const fs = require('fs');
let c = fs.readFileSync('ClientNutrition.jsx', 'utf8');

const old = `    Promise.all([
      api.get('/wellness/tips'),
      api.get('/wellness/meals'),
      api.get('/wellness/tip-of-week'),
    ]).then(([tipsRes, mealsRes, tipRes]) => {
      setTips(tipsRes.data); setMeals(mealsRes.data); setTipOfWeek(tipRes.data); setLoading(false);
    }).catch(() => setLoading(false));`;

const newCode = `    Promise.allSettled([
      api.get('/wellness/tips'),
      api.get('/wellness/meals'),
      api.get('/wellness/tip-of-week'),
    ]).then(([tipsRes, mealsRes, tipRes]) => {
      if (tipsRes.status === 'fulfilled') setTips(tipsRes.value.data || []);
      if (mealsRes.status === 'fulfilled') setMeals(mealsRes.value.data || []);
      if (tipRes.status === 'fulfilled') setTipOfWeek(tipRes.value.data);
      setLoading(false);
    });`;

if (c.includes(old)) {
  c = c.replace(old, newCode);
  fs.writeFileSync('ClientNutrition.jsx', c);
  console.log('Done');
} else {
  console.log('NOT FOUND');
}

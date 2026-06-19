const fs = require('fs');
let c = fs.readFileSync('pages/client/ClientFoodDiary.jsx', 'utf8');
let steps = 0;

// 1. Add Camera icon to imports
if (!c.includes('Camera')) {
  c = c.replace(
    "import { ChevronLeft, ChevronRight, Plus, X, Droplets, Smile, Frown, Meh } from 'lucide-react';",
    "import { ChevronLeft, ChevronRight, Plus, X, Droplets, Smile, Frown, Meh, Camera } from 'lucide-react';"
  );
  steps++;
}

// 2. Add photo state after the saving state
if (!c.includes('mealPhotos')) {
  c = c.replace(
    "  const[saving,setSaving]=useState(false);",
    "  const[saving,setSaving]=useState(false);\n  const[mealPhotos,setMealPhotos]=useState([]);\n  const[photoUploading,setPhotoUploading]=useState(false);"
  );
  steps++;
}

// 3. Load photos when date changes — hook into the existing useEffect that loads diary
if (!c.includes('/diary/photos/')) {
  c = c.replace(
    "  },[date]);",
    "    api.get(`/diary/photos/${ds(date)}`).then(r=>setMealPhotos(r.data.photos||[])).catch(()=>setMealPhotos([]));\n  },[date]);"
  );
  steps++;
}

// 4. Add upload + delete handlers before the save function
if (!c.includes('handlePhotoUpload')) {
  c = c.replace(
    "  const save=async()=>{",
    `  const handlePhotoUpload=async(e)=>{
    const file=e.target.files[0]; if(!file) return;
    if(mealPhotos.length>=4){toast.error('Max 4 photos per day');return;}
    const fd=new FormData(); fd.append('photo',file);
    try{
      setPhotoUploading(true);
      await api.post(\`/diary/photos/\${ds(date)}\`,fd,{headers:{'Content-Type':'multipart/form-data'}});
      const r=await api.get(\`/diary/photos/\${ds(date)}\`);
      setMealPhotos(r.data.photos||[]);
      toast.success('Photo added');
    }catch(err){toast.error(err.response?.data?.error||'Upload failed');}
    finally{setPhotoUploading(false);}
  };
  const deletePhoto=async(pid)=>{
    try{await api.delete(\`/diary/photo/\${pid}\`);setMealPhotos(p=>p.filter(x=>x!==pid));}
    catch{toast.error('Failed to delete');}
  };

  const save=async()=>{`
  );
  steps++;
}

// 5. Add the Add Photo button next to Add Meal
const oldBtn = `          <button type="button" onClick={addMeal} style={{display:'flex',alignItems:'center',gap:'4px',background:\`\${ORANGE}15\`,border:\`1px solid \${ORANGE}30\`,borderRadius:'8px',padding:'5px 12px',cursor:'pointer',color:ORANGE,fontFamily:"'DM Sans',system-ui",fontSize:'0.75rem',fontWeight:700,minHeight:'auto'}}>
            <Plus size={13}/> Add Meal
          </button>`;
const newBtn = `          <div style={{display:'flex',gap:'6px'}}>
            <button type="button" onClick={addMeal} style={{display:'flex',alignItems:'center',gap:'4px',background:\`\${ORANGE}15\`,border:\`1px solid \${ORANGE}30\`,borderRadius:'8px',padding:'5px 12px',cursor:'pointer',color:ORANGE,fontFamily:"'DM Sans',system-ui",fontSize:'0.75rem',fontWeight:700,minHeight:'auto'}}>
              <Plus size={13}/> Add Meal
            </button>
            <label style={{display:'flex',alignItems:'center',gap:'4px',background:\`\${GREEN}15\`,border:\`1px solid \${GREEN}30\`,borderRadius:'8px',padding:'5px 12px',cursor:'pointer',color:GREEN,fontFamily:"'DM Sans',system-ui",fontSize:'0.75rem',fontWeight:700}}>
              <Camera size={13}/> {photoUploading?'…':'Add Photo'}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{display:'none'}}/>
            </label>
          </div>`;
if (c.includes(oldBtn)) { c = c.replace(oldBtn, newBtn); steps++; }

// 6. Add the photo thumbnail strip right after the meals section header div closes.
// Insert just before the "{entry.meals.length===0?(" block
const photoStripAnchor = "        {entry.meals.length===0?(";
const photoStrip = `        {mealPhotos.length>0&&(
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'12px'}}>
            {mealPhotos.map(pid=>(
              <div key={pid} style={{position:'relative'}}>
                <img src={\`\${api.defaults.baseURL}/diary/photo/\${pid}?token=\${localStorage.getItem('brazilfit_token')}\`} alt="meal" style={{width:'72px',height:'72px',objectFit:'cover',borderRadius:'10px',border:\`1px solid \${BORDER}\`}}/>
                <button onClick={()=>deletePhoto(pid)} style={{position:'absolute',top:'-6px',right:'-6px',background:'#000',border:\`1px solid \${BORDER}\`,borderRadius:'50%',width:'20px',height:'20px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',padding:0}}>
                  <X size={12} color="#fff"/>
                </button>
              </div>
            ))}
          </div>
        )}
        {entry.meals.length===0?(`;
if (c.includes(photoStripAnchor) && !c.includes('alt="meal"')) {
  c = c.replace(photoStripAnchor, photoStrip); steps++;
}

fs.writeFileSync('pages/client/ClientFoodDiary.jsx', c);
console.log('Done -', steps, 'of 6 changes applied');

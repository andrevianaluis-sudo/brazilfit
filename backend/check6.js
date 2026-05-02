const {getDb}=require('./src/db/database');
const db=getDb();
const fs=require('fs');
let raw=fs.readFileSync('../frontend/public/exercise-gifs/mapping.json','utf8');
if(raw.charCodeAt(0)===0xFEFF) raw=raw.slice(1);
const mapping=JSON.parse(raw);
const notFound=[];
mapping.forEach(item=>{
  const row=db.prepare("SELECT id FROM exercises WHERE name=?").get(item.exerciseName);
  if(!row) notFound.push(item.exerciseName);
});
console.log('Not found ('+notFound.length+'):');
notFound.slice(0,20).forEach(n=>console.log(' -',n));

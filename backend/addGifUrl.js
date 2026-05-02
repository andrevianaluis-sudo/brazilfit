const {getDb}=require('./src/db/database');
const db=getDb();
try{
  db.prepare("ALTER TABLE exercises ADD COLUMN gif_url TEXT").run();
  console.log('Column added');
}catch(e){console.log('Column may already exist:',e.message);}
const fs=require('fs');
let raw=fs.readFileSync('../frontend/public/exercise-gifs/mapping.json','utf8');
if(raw.charCodeAt(0)===0xFEFF) raw=raw.slice(1);
const mapping=JSON.parse(raw);
const update=db.prepare("UPDATE exercises SET gif_url=? WHERE name=?");
let count=0;
mapping.forEach(item=>{
  const gifUrl='/exercise-gifs/'+item.filename;
  const result=update.run(gifUrl, item.exerciseName);
  if(result.changes>0) count++;
});
console.log('Updated '+count+' exercises with gif_url');

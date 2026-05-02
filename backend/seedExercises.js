const {getDb}=require('./src/db/database');
const db=getDb();
const fs=require('fs');
let raw=fs.readFileSync('../frontend/public/exercise-gifs/mapping.json','utf8');
if(raw.charCodeAt(0)===0xFEFF) raw=raw.slice(1);
const mapping=JSON.parse(raw);
const insert=db.prepare("INSERT OR IGNORE INTO exercises (name, category, equipment, difficulty, muscle_groups, instructions) VALUES (?, ?, 'bodyweight', 'beginner', ?, ?)");
let count=0;
mapping.forEach(item=>{
  const category=item.muscleGroup.replace(' FIX','').trim();
  const muscles=category;
  const instructions='Stretching exercise for '+category+'. GIF: /exercise-gifs/'+item.filename;
  try{insert.run(item.exerciseName, category, muscles, instructions);count++;}catch(e){}
});
console.log('Inserted '+count+' exercises');

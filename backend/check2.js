const {getDb}=require('./src/db/database');
const db=getDb();
const rows=db.prepare("SELECT name, category FROM exercises WHERE category IN ('Neck','Shoulders','Back','Arms','Chest','Hips','Legs','Calves','Stretching') LIMIT 20").all();
console.log(JSON.stringify(rows,null,2));

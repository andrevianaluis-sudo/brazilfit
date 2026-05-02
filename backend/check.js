const {getDb}=require('./src/db/database');
const db=getDb();
const rows=db.prepare('SELECT name, category FROM exercises LIMIT 20').all();
console.log(JSON.stringify(rows,null,2));

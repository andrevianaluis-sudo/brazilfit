const {getDb}=require('./src/db/database');
const db=getDb();
const cols=db.prepare("PRAGMA table_info(exercises)").all();
console.log(JSON.stringify(cols.map(c=>c.name),null,2));

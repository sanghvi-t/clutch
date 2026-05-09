import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);
try {
  await conn.execute('ALTER TABLE training_plans MODIFY COLUMN sessions json');
  console.log('training_plans.sessions fixed');
} catch(e) { console.log('training_plans.sessions:', e.message); }
try {
  await conn.execute('ALTER TABLE user_profiles MODIFY COLUMN sports json');
  console.log('user_profiles.sports fixed');
} catch(e) { console.log('user_profiles.sports:', e.message); }
await conn.end();
console.log('Migration complete');

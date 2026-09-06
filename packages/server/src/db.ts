import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function initializeDatabase() {
  const schemaPath = fs.existsSync(path.join(process.cwd(), 'packages/server/sql/schema.sql'))
    ? path.join(process.cwd(), 'packages/server/sql/schema.sql')
    : path.join(process.cwd(), 'sql/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);

}

export default pool;

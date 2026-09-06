import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: process.env.VERCEL ? 2 : 10,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
});

export async function initializeDatabase() {
  const schemaCandidates = [
    path.join(process.cwd(), 'packages/server/sql/schema.sql'),
    path.join(process.cwd(), 'sql/schema.sql'),
    path.join(__dirname, '../sql/schema.sql'),
  ];
  const schemaPath = schemaCandidates.find((candidate) => fs.existsSync(candidate));
  if (!schemaPath) throw new Error('Database schema file is not available in this deployment');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);

}

export default pool;

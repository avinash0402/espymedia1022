import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import pool from '../db';

const router = Router();

function errorMessage(error: unknown) {
  if (!(error instanceof Error)) return 'Unknown error';
  return error.message
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[redacted database URL]')
    .replace(/password\s*[:=]\s*[^\s,;]+/gi, 'password=[redacted]');
}

router.get('/', async (_req, res) => {
  const schemaCandidates = [
    path.join(process.cwd(), 'packages/server/sql/schema.sql'),
    path.join(process.cwd(), 'sql/schema.sql'),
    path.join(__dirname, '../sql/schema.sql'),
  ];
  const schemaPath = schemaCandidates.find((candidate) => fs.existsSync(candidate));
  const checks: Record<string, { ok: boolean; detail: string }> = {
    databaseUrl: {
      ok: Boolean(process.env.DATABASE_URL),
      detail: process.env.DATABASE_URL ? 'DATABASE_URL is present' : 'DATABASE_URL is missing',
    },
    sessionSecret: {
      ok: Boolean(process.env.SESSION_SECRET),
      detail: process.env.SESSION_SECRET ? 'SESSION_SECRET is present' : 'SESSION_SECRET is missing',
    },
    schema: {
      ok: Boolean(schemaPath),
      detail: schemaPath ? `Schema found at ${schemaPath}` : 'Database schema file was not found',
    },
    node: {
      ok: Number.parseInt(process.versions.node, 10) >= 18,
      detail: `Node.js ${process.version}`,
    },
  };

  try {
    await pool.query('SELECT 1');
    checks.database = { ok: true, detail: 'Database connection succeeded' };
  } catch (error) {
    checks.database = { ok: false, detail: errorMessage(error) };
  }

  const failed = Object.entries(checks).filter(([, check]) => !check.ok);
  res.status(failed.length ? 503 : 200).json({
    ok: failed.length === 0,
    generatedAt: new Date().toISOString(),
    checks,
    failedChecks: failed.map(([name]) => name),
  });
});

export default router;

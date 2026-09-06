import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const checks = [];

function check(name, passed, detail) {
  checks.push({ name, passed, detail });
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

const entrypointPath = path.join(root, 'api/index.ts');
const entrypoint = fs.existsSync(entrypointPath) ? fs.readFileSync(entrypointPath, 'utf8') : '';
const compiledServerPath = path.join(root, 'packages/server/dist/index.js');
const schemaPath = path.join(root, 'packages/server/sql/schema.sql');

check('Vercel entrypoint exists', exists('api/index.ts'), 'api/index.ts');
check(
  'Entrypoint imports compiled server',
  entrypoint.includes("../packages/server/dist/index.js"),
  'Expected import of packages/server/dist/index.js',
);
check('Compiled server exists', fs.existsSync(compiledServerPath), 'packages/server/dist/index.js');
check('Database schema exists', fs.existsSync(schemaPath), 'packages/server/sql/schema.sql');
check('Node version is supported', Number.parseInt(process.versions.node, 10) >= 18, process.version);

for (const dependency of [
  'express',
  'express-session',
  'connect-pg-simple',
  'pg',
  'bcryptjs',
  'cloudinary',
  'multer',
]) {
  const dependencyPath = path.join(root, 'packages/server/node_modules', dependency);
  check(`Server dependency: ${dependency}`, fs.existsSync(dependencyPath), dependencyPath);
}

for (const name of ['DATABASE_URL', 'SESSION_SECRET']) {
  check(`Environment variable: ${name}`, Boolean(process.env[name]), 'Set in the current process');
}

for (const name of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) {
  check(`Optional environment variable: ${name}`, Boolean(process.env[name]), 'Required for image uploads');
}

if (fs.existsSync(compiledServerPath)) {
  try {
    const serverModule = await import(pathToFileURL(compiledServerPath).href);
    const app = serverModule.default?.default ?? serverModule.default;
    check('Compiled server export is callable', typeof app === 'function', `Resolved type: ${typeof app}`);
  } catch (error) {
    check('Compiled server can be imported', false, error instanceof Error ? error.message : String(error));
  }
}

if (process.env.DATABASE_URL) {
  try {
    const require = createRequire(import.meta.url);
    const pg = require(path.join(root, 'packages/server/node_modules/pg'));
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    await pool.query('SELECT 1');
    await pool.end();
    check('Supabase database connection', true, 'SELECT 1 succeeded');
  } catch (error) {
    check('Supabase database connection', false, error instanceof Error ? error.message : String(error));
  }
} else {
  check('Supabase database connection', false, 'Skipped because DATABASE_URL is not set');
}

const failures = checks.filter((item) => !item.passed);
console.log('\nEspy Media deployment diagnostics\n');
for (const item of checks) {
  console.log(`${item.passed ? 'PASS' : 'FAIL'}  ${item.name}`);
  console.log(`      ${item.detail}`);
}
console.log(`\nResult: ${failures.length} failure(s) out of ${checks.length} checks.`);

if (failures.length > 0) process.exitCode = 1;

import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pool, { initializeDatabase } from './db';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import testimonialRoutes from './routes/testimonials';
import blogRoutes from './routes/blog';
import leadRoutes from './routes/leads';
import serviceRoutes from './routes/services';
import settingsRoutes from './routes/settings';
import dashboardRoutes from './routes/dashboard';
import uploadRoutes from './routes/upload';
import cmsRoutes from './routes/cms';

const app = express();
const PORT = parseInt(process.env.SERVER_PORT || '3001', 10);
const PgStore = connectPgSimple(session);

// ── Middleware ────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (Replit / Vercel run behind a proxy)
app.set('trust proxy', 1);

// Session
app.use(session({
  store: new PgStore({ pool, tableName: 'session', createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || 'espy-dev-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax',
  },
}));

// ── Lazy DB initialization (works for both long-running + serverless) ──
let _dbInit: Promise<void> | null = null;
function getDbInit() {
  if (!_dbInit) _dbInit = initializeDatabase();
  return _dbInit;
}

// Ensure DB is ready before any request reaches a route
app.use((_req, _res, next) => {
  getDbInit().then(() => next()).catch(next);
});

// ── API Routes ────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/blog-posts', blogRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cms', cmsRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/robots.txt', async (_req, res) => {
  try {
    const result = await pool.query('SELECT robots_txt FROM settings WHERE id=1');
    res.type('text/plain').send(result.rows[0]?.robots_txt || 'User-agent: *\nAllow: /');
  } catch {
    res.type('text/plain').send('User-agent: *\nAllow: /');
  }
});

app.get('/sitemap.xml', async (_req, res) => {
  try {
    const [settings, projects, posts] = await Promise.all([
      pool.query('SELECT default_meta_title FROM settings WHERE id=1'),
      pool.query('SELECT slug, updated_at FROM projects WHERE published=true ORDER BY sort_order'),
      pool.query('SELECT slug, updated_at FROM blog_posts WHERE published=true ORDER BY published_at DESC NULLS LAST'),
    ]);
    const forwardedHost = _req.get('x-forwarded-host') || _req.get('host');
    const forwardedProto = _req.get('x-forwarded-proto') || _req.protocol;
    const origin = `${forwardedProto}://${forwardedHost}`;
    const urls = ['/', '/graphic-design', '/contact', '/projects', '/blog', ...projects.rows.map((row) => `/work/${row.slug}`), ...posts.rows.map((row) => `/blog/${row.slug}`)];
    const xml = urls.map((url) => `<url><loc>${origin}${url}</loc></url>`).join('');
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}</urlset>`);
  } catch {
    res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>/</loc></url></urlset>');
  }
});

// ── Start locally (not on Vercel) ─────────────────────────────────
if (!process.env.VERCEL) {
  getDbInit()
    .then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`[server] Running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('[server] Database initialization failed', error);
      process.exitCode = 1;
    });
}

export default app;

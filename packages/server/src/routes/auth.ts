import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db';

const router = Router();

// POST /api/auth/setup
router.post('/setup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUsers = await pool.query('SELECT id, email, password_hash FROM admin_users');
    const legacySeedHash = '$2a$10$rrJm7j63zrlWGxINgIG7NeFLYkkFsrLmcxVeEld430rhnLdEkSwyC';
    const canReplaceLegacySeed = existingUsers.rows.length === 1
      && existingUsers.rows[0].email === 'admin@espymedia.com'
      && existingUsers.rows[0].password_hash === legacySeedHash;
    if (existingUsers.rows.length > 0 && !canReplaceLegacySeed) {
      return res.status(409).json({ error: 'Admin setup is already complete' });
    }
    if (!email || !password || password.length < 8) {
      return res.status(400).json({ error: 'Email and a password of at least 8 characters are required' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO admin_users (email, password_hash)
       VALUES ($1, $2)
        ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id, email`,
      [email.toLowerCase().trim(), passwordHash],
    );
    return res.json({ user: { id: result.rows[0].id, email: result.rows[0].email } });
  } catch (err) {
    console.error('[auth/setup]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const result = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    req.session.userId = user.id;
    req.session.userEmail = user.email;
    return res.json({ user: { id: user.id, username: user.email } });
  } catch (err) {
    console.error('[auth/login]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  return res.json({ id: req.session.userId, username: req.session.userEmail });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

export default router;

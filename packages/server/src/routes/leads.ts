import { Router } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

const toLead = (row: any) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  company: row.company,
  projectType: row.project_type,
  budget: row.budget,
  timeline: row.timeline,
  details: row.details,
  status: row.status,
  notes: row.notes,
  createdAt: row.created_at,
});

// GET /api/leads (auth)
router.get('/', requireAuth, async (_req, res) => {
  try {
    const r = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    res.json(r.rows.map(toLead));
  } catch (err) {
    console.error('[leads/list]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/leads (public — contact form)
router.post('/', async (req, res) => {
  try {
    const { name, email, company, projectType, budget, timeline, details } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
    const r = await pool.query(
      `INSERT INTO leads (name, email, company, project_type, budget, timeline, details)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, email, company ?? '', projectType ?? '', budget ?? '', timeline ?? '', details ?? '']
    );
    res.status(201).json(toLead(r.rows[0]));
  } catch (err) {
    console.error('[leads/create]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/leads/:id (auth)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const r = await pool.query(
      `UPDATE leads SET
        status = COALESCE($1, status),
        notes  = COALESCE($2, notes)
       WHERE id = $3 RETURNING *`,
      [status, notes, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(toLead(r.rows[0]));
  } catch (err) {
    console.error('[leads/update]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/leads/:id (auth)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[leads/delete]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { Router } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

const toService = (row: any) => ({
  id: row.id,
  name: row.name,
  headline: row.headline,
  description: row.description,
  icon: row.icon,
  sortOrder: row.sort_order,
  published: row.published,
});

// GET /api/services
router.get('/', async (_req, res) => {
  try {
    const r = await pool.query('SELECT * FROM services ORDER BY sort_order ASC');
    res.json(r.rows.map(toService));
  } catch (err) {
    console.error('[services/list]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/services/:id (auth)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { name, headline, description, icon, sortOrder, published } = req.body;
    const r = await pool.query(
      `UPDATE services SET
        name       = COALESCE($1, name),
        headline   = COALESCE($2, headline),
        description= COALESCE($3, description),
        icon       = COALESCE($4, icon),
        sort_order = COALESCE($5, sort_order),
        published  = COALESCE($6, published)
       WHERE id = $7 RETURNING *`,
      [name, headline, description, icon, sortOrder, published, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(toService(r.rows[0]));
  } catch (err) {
    console.error('[services/update]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

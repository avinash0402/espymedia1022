import { Router } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

const toTestimonial = (row: any) => ({
  id: row.id,
  clientName: row.client_name,
  company: row.company,
  role: row.role,
  quote: row.quote,
  rating: row.rating,
  avatarUrl: row.avatar_url,
  published: row.published,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
});

// GET /api/testimonials
router.get('/', async (req, res) => {
  try {
    const publishedOnly = req.query.published === 'true';
    const q = publishedOnly
      ? 'SELECT * FROM testimonials WHERE published = true ORDER BY sort_order ASC, created_at DESC'
      : 'SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC';
    const r = await pool.query(q);
    res.json(r.rows.map(toTestimonial));
  } catch (err) {
    console.error('[testimonials/list]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/testimonials (auth)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { clientName, company, role, quote, rating, avatarUrl, published } = req.body;
    const r = await pool.query(
      `INSERT INTO testimonials (client_name, company, role, quote, rating, avatar_url, published)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [clientName, company ?? '', role ?? '', quote, rating ?? 5, avatarUrl ?? null, published ?? false]
    );
    res.status(201).json(toTestimonial(r.rows[0]));
  } catch (err) {
    console.error('[testimonials/create]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/testimonials/:id (auth)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { clientName, company, role, quote, rating, avatarUrl, published, sortOrder } = req.body;
    const r = await pool.query(
      `UPDATE testimonials SET
        client_name = COALESCE($1, client_name),
        company     = COALESCE($2, company),
        role        = COALESCE($3, role),
        quote       = COALESCE($4, quote),
        rating      = COALESCE($5, rating),
        avatar_url  = COALESCE($6, avatar_url),
        published   = COALESCE($7, published),
        sort_order  = COALESCE($8, sort_order)
       WHERE id = $9 RETURNING *`,
      [clientName, company, role, quote, rating, avatarUrl, published, sortOrder, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(toTestimonial(r.rows[0]));
  } catch (err) {
    console.error('[testimonials/update]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/testimonials/:id (auth)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM testimonials WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[testimonials/delete]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { Router } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

const toProject = (row: any) => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  category: row.category,
  categoryId: row.category_id,
  clientName: row.client_name,
  challenge: row.challenge,
  approach: row.approach,
  result: row.result,
  metrics: row.metrics,
  imageUrl: row.image_url,
  galleryUrls: row.gallery_urls || [],
  techStack: row.tech_stack || [],
  liveUrl: row.live_url || '',
  altText: row.alt_text || '',
  published: row.published,
  featured: row.featured,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// GET /api/projects
router.get('/', async (_req, res) => {
  try {
    const r = await pool.query('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC');
    res.json(r.rows.map(toProject));
  } catch (err) {
    console.error('[projects/list]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projects/featured
router.get('/featured', async (_req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM projects WHERE featured = true AND published = true ORDER BY sort_order ASC LIMIT 6'
    );
    res.json(r.rows.map(toProject));
  } catch (err) {
    console.error('[projects/featured]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/categories', async (_req, res) => {
  try {
    const r = await pool.query('SELECT id, name, slug FROM project_categories ORDER BY name');
    res.json(r.rows);
  } catch (err) {
    console.error('[projects/categories]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/categories', requireAuth, async (req, res) => {
  try {
    const r = await pool.query('INSERT INTO project_categories (name, slug) VALUES ($1, $2) RETURNING id, name, slug', [req.body.name, req.body.slug]);
    res.status(201).json(r.rows[0]);
  } catch (err: any) {
    res.status(err.code === '23505' ? 409 : 500).json({ error: err.code === '23505' ? 'Slug already exists' : 'Internal server error' });
  }
});

router.patch('/categories/:id', requireAuth, async (req, res) => {
  const r = await pool.query('UPDATE project_categories SET name=COALESCE($1,name), slug=COALESCE($2,slug) WHERE id=$3 RETURNING id, name, slug', [req.body.name, req.body.slug, req.params.id]);
  if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

router.delete('/categories/:id', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM project_categories WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM projects WHERE id = $1 OR slug = $1',
      [req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(toProject(r.rows[0]));
  } catch (err) {
    console.error('[projects/get]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/projects (auth)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, slug, category, categoryId, clientName, challenge, approach, result, metrics, published, featured, imageUrl, galleryUrls, techStack, liveUrl, altText, sortOrder } = req.body;
    if (featured) {
      const featuredCount = await pool.query('SELECT COUNT(*)::int AS count FROM projects WHERE featured = true');
      if (featuredCount.rows[0].count >= 6) return res.status(409).json({ error: 'A maximum of 6 featured projects is allowed' });
    }
    const r = await pool.query(
      `INSERT INTO projects (title, slug, category, category_id, client_name, challenge, approach, result, metrics, published, featured, image_url, gallery_urls, tech_stack, live_url, alt_text, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [title, slug, category ?? '', categoryId ?? null, clientName ?? '', challenge ?? '', approach ?? '', result ?? '', metrics ?? '', published ?? false, featured ?? false, imageUrl ?? null, JSON.stringify(galleryUrls ?? []), techStack ?? [], liveUrl ?? '', altText ?? '', sortOrder ?? 0]
    );
    res.status(201).json(toProject(r.rows[0]));
  } catch (err: any) {
    console.error('[projects/create]', err);
    if (err.code === '23505') return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/projects/:id (auth)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { title, slug, category, categoryId, clientName, challenge, approach, result, metrics, published, featured, imageUrl, galleryUrls, techStack, liveUrl, altText, sortOrder } = req.body;
    if (featured) {
      const featuredCount = await pool.query('SELECT COUNT(*)::int AS count FROM projects WHERE featured = true AND id <> $1', [req.params.id]);
      if (featuredCount.rows[0].count >= 6) return res.status(409).json({ error: 'A maximum of 6 featured projects is allowed' });
    }
    const r = await pool.query(
      `UPDATE projects SET
        title       = COALESCE($1,  title),
        slug        = COALESCE($2,  slug),
        category    = COALESCE($3,  category),
        category_id = COALESCE($4, category_id),
        client_name = COALESCE($5,  client_name),
        challenge   = COALESCE($6,  challenge),
        approach    = COALESCE($7,  approach),
        result      = COALESCE($8,  result),
        metrics     = COALESCE($9,  metrics),
        published   = COALESCE($10,  published),
        featured    = COALESCE($11, featured),
        image_url   = COALESCE($12, image_url),
        gallery_urls = COALESCE($13, gallery_urls),
        tech_stack = COALESCE($14, tech_stack),
        live_url = COALESCE($15, live_url),
        alt_text = COALESCE($16, alt_text),
        sort_order  = COALESCE($17, sort_order),
        updated_at  = NOW()
       WHERE id = $18 RETURNING *`,
      [title, slug, category, categoryId, clientName, challenge, approach, result, metrics, published, featured, imageUrl, galleryUrls ? JSON.stringify(galleryUrls) : null, techStack, liveUrl, altText, sortOrder, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(toProject(r.rows[0]));
  } catch (err) {
    console.error('[projects/update]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/projects/:id (auth)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[projects/delete]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

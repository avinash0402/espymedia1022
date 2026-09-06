import { Router } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

const toPost = (row: any) => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  excerpt: row.excerpt,
  content: row.content,
  coverImageUrl: row.cover_image_url,
  author: row.author,
  published: row.published,
  publishedAt: row.published_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// GET /api/blog-posts
router.get('/', async (req, res) => {
  try {
    const isRecent = req.query.recent === 'true';
    const limit = isRecent ? parseInt(req.query.limit as string) || 3 : 1000;
    const r = await pool.query(
      isRecent
        ? 'SELECT * FROM blog_posts WHERE published = true ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT $1'
        : 'SELECT * FROM blog_posts ORDER BY created_at DESC',
      isRecent ? [limit] : []
    );
    res.json(r.rows.map(toPost));
  } catch (err) {
    console.error('[blog/list]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/blog-posts/:id
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM blog_posts WHERE id = $1 OR slug = $1',
      [req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(toPost(r.rows[0]));
  } catch (err) {
    console.error('[blog/get]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/blog-posts (auth)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, slug, excerpt, content, coverImageUrl, author, published } = req.body;
    const r = await pool.query(
      `INSERT INTO blog_posts (title, slug, excerpt, content, cover_image_url, author, published, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, slug, excerpt ?? '', content ?? '', coverImageUrl ?? null, author ?? 'Espy Media', published ?? false, published ? new Date() : null]
    );
    res.status(201).json(toPost(r.rows[0]));
  } catch (err: any) {
    console.error('[blog/create]', err);
    if (err.code === '23505') return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/blog-posts/:id (auth)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { title, slug, excerpt, content, coverImageUrl, author, published } = req.body;
    // Set published_at when first published
    const existing = await pool.query('SELECT published, published_at FROM blog_posts WHERE id = $1', [req.params.id]);
    const wasPublished = existing.rows[0]?.published;
    const publishedAt = !wasPublished && published ? new Date() : existing.rows[0]?.published_at;

    const r = await pool.query(
      `UPDATE blog_posts SET
        title           = COALESCE($1,  title),
        slug            = COALESCE($2,  slug),
        excerpt         = COALESCE($3,  excerpt),
        content         = COALESCE($4,  content),
        cover_image_url = COALESCE($5,  cover_image_url),
        author          = COALESCE($6,  author),
        published       = COALESCE($7,  published),
        published_at    = $8,
        updated_at      = NOW()
       WHERE id = $9 RETURNING *`,
      [title, slug, excerpt, content, coverImageUrl, author, published, publishedAt, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(toPost(r.rows[0]));
  } catch (err) {
    console.error('[blog/update]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/blog-posts/:id (auth)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM blog_posts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[blog/delete]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

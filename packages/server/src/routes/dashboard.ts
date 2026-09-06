import { Router } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/dashboard/stats (auth)
router.get('/stats', requireAuth, async (_req, res) => {
  try {
    const [leadsTotal, leadsWon, leadsThisWeek, projects, posts, testimonials] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM leads'),
      pool.query("SELECT COUNT(*) FROM leads WHERE status = 'won'"),
      pool.query("SELECT COUNT(*) FROM leads WHERE created_at > NOW() - INTERVAL '7 days'"),
      pool.query('SELECT COUNT(*) FROM projects'),
      pool.query('SELECT COUNT(*) FROM blog_posts WHERE published = true'),
      pool.query('SELECT COUNT(*) FROM testimonials'),
    ]);

    res.json({
      totalLeads: parseInt(leadsTotal.rows[0].count),
      wonLeads: parseInt(leadsWon.rows[0].count),
      newLeadsThisWeek: parseInt(leadsThisWeek.rows[0].count),
      totalProjects: parseInt(projects.rows[0].count),
      publishedPosts: parseInt(posts.rows[0].count),
      testimonialCount: parseInt(testimonials.rows[0].count),
    });
  } catch (err) {
    console.error('[dashboard/stats]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

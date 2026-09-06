import { Router } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

const toSettings = (row: any) => ({
  id: row.id,
  siteName: row.site_name,
  siteDescription: row.site_description,
  contactEmail: row.contact_email,
  supportEmail: row.support_email,
  phone: row.phone,
  whatsapp: row.whatsapp,
  address: row.address,
  mapsEmbed: row.maps_embed,
  logoUrl: row.logo_url,
  footerLogoUrl: row.footer_logo_url,
  faviconUrl: row.favicon_url,
  footerText: row.footer_text,
  twitterUrl: row.twitter_url,
  instagramUrl: row.instagram_url,
  linkedinUrl: row.linkedin_url,
  facebookUrl: row.facebook_url,
  behanceUrl: row.behance_url,
  dribbbleUrl: row.dribbble_url,
  youtubeUrl: row.youtube_url,
  githubUrl: row.github_url,
  defaultMetaTitle: row.default_meta_title,
  defaultMetaDescription: row.default_meta_description,
  defaultMetaKeywords: row.default_meta_keywords,
  defaultOgImage: row.default_og_image,
  robotsTxt: row.robots_txt,
  heroBadge: row.hero_badge,
  heroHeadline1: row.hero_headline_1,
  heroHeadline2: row.hero_headline_2,
  heroSubheadline: row.hero_subheadline,
  homepageStats: row.homepage_stats || [],
  gtmId: row.gtm_id,
  chatbotAvatarUrl: row.chatbot_avatar_url,
  updatedAt: row.updated_at,
});

// GET /api/settings
router.get('/', async (_req, res) => {
  try {
    const r = await pool.query('SELECT * FROM settings ORDER BY id LIMIT 1');
    if (!r.rows[0]) return res.json({});
    res.json(toSettings(r.rows[0]));
  } catch (err) {
    console.error('[settings/get]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/settings (auth)
router.patch('/', requireAuth, async (req, res) => {
  try {
    const {
      siteName, siteDescription, contactEmail, supportEmail, phone, whatsapp, address, mapsEmbed,
      logoUrl, footerLogoUrl, faviconUrl, footerText, twitterUrl, instagramUrl, linkedinUrl,
      facebookUrl, behanceUrl, dribbbleUrl, youtubeUrl, githubUrl, defaultMetaTitle,
      defaultMetaDescription, defaultMetaKeywords, defaultOgImage, robotsTxt,
      heroBadge, heroHeadline1, heroHeadline2, heroSubheadline, homepageStats, gtmId, chatbotAvatarUrl
    } = req.body;

    const r = await pool.query(
      `UPDATE settings SET
        site_name        = COALESCE($1,  site_name),
        site_description = COALESCE($2,  site_description),
        contact_email    = COALESCE($3,  contact_email),
        support_email    = COALESCE($4,  support_email),
        phone            = COALESCE($5,  phone),
        whatsapp         = COALESCE($6,  whatsapp),
        address          = COALESCE($7,  address),
        maps_embed       = COALESCE($8,  maps_embed),
        logo_url         = COALESCE($9,  logo_url),
        footer_logo_url  = COALESCE($10, footer_logo_url),
        favicon_url      = COALESCE($11, favicon_url),
        footer_text      = COALESCE($12, footer_text),
        twitter_url      = COALESCE($13, twitter_url),
        instagram_url    = COALESCE($14, instagram_url),
        linkedin_url     = COALESCE($15, linkedin_url),
        facebook_url     = COALESCE($16, facebook_url),
        behance_url      = COALESCE($17, behance_url),
        dribbble_url     = COALESCE($18, dribbble_url),
        youtube_url      = COALESCE($19, youtube_url),
        github_url       = COALESCE($20, github_url),
        default_meta_title = COALESCE($21, default_meta_title),
        default_meta_description = COALESCE($22, default_meta_description),
        default_meta_keywords = COALESCE($23, default_meta_keywords),
        default_og_image = COALESCE($24, default_og_image),
        robots_txt       = COALESCE($25, robots_txt),
        hero_badge       = COALESCE($26, hero_badge),
        hero_headline_1  = COALESCE($27, hero_headline_1),
        hero_headline_2  = COALESCE($28, hero_headline_2),
        hero_subheadline = COALESCE($29, hero_subheadline),
        homepage_stats   = COALESCE($30, homepage_stats),
        gtm_id           = COALESCE($31, gtm_id),
        chatbot_avatar_url = COALESCE($32, chatbot_avatar_url),
        updated_at       = NOW()
       WHERE id = 1 RETURNING *`,
      [siteName, siteDescription, contactEmail, supportEmail, phone, whatsapp, address, mapsEmbed,
       logoUrl, footerLogoUrl, faviconUrl, footerText, twitterUrl, instagramUrl, linkedinUrl,
       facebookUrl, behanceUrl, dribbbleUrl, youtubeUrl, githubUrl, defaultMetaTitle,
       defaultMetaDescription, defaultMetaKeywords, defaultOgImage, robotsTxt,
       heroBadge, heroHeadline1, heroHeadline2, heroSubheadline,
       homepageStats ? JSON.stringify(homepageStats) : null, gtmId, chatbotAvatarUrl]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Settings not found' });
    res.json(toSettings(r.rows[0]));
  } catch (err) {
    console.error('[settings/update]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

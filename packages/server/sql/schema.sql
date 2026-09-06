-- Espy Media CMS schema
-- Apply this file to the development database before starting the server.

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_name TEXT NOT NULL DEFAULT 'Espy Media',
  site_description TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  support_email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  maps_embed TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '',
  footer_logo_url TEXT NOT NULL DEFAULT '',
  favicon_url TEXT NOT NULL DEFAULT '',
  footer_text TEXT NOT NULL DEFAULT '',
  twitter_url TEXT NOT NULL DEFAULT '',
  instagram_url TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  facebook_url TEXT NOT NULL DEFAULT '',
  behance_url TEXT NOT NULL DEFAULT '',
  dribbble_url TEXT NOT NULL DEFAULT '',
  youtube_url TEXT NOT NULL DEFAULT '',
  github_url TEXT NOT NULL DEFAULT '',
  default_meta_title TEXT NOT NULL DEFAULT '',
  default_meta_description TEXT NOT NULL DEFAULT '',
  default_meta_keywords TEXT NOT NULL DEFAULT '',
  default_og_image TEXT NOT NULL DEFAULT '',
  robots_txt TEXT NOT NULL DEFAULT 'User-agent: *
Allow: /',
  hero_badge TEXT NOT NULL DEFAULT '',
  hero_headline_1 TEXT NOT NULL DEFAULT '',
  hero_headline_2 TEXT NOT NULL DEFAULT '',
  hero_subheadline TEXT NOT NULL DEFAULT '',
  homepage_stats JSONB NOT NULL DEFAULT '[]'::jsonb,
  gtm_id TEXT NOT NULL DEFAULT '',
  chatbot_avatar_url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  headline TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'Web Design',
  client_name TEXT NOT NULL DEFAULT '',
  challenge TEXT NOT NULL DEFAULT '',
  approach TEXT NOT NULL DEFAULT '',
  result TEXT NOT NULL DEFAULT '',
  metrics TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  gallery_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  live_url TEXT NOT NULL DEFAULT '',
  alt_text TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES project_categories(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  avatar_url TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  author TEXT NOT NULL DEFAULT 'Espy Media',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  project_type TEXT NOT NULL DEFAULT '',
  budget TEXT NOT NULL DEFAULT '',
  timeline TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platforms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT NOT NULL DEFAULT '',
  link_url TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS graphic_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS graphic_works (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id INTEGER REFERENCES graphic_categories(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL DEFAULT '',
  gallery_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT NOT NULL DEFAULT '',
  alt_text TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL DEFAULT '',
  period TEXT NOT NULL DEFAULT 'One-time',
  description TEXT NOT NULL DEFAULT '',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  cta_text TEXT NOT NULL DEFAULT 'Get started',
  highlighted BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS seo_pages (
  id SERIAL PRIMARY KEY,
  path TEXT NOT NULL UNIQUE,
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  meta_keywords TEXT NOT NULL DEFAULT '',
  og_title TEXT NOT NULL DEFAULT '',
  og_description TEXT NOT NULL DEFAULT '',
  og_image TEXT NOT NULL DEFAULT '',
  twitter_title TEXT NOT NULL DEFAULT '',
  twitter_description TEXT NOT NULL DEFAULT '',
  canonical_url TEXT NOT NULL DEFAULT '',
  structured_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  noindex BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS legal_pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_badge TEXT NOT NULL DEFAULT 'Now booking Q4 client slots';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS gtm_id TEXT NOT NULL DEFAULT '';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_headline_1 TEXT NOT NULL DEFAULT 'Design & Growth';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_headline_2 TEXT NOT NULL DEFAULT 'for Ambitious Brands';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_subheadline TEXT NOT NULL DEFAULT 'Espy Media is a full-stack creative studio building web design, paid ads, lead generation, and graphic design under one roof — so your brand ships faster and looks sharper doing it.';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS homepage_stats JSONB NOT NULL DEFAULT '[{"end":120,"suffix":"+","label":"Clients Served"},{"end":340,"suffix":"+","label":"Campaigns Run"},{"end":4.8,"suffix":"x","label":"Average ROAS"},{"end":28000,"suffix":"+","label":"Leads Generated"}]'::jsonb;

INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

INSERT INTO services (name, headline, description, sort_order)
SELECT * FROM (VALUES
  ('Web Design & Build', 'Sites engineered to convert, not just look good', 'From storefronts to admin panels, we design and ship fast, conversion-focused sites.', 0),
  ('Paid Ads & Lead Gen', 'Meta and Google campaigns built around a real funnel', 'Shipped with tracking in place so every lead is traceable back to spend.', 1),
  ('Graphic Design', 'Brand identity, social creative, and print', 'Designed to stay consistent across every touchpoint.', 2),
  ('Admin Panels', 'Custom dashboards so you can manage content and leads', 'Orders and leads without touching code.', 3)
) AS seed(name, headline, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM services);

INSERT INTO platforms (name, slug, sort_order)
SELECT * FROM (VALUES
  ('Meta Ads', 'meta-ads', 0),
  ('Google Ads', 'google-ads', 1),
  ('Shopify', 'shopify', 2),
  ('WordPress', 'wordpress', 3),
  ('Figma', 'figma', 4)
) AS seed(name, slug, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM platforms);

INSERT INTO project_categories (name, slug)
SELECT * FROM (VALUES
  ('Web Design', 'web-design'),
  ('E-commerce', 'e-commerce'),
  ('Branding', 'branding')
) AS seed(name, slug)
WHERE NOT EXISTS (SELECT 1 FROM project_categories);

INSERT INTO pricing_plans (name, price, description, features, cta_text, highlighted, sort_order)
SELECT * FROM (VALUES
  ('Starter Plan', '₹7,000', 'Perfect for startups, freelancers, and small businesses looking to establish a professional online presence with a custom website built around your business requirements.', '["Custom Website Designed Around Your Requirements","Premium Responsive Design","Mobile & Tablet Optimised","Contact Form Integration","WhatsApp Integration","Basic E-commerce Website","Basic On-Page SEO","Fast Loading Performance","Google Maps Integration","Free Domain (1 Year)","Free Hosting (1 Year)","6 Months Free Support"]'::jsonb, 'Get Started', FALSE, 0),
  ('Business Plan', '₹13,000', 'Perfect for growing businesses that need a premium website or e-commerce store built to generate leads, increase sales, and scale with their business.', '["Everything in Starter Plan","Custom Website Designed Around Your Requirements","Premium Custom UI/UX Design","Business Website or E-commerce Website","Admin Panel (CMS)","Advanced Lead & Contact Forms","Google Analytics Setup","Meta Pixel Integration","Speed & Performance Optimisation","Enhanced SEO Optimisation","Free Domain (1 Year)","Free Hosting (1 Year)","1 Year Free Support & Maintenance"]'::jsonb, 'Start Your Project', TRUE, 1),
  ('Custom Plan', 'Custom Pricing', 'Built for businesses that require completely custom web solutions, advanced functionality, automations, or enterprise-level development.', '["Fully Custom Website or Web Application","Custom Design Tailored to Your Brand","Advanced E-commerce Solutions","Custom Admin Dashboard","Booking & Appointment Systems","Payment Gateway Integration","API & CRM Integrations","Custom Features & Automations","Advanced SEO & Performance Optimisation","Priority Development & Consultation","Free Domain (1 Year)","Free Hosting (1 Year)","1 Year Free Support & Maintenance"]'::jsonb, 'Request a Quote', FALSE, 2)
) AS seed(name, price, description, features, cta_text, highlighted, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM pricing_plans);

-- Keep the named starter plans in sync when the database already contains the
-- shorter original seed. This is idempotent and also preserves CMS edits to
-- unrelated pricing plans.
UPDATE pricing_plans
SET
  price = '₹7,000',
  description = 'Perfect for startups, freelancers, and small businesses looking to establish a professional online presence with a custom website built around your business requirements.',
  features = '["Custom Website Designed Around Your Requirements","Premium Responsive Design","Mobile & Tablet Optimised","Contact Form Integration","WhatsApp Integration","Basic E-commerce Website","Basic On-Page SEO","Fast Loading Performance","Google Maps Integration","Free Domain (1 Year)","Free Hosting (1 Year)","6 Months Free Support"]'::jsonb,
  cta_text = 'Get Started',
  highlighted = FALSE,
  sort_order = 0
WHERE name = 'Starter Plan'
  AND features = '["Premium responsive design","Contact form integration","WhatsApp integration","Basic on-page SEO"]'::jsonb;

UPDATE pricing_plans
SET
  price = '₹13,000',
  description = 'Perfect for growing businesses that need a premium website or e-commerce store built to generate leads, increase sales, and scale with their business.',
  features = '["Everything in Starter Plan","Custom Website Designed Around Your Requirements","Premium Custom UI/UX Design","Business Website or E-commerce Website","Admin Panel (CMS)","Advanced Lead & Contact Forms","Google Analytics Setup","Meta Pixel Integration","Speed & Performance Optimisation","Enhanced SEO Optimisation","Free Domain (1 Year)","Free Hosting (1 Year)","1 Year Free Support & Maintenance"]'::jsonb,
  cta_text = 'Start Your Project',
  highlighted = TRUE,
  sort_order = 1
WHERE name = 'Business Plan'
  AND features = '["Everything in Starter Plan","Custom UI/UX design","Admin panel (CMS)","Advanced SEO optimisation"]'::jsonb;

UPDATE pricing_plans
SET
  price = 'Custom Pricing',
  description = 'Built for businesses that require completely custom web solutions, advanced functionality, automations, or enterprise-level development.',
  features = '["Fully Custom Website or Web Application","Custom Design Tailored to Your Brand","Advanced E-commerce Solutions","Custom Admin Dashboard","Booking & Appointment Systems","Payment Gateway Integration","API & CRM Integrations","Custom Features & Automations","Advanced SEO & Performance Optimisation","Priority Development & Consultation","Free Domain (1 Year)","Free Hosting (1 Year)","1 Year Free Support & Maintenance"]'::jsonb,
  cta_text = 'Request a Quote',
  highlighted = FALSE,
  sort_order = 2
WHERE name = 'Custom Plan'
  AND features = '["Fully custom website or web application","Payment gateway integration","API & CRM integrations","Priority consultation"]'::jsonb;

INSERT INTO legal_pages (slug, title, content)
VALUES
  ('privacy-policy', 'Privacy Policy', '<h2>Privacy at Espy Media</h2><p>Update this policy from the CMS.</p>'),
  ('terms-conditions', 'Terms & Conditions', '<h2>Terms & Conditions</h2><p>Update these terms from the CMS.</p>')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO seo_pages (path, meta_title, meta_description)
VALUES ('/', 'Espy Media — Design & Growth for Ambitious Brands', 'Espy Media is a full-stack creative studio building web design, paid ads, lead generation, and graphic design.')
ON CONFLICT (path) DO NOTHING;
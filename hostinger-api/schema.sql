-- Import into the Hostinger MySQL database with phpMyAdmin before deployment.
-- The API uses MySQL 8-compatible types and initializes seed content separately.

CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  id INT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
  site_name VARCHAR(255) NOT NULL DEFAULT 'Espy Media',
  site_description TEXT NOT NULL,
  contact_email VARCHAR(255) NOT NULL DEFAULT '',
  support_email VARCHAR(255) NOT NULL DEFAULT '',
  phone VARCHAR(100) NOT NULL DEFAULT '',
  whatsapp VARCHAR(100) NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  maps_embed TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  footer_logo_url TEXT NOT NULL,
  favicon_url TEXT NOT NULL,
  footer_text TEXT NOT NULL,
  twitter_url TEXT NOT NULL,
  instagram_url TEXT NOT NULL,
  linkedin_url TEXT NOT NULL,
  facebook_url TEXT NOT NULL,
  behance_url TEXT NOT NULL,
  dribbble_url TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  github_url TEXT NOT NULL,
  default_meta_title TEXT NOT NULL,
  default_meta_description TEXT NOT NULL,
  default_meta_keywords TEXT NOT NULL,
  default_og_image TEXT NOT NULL,
  robots_txt TEXT NOT NULL,
  hero_badge TEXT NOT NULL,
  hero_headline_1 TEXT NOT NULL,
  hero_headline_2 TEXT NOT NULL,
  hero_subheadline TEXT NOT NULL,
  homepage_stats JSON NOT NULL,
  gtm_id VARCHAR(255) NOT NULL DEFAULT '',
  chatbot_avatar_url TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS services (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  headline TEXT NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(255) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(255) NOT NULL DEFAULT 'Web Design',
  category_id INT UNSIGNED NULL,
  client_name VARCHAR(255) NOT NULL DEFAULT '',
  challenge TEXT NOT NULL,
  approach TEXT NOT NULL,
  result TEXT NOT NULL,
  metrics TEXT NOT NULL,
  image_url TEXT NULL,
  gallery_urls JSON NOT NULL,
  tech_stack JSON NOT NULL,
  live_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  published TINYINT(1) NOT NULL DEFAULT 0,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_projects_category FOREIGN KEY (category_id) REFERENCES project_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS testimonials (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL DEFAULT '',
  role VARCHAR(255) NOT NULL DEFAULT '',
  quote TEXT NOT NULL,
  rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
  avatar_url TEXT NULL,
  published TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS faqs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_faqs_question (question)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  cover_image_url TEXT NULL,
  author VARCHAR(255) NOT NULL DEFAULT 'Espy Media',
  published TINYINT(1) NOT NULL DEFAULT 0,
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL DEFAULT '',
  project_type VARCHAR(255) NOT NULL DEFAULT '',
  budget VARCHAR(255) NOT NULL DEFAULT '',
  timeline VARCHAR(255) NOT NULL DEFAULT '',
  details TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'new',
  notes TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS platforms (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  logo_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  published TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS graphic_categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS graphic_works (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category_id INT UNSIGNED NULL,
  image_url TEXT NOT NULL,
  gallery_urls JSON NOT NULL,
  description TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  published TINYINT(1) NOT NULL DEFAULT 0,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_graphic_works_category FOREIGN KEY (category_id) REFERENCES graphic_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pricing_plans (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price VARCHAR(255) NOT NULL DEFAULT '',
  period VARCHAR(255) NOT NULL DEFAULT 'One-time',
  description TEXT NOT NULL,
  features JSON NOT NULL,
  cta_text VARCHAR(255) NOT NULL DEFAULT 'Get started',
  highlighted TINYINT(1) NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seo_pages (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  path VARCHAR(512) NOT NULL UNIQUE,
  meta_title VARCHAR(255) NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL,
  meta_keywords TEXT NOT NULL,
  og_title VARCHAR(255) NOT NULL DEFAULT '',
  og_description TEXT NOT NULL,
  og_image TEXT NOT NULL,
  twitter_title VARCHAR(255) NOT NULL DEFAULT '',
  twitter_description TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  structured_data JSON NOT NULL,
  noindex TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS legal_pages (
  slug VARCHAR(255) NOT NULL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO settings (
  id, site_description, address, maps_embed, logo_url, footer_logo_url, favicon_url,
  footer_text, twitter_url, instagram_url, linkedin_url, facebook_url, behance_url,
  dribbble_url, youtube_url, github_url, default_meta_title, default_meta_description,
  default_meta_keywords, default_og_image, robots_txt, hero_badge, hero_headline_1,
  hero_headline_2, hero_subheadline, homepage_stats, chatbot_avatar_url
) VALUES (
  1, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
  'User-agent: *\nAllow: /', 'Now booking Q4 client slots', 'Design & Growth',
  'for Ambitious Brands',
  'Espy Media is a full-stack creative studio building web design, paid ads, lead generation, and graphic design under one roof — so your brand ships faster and looks sharper doing it.',
  '[{"end":120,"suffix":"+","label":"Clients Served"},{"end":340,"suffix":"+","label":"Campaigns Run"},{"end":4.8,"suffix":"x","label":"Average ROAS"},{"end":28000,"suffix":"+","label":"Leads Generated"}]',
  ''
);

INSERT INTO services (name, headline, description, sort_order)
SELECT 'Web Design & Build', 'Sites engineered to convert, not just look good', 'From storefronts to admin panels, we design and ship fast, conversion-focused sites.', 0
WHERE NOT EXISTS (SELECT 1 FROM services);
INSERT INTO services (name, headline, description, sort_order)
SELECT 'Paid Ads & Lead Gen', 'Meta and Google campaigns built around a real funnel', 'Shipped with tracking in place so every lead is traceable back to spend.', 1
WHERE NOT EXISTS (SELECT 1 FROM services WHERE sort_order = 1);
INSERT INTO services (name, headline, description, sort_order)
SELECT 'Graphic Design', 'Brand identity, social creative, and print', 'Designed to stay consistent across every touchpoint.', 2
WHERE NOT EXISTS (SELECT 1 FROM services WHERE sort_order = 2);
INSERT INTO services (name, headline, description, sort_order)
SELECT 'Admin Panels', 'Custom dashboards so you can manage content and leads', 'Orders and leads without touching code.', 3
WHERE NOT EXISTS (SELECT 1 FROM services WHERE sort_order = 3);

INSERT IGNORE INTO project_categories (name, slug) VALUES
  ('Web Design', 'web-design'), ('E-commerce', 'e-commerce'), ('Branding', 'branding');
INSERT IGNORE INTO platforms (name, slug, sort_order) VALUES
  ('Meta Ads', 'meta-ads', 0), ('Google Ads', 'google-ads', 1),
  ('Shopify', 'shopify', 2), ('WordPress', 'wordpress', 3), ('Figma', 'figma', 4);
INSERT INTO pricing_plans (name, price, period, description, features, cta_text, highlighted, published, sort_order)
SELECT 'Starter Plan', '₹7,000', 'One-time',
  'Perfect for startups, freelancers, and small businesses looking to establish a professional online presence with a custom website built around your business requirements.',
  '["Custom Website Designed Around Your Requirements","Premium Responsive Design","Mobile & Tablet Optimised","Contact Form Integration","WhatsApp Integration","Basic E-commerce Website","Basic On-Page SEO","Fast Loading Performance","Google Maps Integration","Free Domain (1 Year)","Free Hosting (1 Year)","6 Months Free Support"]',
  'Get Started', 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM pricing_plans);
INSERT INTO pricing_plans (name, price, period, description, features, cta_text, highlighted, published, sort_order)
SELECT 'Business Plan', '₹13,000', 'One-time',
  'Perfect for growing businesses that need a premium website or e-commerce store built to generate leads, increase sales, and scale with their business.',
  '["Everything in Starter Plan","Custom Website Designed Around Your Requirements","Premium Custom UI/UX Design","Business Website or E-commerce Website","Admin Panel (CMS)","Advanced Lead & Contact Forms","Google Analytics Setup","Meta Pixel Integration","Speed & Performance Optimisation","Enhanced SEO Optimisation","Free Domain (1 Year)","Free Hosting (1 Year)","1 Year Free Support & Maintenance"]',
  'Start Your Project', 1, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM pricing_plans WHERE sort_order = 1);
INSERT INTO pricing_plans (name, price, period, description, features, cta_text, highlighted, published, sort_order)
SELECT 'Custom Plan', 'Custom Pricing', 'One-time',
  'Built for businesses that require completely custom web solutions, advanced functionality, automations, or enterprise-level development.',
  '["Fully Custom Website or Web Application","Custom Design Tailored to Your Brand","Advanced E-commerce Solutions","Custom Admin Dashboard","Booking & Appointment Systems","Payment Gateway Integration","API & CRM Integrations","Custom Features & Automations","Advanced SEO & Performance Optimisation","Priority Development & Consultation","Free Domain (1 Year)","Free Hosting (1 Year)","1 Year Free Support & Maintenance"]',
  'Request a Quote', 0, 1, 2
WHERE NOT EXISTS (SELECT 1 FROM pricing_plans WHERE sort_order = 2);
INSERT IGNORE INTO legal_pages (slug, title, content) VALUES
  ('privacy-policy', 'Privacy Policy', '<h2>Privacy at Espy Media</h2><p>Update this policy from the CMS.</p>'),
  ('terms-conditions', 'Terms & Conditions', '<h2>Terms &amp; Conditions</h2><p>Update these terms from the CMS.</p>');
INSERT IGNORE INTO seo_pages (path, meta_title, meta_description, meta_keywords, og_title, og_description, og_image,
  twitter_title, twitter_description, canonical_url, structured_data, noindex)
VALUES ('/', 'Espy Media — Design & Growth for Ambitious Brands',
  'Espy Media is a full-stack creative studio building web design, paid ads, lead generation, and graphic design.',
  '', '', '', '', '', '', '', '{}', 0);

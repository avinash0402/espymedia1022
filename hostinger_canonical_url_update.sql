-- Apply this in phpMyAdmin after selecting the Hostinger application database.
-- Creates or updates SEO metadata for Contact, Web Design Projects, and Graphic Design Portfolio.
-- Also normalizes the canonical URL of every SEO row using its existing route path.

SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO seo_pages (
  path, meta_title, meta_description, meta_keywords, og_title, og_description,
  og_image, twitter_title, twitter_description, canonical_url, structured_data, noindex
)
VALUES
(
  '/contact',
  'Contact Espy Media | Start a Project',
  'Contact Espy Media to discuss web design, development, digital marketing, paid advertising, lead generation, or graphic design. Email or call our team to get started.',
  'contact Espy Media, web design enquiry, digital marketing enquiry, graphic design agency contact',
  'Contact Espy Media',
  'Tell us about your project and connect with the Espy Media team.',
  '',
  'Contact Espy Media | Start a Project',
  'Tell us about your project and connect with the Espy Media team.',
  'https://www.espymediaagency.in/contact',
  JSON_OBJECT(
    '@context', 'https://schema.org',
    '@type', 'ContactPage',
    'name', 'Contact Espy Media',
    'url', 'https://www.espymediaagency.in/contact',
    'mainEntity', JSON_OBJECT(
      '@type', 'Organization',
      'name', 'Espy Media',
      'email', 'info.espymedia@gmail.com',
      'telephone', '7989340409'
    )
  ),
  0
),
(
  '/projects',
  'Web Design Projects & Website Portfolio | Espy Media',
  'Explore websites designed and developed by Espy Media. See responsive, performance-focused web design projects built to strengthen brands and convert visitors.',
  'web design portfolio, website design projects, web development portfolio, responsive website design, Espy Media projects',
  'Web Design Projects | Espy Media',
  'Explore responsive, conversion-focused websites designed and developed by Espy Media.',
  '',
  'Web Design Projects & Website Portfolio | Espy Media',
  'Explore responsive, conversion-focused websites designed and developed by Espy Media.',
  'https://www.espymediaagency.in/projects',
  JSON_OBJECT(
    '@context', 'https://schema.org',
    '@type', 'CollectionPage',
    'name', 'Web Design Projects',
    'url', 'https://www.espymediaagency.in/projects',
    'about', 'Web design and development projects by Espy Media'
  ),
  0
),
(
  '/graphic-design',
  'Graphic Design Portfolio | Branding & Creative Work | Espy Media',
  'Explore Espy Media’s graphic design portfolio, including brand identities, social media creatives, print design, and digital visuals created for growing businesses.',
  'graphic design portfolio, branding portfolio, social media design, print design, creative design work, Espy Media',
  'Graphic Design Portfolio | Espy Media',
  'Browse brand identities, social creatives, print design, and digital visuals by Espy Media.',
  '',
  'Graphic Design Portfolio | Branding & Creative Work | Espy Media',
  'Browse brand identities, social creatives, print design, and digital visuals by Espy Media.',
  'https://www.espymediaagency.in/graphic-design',
  JSON_OBJECT(
    '@context', 'https://schema.org',
    '@type', 'CollectionPage',
    'name', 'Graphic Design Portfolio',
    'url', 'https://www.espymediaagency.in/graphic-design',
    'about', 'Graphic design and branding work by Espy Media'
  ),
  0
)
ON DUPLICATE KEY UPDATE
  meta_title = VALUES(meta_title),
  meta_description = VALUES(meta_description),
  meta_keywords = VALUES(meta_keywords),
  og_title = VALUES(og_title),
  og_description = VALUES(og_description),
  og_image = VALUES(og_image),
  twitter_title = VALUES(twitter_title),
  twitter_description = VALUES(twitter_description),
  canonical_url = VALUES(canonical_url),
  structured_data = VALUES(structured_data),
  noindex = VALUES(noindex);

UPDATE seo_pages
SET canonical_url = CONCAT(
  'https://www.espymediaagency.in',
  CASE
    WHEN LEFT(path, 1) = '/' THEN path
    ELSE CONCAT('/', path)
  END
)
WHERE path IS NOT NULL
  AND path <> '';

COMMIT;

SELECT path, meta_title, meta_description, canonical_url
FROM seo_pages
WHERE path IN ('/', '/contact', '/projects', '/graphic-design')
ORDER BY path;

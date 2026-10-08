-- Apply this in phpMyAdmin to set canonical URLs for all existing SEO page rows.
-- The homepage canonical will be https://www.espymediaagency.in/
-- Each other canonical URL is built from the row's existing path.

SET NAMES utf8mb4;
START TRANSACTION;

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

SELECT path, canonical_url
FROM seo_pages
ORDER BY path;

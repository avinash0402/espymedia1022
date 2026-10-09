-- Keep existing featured rows up to the new limits, ordered by display order
-- and then ID. Extra rows are unfeatured; no projects or images are deleted.
-- The application/API enforce these limits for future changes.

START TRANSACTION;

UPDATE projects
SET featured = 0
WHERE featured = 1
  AND id NOT IN (
    SELECT id
    FROM (
      SELECT id
      FROM projects
      WHERE featured = 1
      ORDER BY sort_order ASC, id ASC
      LIMIT 3
    ) AS retained_web_projects
  );

UPDATE graphic_works
SET featured = 0
WHERE featured = 1
  AND id NOT IN (
    SELECT id
    FROM (
      SELECT id
      FROM graphic_works
      WHERE featured = 1
      ORDER BY sort_order ASC, id ASC
      LIMIT 10
    ) AS retained_graphic_works
  );

COMMIT;

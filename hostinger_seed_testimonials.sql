-- Import the existing homepage testimonial copy into the editable MySQL records.
-- Run once in phpMyAdmin after selecting the Hostinger application database.
-- Re-running this script will not duplicate a row with the same name, company, and quote.

SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO testimonials (client_name, company, role, quote, rating, published, sort_order)
SELECT 'Rahul Sharma', 'TechNova Solutions', 'Founder',
  'Espy Media rebuilt our entire online presence in under a month. Our enquiries went from a trickle to a flood — the lead volume hasn''t dropped since day one.',
  5, 1, 0
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials
  WHERE client_name = 'Rahul Sharma'
    AND company = 'TechNova Solutions'
    AND quote = 'Espy Media rebuilt our entire online presence in under a month. Our enquiries went from a trickle to a flood — the lead volume hasn''t dropped since day one.'
);

INSERT INTO testimonials (client_name, company, role, quote, rating, published, sort_order)
SELECT 'Sarah Lin', 'Helix SaaS', 'Head of Growth',
  'The web redesign doubled our demo bookings within 6 weeks of launch. Zero bloat, pure performance. Best investment we made all year.',
  5, 1, 1
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials
  WHERE client_name = 'Sarah Lin'
    AND company = 'Helix SaaS'
    AND quote = 'The web redesign doubled our demo bookings within 6 weeks of launch. Zero bloat, pure performance. Best investment we made all year.'
);

INSERT INTO testimonials (client_name, company, role, quote, rating, published, sort_order)
SELECT 'Marcus Webb', 'Fortis Legal', 'Founder',
  'Our Google Ads went from burning cash to printing it — 8x ROAS in month three. I genuinely didn''t think that was possible at our budget.',
  5, 1, 2
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials
  WHERE client_name = 'Marcus Webb'
    AND company = 'Fortis Legal'
    AND quote = 'Our Google Ads went from burning cash to printing it — 8x ROAS in month three. I genuinely didn''t think that was possible at our budget.'
);

INSERT INTO testimonials (client_name, company, role, quote, rating, published, sort_order)
SELECT 'Priya Nair', 'Meridian Aesthetic Clinic', 'Managing Director',
  'Espy built a lead machine that fills our CRM every single week. The pipeline quality and brand presentation they delivered is exceptional.',
  5, 1, 3
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials
  WHERE client_name = 'Priya Nair'
    AND company = 'Meridian Aesthetic Clinic'
    AND quote = 'Espy built a lead machine that fills our CRM every single week. The pipeline quality and brand presentation they delivered is exceptional.'
);

INSERT INTO testimonials (client_name, company, role, quote, rating, published, sort_order)
SELECT 'D. Mehta', '', 'Founder',
  'Incredible results from day one.',
  5, 1, 4
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials
  WHERE client_name = 'D. Mehta'
    AND company = ''
    AND quote = 'Incredible results from day one.'
);

INSERT INTO testimonials (client_name, company, role, quote, rating, published, sort_order)
SELECT 'A. Kapoor', '', 'CEO',
  'Best agency we''ve ever worked with.',
  5, 1, 5
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials
  WHERE client_name = 'A. Kapoor'
    AND company = ''
    AND quote = 'Best agency we''ve ever worked with.'
);

COMMIT;

SELECT id, client_name, company, role, quote, rating, published, sort_order
FROM testimonials
WHERE client_name IN ('Rahul Sharma', 'Sarah Lin', 'Marcus Webb', 'Priya Nair', 'D. Mehta', 'A. Kapoor')
ORDER BY sort_order, id;

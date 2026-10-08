-- Run this once in phpMyAdmin after selecting the Hostinger application database.
-- Creates the FAQ table if needed and seeds starter questions without replacing
-- existing answers. Manage the questions later at /admin/faqs.

CREATE TABLE IF NOT EXISTS faqs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_faqs_question (question)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO faqs (question, answer, sort_order, published) VALUES
(
  'What kind of websites does Espy Media create?',
  'We design and build custom business websites and e-commerce experiences, shaped around your brand, audience, and goals. The right approach depends on your project requirements.',
  0,
  1
),
(
  'How much does a website project cost?',
  'The cost depends on the pages, features, integrations, and content your project needs. Our website plans start at the prices shown on this site; after learning about your requirements, we can recommend a suitable scope and quote.',
  1,
  1
),
(
  'How long does it take to build a website?',
  'Timing depends on the project scope, design, features, and how quickly content and feedback are available. We’ll discuss a realistic schedule with you before work begins.',
  2,
  1
),
(
  'Will my website work well on mobile?',
  'Yes. Responsive layouts are part of the design and build process, so the experience is made to adapt to phone, tablet, and desktop screens.',
  3,
  1
),
(
  'Can you build an online store?',
  'Yes. We can help create e-commerce websites, including product discovery and the core shopping experience. The platform and integrations are chosen to suit your catalogue and business needs.',
  4,
  1
),
(
  'Is SEO included in a website project?',
  'Our website work can include foundational on-page and technical SEO, such as clear page structure and metadata. Search rankings depend on many factors, so no specific ranking or traffic result can be guaranteed.',
  5,
  1
),
(
  'Can you help after the website goes live?',
  'Yes. We can discuss ongoing support, maintenance, and improvements based on what your website needs after launch.',
  6,
  1
),
(
  'How do I get started?',
  'Send us a message through the contact page with a short outline of your goals, services, and any reference websites. We’ll follow up to understand the scope and next steps.',
  7,
  1
);

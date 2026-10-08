-- Apply this after schema.sql has been imported into the Hostinger MySQL database.
-- Contact details are stored in settings; the site's Call Us button reads settings.phone.
-- Legal text is a general website draft, not legal advice. Have counsel review it
-- for your business practices and applicable Indian privacy/consumer laws.

SET NAMES utf8mb4;
START TRANSACTION;

UPDATE settings
SET contact_email = 'info.espymedia@gmail.com',
    support_email = 'info.espymedia@gmail.com',
    phone = '7989340409',
    default_meta_title = 'Espy Media | Web Design, Digital Marketing & Branding',
    default_meta_description = 'Espy Media helps businesses grow with conversion-focused web design, development, paid advertising, lead generation, and graphic design. Contact our team to discuss your project.',
    default_meta_keywords = 'web design, web development, digital marketing, paid advertising, lead generation, graphic design, branding, website design agency'
WHERE id = 1;

INSERT INTO legal_pages (slug, title, content)
VALUES
(
  'privacy-policy',
  'Privacy Policy',
  '<p><strong>Last updated: 8 October 2026</strong></p>
   <p>Espy Media respects your privacy. This policy explains what information may be collected when you visit our website or contact us, how it is used, and how you can reach us with questions.</p>
   <h2>Information you provide</h2>
   <p>When you submit an enquiry or contact us, you may provide your name, email address, phone number, company name, project requirements, budget, timeline, and any other information you choose to include. If you contact us by email, telephone, or WhatsApp, we receive the information you share through that channel.</p>
   <h2>Information collected through the website</h2>
   <p>Our hosting and security systems may process basic technical information such as browser and device details, request timestamps, and diagnostic or security logs. If analytics or similar tools are enabled on the website, those tools may use cookies or comparable technologies to measure website usage. You can manage cookies through your browser settings; blocking some cookies may affect website features.</p>
   <h2>How we use information</h2>
   <ul>
     <li>To respond to enquiries and discuss requested services.</li>
     <li>To prepare proposals, provide services, and communicate about active work.</li>
     <li>To operate, secure, troubleshoot, and improve the website and our services.</li>
     <li>To meet applicable legal obligations and protect against misuse or fraud.</li>
   </ul>
   <h2>Sharing and service providers</h2>
   <p>We do not sell personal information. We may share relevant information with service providers who help us host, secure, analyse, or operate the website or deliver a requested service. They should use it only for those purposes. We may also disclose information when required by law or reasonably necessary to protect rights, safety, and security.</p>
   <h2>Retention and security</h2>
   <p>We retain information for as long as reasonably necessary to respond to you, provide services, maintain business records, resolve disputes, and meet legal requirements. We use reasonable safeguards, but no method of transmission or storage can be guaranteed completely secure.</p>
   <h2>Your choices and requests</h2>
   <p>You may contact us to request access to, correction of, or deletion of personal information you have provided, subject to applicable law and legitimate record-keeping requirements. We may need to verify your identity before acting on a request.</p>
   <h2>External links and children</h2>
   <p>Our website may link to third-party websites or services governed by their own privacy practices. Our website is intended for businesses and general audiences, not for children to submit personal information.</p>
   <h2>Changes and contact</h2>
   <p>We may update this policy from time to time by publishing a revised version on this page. For privacy questions or requests, email <a href="mailto:info.espymedia@gmail.com">info.espymedia@gmail.com</a> or call <a href="tel:7989340409">7989340409</a>.</p>'
),
(
  'terms-conditions',
  'Terms & Conditions',
  '<p><strong>Last updated: 8 October 2026</strong></p>
   <p>These terms apply to your use of the Espy Media website. By using the website, you agree to these terms. A separate written proposal, statement of work, or service agreement may set additional terms for a particular project; if it conflicts with these website terms, the project agreement will govern that project.</p>
   <h2>Website information</h2>
   <p>Website content is provided for general information about our services. Examples, portfolio items, timelines, and descriptions are illustrative and do not guarantee a particular result. We may correct or update website content at any time.</p>
   <h2>Enquiries and project agreements</h2>
   <p>Submitting an enquiry does not create a client relationship or require either party to proceed. Scope, deliverables, fees, payment milestones, revisions, timeline, ownership, support, and any cancellation terms should be confirmed in a written project agreement before work begins.</p>
   <h2>Your responsibilities</h2>
   <p>You are responsible for ensuring that information, content, images, trademarks, and other materials you provide may lawfully be used for the project. You must not use the website to submit unlawful, harmful, deceptive, or infringing material or to interfere with the website or its security.</p>
   <h2>Intellectual property</h2>
   <p>Unless a written project agreement says otherwise, the website and its original content, branding, and design are owned by Espy Media or its licensors. You may not copy, republish, or commercially exploit that material without prior written permission. Ownership and licensing of project deliverables will be described in the applicable project agreement.</p>
   <h2>Third-party services and links</h2>
   <p>The website may link to or rely on third-party websites and services. Those services are controlled by their respective providers, and their own terms and policies apply. We are not responsible for third-party content or availability.</p>
   <h2>Availability and liability</h2>
   <p>We aim to keep the website available and accurate but do not guarantee uninterrupted or error-free operation. To the extent permitted by applicable law, Espy Media is not liable for indirect or consequential loss arising solely from use of this informational website. Nothing in these terms excludes liability that cannot legally be excluded. These terms do not replace any rights you have under applicable law or any written project agreement.</p>
   <h2>Changes and contact</h2>
   <p>We may update these terms by publishing a revised version on this page. Questions about these terms may be sent to <a href="mailto:info.espymedia@gmail.com">info.espymedia@gmail.com</a> or discussed by calling <a href="tel:7989340409">7989340409</a>.</p>'
)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  content = VALUES(content);

INSERT INTO seo_pages (
  path, meta_title, meta_description, meta_keywords, og_title, og_description,
  og_image, twitter_title, twitter_description, canonical_url, structured_data, noindex
)
VALUES
(
  '/',
  'Espy Media | Web Design, Digital Marketing & Branding',
  'Espy Media helps businesses grow with conversion-focused web design, development, paid advertising, lead generation, and graphic design. Contact our team to discuss your project.',
  'web design, web development, digital marketing, paid advertising, lead generation, graphic design, branding, website design agency',
  'Espy Media | Design & Growth for Ambitious Brands',
  'Build a sharper brand and grow online with web design, paid ads, lead generation, and graphic design from Espy Media.',
  '',
  'Espy Media | Web Design, Digital Marketing & Branding',
  'Conversion-focused websites, digital marketing, lead generation, and creative design for growing businesses.',
  'https://www.espymediaagency.in/',
  JSON_OBJECT(
    '@context', 'https://schema.org',
    '@type', 'ProfessionalService',
    'name', 'Espy Media',
    'email', 'info.espymedia@gmail.com',
    'telephone', '7989340409',
    'description', 'Web design, web development, digital marketing, paid advertising, lead generation, and graphic design.'
  ),
  0
),
(
  '/privacy-policy',
  'Privacy Policy | Espy Media',
  'Read how Espy Media handles information submitted through our website and enquiries, how it may be used or shared, and how to contact us about a privacy request.',
  'Espy Media privacy policy, personal information, website privacy, data requests',
  'Privacy Policy | Espy Media',
  'Learn how Espy Media handles website enquiries and personal information.',
  '',
  'Privacy Policy | Espy Media',
  'Learn how Espy Media handles website enquiries and personal information.',
  'https://www.espymediaagency.in/privacy-policy',
  JSON_OBJECT('@context', 'https://schema.org', '@type', 'WebPage', 'name', 'Privacy Policy', 'about', 'Espy Media privacy practices'),
  0
),
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
  '/terms-conditions',
  'Terms & Conditions | Espy Media',
  'Review the terms for using the Espy Media website, including website information, enquiries, project agreements, intellectual property, and third-party links.',
  'Espy Media terms and conditions, website terms, project agreements, intellectual property',
  'Terms & Conditions | Espy Media',
  'Read the terms that apply to use of the Espy Media website and enquiries.',
  '',
  'Terms & Conditions | Espy Media',
  'Read the terms that apply to use of the Espy Media website and enquiries.',
  'https://www.espymediaagency.in/terms-conditions',
  JSON_OBJECT('@context', 'https://schema.org', '@type', 'WebPage', 'name', 'Terms & Conditions', 'about', 'Terms for using the Espy Media website'),
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
);

UPDATE seo_pages
SET structured_data = JSON_SET(
  structured_data,
  '$.url', 'https://www.espymediaagency.in/contact'
)
WHERE path = '/contact';

COMMIT;

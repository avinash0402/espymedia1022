# Hostinger PHP + MySQL API

This API replaces the deployed Node/PostgreSQL API while the existing React/Vite
frontend remains on Vercel. The browser calls this API over HTTPS; database
credentials stay on the Hostinger server.

## Requirements

- PHP 8.1 or newer with PDO MySQL enabled
- MySQL database and user created in Hostinger
- HTTPS on the API hostname
- The exact Vercel website origin (for example `https://www.example.com`)

## Prepare the database

1. Back up the current PostgreSQL database before changing production.
2. In Hostinger, create or select the MySQL database and a dedicated database
   user. Grant the user access only to that database. The database must accept
   connections from the API hosted in the same Hostinger account; Vercel itself
   does not connect to MySQL.
3. Use phpMyAdmin to import `schema.sql`.
4. Export and migrate existing PostgreSQL content separately. JSON and array
   columns (for example project galleries and homepage stats) need conversion to
   MySQL JSON. Do not switch the live frontend until the imported content and
   admin account have been checked.

The schema inserts initial site settings and default content for an empty
database. It does not copy existing production data.

## Homepage FAQs

For an existing Hostinger database, run `hostinger_faq_setup.sql` from
phpMyAdmin to create the FAQ table and add starter questions. The insert is
safe to run again: it adds missing questions and does not overwrite existing
answers. Upload the current `index.php` API and deploy the current frontend to
enable the public homepage FAQ section and the authenticated `/admin/faqs`
editor. New installations can use the FAQ table definition in `schema.sql`.

## Portfolio featured limits and image access

The admin and API limit homepage selections to 3 featured website projects and
10 featured graphic works. Deploy the current `index.php` to Hostinger for the
API to accept the 10-work limit; updating the frontend alone does not change
the API's limit. For an existing database with more featured rows than those
limits, run `hostinger_featured_portfolio_limits.sql` once in phpMyAdmin. It
retains the lowest display-order rows (then lowest IDs) and unfeatures the
extras without deleting projects or images.

Upload the current `.htaccess` with the API files so cross-origin requests for
public uploaded images include the CORS header required by the homepage gallery.

## Deploy the API

1. Create an API subdomain in Hostinger, such as `api.example.com`, with HTTPS.
   Point its document root at the contents of this directory (so `index.php`
   is in the document root). The included `.htaccess` routes API requests.
2. In Hostinger File Manager, go to the account's home directory (one level
   above the API subdomain's document root) and create
   `hostinger-api-config.php`. For the common `public_html` document root, put
   this file beside `public_html`, not inside it. Use this PHP array, replacing
   every example value with your Hostinger database details:

   ```php
   <?php
   return [
       'MYSQL_HOST' => 'the-hostinger-database-host',
       'MYSQL_PORT' => '3306',
       'MYSQL_DATABASE' => 'the-full-database-name',
       'MYSQL_USER' => 'the-full-database-username',
       'MYSQL_PASSWORD' => 'the-database-password',
       'FRONTEND_ORIGIN' => 'https://your-vercel-site.example,https://your-custom-domain.example',
       'API_PUBLIC_URL' => 'https://api.yourdomain.com',
   ];
   ```

   Find the hostname, full database name, and username in hPanel's database
   details. `FRONTEND_ORIGIN` accepts one or more browser origins,
   comma-separated with no paths or trailing slashes. The API also allows the
   matching `www` or apex variant of each configured domain. For example:
   `https://espymedia1022.vercel.app,https://espymediaagency.in`.
   `API_PUBLIC_URL` is optional.
3. Save the file with permissions restricted to the account owner where the
   File Manager permits it. Do not put credentials in frontend files, Vercel
   `VITE_*` variables, or any file under the public document root. The API
   loads this private file automatically; environment variables set by Hostinger
   take precedence if present.
4. Upload the updated `index.php` after applying this configuration support.
   Visit `/api/health` and `/api/diagnostics` on the API host. The website's
   `/diagnostics` page additionally checks whether its browser origin is
   allowed, the MySQL connection works, the `admin_users` table exists, and
   initial admin setup is still available. Diagnostics show SQLSTATE/MySQL
   error codes and actionable causes without returning database credentials.

If the frontend and API use unrelated domain names, browsers may block the
cross-site admin session cookie. Prefer serving the API from a subdomain of the
website's own domain (for example `api.example.com` and `www.example.com`).

## Connect the Vercel frontend

Set `VITE_API_BASE_URL` in Vercel to the API origin ending in `/api`, for
example `https://api.example.com/api`, then redeploy the frontend. The PHP API
allows credentialed requests only from origins listed in `FRONTEND_ORIGIN`.
For this site, the production value is
`https://api.espymediaagency.in/api`. Do not deploy with the placeholder
`https://api.example.com/api`; it causes browser API requests to fail.

The frontend still uses the existing React UI and API contract. Public content,
admin login, CMS updates, leads, and image uploads are handled by the PHP API.
Uploads are stored under this API's `uploads/` directory; ensure the Hostinger
account has enough space and that this directory is writable by PHP.

Social preview requests from WhatsApp, Facebook, X, LinkedIn, and other link
crawlers are routed by Vercel to `/share.php` on this API. That endpoint reads
the matching page's SEO row and the default site settings so link previews use
the current admin title, description, and OG image. Deploy the updated frontend
`vercel.json` and upload `share.php` to this API's document root for social
previews to work.

Admin sessions use a 30-day rolling lifetime: authenticated activity refreshes
the browser cookie and PHP session data, and the API sets
`session.gc_maxlifetime` to the same interval. If Hostinger disables this
PHP setting, set `session.gc_maxlifetime` to at least `2592000` seconds in the
API subdomain's PHP configuration.

The API makes one bounded retry when opening MySQL and when a read query loses
its connection (driver errors 2002, 2003, 2006, 2013, or 2055). It does not
retry database writes, to avoid duplicating changes. If `/api/diagnostics`
reports a failure, use its SQLSTATE/MySQL error code and the matching Hostinger
PHP error log entry to investigate. Check hPanel for database availability,
connection limits, and whether the configured database host is the one shown
in the database details. Do not switch to persistent PDO connections as a
workaround: on shared hosting those can consume the account's limited MySQL
connections.

## Sitemap and Google Search Console

The frontend deployment publishes `public/sitemap.xml` at
`https://espymediaagency.in/sitemap.xml` and `public/robots.txt` references it.
After deploying the frontend, open that URL and confirm it returns XML rather
than the SPA HTML page. In Google Search Console, verify the
`https://espymediaagency.in/` property, open **Sitemaps**, submit
`sitemap.xml`, and resolve any reported fetch or URL errors. Update the sitemap
when public page routes change; do not include admin, diagnostics, or private
URLs.

## First admin user

After the schema is imported and the frontend points at the API, use the
existing `/admin/setup` page once to create the first admin. Further setup
attempts are rejected once an admin account exists.

## Move Cloudinary images to Hostinger

The PHP API stores new uploads in its `uploads/` directory. To copy all image
assets from the Cloudinary account and replace Cloudinary links used by site
content, run the migration script from the project root on a trusted computer
with Node.js 18 or newer. It uses the Cloudinary Admin API and your Hostinger
API; credentials are read only from local environment variables, never saved in
the repository.

In PowerShell, set the Cloudinary cloud name/API key/API secret and the
Hostinger API URL. Run without `--apply` first to list the number and total
size of assets, referenced image links, and content records:

```powershell
$env:CLOUDINARY_CLOUD_NAME = 'your-cloud-name'
$env:CLOUDINARY_API_KEY = 'your-cloudinary-api-key'
$env:CLOUDINARY_API_SECRET = 'your-cloudinary-api-secret'
$env:HOSTINGER_API_BASE = 'https://api.yourdomain.com/api'
node scripts/migrate-cloudinary-to-hostinger.mjs
```

After checking the preview, set the Hostinger admin credentials in the same
PowerShell window and run with `--apply`:

```powershell
$env:HOSTINGER_ADMIN_EMAIL = 'your-admin-email'
$env:HOSTINGER_ADMIN_PASSWORD = 'your-admin-password'
node scripts/migrate-cloudinary-to-hostinger.mjs --apply
```

Import the content rows into MySQL before applying the migration. The script
copies every image asset in the Cloudinary `image/upload` collection (not
video/raw resources), then copies any referenced transformed image URLs needed
to preserve the exact content image. It updates image URLs in settings,
projects, graphic works and galleries, testimonials, blog posts, platforms,
and SEO records. It resumes from the local ignored mapping file if interrupted.
Uploads over 10 MB or unsupported image formats stop the run before database
URLs are updated; resolve those images and run it again.
If you import database rows after running the script, run it again after the
import so those rows' Cloudinary URLs are also replaced.

Verify the copied images and website pages before removing the Cloudinary
environment variables from any old deployment and revoking the Cloudinary API
key. Keep the Cloudinary originals until the Hostinger copies and every
referenced page have been checked. Copying does not delete any Cloudinary data.

Keep the old database available and backed up until public pages, login,
dashboard, CMS editing, lead submission, and uploads have all been tested on
the new API. The old PostgreSQL/Node server source remains for local development and
rollback only. No Vercel serverless API is deployed; production API requests
use the configured Hostinger API URL.

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
   details. `FRONTEND_ORIGIN` accepts one or more exact browser origins,
   comma-separated with no paths or trailing slashes. For example:
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

The frontend still uses the existing React UI and API contract. Public content,
admin login, CMS updates, leads, and image uploads are handled by the PHP API.
Uploads are stored under this API's `uploads/` directory; ensure the Hostinger
account has enough space and that this directory is writable by PHP.

## First admin user

After the schema is imported and the frontend points at the API, use the
existing `/admin/setup` page once to create the first admin. Further setup
attempts are rejected once an admin account exists.

Keep the old database available and backed up until public pages, login,
dashboard, CMS editing, lead submission, and uploads have all been tested on
the new API. The old PostgreSQL/Node server source remains for local development and
rollback only. No Vercel serverless API is deployed; production API requests
use the configured Hostinger API URL.

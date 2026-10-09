<?php
declare(strict_types=1);

const LEGACY_ADMIN_HASH = '$2a$10$rrJm7j63zrlWGxINgIG7NeFLYkkFsrLmcxVeEld430rhnLdEkSwyC';
const ADMIN_SESSION_LIFETIME_SECONDS = 30 * 24 * 60 * 60;

$privateConfigPath = getenv('HOSTINGER_API_CONFIG') ?: dirname(__DIR__) . '/hostinger-api-config.php';
$privateConfig = [];
$requestId = bin2hex(random_bytes(8));
if (is_file($privateConfigPath)) {
    $loadedConfig = require $privateConfigPath;
    if (is_array($loadedConfig)) {
        $privateConfig = $loadedConfig;
    } else {
        error_log('[hostinger-api] Private config must return an array');
    }
}

function configValue(string $name, ?string $default = null): ?string
{
    global $privateConfig;
    $environmentValue = getenv($name);
    if ($environmentValue !== false && $environmentValue !== '') {
        return $environmentValue;
    }
    $value = $privateConfig[$name] ?? $default;
    return is_string($value) ? $value : $default;
}

function respond(mixed $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function fail(string $message, int $status): never
{
    global $requestId;
    respond(['error' => $message, 'requestId' => $requestId], $status);
}

function databaseErrorDetail(Throwable $error): string
{
    if (!$error instanceof PDOException) {
        return $error->getMessage() === 'MySQL configuration is incomplete'
            ? 'MySQL configuration is incomplete. Verify MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, and MYSQL_PASSWORD in the private Hostinger config.'
            : 'Database check failed. Check the Hostinger PHP error log for the full server-side error.';
    }

    $sqlState = (string)$error->getCode();
    $driverCode = isset($error->errorInfo[1]) ? (int)$error->errorInfo[1] : 0;
    $reason = match ($driverCode) {
        1045 => 'MySQL denied access. Verify the database username and password, and confirm the user is assigned to this database.',
        1049 => 'MySQL could not find the configured database. Verify its full database name in Hostinger.',
        2002, 2003 => 'Hostinger MySQL could not be reached. Verify the database host and port.',
        1146 => 'A required MySQL table is missing. Import the current schema.sql file using phpMyAdmin.',
        1044 => 'The configured MySQL user does not have permission to use this database.',
        2054 => 'The MySQL server authentication method is not supported by the PHP client.',
        default => 'MySQL rejected the operation. Check the Hostinger PHP error log for the full server-side error.',
    };
    $codes = 'SQLSTATE ' . ($sqlState !== '' ? $sqlState : 'unknown');
    if ($driverCode !== 0) {
        $codes .= ', MySQL error ' . $driverCode;
    }
    return $reason . ' (' . $codes . ').';
}

function database(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = configValue('MYSQL_HOST', '');
    $name = configValue('MYSQL_DATABASE', '');
    $user = configValue('MYSQL_USER', '');
    $password = configValue('MYSQL_PASSWORD');
    if ($host === '' || $name === '' || $user === '' || $password === null || $password === '') {
        throw new RuntimeException('MySQL configuration is incomplete');
    }
    $port = configValue('MYSQL_PORT', '3306');
    $pdo = new PDO(
        "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 5,
        ]
    );
    return $pdo;
}

function queryRows(string $sql, array $values = []): array
{
    $statement = database()->prepare($sql);
    $statement->execute($values);
    return $statement->fetchAll();
}

function queryOne(string $sql, array $values = []): ?array
{
    $statement = database()->prepare($sql);
    $statement->execute($values);
    $row = $statement->fetch();
    return $row === false ? null : $row;
}

function execute(string $sql, array $values = []): PDOStatement
{
    $statement = database()->prepare($sql);
    $statement->execute($values);
    return $statement;
}

function decodeRow(?array $row, array $map, array $jsonFields = [], array $boolFields = []): ?array
{
    if ($row === null) {
        return null;
    }
    $result = [];
    foreach ($map as $public => $column) {
        $value = $row[$column] ?? null;
        if (in_array($public, $jsonFields, true)) {
            if (is_string($value)) {
                $value = json_decode($value);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    $value = [];
                }
            } elseif ($value === null) {
                $value = [];
            }
        } elseif (in_array($public, $boolFields, true)) {
            $value = (bool)$value;
        }
        $result[$public] = $value;
    }
    return $result;
}

function decodeRows(array $rows, array $map, array $jsonFields = [], array $boolFields = []): array
{
    return array_map(
        static fn(array $row): array => decodeRow($row, $map, $jsonFields, $boolFields) ?? [],
        $rows
    );
}

function requestBody(): array
{
    $body = file_get_contents('php://input');
    if ($body === false || trim($body) === '') {
        return [];
    }
    $decoded = json_decode($body, true);
    if (!is_array($decoded)) {
        fail('Invalid JSON body', 400);
    }
    return $decoded;
}

function valuesFor(array $body, array $fieldMap, array $jsonFields = []): array
{
    $columns = [];
    $values = [];
    foreach ($fieldMap as $public => $column) {
        if (!array_key_exists($public, $body)) {
            continue;
        }
        $columns[] = $column;
        $value = $body[$public];
        $values[] = in_array($public, $jsonFields, true)
            ? json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
            : $value;
    }
    return [$columns, $values];
}

function insertMapped(string $table, array $body, array $fieldMap, array $jsonFields = []): array
{
    [$columns, $values] = valuesFor($body, $fieldMap, $jsonFields);
    if ($columns === []) {
        fail('No fields provided', 400);
    }
    $quoted = implode(', ', $columns);
    $placeholders = implode(', ', array_fill(0, count($columns), '?'));
    $statement = execute("INSERT INTO {$table} ({$quoted}) VALUES ({$placeholders})", $values);
    $id = (int)database()->lastInsertId();
    $primaryKey = $table === 'legal_pages' ? 'slug' : 'id';
    $keyValue = $table === 'legal_pages' ? (string)($body['slug'] ?? '') : $id;
    return queryOne("SELECT * FROM {$table} WHERE {$primaryKey} = ?", [$keyValue]) ?? [];
}

function updateMapped(string $table, int|string $id, string $keyColumn, array $body, array $fieldMap, array $jsonFields = []): ?array
{
    [$columns, $values] = valuesFor($body, $fieldMap, $jsonFields);
    if ($columns !== []) {
        $assignments = implode(', ', array_map(static fn(string $column): string => "{$column} = ?", $columns));
        $values[] = $id;
        execute("UPDATE {$table} SET {$assignments} WHERE {$keyColumn} = ?", $values);
    }
    return queryOne("SELECT * FROM {$table} WHERE {$keyColumn} = ?", [$id]);
}

function removeById(string $table, int|string $id, string $keyColumn = 'id'): void
{
    execute("DELETE FROM {$table} WHERE {$keyColumn} = ?", [$id]);
}

function requireAuth(): void
{
    if (empty($_SESSION['userId'])) {
        fail('Unauthorized', 401);
    }
    keepAdminSessionAlive();
}

function frontendOriginAllowed(string $origin, array $configuredOrigins): bool
{
    if (in_array($origin, $configuredOrigins, true)) {
        return true;
    }

    $requestParts = parse_url($origin);
    if (!is_array($requestParts) || !isset($requestParts['scheme'], $requestParts['host'])) {
        return false;
    }
    $requestHost = strtolower($requestParts['host']);
    $requestPort = isset($requestParts['port']) ? ':' . $requestParts['port'] : '';

    foreach ($configuredOrigins as $configuredOrigin) {
        $configuredParts = parse_url($configuredOrigin);
        if (!is_array($configuredParts) || !isset($configuredParts['scheme'], $configuredParts['host'])) {
            continue;
        }
        if ($requestParts['scheme'] !== $configuredParts['scheme']) {
            continue;
        }

        $configuredHost = strtolower($configuredParts['host']);
        $configuredPort = isset($configuredParts['port']) ? ':' . $configuredParts['port'] : '';
        if ($requestPort !== $configuredPort || substr_count($configuredHost, '.') < 1) {
            continue;
        }

        $wwwHost = str_starts_with($configuredHost, 'www.')
            ? substr($configuredHost, 4)
            : 'www.' . $configuredHost;
        if ($requestHost === $wwwHost) {
            return true;
        }
    }

    return false;
}

function keepAdminSessionAlive(): void
{
    if (empty($_SESSION['userId'])) {
        return;
    }
    $_SESSION['lastActivityAt'] = time();

    $params = session_get_cookie_params();
    $options = [
        'expires' => time() + ADMIN_SESSION_LIFETIME_SECONDS,
        'path' => $params['path'],
        'secure' => $params['secure'],
        'httponly' => $params['httponly'],
        'samesite' => $params['samesite'] ?: 'None',
    ];
    if ($params['domain'] !== '') {
        $options['domain'] = $params['domain'];
    }
    if (!setcookie(session_name(), session_id(), $options)) {
        error_log('[hostinger-api] Could not refresh the admin session cookie');
    }
}

function requireMethod(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== $method) {
        header('Allow: ' . $method);
        fail('Method not allowed', 405);
    }
}

function sendMappedOne(string $table, int|string $id, string $keyColumn, array $map, array $json = [], array $bool = []): never
{
    $row = queryOne("SELECT * FROM {$table} WHERE {$keyColumn} = ?", [$id]);
    if ($row === null) {
        fail('Not found', 404);
    }
    respond(decodeRow($row, $map, $json, $bool));
}

$allowedOrigins = array_values(array_filter(array_map(
    'trim',
    explode(',', (string)(configValue('FRONTEND_ORIGIN', '') ?: ''))
), static fn(string $allowed): bool => $allowed !== ''));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && frontendOriginAllowed($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 600');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$forwardedProto = strtolower(trim(explode(',', (string)($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''))[0]));
$isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || $forwardedProto === 'https';
if (ini_set('session.gc_maxlifetime', (string)ADMIN_SESSION_LIFETIME_SECONDS) === false) {
    error_log('[hostinger-api] Could not set session.gc_maxlifetime; configure it to at least 2592000 seconds in Hostinger PHP settings');
}
session_set_cookie_params([
    'lifetime' => ADMIN_SESSION_LIFETIME_SECONDS,
    'path' => '/',
    'secure' => $isSecure,
    'httponly' => true,
    'samesite' => 'None',
]);
session_start();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = preg_replace('#^/api(?=/|$)#', '', $uriPath) ?: '/';
$path = '/' . trim($path, '/');
$body = requestBody();
if ($origin !== '' && !in_array($origin, $allowedOrigins, true)) {
    fail('Request origin is not allowed', 403);
}

$projectMap = [
    'id' => 'id', 'title' => 'title', 'slug' => 'slug', 'category' => 'category',
    'categoryId' => 'category_id', 'clientName' => 'client_name', 'challenge' => 'challenge',
    'approach' => 'approach', 'result' => 'result', 'metrics' => 'metrics',
    'imageUrl' => 'image_url', 'galleryUrls' => 'gallery_urls', 'techStack' => 'tech_stack',
    'liveUrl' => 'live_url', 'altText' => 'alt_text', 'published' => 'published',
    'featured' => 'featured', 'sortOrder' => 'sort_order', 'createdAt' => 'created_at',
    'updatedAt' => 'updated_at',
];
$testimonialMap = [
    'id' => 'id', 'clientName' => 'client_name', 'company' => 'company', 'role' => 'role',
    'quote' => 'quote', 'rating' => 'rating', 'avatarUrl' => 'avatar_url',
    'published' => 'published', 'sortOrder' => 'sort_order', 'createdAt' => 'created_at',
];
$faqMap = [
    'id' => 'id', 'question' => 'question', 'answer' => 'answer',
    'sortOrder' => 'sort_order', 'published' => 'published',
];
$blogMap = [
    'id' => 'id', 'title' => 'title', 'slug' => 'slug', 'excerpt' => 'excerpt',
    'content' => 'content', 'coverImageUrl' => 'cover_image_url', 'author' => 'author',
    'published' => 'published', 'publishedAt' => 'published_at',
    'createdAt' => 'created_at', 'updatedAt' => 'updated_at',
];
$leadMap = [
    'id' => 'id', 'name' => 'name', 'email' => 'email', 'company' => 'company',
    'projectType' => 'project_type', 'budget' => 'budget', 'timeline' => 'timeline',
    'details' => 'details', 'status' => 'status', 'notes' => 'notes', 'createdAt' => 'created_at',
];
$serviceMap = [
    'id' => 'id', 'name' => 'name', 'headline' => 'headline', 'description' => 'description',
    'icon' => 'icon', 'sortOrder' => 'sort_order', 'published' => 'published',
];
$platformMap = [
    'id' => 'id', 'name' => 'name', 'slug' => 'slug', 'logoUrl' => 'logo_url',
    'linkUrl' => 'link_url', 'published' => 'published', 'sortOrder' => 'sort_order',
];
$planMap = [
    'id' => 'id', 'name' => 'name', 'price' => 'price', 'period' => 'period',
    'description' => 'description', 'features' => 'features', 'ctaText' => 'cta_text',
    'highlighted' => 'highlighted', 'published' => 'published', 'sortOrder' => 'sort_order',
];
$categoryMap = ['id' => 'id', 'name' => 'name', 'slug' => 'slug'];
$workMap = [
    'id' => 'id', 'title' => 'title', 'slug' => 'slug', 'categoryId' => 'category_id',
    'imageUrl' => 'image_url', 'galleryUrls' => 'gallery_urls', 'description' => 'description',
    'altText' => 'alt_text', 'published' => 'published', 'featured' => 'featured',
    'sortOrder' => 'sort_order',
];
$legalMap = ['slug' => 'slug', 'title' => 'title', 'content' => 'content', 'updatedAt' => 'updated_at'];
$seoMap = [
    'id' => 'id', 'path' => 'path', 'metaTitle' => 'meta_title',
    'metaDescription' => 'meta_description', 'metaKeywords' => 'meta_keywords',
    'ogTitle' => 'og_title', 'ogDescription' => 'og_description', 'ogImage' => 'og_image',
    'twitterTitle' => 'twitter_title', 'twitterDescription' => 'twitter_description',
    'canonicalUrl' => 'canonical_url', 'structuredData' => 'structured_data',
    'noindex' => 'noindex',
];

try {
    if ($path === '/health' && $method === 'GET') {
        database()->query('SELECT 1');
        respond(['status' => 'ok']);
    }

    if ($path === '/diagnostics' && $method === 'GET') {
        $requiredConfig = ['MYSQL_HOST', 'MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD'];
        $missingConfig = array_values(array_filter(
            $requiredConfig,
            static fn(string $key): bool => !configValue($key)
        ));
        $hasMysqlConfig = $missingConfig === [];
        $hasPdoMysql = in_array('mysql', PDO::getAvailableDrivers(), true);
        $schemaFilePresent = is_file(__DIR__ . '/schema.sql');
        $allowedOrigins = array_values(array_filter(array_map(
            'trim',
            explode(',', (string)(configValue('FRONTEND_ORIGIN', '') ?: ''))
        ), static fn(string $allowed): bool => $allowed !== ''));
        $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $originAllowed = $requestOrigin === '' || frontendOriginAllowed($requestOrigin, $allowedOrigins);
        $checks = [
            'databaseConfig' => [
                'ok' => $hasMysqlConfig,
                'detail' => $hasMysqlConfig ? 'Required MySQL settings are configured' : 'Missing MySQL settings: ' . implode(', ', $missingConfig),
            ],
            'php' => ['ok' => PHP_VERSION_ID >= 80100, 'detail' => 'PHP ' . PHP_VERSION . ' (PHP 8.1+ required)'],
            'databaseDriver' => [
                'ok' => $hasPdoMysql,
                'detail' => $hasPdoMysql ? 'PDO MySQL extension is enabled' : 'PDO MySQL extension is not enabled',
            ],
            'schema' => [
                'ok' => $schemaFilePresent,
                'detail' => $schemaFilePresent ? 'MySQL schema file is present' : 'MySQL schema file is missing from the API deployment',
            ],
            'frontendOrigin' => [
                'ok' => $originAllowed,
                'detail' => $requestOrigin === ''
                    ? 'No browser Origin header was supplied; CORS is not required for this request'
                    : ($originAllowed
                        ? 'This website origin is allowed by the API'
                        : 'This website origin is not in the Hostinger FRONTEND_ORIGIN allowlist'),
            ],
        ];
        $databaseAvailable = false;
        try {
            database()->query('SELECT 1');
            $checks['database'] = ['ok' => true, 'detail' => 'MySQL connection succeeded'];
            $databaseAvailable = true;
        } catch (Throwable $error) {
            $checks['database'] = ['ok' => false, 'detail' => databaseErrorDetail($error)];
        }

        $adminSetupAvailable = false;
        if ($databaseAvailable) {
            try {
                $users = queryRows('SELECT id, email, password_hash FROM admin_users');
                $canReplaceSeed = count($users) === 1
                    && $users[0]['email'] === 'admin@espymedia.com'
                    && $users[0]['password_hash'] === LEGACY_ADMIN_HASH;
                $adminSetupAvailable = $users === [] || $canReplaceSeed;
                $checks['schema'] = [
                    'ok' => $schemaFilePresent,
                    'detail' => $schemaFilePresent
                        ? 'The schema file and admin_users table are available'
                        : 'MySQL schema file is missing from the API deployment',
                ];
                $checks['adminSetup'] = [
                    'ok' => true,
                    'detail' => $adminSetupAvailable
                        ? 'Initial admin account setup is available'
                        : 'An admin account already exists; initial setup is correctly closed',
                ];
            } catch (Throwable $error) {
                $detail = databaseErrorDetail($error);
                $checks['schema'] = [
                    'ok' => false,
                    'detail' => $detail,
                ];
                $checks['adminSetup'] = [
                    'ok' => false,
                    'detail' => 'Admin setup cannot continue until the admin_users table is available: ' . $detail,
                ];
            }
        } else {
            $checks['schema'] = [
                'ok' => false,
                'detail' => 'Could not verify the admin_users table because the MySQL connection failed',
            ];
            $checks['adminSetup'] = [
                'ok' => false,
                'detail' => 'Admin setup cannot be checked until the MySQL connection is available',
            ];
        }
        $failed = array_keys(array_filter($checks, static fn(array $check): bool => !$check['ok']));
        respond(['ok' => $failed === [], 'generatedAt' => gmdate('c'), 'checks' => $checks, 'failedChecks' => $failed], $failed === [] ? 200 : 503);
    }

    if ($path === '/auth/setup' && $method === 'POST') {
        $users = queryRows('SELECT id, email, password_hash FROM admin_users');
        $canReplaceSeed = count($users) === 1
            && $users[0]['email'] === 'admin@espymedia.com'
            && $users[0]['password_hash'] === LEGACY_ADMIN_HASH;
        if ($users !== [] && !$canReplaceSeed) {
            fail('Admin setup is already complete', 409);
        }
        $email = strtolower(trim((string)($body['email'] ?? '')));
        $password = (string)($body['password'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) {
            fail('A valid email and a password of at least 8 characters are required', 400);
        }
        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        if ($canReplaceSeed) {
            execute('UPDATE admin_users SET email = ?, password_hash = ? WHERE id = ?', [$email, $hash, $users[0]['id']]);
            $id = (int)$users[0]['id'];
        } else {
            execute('INSERT INTO admin_users (email, password_hash) VALUES (?, ?)', [$email, $hash]);
            $id = (int)database()->lastInsertId();
        }
        respond(['user' => ['id' => $id, 'email' => $email]]);
    }

    if ($path === '/auth/login' && $method === 'POST') {
        $email = strtolower(trim((string)($body['email'] ?? '')));
        $password = (string)($body['password'] ?? '');
        if ($email === '' || $password === '') {
            fail('Email and password required', 400);
        }
        $user = queryOne('SELECT id, email, password_hash FROM admin_users WHERE email = ?', [$email]);
        if ($user === null || !password_verify($password, $user['password_hash'])) {
            fail('Invalid credentials', 401);
        }
        session_regenerate_id(true);
        $_SESSION['userId'] = (int)$user['id'];
        $_SESSION['userEmail'] = $user['email'];
        respond(['user' => ['id' => (int)$user['id'], 'username' => $user['email']]]);
    }
    if ($path === '/auth/me' && $method === 'GET') {
        if (empty($_SESSION['userId'])) {
            fail('Not authenticated', 401);
        }
        keepAdminSessionAlive();
        respond(['id' => (int)$_SESSION['userId'], 'username' => $_SESSION['userEmail'] ?? '']);
    }
    if ($path === '/auth/logout' && $method === 'POST') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', ['expires' => time() - 42000, 'path' => $params['path'], 'secure' => $params['secure'], 'httponly' => $params['httponly'], 'samesite' => 'None']);
        }
        session_destroy();
        respond(['success' => true]);
    }

    if ($path === '/settings' && $method === 'GET') {
        $settingsMap = [
            'id' => 'id', 'siteName' => 'site_name', 'siteDescription' => 'site_description',
            'contactEmail' => 'contact_email', 'supportEmail' => 'support_email', 'phone' => 'phone',
            'whatsapp' => 'whatsapp', 'address' => 'address', 'mapsEmbed' => 'maps_embed',
            'logoUrl' => 'logo_url', 'footerLogoUrl' => 'footer_logo_url', 'faviconUrl' => 'favicon_url',
            'footerText' => 'footer_text', 'twitterUrl' => 'twitter_url', 'instagramUrl' => 'instagram_url',
            'linkedinUrl' => 'linkedin_url', 'facebookUrl' => 'facebook_url', 'behanceUrl' => 'behance_url',
            'dribbbleUrl' => 'dribbble_url', 'youtubeUrl' => 'youtube_url', 'githubUrl' => 'github_url',
            'defaultMetaTitle' => 'default_meta_title', 'defaultMetaDescription' => 'default_meta_description',
            'defaultMetaKeywords' => 'default_meta_keywords', 'defaultOgImage' => 'default_og_image',
            'robotsTxt' => 'robots_txt', 'heroBadge' => 'hero_badge', 'heroHeadline1' => 'hero_headline_1',
            'heroHeadline2' => 'hero_headline_2', 'heroSubheadline' => 'hero_subheadline',
            'homepageStats' => 'homepage_stats', 'gtmId' => 'gtm_id', 'chatbotAvatarUrl' => 'chatbot_avatar_url',
            'updatedAt' => 'updated_at',
        ];
        $row = queryOne('SELECT * FROM settings ORDER BY id LIMIT 1');
        respond(decodeRow($row, $settingsMap, ['homepageStats']) ?? new stdClass());
    }
    if ($path === '/settings' && $method === 'PATCH') {
        requireAuth();
        $fields = [
            'siteName' => 'site_name', 'siteDescription' => 'site_description',
            'contactEmail' => 'contact_email', 'supportEmail' => 'support_email', 'phone' => 'phone',
            'whatsapp' => 'whatsapp', 'address' => 'address', 'mapsEmbed' => 'maps_embed',
            'logoUrl' => 'logo_url', 'footerLogoUrl' => 'footer_logo_url', 'faviconUrl' => 'favicon_url',
            'footerText' => 'footer_text', 'twitterUrl' => 'twitter_url', 'instagramUrl' => 'instagram_url',
            'linkedinUrl' => 'linkedin_url', 'facebookUrl' => 'facebook_url', 'behanceUrl' => 'behance_url',
            'dribbbleUrl' => 'dribbble_url', 'youtubeUrl' => 'youtube_url', 'githubUrl' => 'github_url',
            'defaultMetaTitle' => 'default_meta_title', 'defaultMetaDescription' => 'default_meta_description',
            'defaultMetaKeywords' => 'default_meta_keywords', 'defaultOgImage' => 'default_og_image',
            'robotsTxt' => 'robots_txt', 'heroBadge' => 'hero_badge', 'heroHeadline1' => 'hero_headline_1',
            'heroHeadline2' => 'hero_headline_2', 'heroSubheadline' => 'hero_subheadline',
            'homepageStats' => 'homepage_stats', 'gtmId' => 'gtm_id', 'chatbotAvatarUrl' => 'chatbot_avatar_url',
        ];
        [$columns, $values] = valuesFor($body, $fields, ['homepageStats']);
        if ($columns !== []) {
            $assignments = implode(', ', array_map(static fn(string $column): string => "{$column} = ?", $columns));
            execute("UPDATE settings SET {$assignments} WHERE id = 1", $values);
        }
        $row = queryOne('SELECT * FROM settings WHERE id = 1');
        if ($row === null) {
            fail('Settings not found', 404);
        }
        $settingsMap = [
            'id' => 'id', 'siteName' => 'site_name', 'siteDescription' => 'site_description',
            'contactEmail' => 'contact_email', 'supportEmail' => 'support_email', 'phone' => 'phone',
            'whatsapp' => 'whatsapp', 'address' => 'address', 'mapsEmbed' => 'maps_embed',
            'logoUrl' => 'logo_url', 'footerLogoUrl' => 'footer_logo_url', 'faviconUrl' => 'favicon_url',
            'footerText' => 'footer_text', 'twitterUrl' => 'twitter_url', 'instagramUrl' => 'instagram_url',
            'linkedinUrl' => 'linkedin_url', 'facebookUrl' => 'facebook_url', 'behanceUrl' => 'behance_url',
            'dribbbleUrl' => 'dribbble_url', 'youtubeUrl' => 'youtube_url', 'githubUrl' => 'github_url',
            'defaultMetaTitle' => 'default_meta_title', 'defaultMetaDescription' => 'default_meta_description',
            'defaultMetaKeywords' => 'default_meta_keywords', 'defaultOgImage' => 'default_og_image',
            'robotsTxt' => 'robots_txt', 'heroBadge' => 'hero_badge', 'heroHeadline1' => 'hero_headline_1',
            'heroHeadline2' => 'hero_headline_2', 'heroSubheadline' => 'hero_subheadline',
            'homepageStats' => 'homepage_stats', 'gtmId' => 'gtm_id', 'chatbotAvatarUrl' => 'chatbot_avatar_url',
            'updatedAt' => 'updated_at',
        ];
        respond(decodeRow($row, $settingsMap, ['homepageStats']));
    }

    if ($path === '/projects' && $method === 'GET') {
        respond(decodeRows(queryRows('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC'), $projectMap, ['galleryUrls', 'techStack'], ['published', 'featured']));
    }
    if ($path === '/projects/featured' && $method === 'GET') {
        respond(decodeRows(queryRows('SELECT * FROM projects WHERE featured = 1 AND published = 1 ORDER BY sort_order ASC, id ASC LIMIT 3'), $projectMap, ['galleryUrls', 'techStack'], ['published', 'featured']));
    }
    if ($path === '/projects/categories' && $method === 'GET') {
        respond(queryRows('SELECT id, name, slug FROM project_categories ORDER BY name'));
    }
    if (preg_match('#^/projects/categories/(\d+)$#', $path, $matches)) {
        requireAuth();
        $id = (int)$matches[1];
        if ($method === 'PATCH') {
            $map = ['name' => 'name', 'slug' => 'slug'];
            $row = updateMapped('project_categories', $id, 'id', $body, $map);
            respond(decodeRow($row, $categoryMap) ?? fail('Not found', 404));
        }
        if ($method === 'DELETE') {
            removeById('project_categories', $id);
            respond(['success' => true]);
        }
    }
    if ($path === '/projects/categories' && $method === 'POST') {
        requireAuth();
        [$columns, $values] = valuesFor($body, ['name' => 'name', 'slug' => 'slug']);
        execute('INSERT INTO project_categories (name, slug) VALUES (?, ?)', [$body['name'] ?? '', $body['slug'] ?? '']);
        respond(decodeRow(queryOne('SELECT * FROM project_categories WHERE id = ?', [(int)database()->lastInsertId()]), $categoryMap), 201);
    }
    if (preg_match('#^/projects/([^/]+)$#', $path, $matches)) {
        $id = ctype_digit($matches[1]) ? (int)$matches[1] : $matches[1];
        if ($method === 'GET') {
            $row = queryOne('SELECT * FROM projects WHERE id = ? OR slug = ? LIMIT 1', [(string)$id, (string)$id]);
            if ($row === null) {
                fail('Not found', 404);
            }
            respond(decodeRow($row, $projectMap, ['galleryUrls', 'techStack'], ['published', 'featured']));
        }
        requireAuth();
        if ($method === 'DELETE') {
            removeById('projects', $id);
            respond(['success' => true]);
        }
        if ($method === 'PATCH') {
            if (!empty($body['featured'])) {
                $featuredCount = queryOne('SELECT COUNT(*) AS count FROM projects WHERE featured = 1 AND id <> ?', [$id]);
                if ((int)($featuredCount['count'] ?? 0) >= 3) {
                    fail('A maximum of 3 featured website projects is allowed', 409);
                }
            }
            $fields = array_diff_key($projectMap, array_flip(['id', 'createdAt', 'updatedAt']));
            $row = updateMapped('projects', $id, 'id', $body, $fields, ['galleryUrls', 'techStack']);
            if ($row === null) {
                fail('Not found', 404);
            }
            respond(decodeRow($row, $projectMap, ['galleryUrls', 'techStack'], ['published', 'featured']));
        }
    }
    if ($path === '/projects' && $method === 'POST') {
        requireAuth();
        if (!empty($body['featured'])) {
            $featuredCount = queryOne('SELECT COUNT(*) AS count FROM projects WHERE featured = 1');
            if ((int)($featuredCount['count'] ?? 0) >= 3) {
                fail('A maximum of 3 featured website projects is allowed', 409);
            }
        }
        $fields = array_diff_key($projectMap, array_flip(['id', 'createdAt', 'updatedAt']));
        foreach (['category' => '', 'categoryId' => null, 'clientName' => '', 'challenge' => '', 'approach' => '', 'result' => '', 'metrics' => '', 'galleryUrls' => [], 'techStack' => [], 'liveUrl' => '', 'altText' => '', 'published' => false, 'featured' => false, 'sortOrder' => 0] as $key => $default) {
            $body[$key] ??= $default;
        }
        $row = insertMapped('projects', $body, $fields, ['galleryUrls', 'techStack']);
        respond(decodeRow($row, $projectMap, ['galleryUrls', 'techStack'], ['published', 'featured']), 201);
    }

    if ($path === '/testimonials' && $method === 'GET') {
        $where = ($_GET['published'] ?? '') === 'true' ? ' WHERE published = 1' : '';
        respond(decodeRows(queryRows("SELECT * FROM testimonials{$where} ORDER BY sort_order ASC, created_at DESC"), $testimonialMap, [], ['published']));
    }
    if ($path === '/faqs' && $method === 'GET') {
        respond(decodeRows(
            queryRows('SELECT * FROM faqs WHERE published = 1 ORDER BY sort_order ASC, id ASC'),
            $faqMap,
            [],
            ['published']
        ));
    }
    if (preg_match('#^/testimonials/(\d+)$#', $path, $matches)) {
        requireAuth();
        $id = (int)$matches[1];
        if ($method === 'PATCH') {
            $fields = ['clientName' => 'client_name', 'company' => 'company', 'role' => 'role', 'quote' => 'quote', 'rating' => 'rating', 'avatarUrl' => 'avatar_url', 'published' => 'published', 'sortOrder' => 'sort_order'];
            $row = updateMapped('testimonials', $id, 'id', $body, $fields);
            if ($row === null) {
                fail('Not found', 404);
            }
            respond(decodeRow($row, $testimonialMap, [], ['published']));
        }
        if ($method === 'DELETE') {
            removeById('testimonials', $id);
            respond(['success' => true]);
        }
    }
    if ($path === '/testimonials' && $method === 'POST') {
        requireAuth();
        foreach (['company' => '', 'role' => '', 'rating' => 5, 'avatarUrl' => null, 'published' => false] as $key => $default) {
            $body[$key] ??= $default;
        }
        $fields = ['clientName' => 'client_name', 'company' => 'company', 'role' => 'role', 'quote' => 'quote', 'rating' => 'rating', 'avatarUrl' => 'avatar_url', 'published' => 'published'];
        $row = insertMapped('testimonials', $body, $fields);
        respond(decodeRow($row, $testimonialMap, [], ['published']), 201);
    }

    if ($path === '/blog-posts' && $method === 'GET') {
        if (($_GET['recent'] ?? '') === 'true') {
            $limit = max(1, min(100, (int)($_GET['limit'] ?? 3)));
            $rows = queryRows("SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC, created_at DESC LIMIT {$limit}");
        } else {
            $rows = queryRows('SELECT * FROM blog_posts ORDER BY created_at DESC');
        }
        respond(decodeRows($rows, $blogMap, [], ['published']));
    }
    if (preg_match('#^/blog-posts/([^/]+)$#', $path, $matches)) {
        $id = ctype_digit($matches[1]) ? (int)$matches[1] : $matches[1];
        if ($method === 'GET') {
            $row = queryOne('SELECT * FROM blog_posts WHERE id = ? OR slug = ? LIMIT 1', [(string)$id, (string)$id]);
            if ($row === null) {
                fail('Not found', 404);
            }
            respond(decodeRow($row, $blogMap, [], ['published']));
        }
        requireAuth();
        if ($method === 'DELETE') {
            removeById('blog_posts', $id);
            respond(['success' => true]);
        }
        if ($method === 'PATCH') {
            $existing = queryOne('SELECT published, published_at FROM blog_posts WHERE id = ?', [$id]);
            if ($existing === null) {
                fail('Not found', 404);
            }
            $fields = ['title' => 'title', 'slug' => 'slug', 'excerpt' => 'excerpt', 'content' => 'content', 'coverImageUrl' => 'cover_image_url', 'author' => 'author', 'published' => 'published'];
            [$columns, $values] = valuesFor($body, $fields);
            if (array_key_exists('published', $body) && $body['published'] && !$existing['published']) {
                $columns[] = 'published_at';
                $values[] = date('Y-m-d H:i:s');
            }
            if ($columns !== []) {
                $assignments = implode(', ', array_map(static fn(string $column): string => "{$column} = ?", $columns));
                $values[] = $id;
                execute("UPDATE blog_posts SET {$assignments} WHERE id = ?", $values);
            }
            $row = queryOne('SELECT * FROM blog_posts WHERE id = ?', [$id]);
            respond(decodeRow($row, $blogMap, [], ['published']));
        }
    }
    if ($path === '/blog-posts' && $method === 'POST') {
        requireAuth();
        $published = (bool)($body['published'] ?? false);
        $fields = ['title' => 'title', 'slug' => 'slug', 'excerpt' => 'excerpt', 'content' => 'content', 'coverImageUrl' => 'cover_image_url', 'author' => 'author', 'published' => 'published'];
        $body += ['excerpt' => '', 'content' => '', 'coverImageUrl' => null, 'author' => 'Espy Media', 'published' => false];
        $row = insertMapped('blog_posts', $body, $fields);
        if ($published) {
            execute('UPDATE blog_posts SET published_at = CURRENT_TIMESTAMP WHERE id = ?', [$row['id']]);
            $row = queryOne('SELECT * FROM blog_posts WHERE id = ?', [$row['id']]);
        }
        respond(decodeRow($row, $blogMap, [], ['published']), 201);
    }

    if ($path === '/leads' && $method === 'GET') {
        requireAuth();
        respond(decodeRows(queryRows('SELECT * FROM leads ORDER BY created_at DESC'), $leadMap));
    }
    if (preg_match('#^/leads/(\d+)$#', $path, $matches)) {
        requireAuth();
        $id = (int)$matches[1];
        if ($method === 'PATCH') {
            $row = updateMapped('leads', $id, 'id', $body, ['status' => 'status', 'notes' => 'notes']);
            if ($row === null) {
                fail('Not found', 404);
            }
            respond(decodeRow($row, $leadMap));
        }
        if ($method === 'DELETE') {
            removeById('leads', $id);
            respond(['success' => true]);
        }
    }
    if ($path === '/leads' && $method === 'POST') {
        $name = trim((string)($body['name'] ?? ''));
        $email = trim((string)($body['email'] ?? ''));
        if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            fail('Name and valid email required', 400);
        }
        $body['name'] = $name;
        $body['email'] = $email;
        $body += ['company' => '', 'projectType' => '', 'budget' => '', 'timeline' => '', 'details' => ''];
        $row = insertMapped('leads', $body, ['name' => 'name', 'email' => 'email', 'company' => 'company', 'projectType' => 'project_type', 'budget' => 'budget', 'timeline' => 'timeline', 'details' => 'details']);
        respond(decodeRow($row, $leadMap), 201);
    }

    if ($path === '/services' && $method === 'GET') {
        respond(decodeRows(queryRows('SELECT * FROM services ORDER BY sort_order ASC'), $serviceMap, [], ['published']));
    }
    if (preg_match('#^/services/(\d+)$#', $path, $matches) && $method === 'PATCH') {
        requireAuth();
        $row = updateMapped('services', (int)$matches[1], 'id', $body, ['name' => 'name', 'headline' => 'headline', 'description' => 'description', 'icon' => 'icon', 'sortOrder' => 'sort_order', 'published' => 'published']);
        if ($row === null) {
            fail('Not found', 404);
        }
        respond(decodeRow($row, $serviceMap, [], ['published']));
    }

    if ($path === '/dashboard/stats' && $method === 'GET') {
        requireAuth();
        $counts = [
            'totalLeads' => 'SELECT COUNT(*) AS count FROM leads',
            'wonLeads' => "SELECT COUNT(*) AS count FROM leads WHERE status = 'won'",
            'newLeadsThisWeek' => 'SELECT COUNT(*) AS count FROM leads WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)',
            'totalProjects' => 'SELECT COUNT(*) AS count FROM projects',
            'publishedPosts' => 'SELECT COUNT(*) AS count FROM blog_posts WHERE published = 1',
            'testimonialCount' => 'SELECT COUNT(*) AS count FROM testimonials',
        ];
        $stats = [];
        foreach ($counts as $key => $sql) {
            $stats[$key] = (int)(queryOne($sql)['count'] ?? 0);
        }
        respond($stats);
    }

    $cmsResources = [
        'platforms' => ['table' => 'platforms', 'map' => $platformMap, 'json' => [], 'bool' => ['published'], 'fields' => ['name' => 'name', 'slug' => 'slug', 'logoUrl' => 'logo_url', 'linkUrl' => 'link_url', 'published' => 'published', 'sortOrder' => 'sort_order'], 'order' => 'sort_order, id'],
        'pricing' => ['table' => 'pricing_plans', 'map' => $planMap, 'json' => ['features'], 'bool' => ['highlighted', 'published'], 'fields' => ['name' => 'name', 'price' => 'price', 'period' => 'period', 'description' => 'description', 'features' => 'features', 'ctaText' => 'cta_text', 'highlighted' => 'highlighted', 'published' => 'published', 'sortOrder' => 'sort_order'], 'order' => 'sort_order, id'],
        'graphic-categories' => ['table' => 'graphic_categories', 'map' => $categoryMap, 'json' => [], 'bool' => [], 'fields' => ['name' => 'name', 'slug' => 'slug'], 'order' => 'name'],
        'graphic-works' => ['table' => 'graphic_works', 'map' => $workMap, 'json' => ['galleryUrls'], 'bool' => ['published', 'featured'], 'fields' => ['title' => 'title', 'slug' => 'slug', 'categoryId' => 'category_id', 'imageUrl' => 'image_url', 'galleryUrls' => 'gallery_urls', 'description' => 'description', 'altText' => 'alt_text', 'published' => 'published', 'featured' => 'featured', 'sortOrder' => 'sort_order'], 'order' => 'sort_order, id'],
        'seo' => ['table' => 'seo_pages', 'map' => $seoMap, 'json' => ['structuredData'], 'bool' => ['noindex'], 'fields' => ['path' => 'path', 'metaTitle' => 'meta_title', 'metaDescription' => 'meta_description', 'metaKeywords' => 'meta_keywords', 'ogTitle' => 'og_title', 'ogDescription' => 'og_description', 'ogImage' => 'og_image', 'twitterTitle' => 'twitter_title', 'twitterDescription' => 'twitter_description', 'canonicalUrl' => 'canonical_url', 'structuredData' => 'structured_data', 'noindex' => 'noindex'], 'order' => 'path'],
        'faqs' => ['table' => 'faqs', 'map' => $faqMap, 'json' => [], 'bool' => ['published'], 'fields' => ['question' => 'question', 'answer' => 'answer', 'sortOrder' => 'sort_order', 'published' => 'published'], 'order' => 'sort_order, id'],
    ];
    if (preg_match('#^/cms/([^/]+)(?:/([^/]+))?$#', $path, $matches)) {
        $resource = $matches[1];
        $id = $matches[2] ?? null;
        if ($resource === 'legal') {
            if ($id === null && $method === 'GET') {
                respond(decodeRows(queryRows('SELECT * FROM legal_pages ORDER BY slug'), $legalMap));
            }
            if ($id !== null && $method === 'PATCH') {
                requireAuth();
                $row = updateMapped('legal_pages', $id, 'slug', $body, ['title' => 'title', 'content' => 'content']);
                if ($row === null) {
                    fail('Not found', 404);
                }
                respond(decodeRow($row, $legalMap));
            }
        } elseif (isset($cmsResources[$resource])) {
            $config = $cmsResources[$resource];
            $table = $config['table'];
            $map = $config['map'];
            if ($id === null && $method === 'GET') {
                if ($resource === 'faqs') {
                    requireAuth();
                }
                respond(decodeRows(queryRows("SELECT * FROM {$table} ORDER BY {$config['order']}"), $map, $config['json'], $config['bool']));
            }
            if ($id === null && $method === 'POST') {
                requireAuth();
                if ($resource === 'seo' && empty($body['path'])) {
                    fail('path is required', 400);
                }
                if ($resource === 'faqs' && (trim((string)($body['question'] ?? '')) === '' || trim((string)($body['answer'] ?? '')) === '')) {
                    fail('Question and answer are required', 400);
                }
                if ($resource === 'graphic-works' && !empty($body['featured'])) {
                    $count = queryOne('SELECT COUNT(*) AS count FROM graphic_works WHERE featured = 1');
                    if ((int)($count['count'] ?? 0) >= 10) {
                        fail('A maximum of 10 featured graphic works is allowed', 409);
                    }
                }
                $defaults = match ($resource) {
                    'platforms' => ['logoUrl' => '', 'linkUrl' => '', 'published' => true, 'sortOrder' => 0],
                    'pricing' => ['price' => '', 'period' => 'One-time', 'description' => '', 'features' => [], 'ctaText' => 'Get started', 'highlighted' => false, 'published' => true, 'sortOrder' => 0],
                    'graphic-works' => ['categoryId' => null, 'imageUrl' => '', 'galleryUrls' => [], 'description' => '', 'altText' => '', 'published' => false, 'featured' => false, 'sortOrder' => 0],
                    'seo' => ['metaTitle' => '', 'metaDescription' => '', 'metaKeywords' => '', 'ogTitle' => '', 'ogDescription' => '', 'ogImage' => '', 'twitterTitle' => '', 'twitterDescription' => '', 'canonicalUrl' => '', 'structuredData' => new stdClass(), 'noindex' => false],
                    default => [],
                };
                foreach ($defaults as $key => $default) {
                    if (!array_key_exists($key, $body)) {
                        $body[$key] = $default;
                    }
                }
                $row = insertMapped($table, $body, $config['fields'], $config['json']);
                respond(decodeRow($row, $map, $config['json'], $config['bool']), 201);
            }
            if ($id !== null) {
                requireAuth();
                $numericId = ctype_digit($id) ? (int)$id : $id;
                if ($method === 'PATCH') {
                    if ($resource === 'faqs') {
                        foreach (['question', 'answer'] as $field) {
                            if (array_key_exists($field, $body) && trim((string)$body[$field]) === '') {
                                fail('Question and answer cannot be empty', 400);
                            }
                        }
                    }
                    if ($resource === 'graphic-works' && !empty($body['featured'])) {
                        $count = queryOne('SELECT COUNT(*) AS count FROM graphic_works WHERE featured = 1 AND id <> ?', [$numericId]);
                        if ((int)($count['count'] ?? 0) >= 10) {
                            fail('A maximum of 10 featured graphic works is allowed', 409);
                        }
                    }
                    $row = updateMapped($table, $numericId, 'id', $body, $config['fields'], $config['json']);
                    if ($row === null) {
                        fail('Not found', 404);
                    }
                    respond(decodeRow($row, $map, $config['json'], $config['bool']));
                }
                if ($method === 'DELETE') {
                    removeById($table, $numericId);
                    respond(['success' => true]);
                }
            }
        }
    }

    if ($path === '/upload' && $method === 'POST') {
        requireAuth();
        if (!isset($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
            fail('No file uploaded', 400);
        }
        $file = $_FILES['file'];
        if ($file['error'] !== UPLOAD_ERR_OK || $file['size'] > 10 * 1024 * 1024) {
            fail('File must be no larger than 10 MB', 400);
        }
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'avif'];
        if (!in_array($extension, $allowedExtensions, true)) {
            fail('Unsupported image file type', 400);
        }
        $uploadDirectory = __DIR__ . '/uploads';
        if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0755, true) && !is_dir($uploadDirectory)) {
            throw new RuntimeException('Upload directory could not be created');
        }
        $filename = bin2hex(random_bytes(16)) . '.' . $extension;
        if (!move_uploaded_file($file['tmp_name'], $uploadDirectory . '/' . $filename)) {
            throw new RuntimeException('Uploaded file could not be saved');
        }
        $baseUrl = rtrim((string)(configValue('API_PUBLIC_URL', '') ?: ''), '/');
        if ($baseUrl === '') {
            $scheme = $isSecure ? 'https' : 'http';
            $baseUrl = $scheme . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost');
        }
        respond(['url' => $baseUrl . '/uploads/' . $filename, 'filename' => $filename]);
    }

    if ($path === '/robots.txt' && $method === 'GET') {
        header('Content-Type: text/plain; charset=utf-8');
        echo queryOne('SELECT robots_txt FROM settings WHERE id = 1')['robots_txt'] ?? "User-agent: *\nAllow: /";
        exit;
    }

    fail('Not found', 404);
} catch (PDOException $error) {
    error_log('[hostinger-api][' . $requestId . '] Database error: ' . $error->getMessage());
    $status = $error->getCode() === '23000' ? 409 : 500;
    fail($status === 409 ? 'A record with this value already exists' : databaseErrorDetail($error), $status);
} catch (Throwable $error) {
    error_log('[hostinger-api][' . $requestId . '] ' . $error->getMessage());
    if ($error instanceof RuntimeException && $error->getMessage() === 'MySQL configuration is incomplete') {
        fail(databaseErrorDetail($error), 500);
    }
    fail('Server configuration or request failed. Reference: ' . $requestId, 500);
}

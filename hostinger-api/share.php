<?php
declare(strict_types=1);

$privateConfigPath = getenv('HOSTINGER_API_CONFIG') ?: dirname(__DIR__) . '/hostinger-api-config.php';
$privateConfig = [];
if (is_file($privateConfigPath)) {
    $loadedConfig = require $privateConfigPath;
    if (is_array($loadedConfig)) {
        $privateConfig = $loadedConfig;
    }
}

$configValue = static function (string $name, ?string $default = null) use (&$privateConfig): ?string {
    $environmentValue = getenv($name);
    if ($environmentValue !== false && $environmentValue !== '') {
        return $environmentValue;
    }
    $value = $privateConfig[$name] ?? $default;
    return is_string($value) ? $value : $default;
};

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'GET' && $method !== 'HEAD') {
    header('Allow: GET, HEAD');
    http_response_code(405);
    exit('Method not allowed');
}

$normalizePath = static function (string $path): string {
    $pathname = parse_url($path, PHP_URL_PATH);
    if (!is_string($pathname)) {
        return '/';
    }
    $segments = array_values(array_filter(explode('/', $pathname), static fn(string $segment): bool => $segment !== '' && $segment !== '.'));
    $normalized = [];
    foreach ($segments as $segment) {
        if ($segment === '..') {
            array_pop($normalized);
        } else {
            $normalized[] = $segment;
        }
    }
    return $normalized === [] ? '/' : '/' . implode('/', $normalized);
};

$escape = static fn(string $value): string => htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

try {
    $host = $configValue('MYSQL_HOST', '');
    $databaseName = $configValue('MYSQL_DATABASE', '');
    $username = $configValue('MYSQL_USER', '');
    $password = $configValue('MYSQL_PASSWORD');
    if ($host === '' || $databaseName === '' || $username === '' || $password === null || $password === '') {
        throw new RuntimeException('MySQL configuration is incomplete');
    }
    $port = $configValue('MYSQL_PORT', '3306');
    $pdo = new PDO(
        "mysql:host={$host};port={$port};dbname={$databaseName};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 5,
        ],
    );

    $sharePath = $normalizePath((string)($_GET['path'] ?? '/'));
    $settings = $pdo->query(
        'SELECT site_name, site_description, default_meta_title, default_meta_description, default_meta_keywords, default_og_image FROM settings ORDER BY id LIMIT 1'
    )->fetch() ?: [];
    $pageStatement = $pdo->prepare(
        'SELECT path, meta_title, meta_description, meta_keywords, og_title, og_description, og_image, twitter_title, twitter_description, canonical_url, noindex FROM seo_pages WHERE path = ?'
    );
    $pageStatement->execute([$sharePath]);
    $page = $pageStatement->fetch() ?: null;
    $homePage = $sharePath === '/'
        ? $page
        : ($pdo->query("SELECT canonical_url FROM seo_pages WHERE path = '/'")->fetch() ?: null);
    $metadata = $page ?? $homePage ?? [];

    $title = ($metadata['meta_title'] ?? '') ?: ($settings['default_meta_title'] ?? '') ?: ($settings['site_name'] ?? 'Espy Media');
    $description = ($metadata['meta_description'] ?? '') ?: ($settings['default_meta_description'] ?? '') ?: ($settings['site_description'] ?? '');
    $ogTitle = ($metadata['og_title'] ?? '') ?: $title;
    $ogDescription = ($metadata['og_description'] ?? '') ?: $description;
    $twitterTitle = ($metadata['twitter_title'] ?? '') ?: $ogTitle;
    $twitterDescription = ($metadata['twitter_description'] ?? '') ?: $ogDescription;

    $apiPublicUrl = rtrim($configValue('API_PUBLIC_URL', 'https://api.espymediaagency.in') ?: 'https://api.espymediaagency.in', '/');
    $rawImage = trim(($metadata['og_image'] ?? '') ?: ($settings['default_og_image'] ?? ''));
    $ogImage = '';
    if ($rawImage !== '') {
        if (preg_match('#^https?://#i', $rawImage) === 1) {
            $ogImage = $rawImage;
        } elseif (preg_match('#^//#', $rawImage) === 1) {
            $ogImage = 'https:' . $rawImage;
        } else {
            $ogImage = $apiPublicUrl . '/' . ltrim($rawImage, '/');
        }
    }

    $homeCanonical = $homePage['canonical_url'] ?? '';
    $homeCanonicalParts = parse_url($homeCanonical);
    $canonicalOrigin = is_array($homeCanonicalParts)
        && in_array($homeCanonicalParts['scheme'] ?? '', ['http', 'https'], true)
        && !empty($homeCanonicalParts['host'])
        ? $homeCanonicalParts['scheme'] . '://' . $homeCanonicalParts['host']
        : 'https://www.espymediaagency.in';
    $pageCanonical = $metadata['canonical_url'] ?? '';
    $pageCanonicalParts = parse_url($pageCanonical);
    $canonicalUrl = is_array($pageCanonicalParts)
        && in_array($pageCanonicalParts['scheme'] ?? '', ['http', 'https'], true)
        && !empty($pageCanonicalParts['host'])
        ? $pageCanonical
        : rtrim($canonicalOrigin, '/') . ($sharePath === '/' ? '/' : $sharePath);
    $robots = !empty($metadata['noindex']) ? 'noindex, nofollow' : 'index, follow';

    $tags = [
        '<title>' . $escape($title) . '</title>',
        '<meta name="description" content="' . $escape($description) . '">',
        '<meta name="robots" content="' . $robots . '">',
        '<meta name="keywords" content="' . $escape(($metadata['meta_keywords'] ?? '') ?: ($settings['default_meta_keywords'] ?? '')) . '">',
        '<meta property="og:type" content="website">',
        '<meta property="og:title" content="' . $escape($ogTitle) . '">',
        '<meta property="og:description" content="' . $escape($ogDescription) . '">',
        '<meta property="og:url" content="' . $escape($canonicalUrl) . '">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="' . $escape($twitterTitle) . '">',
        '<meta name="twitter:description" content="' . $escape($twitterDescription) . '">',
        '<link rel="canonical" href="' . $escape($canonicalUrl) . '">',
    ];
    if ($ogImage !== '') {
        $tags[] = '<meta property="og:image" content="' . $escape($ogImage) . '">';
        $tags[] = '<meta property="og:image:secure_url" content="' . $escape($ogImage) . '">';
        $tags[] = '<meta property="og:image:alt" content="' . $escape($ogTitle) . '">';
        $tags[] = '<meta name="twitter:image" content="' . $escape($ogImage) . '">';
    }

    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('X-Robots-Tag: ' . $robots);
    if ($method === 'HEAD') {
        exit;
    }
    echo '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' . implode("\n", $tags)
        . '</head><body><a href="' . $escape($canonicalUrl) . '">' . $escape($title) . '</a></body></html>';
} catch (Throwable $error) {
    error_log('[hostinger-share] ' . $error->getMessage());
    http_response_code(503);
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-Control: no-store');
    exit('Social preview metadata is temporarily unavailable');
}

<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Shared hosting: অ্যাপটা /backend সাবফোল্ডারে চলে, root .htaccess রিকোয়েস্ট public/-এ rewrite করে।
// তখন SCRIPT_NAME=/backend/public/index.php হয়ে যায় কিন্তু URL-এ /public নেই, ফলে Laravel
// base path মেলাতে না পেরে সব রুটে 404 দেয়। SCRIPT_NAME ঠিক করে দিলে baseUrl=/backend ধরা পড়ে।
if (str_ends_with($_SERVER['SCRIPT_NAME'] ?? '', '/backend/public/index.php')
    && !str_starts_with($_SERVER['REQUEST_URI'] ?? '', '/backend/public/')) {
    $_SERVER['SCRIPT_NAME'] = '/backend/index.php';
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());

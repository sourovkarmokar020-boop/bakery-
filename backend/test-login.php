<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Http\Kernel');

use Illuminate\Http\Request;

// Create a test login request with JSON body
$data = json_encode([
    'email' => 'lotusmostafiz@gmail.com',
    'password' => '1@#DremMart234@',
]);

$request = Request::create('/api/auth/login', 'POST', [], [], [], [
    'CONTENT_TYPE' => 'application/json',
], $data);

$request->headers->set('Accept', 'application/json');

echo "=== Testing Login API ===\n";
echo "Email: lotusmostafiz@gmail.com\n";
echo "Password: 1@#DremMart234@\n\n";

$response = $kernel->handle($request);

echo "Status Code: " . $response->getStatusCode() . "\n";
echo "Response Body:\n";
echo json_encode(json_decode($response->getContent()), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";

$kernel->terminate($request, $response);

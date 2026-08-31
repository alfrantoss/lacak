<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

// Step 1: Get CSRF token from capture page
$response = Http::get('http://127.0.0.1:8000/t/09a4a3dd-38e0-432c-9d0f-57813779a941');
$html = $response->body();

// Extract CSRF token
preg_match('/csrf-token" content="([^"]+)"/', $html, $matches);
$csrfToken = $matches[1] ?? '';
echo "CSRF Token: " . $csrfToken . "\n";

// Get session cookie
$cookieHeader = $response->header('Set-Cookie');
echo "Cookie Header: " . $cookieHeader . "\n";

// Extract session ID from cookie
preg_match('/laravel_session=([^;]+)/', $cookieHeader, $cookieMatch);
$sessionId = $cookieMatch[1] ?? '';
echo "Session ID: " . $sessionId . "\n";

// Step 2: Send capture data
$response2 = Http::withHeaders([
    'Content-Type' => 'application/json',
    'X-CSRF-TOKEN' => $csrfToken,
    'Cookie' => 'laravel_session=' . (session()->getId() ?? ''),
])->post('http://127.0.0.1:8000/t/09a4a3dd-38e0-432c-9d0f-57813779a941/capture', [
    'latitude' => -6.2,
    'longitude' => 106.8,
    'photo' => null
]);

echo "Status: " . $response2->status() . "\n";
echo "Response: " . $response2->body() . "\n";

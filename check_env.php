<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
echo "APP_URL: " . config('app.url') . PHP_EOL;
echo "APP_ENV: " . config('app.env') . PHP_EOL;
echo "FORCE_HTTPS: " . env('FORCE_HTTPS') . PHP_EOL;

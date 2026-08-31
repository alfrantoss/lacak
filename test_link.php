<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$link = App\Models\TrackingLink::first();
echo "Slug: " . $link->slug . "\n";
echo "Tracking URL: http://127.0.0.1:8000/t/" . $link->slug . "\n";

<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PhishingReportController;
use App\Http\Controllers\TrackingLinkController;

Route::prefix('v1')->group(function () {
    Route::apiResource('phishing-reports', PhishingReportController::class);
    Route::apiResource('tracking-links', TrackingLinkController::class);
    Route::post('tracking/{slug}/capture', [TrackingLinkController::class, 'storeCapture']);
});

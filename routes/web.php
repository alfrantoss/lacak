<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TrackingLinkController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/t/{slug}', [TrackingLinkController::class, 'redirectPage']);

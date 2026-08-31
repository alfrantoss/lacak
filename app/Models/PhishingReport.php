<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PhishingReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'url',
        'domain',
        'ip_address',
        'country',
        'city',
        'latitude',
        'longitude',
        'screenshot_path',
        'screenshot_url',
        'description',
        'reporter_name',
        'reporter_email',
        'status',
        'reported_at',
        'verified_at',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'reported_at' => 'datetime',
        'verified_at' => 'datetime',
    ];
}

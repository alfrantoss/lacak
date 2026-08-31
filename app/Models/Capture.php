<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Capture extends Model
{
    use HasFactory;

    protected $fillable = [
        'tracking_link_id',
        'ip_address',
        'country',
        'city',
        'region',
        'isp',
        'latitude',
        'longitude',
        'browser',
        'os',
        'user_agent',
        'photo_path',
        'photo_url',
        'captured_at',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'captured_at' => 'datetime',
    ];

    public function trackingLink()
    {
        return $this->belongsTo(TrackingLink::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class TrackingLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'target_url',
        'description',
        'is_active',
        'click_count',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function captures()
    {
        return $this->hasMany(Capture::class);
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (!$model->slug) {
                $model->slug = Str::uuid();
            }
        });
    }
}

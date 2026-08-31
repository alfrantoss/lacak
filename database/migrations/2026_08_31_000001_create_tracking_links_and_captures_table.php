<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tracking_links', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('target_url');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('click_count')->default(0);
            $table->timestamps();
        });

        Schema::create('captures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tracking_link_id')->constrained()->cascadeOnDelete();
            $table->string('ip_address')->nullable();
            $table->string('country')->nullable();
            $table->string('city')->nullable();
            $table->string('region')->nullable();
            $table->string('isp')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('browser')->nullable();
            $table->string('os')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('photo_url')->nullable();
            $table->timestamp('captured_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('captures');
        Schema::dropIfExists('tracking_links');
    }
};

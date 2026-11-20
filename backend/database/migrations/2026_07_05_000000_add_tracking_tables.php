<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create tracking_events_log table
        Schema::create('tracking_events_log', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('event_name');
            $table->json('event_data')->nullable();
            $table->string('platform')->default('web');
            $table->string('source')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->text('page_url')->nullable();
            $table->text('referrer_url')->nullable();
            $table->timestamps();
            
            $table->index('event_name');
            $table->index('created_at');
        });

        // 2. Add new tracking fields to site_settings (if not exist)
        $trackingSettings = [
            ['key' => 'google_search_console', 'value' => '', 'group_name' => 'tracking'],
            ['key' => 'google_ads_conversion_label', 'value' => '', 'group_name' => 'tracking'],
            ['key' => 'facebook_capi_token', 'value' => '', 'group_name' => 'tracking'],
            ['key' => 'tiktok_access_token', 'value' => '', 'group_name' => 'tracking'],
        ];

        foreach ($trackingSettings as $setting) {
            $exists = DB::table('site_settings')->where('key', $setting['key'])->exists();
            if (!$exists) {
                DB::table('site_settings')->insert([
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'key' => $setting['key'],
                    'value' => $setting['value'],
                    'group_name' => $setting['group_name'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tracking_events_log');
        
        DB::table('site_settings')->whereIn('key', [
            'google_search_console',
            'google_ads_conversion_label',
            'facebook_capi_token',
            'tiktok_access_token',
        ])->delete();
    }
};
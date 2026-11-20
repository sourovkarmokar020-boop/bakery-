<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * boot-settings.js হলো স্টোরফ্রন্টের প্রথম paint-এর একমাত্র উৎস — এখানে সেটিংস না এলে
 * সাইট কোডে হার্ডকোড করা ডিফল্ট নাম/রঙ দেখায়। তাই এই আচরণটা টেস্টে বাঁধা।
 */
class BootSettingsTest extends TestCase
{
    // পুরো migration চালানো হয় না (কিছু ডেটা-migration MySQL-নির্দিষ্ট), রুটটির
    // দরকার শুধু এই টেবিলটাই — তাই in-memory sqlite-এ সেটাই বানিয়ে নেওয়া হয়
    protected function setUp(): void
    {
        parent::setUp();

        Schema::dropIfExists('site_settings');
        Schema::create('site_settings', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group_name')->default('general');
            $table->timestamps();
        });
    }

    private function setting(string $key, ?string $value): void
    {
        DB::table('site_settings')->insert([
            'id' => (string) Str::uuid(),
            'key' => $key,
            'value' => $value,
            'group_name' => 'general',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_boot_script_ships_saved_settings_to_the_first_paint(): void
    {
        $this->setting('brand_name_en', 'Boot Mart');
        $this->setting('brand_color', '#f59e0b');

        $response = $this->get('/api/boot-settings.js');

        $response->assertOk();
        $this->assertStringContainsString('javascript', $response->headers->get('Content-Type'));

        $body = $response->getContent();
        // React (SiteSettingsContext) এখান থেকেই প্রথম রেন্ডারের ডেটা নেয়
        $this->assertStringContainsString('window.__SITE_SETTINGS__', $body);
        $this->assertStringContainsString('Boot Mart', $body);
        $this->assertStringContainsString('#f59e0b', $body);
    }

    public function test_boot_script_never_leaks_secret_settings(): void
    {
        $this->setting('openai_api_key', 'sk-should-never-ship');
        $this->setting('facebook_capi_token', 'capi-should-never-ship');
        $this->setting('tiktok_access_token', 'tiktok-should-never-ship');
        $this->setting('smtp_password', 'pass-should-never-ship');
        $this->setting('brand_color', '#f59e0b');

        $body = $this->get('/api/boot-settings.js')->getContent();

        foreach (['sk-should-never-ship', 'capi-should-never-ship', 'tiktok-should-never-ship', 'pass-should-never-ship'] as $secret) {
            $this->assertStringNotContainsString($secret, $body);
        }

        // পাবলিক সেটিংস আগের মতোই যায়
        $this->assertStringContainsString('#f59e0b', $body);
    }

    public function test_boot_script_survives_an_empty_settings_table(): void
    {
        $response = $this->get('/api/boot-settings.js');

        $response->assertOk();
        // সেটিংস না থাকলেও স্ক্রিপ্টটা যেন syntax-এ ভাঙা না হয় ({} থাকবে, [] নয়)
        $this->assertStringContainsString('var s = {};', $response->getContent());
    }
}

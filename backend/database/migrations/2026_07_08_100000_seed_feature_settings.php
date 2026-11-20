<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // ভিজ্যুয়াল সার্চ, লাইভ চ্যাট চালু/বন্ধ ও OpenAI key — admin থেকে নিয়ন্ত্রণের জন্য।
        // openai_api_key row আগে থেকেই থাকলে admin সেভ সবসময় update হয় (insert-এ duplicate হয় না)।
        $defaults = [
            'visual_search_enabled' => 'true',
            'live_chat_enabled' => 'true',
            'sales_notification_enabled' => 'true',
            'openai_api_key' => '',
        ];

        foreach ($defaults as $key => $value) {
            if (! DB::table('site_settings')->where('key', $key)->exists()) {
                DB::table('site_settings')->insert([
                    'id' => (string) Str::uuid(),
                    'key' => $key,
                    'value' => $value,
                    'group_name' => 'features',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        DB::table('site_settings')->whereIn('key', [
            'visual_search_enabled', 'live_chat_enabled', 'openai_api_key',
        ])->delete();
    }
};

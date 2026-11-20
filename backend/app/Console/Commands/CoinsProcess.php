<?php

namespace App\Console\Commands;

use App\Services\CoinService;
use Illuminate\Console\Command;

/**
 * pending কয়েন খরচযোগ্য করা ও মেয়াদোত্তীর্ণ কয়েন বাদ দেওয়া।
 *
 * চাঙ্ক ধরে চলে — লক্ষ লক্ষ সারির উপর একটি বড় UPDATE চালালে টেবিল লক হয়ে যেত।
 * ক্রন: php artisan coins:process
 */
class CoinsProcess extends Command
{
    protected $signature = 'coins:process {--limit=1000 : প্রতি রানে সর্বোচ্চ কত সারি}';

    protected $description = 'কয়েন ম্যাচিওর ও মেয়াদ শেষ করার কাজ চালায়';

    public function handle(CoinService $coins): int
    {
        if (! $coins->isEnabled()) {
            $this->info('কয়েন সিস্টেম বন্ধ আছে — কিছু করা হয়নি।');

            return self::SUCCESS;
        }

        $limit = (int) $this->option('limit');

        $matured = $coins->mature($limit);
        $this->info("ম্যাচিওর হয়েছে: {$matured}");

        $expired = $coins->expire($limit);
        $this->info("মেয়াদ শেষ: {$expired}");

        return self::SUCCESS;
    }
}

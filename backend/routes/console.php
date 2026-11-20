<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// কয়েন ম্যাচিওর ও মেয়াদ শেষের কাজ — রাতের বেলা, কম ব্যস্ত সময়ে
Schedule::command('coins:process')->dailyAt('03:00')->withoutOverlapping();

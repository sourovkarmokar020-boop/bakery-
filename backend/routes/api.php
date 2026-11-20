<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\CoinController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\QueryController;
use App\Http\Controllers\Api\SteadfastCourierController;
use App\Http\Controllers\Api\VisualSearchController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => ['ok' => true, 'app' => 'Organic Laravel API']);

// Admin-এর সেট করা সব সেটিংস (ব্র্যান্ড নাম, লোগো, রঙ, টপবার লেখা...) প্রথম paint-এর
// আগেই পৌঁছে দেওয়ার জন্য — index.html এই স্ক্রিপ্টটা blocking ভাবে লোড করে, তাই
// হার্ডকোড করা ডিফল্ট নাম/রঙের flash আর দেখা যায় না। React (SiteSettingsContext)
// window.__SITE_SETTINGS__ থেকেই শুরু করে, ফলে প্রথম রেন্ডারেই আসল সেটিংস বসে।
// Admin সেটিংস বদলালে সর্বোচ্চ ৬০ সেকেন্ডের মধ্যে সবার কাছে নতুনটা চলে যায়।
Route::get('/boot-settings.js', function () {
    // গোপন key (API key/token/password) কখনো এই পাবলিক স্ক্রিপ্টে যায় না
    try {
        $settings = \Illuminate\Support\Facades\DB::table('site_settings')
            ->pluck('value', 'key')
            ->reject(fn ($value, $key) => (bool) preg_match('/(_key|_token|_secret|password)$/i', (string) $key))
            ->map(fn ($value) => (string) ($value ?? ''))
            ->all();
    } catch (\Throwable $e) {
        // ডাটাবেস বন্ধ থাকলে HTML error page না পাঠিয়ে খালি (কিন্তু বৈধ) স্ক্রিপ্ট যায় —
        // ফ্রন্টএন্ড তখন আগের ভিজিটের ক্যাশ করা সেটিংস দিয়েই সাইট দেখায়
        \Log::warning('boot-settings.js: settings load failed', ['error' => $e->getMessage()]);
        $settings = [];
        $failed = true;
    }

    $json = json_encode((object) $settings, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);
    $js = <<<JS
(function () {
  try {
    var s = {$json};
    window.__SITE_SETTINGS__ = s;
    var hsl = function (hex) {
      var c = (hex || "").replace("#", "");
      if (c.length !== 6) return null;
      var r = parseInt(c.slice(0, 2), 16) / 255,
        g = parseInt(c.slice(2, 4), 16) / 255,
        b = parseInt(c.slice(4, 6), 16) / 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
      if (max === min) return "0 0% " + Math.round(l * 100) + "%";
      var d = max - min;
      var sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      var h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      return Math.round(h * 60) + " " + Math.round(sat * 100) + "% " + Math.round(l * 100) + "%";
    };
    var rules = [];
    if (s.brand_color && hsl(s.brand_color)) rules.push("--primary: " + hsl(s.brand_color) + "; --ring: " + hsl(s.brand_color) + ";");
    if (s.button_color && hsl(s.button_color)) rules.push("--button: " + hsl(s.button_color) + ";");
    if (s.accent_color && hsl(s.accent_color)) rules.push("--accent: " + hsl(s.accent_color) + ";");
    if (s.gradient_mode === "gradient" && s.brand_color && s.accent_color) {
      rules.push("--brand-gradient: linear-gradient(135deg, " + s.brand_color + ", " + s.accent_color + ");");
    }
    if (rules.length) {
      var st = document.createElement("style");
      st.id = "brand-theme-boot";
      st.textContent = ":root{" + rules.join(" ") + "}";
      document.head.appendChild(st);
    }
    if (s.favicon_url) {
      var link = document.querySelector('link[rel="icon"]');
      if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
      link.href = s.favicon_url;
    }
    if (s.seo_title) document.title = s.seo_title;
  } catch (e) {}
})();
JS;

    return response($js, 200)
        ->header('Content-Type', 'application/javascript; charset=utf-8')
        // ব্যর্থ হলে খালি ফলাফল ক্যাশ করা যাবে না — নাহলে ডাটাবেস ফিরে এলেও
        // ৬০ সেকেন্ড পর্যন্ত ব্রাউজার খালি স্ক্রিপ্টই ধরে রাখত
        ->header('Cache-Control', isset($failed) ? 'no-store' : 'public, max-age=60');
});

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/home', [QueryController::class, 'home']);
Route::middleware('auth:sanctum')->get('/auth/me', [AuthController::class, 'me']);
Route::middleware('auth:sanctum')->post('/auth/logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::post('/users', [AdminUserController::class, 'store']);
    Route::put('/users/{user}/role', [AdminUserController::class, 'updateRole']);
    Route::get('/steadfast', [SteadfastCourierController::class, 'show']);
    Route::post('/steadfast', [SteadfastCourierController::class, 'save']);
    Route::post('/steadfast/balance', [SteadfastCourierController::class, 'balance']);
    Route::post('/steadfast/orders/{order}/send', [SteadfastCourierController::class, 'sendOrder']);
});

Route::post('/query/{table}', [QueryController::class, 'handle']);
Route::post('/rpc/{name}', [QueryController::class, 'rpc']);
Route::post('/storage/{bucket}', [QueryController::class, 'upload']);
Route::post('/visual-search', [VisualSearchController::class, 'search']);

// লাইভ চ্যাট — Laravel rule-based bot (external API ছাড়া)
Route::post('/chat', [\App\Http\Controllers\Api\ChatController::class, 'reply']);

// Tracking routes (no auth required for tracking)
Route::post('/tracking/event', [\App\Http\Controllers\Api\TrackingController::class, 'track']);

// SMTP Settings routes (admin only)
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/smtp', [\App\Http\Controllers\Api\SmtpController::class, 'show']);
    Route::post('/smtp', [\App\Http\Controllers\Api\SmtpController::class, 'save']);
    Route::post('/smtp/test', [\App\Http\Controllers\Api\SmtpController::class, 'test']);
    Route::get('/bkash', [\App\Http\Controllers\Api\BkashController::class, 'show']);
    Route::post('/bkash', [\App\Http\Controllers\Api\BkashController::class, 'save']);
});

// bKash checkout (public: called from the storefront checkout/callback pages)
Route::post('/bkash/create', [\App\Http\Controllers\Api\BkashController::class, 'create']);
Route::post('/bkash/execute', [\App\Http\Controllers\Api\BkashController::class, 'execute']);

// কুপন — ছাড়ের হিসাব সবসময় সার্ভারে, তাই /query/{table} এর বাইরে
Route::post('/coupons/validate', [CouponController::class, 'check']);
Route::post('/coupons/apply', [CouponController::class, 'apply']);

// কয়েন সিস্টেম — ইচ্ছাকৃতভাবে /query/{table} এর বাইরে, কারণ ওই এন্ডপয়েন্টে auth নেই
Route::get('/coins/settings', [CoinController::class, 'publicSettings']);
// quote পাবলিক — গেস্টও দেখতে পায় সে কত কয়েন পাবে (গেস্ট অর্ডারেও কয়েন জমে)।
// লগইন থাকলে টোকেন থেকে ব্যালেন্সও আসে। auth গ্রুপে রাখলে প্রতি গেস্ট ভিজিটে
// সার্ভারে একটা করে এরর তৈরি হতো।
Route::post('/coins/quote', [CoinController::class, 'quote']);
Route::get('/coins/rewards', [CoinController::class, 'rewards']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/coins/me', [CoinController::class, 'me']);
    Route::get('/coins/me/transactions', [CoinController::class, 'myTransactions']);
    Route::post('/coins/apply', [CoinController::class, 'apply']);
    Route::post('/coins/redeem-product', [CoinController::class, 'redeemProduct']);
});

Route::middleware('auth:sanctum')->prefix('admin/coins')->group(function () {
    Route::get('/settings', [CoinController::class, 'adminSettings']);
    Route::post('/settings', [CoinController::class, 'saveSettings']);
    Route::get('/stats', [CoinController::class, 'stats']);
    Route::get('/customers', [CoinController::class, 'customers']);
    Route::get('/customers/{customerId}/transactions', [CoinController::class, 'customerTransactions']);
    Route::post('/adjust', [CoinController::class, 'adjust']);
    Route::get('/tiers', [CoinController::class, 'tiers']);
    Route::post('/tiers', [CoinController::class, 'saveTier']);
    Route::put('/tiers/{id}', [CoinController::class, 'saveTier']);
    Route::delete('/tiers/{id}', [CoinController::class, 'deleteTier']);
    Route::get('/rewards', [CoinController::class, 'adminRewards']);
    Route::post('/rewards', [CoinController::class, 'saveReward']);
    Route::put('/rewards/{id}', [CoinController::class, 'saveReward']);
    Route::delete('/rewards/{id}', [CoinController::class, 'deleteReward']);
});

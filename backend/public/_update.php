<?php

/**
 * Dream Mart — আপডেট রানার (এক-বার ব্যবহারের ফাইল)
 * =================================================
 * শেয়ার্ড হোস্টিংয়ে SSH/Terminal না থাকলে `php artisan migrate` চালানো যায় না।
 * এই ফাইলটা ব্রাউজার থেকে খুলে সেই কাজটাই করে দেয় — নতুন migration চালায় আর
 * Laravel-এর ক্যাশ পরিষ্কার করে, যাতে নতুন কোড সাথে সাথে চালু হয়।
 *
 * ঠিকানা:  /backend/_update.php?token=dm-2026-07-30-f3a91c
 *
 * token ছাড়া কিছুই হয় না — কেউ ভুল করে বা ইচ্ছে করে URL-টা পেলেও migration
 * চালাতে পারবে না। তবু কাজ শেষ হলে ফাইলটা ডিলিট করে দেওয়াই নিয়ম।
 *
 * `migrate` কখনো পুরনো টেবিল মুছে না — শুধু যেগুলো এখনো চলেনি সেগুলোই চালায়।
 * এই আপডেটের দুইটা migration-ই আগে থেকে থাকা ডাটা (অ্যাডমিনের হাতে এডিট করা
 * পেজ/সেটিংস) দেখে নিয়ে ছোঁয় না, তাই দুইবার চললেও ক্ষতি নেই।
 */

const UPDATE_TOKEN = 'dm-2026-07-30-f3a91c';

$given = $_GET['token'] ?? ($_SERVER['argv'][1] ?? '');

if (!is_string($given) || !hash_equals(UPDATE_TOKEN, $given)) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    exit("403 — token ভুল বা দেওয়া হয়নি।\n\nসঠিক ঠিকানা:\n  /backend/_update.php?token=" . UPDATE_TOKEN . "\n");
}

@set_time_limit(300);

header('Content-Type: text/html; charset=utf-8');

/** ধাপগুলোর ফলাফল জমা হয় এখানে */
$results = [];
$hasError = false;

$run = function (string $label, callable $fn) use (&$results, &$hasError): void {
    try {
        $output = (string) $fn();
        $results[] = ['label' => $label, 'ok' => true, 'output' => trim($output)];
    } catch (\Throwable $e) {
        $hasError = true;
        $results[] = ['label' => $label, 'ok' => false, 'output' => $e->getMessage()];
    }
};

$booted = false;

try {
    require __DIR__ . '/../vendor/autoload.php';
    /** @var \Illuminate\Foundation\Application $app */
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    $booted = true;
} catch (\Throwable $e) {
    $hasError = true;
    $results[] = [
        'label' => 'Laravel চালু করা',
        'ok' => false,
        'output' => $e->getMessage(),
    ];
}

if ($booted) {
    $artisan = function (string $command, array $params = []) {
        \Illuminate\Support\Facades\Artisan::call($command, $params);

        return \Illuminate\Support\Facades\Artisan::output();
    };

    // ক্যাশ আগে পরিষ্কার — না হলে migrate পুরনো ক্যাশ করা DB সেটিংস নিয়ে চলত
    $run('পুরনো config ক্যাশ মোছা', fn () => $artisan('config:clear'));
    $run('পুরনো route ক্যাশ মোছা', fn () => $artisan('route:clear'));
    $run('পুরনো view ক্যাশ মোছা', fn () => $artisan('view:clear'));
    $run('অ্যাপ্লিকেশন ক্যাশ মোছা', fn () => $artisan('cache:clear'));

    // আসল কাজ — নতুন migration চালানো
    $run('নতুন migration চালানো', fn () => $artisan('migrate', ['--force' => true]));
}

/** ফলাফল সত্যিই বসেছে কিনা ডাটাবেসে মিলিয়ে দেখা */
$checks = [];

if ($booted && !$hasError) {
    try {
        $db = \Illuminate\Support\Facades\DB::class;

        $slugs = ['delivery-rules', 'return-policy', 'terms-and-conditions', 'privacy-policy'];
        $found = $db::table('pages')->whereIn('slug', $slugs)->pluck('slug')->all();

        $checks[] = [
            'label' => 'ফুটারের ৪টা পলিসি পেজ',
            'ok' => count($found) === 4,
            'value' => count($found) . '/4 পাওয়া গেছে' . (count($found) === 4 ? '' : ' — নেই: ' . implode(', ', array_diff($slugs, $found))),
        ];

        foreach (['footer_address' => 'ফুটারের ঠিকানা', 'footer_phone' => 'ফুটারের ফোন', 'footer_important_links' => 'ফুটারের লিংক তালিকা'] as $key => $label) {
            $value = $db::table('site_settings')->where('key', $key)->value('value');
            $checks[] = [
                'label' => $label . ' (' . $key . ')',
                'ok' => $value !== null && $value !== '',
                'value' => $value === null ? 'সেটিংসে নেই' : (string) $value,
            ];
        }

        $settingsCount = $db::table('site_settings')->count();
        $checks[] = [
            'label' => 'মোট সাইট সেটিংস',
            'ok' => $settingsCount > 0,
            'value' => $settingsCount . ' টা',
        ];
    } catch (\Throwable $e) {
        $hasError = true;
        $checks[] = ['label' => 'ডাটাবেস যাচাই', 'ok' => false, 'value' => $e->getMessage()];
    }
}

$allOk = !$hasError;
foreach ($checks as $c) {
    if (!$c['ok']) {
        $allOk = false;
    }
}

$e = fn ($s) => htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');

?>
<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dream Mart — আপডেট</title>
<style>
  body { font-family: system-ui, "Segoe UI", "Noto Sans Bengali", sans-serif; max-width: 820px;
         margin: 0 auto; padding: 24px 16px 64px; line-height: 1.7; color: #1f2328; background: #fff; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .sub { color: #656d76; margin: 0 0 24px; font-size: 14px; }
  .banner { padding: 14px 16px; border-radius: 8px; margin: 0 0 24px; font-weight: 600; }
  .banner.ok { background: #dafbe1; border: 1px solid #26a148; color: #1a7f37; }
  .banner.bad { background: #ffebe9; border: 1px solid #cf222e; color: #cf222e; }
  h2 { font-size: 15px; margin: 28px 0 10px; text-transform: uppercase;
       letter-spacing: .04em; color: #656d76; }
  .row { display: flex; gap: 10px; padding: 9px 0; border-bottom: 1px solid #eaeef2;
         align-items: flex-start; }
  .row:last-child { border-bottom: 0; }
  .mark { flex: 0 0 auto; width: 20px; }
  .name { flex: 0 0 auto; min-width: 210px; font-weight: 600; }
  .val { color: #3d444d; word-break: break-word; flex: 1 1 auto; }
  pre { background: #f6f8fa; border: 1px solid #eaeef2; border-radius: 6px; padding: 10px 12px;
        overflow-x: auto; font-size: 12.5px; margin: 6px 0 0; white-space: pre-wrap; }
  .note { background: #fff8c5; border: 1px solid #d4a72c; border-radius: 8px;
          padding: 14px 16px; margin-top: 28px; }
  code { background: #f0f1f3; padding: 1px 5px; border-radius: 4px; font-size: 13px; }
</style>
</head>
<body>

<h1>Dream Mart — আপডেট</h1>
<p class="sub">নতুন migration চালানো আর ক্যাশ পরিষ্কার করার ফলাফল।</p>

<?php if ($allOk): ?>
  <div class="banner ok">✅ আপডেট সফল হয়েছে — সাইট এখন নতুন ভার্সনে চলছে।</div>
<?php else: ?>
  <div class="banner bad">❌ কোথাও সমস্যা হয়েছে — নিচে লাল দাগ দেওয়া লাইনটা দেখুন।</div>
<?php endif; ?>

<h2>যা যা চালানো হলো</h2>
<?php foreach ($results as $r): ?>
  <div class="row">
    <span class="mark"><?= $r['ok'] ? '✅' : '❌' ?></span>
    <span class="name"><?= $e($r['label']) ?></span>
    <span class="val"><?= $r['output'] === '' ? '<em style="color:#656d76">কিছু করার ছিল না</em>' : '<pre>' . $e($r['output']) . '</pre>' ?></span>
  </div>
<?php endforeach; ?>

<?php if ($checks): ?>
  <h2>ডাটাবেসে মিলিয়ে দেখা</h2>
  <?php foreach ($checks as $c): ?>
    <div class="row">
      <span class="mark"><?= $c['ok'] ? '✅' : '❌' ?></span>
      <span class="name"><?= $e($c['label']) ?></span>
      <span class="val"><?= $e($c['value']) ?></span>
    </div>
  <?php endforeach; ?>
<?php endif; ?>

<div class="note">
  <strong>শেষ কাজ:</strong> সব ✅ হলে cPanel → File Manager থেকে
  <code>public_html/backend/public/_update.php</code> ফাইলটা <strong>ডিলিট করে দিন</strong>।
  এটা রেখে দেওয়ার দরকার নেই।
</div>

</body>
</html>

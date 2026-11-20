# Dream Mart — cPanel-এ আপলোড গাইড

**সাইট:** http://dreammart.digitalwebars.xyz/
**ডাটাবেস:** `digita42_dreammart` · **ইউজার:** `digita42_dreammart` · **পাসওয়ার্ড:** `digita42_dreammart`

এই প্যাকেজে frontend (React) আর backend (Laravel) দুইটাই একসাথে আছে। সার্ভারে
`composer` বা `npm` কিছুই চালাতে হবে না — শুধু আপলোড করে ডাটাবেস ইমপোর্ট করলেই সাইট চালু।

> **এই প্যাকেজটা লোকালি চালিয়ে টেস্ট করা হয়েছে** — zip টা নতুন করে extract করে
> Laravel চালিয়ে দেখা হয়েছে, API ঠিকঠাক ডাটা দিচ্ছে, আর ডাটাবেসের ১০৮টা ছবির
> লিংকের প্রত্যেকটার ফাইল প্যাকেজের ভিতরে আছে কিনা মিলিয়ে দেখা হয়েছে।

---

## ফোল্ডারে যা যা আছে

| ফাইল | কী | সাইজ |
|---|---|---|
| `dreammart-cpanel.zip` | পুরো সাইট — frontend + backend + সব ছবি + vendor | ৯৮.৬ MB |
| `digita42_dreammart.sql` | ডাটাবেস — ৪৪টা টেবিল, ৯২টা প্রোডাক্ট, সব ডাটাসহ | ২৭১ KB |
| `INSTALL-README.md` | এই ফাইলটা | — |

---

## ধাপ ১ — পুরনোটা মুছে ফেলুন

আগের বার যা আপলোড হয়েছিল সেটা পুরোপুরি সরিয়ে ফেলা দরকার, না হলে পুরনো ফাইল
মিশে গিয়ে গোলমাল হবে।

1. cPanel → **File Manager** → **`public_html`** ফোল্ডারে ঢুকুন
2. উপরে ডান দিকে **Settings → Show Hidden Files (dotfiles)** টিক দিন
   *(না দিলে `.htaccess` আর `.env` ফাইলগুলো চোখেই পড়বে না)*
3. **Select All** → **Delete** — `public_html`-এর ভিতরের সবকিছু মুছে দিন
   *(`public_html` ফোল্ডারটা থাকবে, শুধু ভিতরটা খালি হবে)*

> `cgi-bin` ফোল্ডারটা থাকলে ওটা রেখে দিতে পারেন, ক্ষতি নেই।

---

## ধাপ ২ — ডাটাবেস ইমপোর্ট

1. cPanel → **phpMyAdmin** খুলুন
2. বাম পাশ থেকে **`digita42_dreammart`** ডাটাবেসটা সিলেক্ট করুন
3. ভিতরে আগের কোনো টেবিল থাকলে চিন্তা নেই — এই SQL ফাইলে `DROP TABLE IF EXISTS`
   দেওয়া আছে, পুরনো টেবিল নিজে থেকেই মুছে নতুন করে বসবে
4. উপরে **Import** ট্যাব → **Choose File** → `digita42_dreammart.sql`
5. **Character set of the file** এ **`utf8mb4`** আছে কিনা দেখে নিচে **Go** চাপুন

শেষে **৪৪টা টেবিল** দেখা যাবে। `categories` টেবিলে ঢুকে দেখুন বাংলা লেখা
(পোশাক, শিশু, ঘড়ি) ঠিকঠাক আসছে কিনা।

> ফাইলটা মাত্র ২৭১ KB, তাই phpMyAdmin-এর আপলোড লিমিটে আটকাবে না।

---

## ধাপ ৩ — ফাইল আপলোড

1. cPanel → **File Manager** → **`public_html`** (এখন খালি)
2. উপরে **Upload** → `dreammart-cpanel.zip` আপলোড করুন *(৯৮ MB, একটু সময় নেবে)*
3. আপলোড শেষে File Manager-এ ফিরে গিয়ে **Reload** চাপুন
4. zip ফাইলটার উপর **রাইট ক্লিক → Extract**
5. Extract-এর জায়গা যেন **`/public_html`** থাকে (অন্য কোনো সাবফোল্ডার নয়)
6. Extract শেষ হলে `dreammart-cpanel.zip` ফাইলটা **ডিলিট করে দিন**

### Extract হওয়ার পর ফোল্ডার এরকম দেখাবে

```
public_html/
├── .htaccess              ← React SPA-র রাউটিং
├── index.html
├── assets/                ← JS, CSS আর ছবি (/assets/uploads/…)
├── favicon.webp
├── robots.txt
└── backend/               ← Laravel
    ├── .htaccess          ← সব রিকোয়েস্ট public/ এ পাঠায়
    ├── .env               ← হোস্টিংয়ের DB তথ্য এখানেই বসানো আছে
    ├── app/  config/  routes/  database/  resources/
    ├── vendor/            ← composer install লাগবে না, দেওয়াই আছে
    ├── storage/           ← লগ, ক্যাশ, সেশন
    └── public/
        ├── index.php      ← Laravel-এর entry point
        ├── _diag.php      ← ইনস্টল চেক করার পেজ (পরে ডিলিট করবেন)
        └── storage/       ← আপলোড করা ছবি (/backend/storage/uploads/…)
```

---

## ধাপ ৪ — PHP ভার্সন

cPanel → **MultiPHP Manager** → ডোমেইন `dreammart.digitalwebars.xyz` সিলেক্ট করে
**PHP 8.2 / 8.3 / 8.4** যেকোনো একটা দিন (Laravel 12-এর জন্য কমপক্ষে ৮.২ লাগে)।

> আপনার সার্ভারে এখন **PHP 8.4.23** চলছে — এটা ঠিক আছে, বদলানোর দরকার নেই।

---

## ধাপ ৫ — চেক করুন (সবচেয়ে জরুরি ধাপ)

ব্রাউজারে খুলুন:

### 👉 http://dreammart.digitalwebars.xyz/backend/_diag.php

এই পেজটা **Laravel চালু না করেই** সার্ভারের সব শর্ত পরীক্ষা করে — PHP ভার্সন,
extension, ফোল্ডার permission, ডাটাবেস কানেকশন, কয়টা টেবিল ইমপোর্ট হয়েছে,
বাংলা লেখা ঠিক আছে কিনা — সব এক পেজে দেখায়।

- **সব সবুজ (✅)** → সাইট চালু, নিচের ধাপে যান
- **লাল (❌) কিছু থাকলে** → প্রতিটা লাইনের পাশে ঠিক কী করতে হবে লেখা আছে
- ফোল্ডার/permission সমস্যা থাকলে পেজের নিচে **"Fix folders"** বোতামে চাপ দিন
  *(এটা শুধু ফোল্ডার বানায় আর permission ঠিক করে, ডাটাবেসে হাত দেয় না)*

সব সবুজ হলে **`public_html/backend/public/_diag.php` ফাইলটা ডিলিট করে দিন।**

### তারপর এগুলো দেখুন

| লিংক | ঠিক থাকলে যা দেখবেন |
|---|---|
| http://dreammart.digitalwebars.xyz/ | দোকানের হোমপেজ, ব্যানার আর প্রোডাক্ট |
| http://dreammart.digitalwebars.xyz/backend/api/health | `{"ok":true,"app":"Organic Laravel API"}` |
| http://dreammart.digitalwebars.xyz/admin/login | অ্যাডমিন লগইন পেজ |

**অ্যাডমিন লগইন:** `lotusmostafiz@gmail.com` — পাসওয়ার্ড আপনার লোকাল সাইটে
যেটা, সেটাই (ডাটাবেসের সাথে হুবহু চলে এসেছে)।

---

## গতবার সাইট কেন চলেনি, আর এবার কী বদলেছে

গতবারের প্যাকেজে frontend উঠেছিল ঠিকই, কিন্তু `/backend/api/health` সহ **সব API
500 error** দিচ্ছিল। কারণগুলো এবার ঠিক করা হয়েছে:

**১. `bootstrap/cache` এর manifest ফাইল দুইটা zip-এ ছিল না**
Laravel প্রতি রিকোয়েস্টে ওগুলো নতুন করে বানানোর চেষ্টা করত, আর ফোল্ডারে লেখার
অনুমতি না থাকায় প্রতিবারই থেমে যেত। এবার ফাইল দুইটা প্যাকেজেই দেওয়া আছে —
আর সেগুলো `--no-dev` vendor অনুযায়ী নতুন করে বানানো, তাই এমন কোনো ক্লাসের নাম
নেই যেটা সার্ভারে নেই।

**২. একটা middleware ডাটাবেস না পেলে গোটা API ফেলে দিত**
`BlockCustomerIp` middleware প্রতিটা API রিকোয়েস্টে `blocked_customers` টেবিল
পড়ত। ডাটাবেস ইমপোর্ট না হলে বা credential ভুল হলে ওখানেই exception হয়ে
**`/api/health` পর্যন্ত 500** দিত — ফলে আসল সমস্যাটা (ডাটাবেস) ঢাকা পড়ে যেত।
এখন DB পড়তে না পারলে middleware রিকোয়েস্ট ছেড়ে দেয়, তাই `/api/health` সবসময়ই
উত্তর দেবে আর সমস্যা কোথায় সেটা আলাদা করে বোঝা যাবে।

**৩. খালি ফোল্ডার হারিয়ে যাওয়ার ঝুঁকি**
`storage/logs`, `storage/framework/views` এগুলো খালি ছিল বলে unzip করার সময়
বাদ পড়ে যেতে পারত, আর Laravel সাথে সাথেই 500 দিত। এবার প্রতিটাতে একটা করে
`.gitkeep` ফাইল দেওয়া আছে, তাই ফোল্ডার হারাবে না।

**৪. zip-এর ভিতরের path**
গতবারের চেয়ে এবার zip টা Linux-এর নিয়মে (`/` দিয়ে) বানানো — Windows-এর `\`
দিয়ে বানালে cPanel-এ ফোল্ডারের বদলে অদ্ভুত নামের ফাইল তৈরি হয়ে যেতে পারত।

**৫. এছাড়াও**
- ডাটাবেসে `http://127.0.0.1:8000/...` আর `http://localhost:8080/...` লিংকগুলো
  site-relative করা হয়েছে (মোট ১,৫০৫টা) — ডোমেইন বদলালেও ছবি ঠিক থাকবে
- লোকাল টেস্টিংয়ের ৬৮১টা ভিজিট `tracking_events_log` থেকে সরানো হয়েছে, তাই
  লাইভ রিপোর্টের হিসাব পরিষ্কার থাকবে
- `banners` টেবিলে দুইটা বাংলা টাইটেল `??????` হয়ে সেভ ছিল, ঠিক করা হয়েছে
  (ফ্যাশন ও গিফট, হোম এসেনশিয়ালস)
- ডুপ্লিকেট ছবির ফোল্ডার বাদ দেওয়ায় প্যাকেজ ১৪৯ MB থেকে ১১৯ MB হয়েছে
- সার্ভারে দরকার নেই এমন ফাইল (`test-login.php`, `check-admin.php`,
  `update_products.php`, phpunit, dev প্যাকেজ) বাদ দেওয়া হয়েছে

---

## আগে থেকেই যা ঠিক করা আছে

- **API-র ঠিকানা** — frontend `/backend/api` তে কল করে, ডোমেইন কোথাও hardcode
  করা নেই। ভবিষ্যতে ডোমেইন বদলালেও নতুন করে build করতে হবে না।
- **storage symlink** — শেয়ার্ড হোস্টিংয়ে `php artisan storage:link` চালানোর
  সুযোগ থাকে না। তাই `.env` এ `FILESYSTEM_PUBLIC_USE_PUBLIC_PATH=true` দেওয়া
  আছে — নতুন আপলোড সরাসরি `backend/public/storage/` এ যাবে, **symlink লাগবে না**।
- **নিরাপত্তা** — `.env`, `app/`, `vendor/`, `config/` ব্রাউজার থেকে খোলা যাবে
  না, সব রিকোয়েস্ট Laravel-এর ভিতর দিয়ে যায়। `APP_DEBUG=false` করা আছে।
- **vendor** — dev প্যাকেজ বাদ দিয়ে optimized autoloader দিয়ে বানানো,
  সার্ভারে composer চালানোর দরকার নেই।

---

## সমস্যা হলে

সবার আগে **`/backend/_diag.php`** খুলুন — বেশিরভাগ সমস্যা ওখানেই ধরা পড়বে।

**হোমপেজ আসে কিন্তু প্রোডাক্ট আসে না**
`/backend/api/health` খুলুন।
- JSON আসে → Laravel ঠিক আছে, সমস্যা ডাটাবেসে। `_diag.php` এ ডাটাবেসের
  লাইনটা দেখুন।
- HTML/404 আসে → `.htaccess` ফাইলগুলো আপলোড হয়নি। Show Hidden Files চালু
  করে `public_html/.htaccess` আর `public_html/backend/.htaccess` আছে কিনা দেখুন।

**সাদা পেজ বা 500 Error**
`public_html/backend/storage/logs/laravel.log` খুলে দেখুন। কিছু না থাকলে
সাময়িকভাবে `backend/.env` এ `APP_DEBUG=true` দিয়ে আসল কারণটা দেখে নিয়ে
**আবার `false` করে দিন**।

**ছবি আসছে না**
`public_html/backend/public/storage/uploads/` ফোল্ডারে ফাইল আছে কিনা দেখুন
(৩৬৭টা থাকার কথা), আর permission **755** কিনা দেখুন।

**ভিতরের পেজে (যেমন /cart) রিফ্রেশ দিলে 404**
`public_html/.htaccess` নেই — ওটাই SPA রাউটিং সামলায়।

**অ্যাডমিনে লগইন হয় না**
`_diag.php` এ "অ্যাডমিন ইউজার" লাইনটা দেখুন। ০ দেখালে ডাটাবেস ইমপোর্ট
অসম্পূর্ণ — আবার ইমপোর্ট করুন।

---

## পরে করার মতো কিছু কাজ

- **HTTPS** — cPanel → **SSL/TLS Status** → AutoSSL চালান। তারপর
  `backend/.env` এ `APP_URL` এর `http://` বদলে `https://` করে দিন।
- **মেইল** — cPanel-এ ইমেইল অ্যাকাউন্ট বানিয়ে অ্যাডমিন প্যানেলের
  **Settings → SMTP** পেজ থেকে বসিয়ে দিলে অর্ডার কনফার্মেশন মেইল যাবে।
- **OpenAI key** — `backend/.env` এ visual search ফিচারের জন্য একটা
  OpenAI API key বসানো আছে। কি-টা যেহেতু আগে প্লেইন টেক্সটে ঘোরাঘুরি করেছে,
  নিরাপত্তার জন্য OpenAI ড্যাশবোর্ড থেকে ওটা বাতিল করে নতুন একটা বানিয়ে
  `.env` এ বসিয়ে দেওয়া ভালো।

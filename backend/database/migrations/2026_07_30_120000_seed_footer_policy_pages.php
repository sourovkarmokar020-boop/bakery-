<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * ফুটারের "লিংক" সেকশনের পলিসি পেজগুলো (ডেলিভারি নিয়ম, রিটার্ন পলিসি, শর্তাবলী,
 * প্রাইভেসি পলিসি) + লিংক তালিকা।
 *
 * পেজগুলো CMS-এর `pages` টেবিলে রাখা হয়েছে, আলাদা React পেজ বানানো হয়নি — কারণ
 * অ্যাডমিন প্যানেলের "পেজ ম্যানেজ" থেকেই দুই ভাষার লেখা এডিট করা যায়, ডেভেলপার
 * লাগে না। slug একই থাকলে ফুটারের লিংক কখনো ভাঙে না।
 *
 * লেখাগুলো শুরুর ডিফল্ট — ডেলিভারি চার্জ shipping_charges টেবিল থেকে আর যোগাযোগের
 * তথ্য site_settings থেকে নিয়ে বসানো হয়, যাতে সাইটের বাকি অংশের সাথে না মেলে এমন
 * সংখ্যা কোথাও হার্ডকোড না হয়।
 */
return new class extends Migration
{
    public function up(): void
    {
        $phone = $this->setting('site_phone', '01985403218');
        $whatsapp = $this->setting('whatsapp_number', $phone);
        $email = $this->setting('site_email', 'info@dreammart.com');
        $address = $this->setting('site_address_en', $this->setting('site_address', 'Dhaka, Bangladesh'));
        $brand = $this->setting('brand_name', 'Dream Mart');

        $inside = $this->charge('ভিতরে', 70);
        $outside = $this->charge('বাইরে', 150);

        foreach ($this->pages($phone, $whatsapp, $email, $address, $brand, $inside, $outside) as $page) {
            // অ্যাডমিন হাতে এডিট করা পেজ যেন migration আবার চালালে মুছে না যায়
            if (DB::table('pages')->where('slug', $page['slug'])->exists()) {
                continue;
            }

            DB::table('pages')->insert([
                'id' => (string) Str::uuid(),
                'slug' => $page['slug'],
                // title / content হলো লিগ্যাসি (ভাষা-নিরপেক্ষ) কলাম — অ্যাডমিন
                // SettingsPage-এর মতোই এখানে বাংলা মানটাই রাখা হয়
                'title' => $page['title_bn'],
                'title_en' => $page['title_en'],
                'title_bn' => $page['title_bn'],
                'content' => $page['content_bn'],
                'content_en' => $page['content_en'],
                'content_bn' => $page['content_bn'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ফুটারের লিংক তালিকা — DB-র মান Footer.tsx-এর ডিফল্টকে ওভাররাইড করে,
        // তাই নতুন লিংকগুলো এখানেও বসাতে হয়
        $links = json_encode([
            ['label' => 'সকল পণ্য', 'url' => '/products'],
            ['label' => 'ডেলিভারি নিয়ম', 'url' => '/page/delivery-rules'],
            ['label' => 'রিটার্ন পলিসি', 'url' => '/page/return-policy'],
            ['label' => 'শর্তাবলী', 'url' => '/page/terms-and-conditions'],
            ['label' => 'প্রাইভেসি পলিসি', 'url' => '/page/privacy-policy'],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if (DB::table('site_settings')->where('key', 'footer_important_links')->exists()) {
            DB::table('site_settings')
                ->where('key', 'footer_important_links')
                ->update(['value' => $links, 'updated_at' => now()]);
        } else {
            DB::table('site_settings')->insert([
                'id' => (string) Str::uuid(),
                'key' => 'footer_important_links',
                'value' => $links,
                'group_name' => 'general',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('pages')->whereIn('slug', [
            'delivery-rules', 'return-policy', 'terms-and-conditions', 'privacy-policy',
        ])->delete();
    }

    private function setting(string $key, string $fallback): string
    {
        $value = DB::table('site_settings')->where('key', $key)->value('value');

        return filled($value) ? trim($value) : $fallback;
    }

    /** এলাকার নামে "ভিতরে"/"বাইরে" খুঁজে চার্জ বের করে — না পেলে ডিফল্ট */
    private function charge(string $needle, int $fallback): int
    {
        $row = DB::table('shipping_charges')
            ->where('is_active', true)
            ->where('area_name', 'like', "%{$needle}%")
            ->value('charge');

        return $row === null ? $fallback : (int) round((float) $row);
    }

    private function pages(
        string $phone,
        string $whatsapp,
        string $email,
        string $address,
        string $brand,
        int $inside,
        int $outside
    ): array {
        return [
            [
                'slug' => 'delivery-rules',
                'title_en' => 'Delivery Rules',
                'title_bn' => 'ডেলিভারি নিয়ম',
                'content_en' => <<<HTML
<h2>Delivery Charges</h2>
<ul>
  <li><strong>Inside Dhaka:</strong> ৳{$inside} — delivered within 1-2 working days.</li>
  <li><strong>Outside Dhaka:</strong> ৳{$outside} — delivered within 3-5 working days.</li>
</ul>
<p>The exact charge for your area is shown on the checkout page before you confirm the order.</p>

<h2>How Ordering Works</h2>
<ol>
  <li>Place the order from the website, or call us at {$phone}.</li>
  <li>Our team calls or messages you on WhatsApp ({$whatsapp}) to confirm the order.</li>
  <li>After confirmation the parcel is handed over to our courier partner.</li>
  <li>You can follow the parcel any time from the <a href="/track-order">Track Order</a> page.</li>
</ol>

<h2>Payment</h2>
<ul>
  <li><strong>Cash on Delivery (COD)</strong> is available across the country — pay when you receive the parcel.</li>
  <li>Online payment (bKash) is available as well; the delivery charge is included in the total.</li>
  <li>For some large or high-value orders we may request an advance for the delivery charge.</li>
</ul>

<h2>Please Note</h2>
<ul>
  <li>Please check the parcel in front of the delivery person. If anything is wrong, see our <a href="/page/return-policy">Return Policy</a>.</li>
  <li>Delivery may take longer during public holidays, strikes or natural disasters.</li>
  <li>If we cannot reach you on the given phone number, the parcel may be returned to us.</li>
</ul>

<p>Any question about delivery? Call {$phone} or WhatsApp {$whatsapp}. Email: {$email}</p>
HTML,
                'content_bn' => <<<HTML
<h2>ডেলিভারি চার্জ</h2>
<ul>
  <li><strong>ঢাকার ভিতরে:</strong> ৳{$inside} — ১-২ কর্মদিবসে পৌঁছে যায়।</li>
  <li><strong>ঢাকার বাইরে:</strong> ৳{$outside} — ৩-৫ কর্মদিবসে পৌঁছে যায়।</li>
</ul>
<p>আপনার এলাকার সঠিক চার্জ অর্ডার কনফার্ম করার আগেই চেকআউট পেজে দেখানো হয়।</p>

<h2>অর্ডার যেভাবে হয়</h2>
<ol>
  <li>ওয়েবসাইট থেকে অর্ডার করুন, অথবা {$phone} নম্বরে কল করুন।</li>
  <li>আমাদের টিম কল বা WhatsApp ({$whatsapp}) এ মেসেজ দিয়ে অর্ডার কনফার্ম করে।</li>
  <li>কনফার্ম হওয়ার পর পার্সেল কুরিয়ারে হ্যান্ডওভার করা হয়।</li>
  <li><a href="/track-order">অর্ডার ট্র্যাক</a> পেজ থেকে যেকোনো সময় পার্সেলের অবস্থা দেখতে পারবেন।</li>
</ol>

<h2>পেমেন্ট</h2>
<ul>
  <li><strong>ক্যাশ অন ডেলিভারি (COD)</strong> সারাদেশে চালু — পার্সেল হাতে পেয়ে টাকা দিন।</li>
  <li>অনলাইন পেমেন্ট (বিকাশ) দিয়েও দাম দিতে পারেন; ডেলিভারি চার্জ মোট টাকার সাথে যোগ হয়।</li>
  <li>কিছু বড় বা বেশি দামের অর্ডারে ডেলিভারি চার্জ অগ্রিম নেওয়া হতে পারে।</li>
</ul>

<h2>খেয়াল রাখবেন</h2>
<ul>
  <li>ডেলিভারি ম্যানের সামনেই পার্সেল চেক করে নিন। কোনো সমস্যা থাকলে আমাদের <a href="/page/return-policy">রিটার্ন পলিসি</a> দেখুন।</li>
  <li>সরকারি ছুটি, হরতাল বা প্রাকৃতিক দুর্যোগে ডেলিভারিতে বেশি সময় লাগতে পারে।</li>
  <li>দেওয়া নম্বরে আপনাকে না পাওয়া গেলে পার্সেল আমাদের কাছে ফিরে আসতে পারে।</li>
</ul>

<p>ডেলিভারি নিয়ে কোনো প্রশ্ন? কল করুন {$phone} বা WhatsApp {$whatsapp}। ইমেইল: {$email}</p>
HTML,
            ],
            [
                'slug' => 'return-policy',
                'title_en' => 'Return Policy',
                'title_bn' => 'রিটার্ন পলিসি',
                'content_en' => <<<HTML
<h2>Check the Parcel First</h2>
<p>Please open and check the product in front of the delivery person. If the item is wrong, broken or damaged, refuse the parcel right there and call us at {$phone} — this is the fastest way to solve the problem.</p>

<h2>When You Can Return a Product</h2>
<ul>
  <li>A wrong product or wrong size/colour was delivered.</li>
  <li>The product arrived broken, damaged or with a manufacturing defect.</li>
  <li>An item of the order is missing from the parcel.</li>
</ul>
<p>Please inform us <strong>within 3 days</strong> of receiving the parcel, with a photo or video of the product and the packaging.</p>

<h2>Conditions</h2>
<ul>
  <li>The product must be unused and in its original packaging, with all tags, free gifts and accessories.</li>
  <li>The order number or invoice must be provided.</li>
  <li>If the fault is ours, we pay the return courier charge. For a change of mind, the customer pays it.</li>
</ul>

<h2>Not Returnable</h2>
<ul>
  <li>Used, washed or damaged-after-delivery products.</li>
  <li>Opened food, cosmetics, personal care or innerwear items (for hygiene reasons).</li>
  <li>Small differences in colour caused by your screen or by photography lighting.</li>
  <li>Products bought as clearance or "as-is" items.</li>
</ul>

<h2>Replacement & Refund</h2>
<ul>
  <li>Once we receive and check the returned product, we send a replacement or refund within 3-7 working days.</li>
  <li>Refunds for COD orders are sent to your bKash/Nagad number; online payments are returned to the original payment method.</li>
  <li>The delivery charge already paid is refunded only when the fault is ours.</li>
</ul>

<h2>Order Cancellation</h2>
<p>You can cancel free of charge any time before the parcel is handed over to the courier. Just call {$phone} or WhatsApp {$whatsapp}.</p>
HTML,
                'content_bn' => <<<HTML
<h2>আগে পার্সেল চেক করুন</h2>
<p>ডেলিভারি ম্যানের সামনেই পার্সেল খুলে পণ্য দেখে নিন। পণ্য ভুল, ভাঙা বা ক্ষতিগ্রস্ত হলে তখনই পার্সেল ফিরিয়ে দিন এবং {$phone} নম্বরে কল করুন — সমস্যা সমাধানের এটাই দ্রুততম উপায়।</p>

<h2>কখন পণ্য রিটার্ন করা যাবে</h2>
<ul>
  <li>ভুল পণ্য অথবা ভুল সাইজ/কালার পাঠানো হয়েছে।</li>
  <li>পণ্য ভাঙা, ক্ষতিগ্রস্ত বা তৈরিতে ত্রুটি আছে।</li>
  <li>অর্ডারের কোনো আইটেম পার্সেলে নেই।</li>
</ul>
<p>পার্সেল পাওয়ার <strong>৩ দিনের মধ্যে</strong> পণ্য ও প্যাকেজিংয়ের ছবি বা ভিডিওসহ আমাদের জানাতে হবে।</p>

<h2>শর্তাবলী</h2>
<ul>
  <li>পণ্য অব্যবহৃত থাকতে হবে এবং অরিজিনাল প্যাকেজিং, ট্যাগ, ফ্রি গিফট ও এক্সেসরিজ সব থাকতে হবে।</li>
  <li>অর্ডার নম্বর বা ইনভয়েস দিতে হবে।</li>
  <li>ভুল আমাদের হলে রিটার্নের কুরিয়ার খরচ আমরা দিই। শুধু পছন্দ বদলালে খরচ গ্রাহকের।</li>
</ul>

<h2>যা রিটার্ন নেওয়া হয় না</h2>
<ul>
  <li>ব্যবহার করা, ধোয়া বা ডেলিভারির পর নষ্ট হওয়া পণ্য।</li>
  <li>খোলা খাদ্যপণ্য, কসমেটিকস, পার্সোনাল কেয়ার ও ইনারওয়্যার (স্বাস্থ্যগত কারণে)।</li>
  <li>আপনার স্ক্রিন বা ছবির আলোর কারণে কালারের সামান্য পার্থক্য।</li>
  <li>ক্লিয়ারেন্স বা "as-is" অফারে কেনা পণ্য।</li>
</ul>

<h2>রিপ্লেসমেন্ট ও রিফান্ড</h2>
<ul>
  <li>রিটার্ন পণ্য আমাদের কাছে পৌঁছে যাচাই হওয়ার পর ৩-৭ কর্মদিবসের মধ্যে রিপ্লেসমেন্ট বা রিফান্ড দেওয়া হয়।</li>
  <li>COD অর্ডারের টাকা আপনার বিকাশ/নগদ নম্বরে পাঠানো হয়; অনলাইন পেমেন্ট একই মাধ্যমে ফেরত যায়।</li>
  <li>আগে দেওয়া ডেলিভারি চার্জ শুধু আমাদের ভুলের ক্ষেত্রেই ফেরত দেওয়া হয়।</li>
</ul>

<h2>অর্ডার বাতিল</h2>
<p>পার্সেল কুরিয়ারে হ্যান্ডওভার হওয়ার আগে যেকোনো সময় বিনা খরচে অর্ডার বাতিল করতে পারবেন। {$phone} নম্বরে কল করুন বা WhatsApp করুন {$whatsapp}।</p>
HTML,
            ],
            [
                'slug' => 'terms-and-conditions',
                'title_en' => 'Terms & Conditions',
                'title_bn' => 'শর্তাবলী',
                'content_en' => <<<HTML
<p>By browsing this website or placing an order on it, you agree to the terms below. Please read them before you order.</p>

<h2>Products & Prices</h2>
<ul>
  <li>All prices are in Bangladeshi Taka (৳). Delivery charge is added separately at checkout.</li>
  <li>We try to keep every product image, description and price accurate, but small differences can happen. Colour may look slightly different on different screens.</li>
  <li>Prices and offers can change without prior notice. The price shown when your order is confirmed is the price that applies.</li>
</ul>

<h2>Orders</h2>
<ul>
  <li>An order is confirmed only after our team verifies it by phone or WhatsApp.</li>
  <li>If a product is out of stock, or a price/stock error occurred, we may cancel the order and inform you.</li>
  <li>We may cancel or block orders that repeatedly refuse Cash on Delivery, give a fake address or phone number, or look fraudulent.</li>
  <li>Delivery, return and refund rules are described on the <a href="/page/delivery-rules">Delivery Rules</a> and <a href="/page/return-policy">Return Policy</a> pages, and are part of these terms.</li>
</ul>

<h2>Your Account</h2>
<ul>
  <li>Please give a correct name, phone number and address — delivery depends on it.</li>
  <li>Keeping your account password safe is your responsibility.</li>
  <li>Coins, coupons and offers cannot be exchanged for cash and can be stopped or changed at any time.</li>
</ul>

<h2>Website Content</h2>
<p>All content on this site — logo, brand name, text, product images and design — belongs to {$brand}. Copying or using it commercially without written permission is not allowed.</p>

<h2>Liability</h2>
<p>Our responsibility is limited to the value of the product you purchased. We are not liable for delays caused by events beyond our control such as courier problems, natural disasters or strikes.</p>

<h2>Contact & Governing Law</h2>
<p>These terms are governed by the laws of Bangladesh. For any question: {$phone} • WhatsApp {$whatsapp} • {$email} • {$address}</p>
HTML,
                'content_bn' => <<<HTML
<p>এই ওয়েবসাইট ব্যবহার করলে বা এখান থেকে অর্ডার করলে আপনি নিচের শর্তগুলো মেনে নিচ্ছেন। অর্ডারের আগে অনুগ্রহ করে পড়ে নিন।</p>

<h2>পণ্য ও দাম</h2>
<ul>
  <li>সব দাম বাংলাদেশি টাকায় (৳)। ডেলিভারি চার্জ চেকআউটে আলাদাভাবে যোগ হয়।</li>
  <li>প্রতিটি পণ্যের ছবি, বর্ণনা ও দাম সঠিক রাখার চেষ্টা করি, তবু ছোট পার্থক্য হতে পারে। ভিন্ন স্ক্রিনে কালার কিছুটা আলাদা দেখাতে পারে।</li>
  <li>দাম ও অফার আগে না জানিয়ে পরিবর্তন হতে পারে। অর্ডার কনফার্ম হওয়ার সময় যে দাম দেখানো হয়, সেটাই প্রযোজ্য।</li>
</ul>

<h2>অর্ডার</h2>
<ul>
  <li>আমাদের টিম ফোন বা WhatsApp-এ যাচাই করার পরই অর্ডার কনফার্ম হয়।</li>
  <li>পণ্য স্টকে না থাকলে, বা দাম/স্টকে ভুল হলে আমরা অর্ডার বাতিল করে আপনাকে জানাতে পারি।</li>
  <li>বারবার ক্যাশ অন ডেলিভারি ফিরিয়ে দেওয়া, ভুয়া ঠিকানা বা নম্বর দেওয়া, কিংবা প্রতারণামূলক মনে হলে অর্ডার বাতিল বা নম্বর ব্লক করা হতে পারে।</li>
  <li>ডেলিভারি, রিটার্ন ও রিফান্ডের নিয়ম <a href="/page/delivery-rules">ডেলিভারি নিয়ম</a> ও <a href="/page/return-policy">রিটার্ন পলিসি</a> পেজে দেওয়া আছে এবং সেগুলোও এই শর্তাবলীর অংশ।</li>
</ul>

<h2>আপনার অ্যাকাউন্ট</h2>
<ul>
  <li>সঠিক নাম, ফোন নম্বর ও ঠিকানা দিন — ডেলিভারি এর উপরেই নির্ভর করে।</li>
  <li>অ্যাকাউন্টের পাসওয়ার্ড নিরাপদ রাখার দায়িত্ব আপনার।</li>
  <li>কয়েন, কুপন ও অফার নগদ টাকায় বিনিময়যোগ্য নয় এবং যেকোনো সময় বন্ধ বা পরিবর্তন করা হতে পারে।</li>
</ul>

<h2>ওয়েবসাইটের কন্টেন্ট</h2>
<p>এই সাইটের সব কন্টেন্ট — লোগো, ব্র্যান্ড নাম, লেখা, পণ্যের ছবি ও ডিজাইন — {$brand} এর সম্পত্তি। লিখিত অনুমতি ছাড়া এগুলো কপি বা বাণিজ্যিকভাবে ব্যবহার করা যাবে না।</p>

<h2>দায়বদ্ধতা</h2>
<p>আমাদের দায় আপনার কেনা পণ্যের মূল্যের মধ্যেই সীমাবদ্ধ। কুরিয়ার সমস্যা, প্রাকৃতিক দুর্যোগ বা হরতালের মতো আমাদের নিয়ন্ত্রণের বাইরের কারণে দেরির জন্য আমরা দায়ী নই।</p>

<h2>যোগাযোগ ও প্রযোজ্য আইন</h2>
<p>এই শর্তাবলী বাংলাদেশের প্রচলিত আইন অনুযায়ী পরিচালিত। যেকোনো প্রশ্নে: {$phone} • WhatsApp {$whatsapp} • {$email} • {$address}</p>
HTML,
            ],
            [
                'slug' => 'privacy-policy',
                'title_en' => 'Privacy Policy',
                'title_bn' => 'প্রাইভেসি পলিসি',
                'content_en' => <<<HTML
<p>{$brand} respects your privacy. This page explains what information we collect, why we collect it and how we protect it.</p>

<h2>What We Collect</h2>
<ul>
  <li>Name, phone number, delivery address and email address.</li>
  <li>Order history, cart items and product reviews.</li>
  <li>Basic technical information such as device type, browser and pages visited.</li>
</ul>
<p>We never store your full card or bKash PIN. Online payments are handled on the payment provider's own secure page.</p>

<h2>Why We Use It</h2>
<ul>
  <li>To confirm, pack and deliver your order and to issue an invoice.</li>
  <li>To give you support and to answer questions about your order.</li>
  <li>To inform you about offers and new products (you can ask us to stop any time).</li>
  <li>To improve the website and prevent fraudulent orders.</li>
</ul>

<h2>Who We Share It With</h2>
<ul>
  <li><strong>Courier partners</strong> — your name, address and phone number, only to deliver the parcel.</li>
  <li><strong>Payment providers</strong> — the information needed to complete an online payment.</li>
  <li><strong>Analytics and advertising tools</strong> (such as Facebook Pixel and Google Analytics) — anonymous browsing data.</li>
</ul>
<p>We do not sell or rent your personal information to anyone. Information is shared with the authorities only where the law requires it.</p>

<h2>Cookies</h2>
<p>We use cookies to keep your cart, remember your language choice and understand how the site is used. You can delete or block cookies from your browser settings, but some features (like the cart) may then not work properly.</p>

<h2>Security & Your Rights</h2>
<ul>
  <li>Your data is kept on protected servers and only our authorised team can access it.</li>
  <li>You may ask us to see, correct or delete your information, or to stop marketing messages.</li>
  <li>To make such a request, call {$phone} or email {$email}.</li>
</ul>

<p>If this policy changes, the updated version will be published on this page.</p>
HTML,
                'content_bn' => <<<HTML
<p>{$brand} আপনার গোপনীয়তাকে সম্মান করে। এই পেজে বলা হয়েছে আমরা কী তথ্য নিই, কেন নিই এবং কীভাবে তা সুরক্ষিত রাখি।</p>

<h2>আমরা কী তথ্য নিই</h2>
<ul>
  <li>নাম, ফোন নম্বর, ডেলিভারি ঠিকানা ও ইমেইল।</li>
  <li>অর্ডারের ইতিহাস, কার্টের পণ্য ও রিভিউ।</li>
  <li>ডিভাইসের ধরন, ব্রাউজার ও কোন পেজ দেখেছেন — এই ধরনের সাধারণ কারিগরি তথ্য।</li>
</ul>
<p>আপনার কার্ডের পুরো তথ্য বা বিকাশ পিন আমরা কখনো সংরক্ষণ করি না। অনলাইন পেমেন্ট পেমেন্ট প্রতিষ্ঠানের নিজস্ব নিরাপদ পেজেই সম্পন্ন হয়।</p>

<h2>কেন ব্যবহার করি</h2>
<ul>
  <li>অর্ডার কনফার্ম, প্যাক ও ডেলিভারি করতে এবং ইনভয়েস দিতে।</li>
  <li>আপনাকে সাপোর্ট দিতে ও অর্ডার সংক্রান্ত প্রশ্নের উত্তর দিতে।</li>
  <li>অফার ও নতুন পণ্যের খবর জানাতে (যেকোনো সময় বন্ধ করতে বলতে পারেন)।</li>
  <li>ওয়েবসাইট উন্নত করতে ও প্রতারণামূলক অর্ডার ঠেকাতে।</li>
</ul>

<h2>কার সাথে শেয়ার করি</h2>
<ul>
  <li><strong>কুরিয়ার প্রতিষ্ঠান</strong> — শুধু পার্সেল পৌঁছে দিতে আপনার নাম, ঠিকানা ও ফোন নম্বর।</li>
  <li><strong>পেমেন্ট প্রতিষ্ঠান</strong> — অনলাইন পেমেন্ট সম্পন্ন করতে যতটুকু তথ্য দরকার।</li>
  <li><strong>অ্যানালিটিকস ও বিজ্ঞাপন টুল</strong> (যেমন Facebook Pixel, Google Analytics) — পরিচয়হীন ব্রাউজিং তথ্য।</li>
</ul>
<p>আপনার ব্যক্তিগত তথ্য আমরা কারো কাছে বিক্রি বা ভাড়া দিই না। শুধু আইনি বাধ্যবাধকতা থাকলে সংশ্লিষ্ট কর্তৃপক্ষকে তথ্য দেওয়া হয়।</p>

<h2>কুকিজ</h2>
<p>কার্ট ধরে রাখা, ভাষার পছন্দ মনে রাখা ও সাইট কীভাবে ব্যবহৃত হচ্ছে তা বোঝার জন্য আমরা কুকিজ ব্যবহার করি। ব্রাউজার সেটিংস থেকে কুকিজ মুছে বা বন্ধ করে দিতে পারেন, তবে তখন কার্টের মতো কিছু সুবিধা ঠিকভাবে কাজ করবে না।</p>

<h2>নিরাপত্তা ও আপনার অধিকার</h2>
<ul>
  <li>আপনার তথ্য সুরক্ষিত সার্ভারে রাখা হয় এবং শুধু আমাদের অনুমোদিত টিম তা দেখতে পারে।</li>
  <li>আপনি চাইলে আপনার তথ্য দেখতে, সংশোধন করতে বা মুছে দিতে বলতে পারেন, কিংবা মার্কেটিং মেসেজ বন্ধ করতে পারেন।</li>
  <li>এমন অনুরোধের জন্য {$phone} নম্বরে কল করুন বা {$email} এ ইমেইল করুন।</li>
</ul>

<p>এই পলিসি পরিবর্তন হলে হালনাগাদ সংস্করণ এই পেজেই প্রকাশ করা হবে।</p>
HTML,
            ],
        ];
    }
};

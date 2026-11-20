<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * নিয়ম-ভিত্তিক (rule-based) লাইভ চ্যাট — কোনো external AI API ছাড়াই পুরোপুরি
 * Laravel + ডাটাবেস দিয়ে চলে। কাস্টমারের প্রশ্নের keyword বুঝে DB-র আসল পণ্য
 * খুঁজে দেয় এবং ডেলিভারি/পেমেন্ট/অর্ডার/যোগাযোগসহ নানা বিষয়ের উত্তর দেয়।
 * উত্তরে ভিন্নতা (variation) রাখা হয়েছে যাতে রোবটের মতো না শোনায়।
 */
class ChatController extends Controller
{
    public function reply(Request $request): JsonResponse
    {
        $enabled = DB::table('site_settings')->where('key', 'live_chat_enabled')->value('value');
        if ($enabled === 'false') {
            return response()->json(['reply' => 'দুঃখিত, লাইভ চ্যাট এখন বন্ধ আছে।']);
        }

        $message = trim((string) $request->input('message', ''));
        if ($message === '') {
            return response()->json(['reply' => 'জি বলুন, কীভাবে সাহায্য করতে পারি? 🙂']);
        }

        return response()->json(['reply' => $this->buildReply($message)]);
    }

    private function buildReply(string $message): string
    {
        $s = DB::table('site_settings')->pluck('value', 'key')->toArray();
        $brand = $s['brand_name'] ?? 'আমাদের শপ';
        $msg = mb_strtolower($message);
        $tokens = $this->tokens($msg);

        // --- ছোট-খাটো কথা / সৌজন্য (এগুলো আগে, যাতে "hi" ইত্যাদি আলাদা করে ধরা যায়) ---

        if ($this->hasWord($tokens, ['hi', 'hii', 'hey', 'hello', 'হাই', 'হ্যালো', 'সালাম', 'আসসালামু', 'আসসালামুয়ালাইকুম', 'assalamualaikum', 'salam'])) {
            return $this->pick([
                "ওয়ালাইকুম আসসালাম! 🙂 {$brand}-এ স্বাগতম। কী খুঁজছেন বলুন তো?",
                "আসসালামু আলাইকুম! 👋 বলুন কীভাবে সাহায্য করতে পারি — পণ্য, দাম নাকি অর্ডার নিয়ে?",
                "হ্যালো! 😊 {$brand}-এ স্বাগতম। কোন পণ্যটা নিয়ে জানতে চান?",
            ]);
        }

        if ($this->has($msg, ['ধন্যবাদ', 'thanks', 'thank you', 'thanku', 'thnx', 'tnx', 'শুকরিয়া'])) {
            return $this->pick([
                "আপনাকেও ধন্যবাদ! 🙏 আর কিছু লাগলে বলবেন।",
                "স্বাগতম! 😊 যেকোনো সময় জিজ্ঞেস করতে পারেন।",
                "খুশি হলাম সাহায্য করতে পেরে! আরও কিছু জানার থাকলে বলুন।",
            ]);
        }

        if ($this->has($msg, ['বিদায়', 'bye', 'good bye', 'allah hafez', 'আল্লাহ হাফেজ', 'khoda hafez', 'টাটা'])) {
            return $this->pick([
                "আল্লাহ হাফেজ! 🙂 আবার আসবেন, {$brand} সবসময় আপনার পাশে।",
                "ভালো থাকবেন! 👋 আবার প্রয়োজন হলে চলে আসবেন।",
            ]);
        }

        if ($this->has($msg, ['kemon acho', 'kemon achen', 'কেমন আছো', 'কেমন আছেন', 'how are you', 'কি খবর', 'ki khobor'])) {
            return "আলহামদুলিল্লাহ, ভালো আছি! 😊 আপনি কেমন আছেন? বলুন, কোন পণ্য নিয়ে সাহায্য করতে পারি?";
        }

        if ($this->has($msg, ['তুমি কি মানুষ', 'তুমি কি রোবট', 'আপনি কি মানুষ', 'are you human', 'are you bot', 'তুমি কি bot', 'bot naki', 'মানুষ নাকি', 'manush', 'manus', 'robot', 'tumi ke', 'tumi ki', 'apni ke'])) {
            return "আমি {$brand}-এর সহকারী, দ্রুত সাহায্য করতে সবসময় এখানে আছি 🙂। আরও বিস্তারিত দরকার হলে আমাদের টিমের সাথেও কথা বলতে পারেন।" . $this->contactLine($s);
        }

        // অভিযোগ / কিছু কাজ করছে না (number off, ভুল, কাজ করছে না) — সহানুভূতিশীল উত্তর
        if ($this->has($msg, ['kaj kore na', 'kaj korche na', 'kaj kortece na', 'kortece na', 'kaj kore nai', 'kaj kortase na', 'korche na', 'vul', 'bhul', 'wrong', 'off ', 'bondho', 'kharap', 'kharrap', 'complain', 'complaint', 'ovijog', 'অভিযোগ', 'ভুল', 'কাজ করছে না', 'কাজ করে না', 'বন্ধ', 'সমস্যা হচ্ছে', 'পাচ্ছি না', 'ধরছে না'])
            || $this->hasWord($tokens, ['off', 'problem', 'issue', 'vul', 'bhul'])) {
            return $this->pick([
                "ওহ, দুঃখিত এতে অসুবিধা হচ্ছে! 🙏 আপনি ঠিক কোন সমস্যায় পড়েছেন একটু বললে আমি সাহায্য করার চেষ্টা করি। চাইলে সরাসরি আমাদের টিমের সাথেও কথা বলতে পারেন 👇",
                "সরি ভাই/আপা, এটা নিয়ে সমস্যা হচ্ছে শুনে খারাপ লাগল। 🙏 একটু বিস্তারিত বললে দ্রুত সমাধানের চেষ্টা করি — অথবা এখনই কল করে জানাতে পারেন 👇",
            ]) . $this->contactLine($s, true);
        }

        // --- নির্দিষ্ট বিষয় (specific intents) ---

        // অর্ডার ট্র্যাক
        if ($this->has($msg, ['ট্র্যাক', 'track', 'অর্ডার কোথায়', 'order kothay', 'আমার অর্ডার', 'কবে পাবো', 'কবে পাব', 'delivery kobe', 'status'])) {
            return "আপনার অর্ডারের অবস্থা দেখতে [ট্র্যাক অর্ডার পেজে](/track-order) যান — সেখানে ফোন নম্বর বা অর্ডার নম্বর দিয়ে খুঁজে দেখতে পারবেন।" . $this->contactLine($s);
        }

        // রিটার্ন / রিফান্ড
        if ($this->has($msg, ['রিটার্ন', 'return', 'রিফান্ড', 'refund', 'ফেরত', 'বদল', 'exchange', 'নষ্ট', 'সমস্যা থাকলে'])) {
            return $this->pick([
                "পণ্যে কোনো সমস্যা থাকলে চিন্তা নেই — ডেলিভারির সময় দেখে নিতে পারবেন, সমস্যা হলে রিটার্ন/রিফান্ডের সুযোগ আছে।",
                "আপনার সন্তুষ্টিই আমাদের কাছে গুরুত্বপূর্ণ। পণ্যে ত্রুটি থাকলে রিটার্ন বা বদলে নেওয়া যাবে।",
            ]) . $this->contactLine($s);
        }

        // অফার / ছাড়
        if ($this->has($msg, ['অফার', 'offer', 'ছাড়', 'discount', 'ডিসকাউন্ট', 'কম দামে', 'সেল', 'sale', 'কুপন', 'coupon'])) {
            return "এই মুহূর্তে চলমান অফার ও ছাড়ের পণ্যগুলো হোমপেজের 'অফারে কিনুন' অংশে দেখতে পাবেন — [এখানে দেখুন](/)। 🔥";
        }

        // ডেলিভারি
        if ($this->has($msg, ['ডেলিভারি', 'ডেলিভারী', 'delivery', 'চার্জ', 'charge', 'শিপিং', 'shipping', 'কুরিয়ার', 'courier', 'খরচ'])) {
            return $this->deliveryInfo() . $this->contactLine($s);
        }

        // পেমেন্ট
        if ($this->has($msg, ['পেমেন্ট', 'payment', 'বিকাশ', 'bkash', 'নগদ', 'nagad', 'রকেট', 'rocket', 'cash', 'cod', 'ক্যাশ', 'টাকা দিব', 'টাকা দিবো', 'advance'])) {
            return "পেমেন্ট যেভাবে করতে পারেন: 💳\n• ক্যাশ অন ডেলিভারি (COD) — পণ্য হাতে পেয়ে টাকা দিন\n• বিকাশ / নগদ\nঅর্ডার করতে পণ্যটি কার্টে যোগ করে চেকআউট করুন।" . $this->contactLine($s);
        }

        // কিভাবে অর্ডার
        if ($this->has($msg, ['কিভাবে অর্ডার', 'কীভাবে অর্ডার', 'how to order', 'অর্ডার কর', 'order kor', 'কিভাবে কিন', 'কিনব', 'কিনবো', 'অর্ডার দিব', 'অর্ডার দিবো', 'অর্ডার করব'])) {
            return "অর্ডার করা খুব সহজ: 📝\n১) পছন্দের পণ্যের পেজে যান\n২) 'কার্টে যোগ করুন' চাপুন\n৩) কার্টে গিয়ে নাম, ঠিকানা ও ফোন দিয়ে অর্ডার কনফার্ম করুন\nপণ্য হাতে পেয়ে ক্যাশ অন ডেলিভারিতে টাকা দিতে পারবেন। 😊" . $this->contactLine($s);
        }

        // খোলা থাকার সময় — যোগাযোগের আগে, কারণ "kon time e call dibo" আসলে সময় জানতে চায়
        if ($this->has($msg, ['কখন খোলা', 'কয়টা পর্যন্ত', 'সময়', 'open', 'hour', 'ঘণ্টা', 'কখন কল', 'kon time', 'kokhon', 'koto tay', 'kobe call', 'call dibo', 'kon somoy', 'kkhon'])) {
            $hours = $s['business_hours'] ?? '';
            return $hours !== ''
                ? "আমরা খোলা থাকি 🕒 {$hours}। এই সময়ের মধ্যে কল করলে সরাসরি কথা বলা যাবে।" . $this->contactLine($s)
                : $this->pick([
                    "যেকোনো সময় অর্ডার করতে পারেন — ওয়েবসাইট তো ২৪ ঘণ্টাই খোলা। 🙂 আর কল বা WhatsApp-এ সকাল ৯টা থেকে রাত ১০টা পর্যন্ত আমাদের পাবেন।",
                    "সকাল ৯টা থেকে রাত ১০টা — এই সময়ের মধ্যে কল করলেই আমাদের টিমকে পাবেন। ওয়েবসাইটে অবশ্য ২৪ ঘণ্টা অর্ডার করা যায়। 🕒",
                ]) . $this->contactLine($s);
        }

        // যোগাযোগ
        if ($this->has($msg, ['যোগাযোগ', 'contact', 'নাম্বার', 'নম্বর', 'number', 'ফোন', 'phone', 'call', 'কল', 'whatsapp', 'হোয়াটস', 'হেল্পলাইন', 'hotline'])) {
            return $this->pick([
                "অবশ্যই! এই নম্বরে সরাসরি কথা বলতে পারেন 👇",
                "জি, আমাদের সাথে সরাসরি যোগাযোগ করতে পারেন 👇",
                "নিশ্চয়ই, নিচের নম্বরে কল বা WhatsApp করতে পারেন 👇",
            ]) . $this->contactLine($s, true);
        }

        // ক্যাটাগরি তালিকা
        if ($this->has($msg, ['ক্যাটাগরি', 'category', 'কি কি ধরন', 'কী কী ধরন', 'ধরনের পণ্য', 'কি কি আছে', 'কী কী আছে', 'কি কি পণ্য', 'কী ধরনের', 'types', 'সব পণ্য', 'all product'])) {
            $cats = $this->categories();
            if (! empty($cats)) {
                $lines = ['আমাদের যেসব ক্যাটাগরি আছে: 🗂️'];
                foreach ($cats as $c) {
                    $lines[] = '• [' . $c->name . '](/category/' . $c->slug . ')';
                }
                $lines[] = "\nযে ক্যাটাগরিতে ঢুকতে চান নামে ক্লিক করুন, অথবা সরাসরি পণ্যের নাম লিখুন।";

                return implode("\n", $lines);
            }
        }

        // সবচেয়ে কম দাম / বাজেট
        if ($this->has($msg, ['সবচেয়ে কম', 'সস্তা', 'কম দাম', 'cheap', 'budget', 'বাজেট', 'affordable', 'কমের মধ্যে', 'kom dam', 'kom dame', 'sasta', 'sosta', 'sobcheye kom', 'komer moddhe', 'kom price'])) {
            $cheap = DB::table('products')->where('is_active', true)
                ->orderByRaw('COALESCE(sale_price, base_price) asc')->limit(5)
                ->get(['name', 'slug', 'base_price', 'sale_price']);
            if ($cheap->isNotEmpty()) {
                return $this->productList($cheap->all(), 'কম দামের কিছু পণ্য এখানে: 💰');
            }
        }

        // --- পণ্য খোঁজা (DB থেকে আসল পণ্য) — সবচেয়ে দরকারি অংশ ---
        $products = $this->searchProducts($message);
        if (! empty($products)) {
            return $this->productList($products, $this->pick([
                'জি, এই পণ্যগুলো পাওয়া যাচ্ছে: 🛍️',
                'দেখুন তো, এগুলো আপনার খোঁজার সাথে মিলছে: 🛍️',
                'এই পণ্যগুলো আমাদের কাছে আছে: 🛍️',
            ]));
        }

        // কিছু না বুঝলে — বন্ধুসুলভভাবে কিছু আসল পণ্য দেখিয়ে দিই
        return $this->fallbackWithProducts();
    }

    private function searchProducts(string $message): array
    {
        $products = DB::table('products')
            ->where('is_active', true)
            ->get(['name', 'slug', 'base_price', 'sale_price']);

        // সাধারণ filler/stop-word — এগুলো দিয়ে পণ্য ম্যাচ করানো হয় না (নাহলে ভুল পণ্য আসে)
        $stop = [
            'er', 'ta', 'tar', 'ache', 'achhe', 'ki', 'koto', 'dam', 'daam', 'price',
            'taka', 'hobe', 'eta', 'oita', 'ei', 'the', 'for', 'and', 'are', 'you', 'your',
            'with', 'kire', 'kemon', 'please', 'chai', 'lagbe', 'dekhan', 'dekhao', 'amar', 'ache?',
        ];

        $words = array_filter(
            $this->tokens(mb_strtolower($message)),
            fn ($w) => mb_strlen($w) >= 3 && ! in_array($w, $stop, true)
        );
        if (empty($words)) {
            return [];
        }

        $matched = [];
        foreach ($products as $p) {
            $name = mb_strtolower($p->name);
            foreach ($words as $w) {
                if (mb_stripos($name, $w) !== false) {
                    $matched[] = $p;
                    break;
                }
            }
            if (count($matched) >= 5) {
                break;
            }
        }

        return $matched;
    }

    private function productList(array|\Illuminate\Support\Collection $products, string $heading): string
    {
        $lines = [$heading];
        foreach ($products as $p) {
            $lines[] = '• [' . $p->name . '](/product/' . $p->slug . ') — ৳' . $this->money($p->sale_price ?? $p->base_price);
        }
        $lines[] = "\nপণ্যের নামে ক্লিক করে বিস্তারিত দেখে অর্ডার করতে পারেন। 😊";

        return implode("\n", $lines);
    }

    private function fallbackWithProducts(): string
    {
        $products = DB::table('products')
            ->where('is_active', true)
            ->inRandomOrder()
            ->limit(5)
            ->get(['name', 'slug', 'base_price', 'sale_price']);

        if ($products->isEmpty()) {
            return "আপনার কথাটা ঠিক বুঝতে পারিনি 🙂। একটু সহজ করে বলবেন? অথবা আমাদের সব পণ্য দেখতে [এখানে ক্লিক করুন](/)।";
        }

        return $this->productList($products->all(), $this->pick([
            'ঠিক বুঝলাম না 🙂, তবে আপনি হয়তো এগুলো খুঁজছেন:',
            'একটু বুঝিয়ে বলবেন? এর মধ্যে এই পণ্যগুলো দেখতে পারেন:',
        ]));
    }

    private function categories(): array
    {
        return DB::table('categories')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->limit(12)
            ->get(['name', 'slug'])
            ->all();
    }

    private function deliveryInfo(): string
    {
        $charges = DB::table('shipping_charges')->where('is_active', true)->get(['area_name', 'charge']);
        if ($charges->isNotEmpty()) {
            $lines = ['ডেলিভারি চার্জ: 🚚'];
            foreach ($charges as $c) {
                $lines[] = '• ' . $c->area_name . ' — ৳' . $this->money($c->charge);
            }
            $lines[] = 'অর্ডার কনফার্ম হলে দ্রুত পৌঁছে দেওয়ার চেষ্টা করি।';

            return implode("\n", $lines);
        }

        return "ডেলিভারি চার্জ: 🚚\n• ঢাকার ভিতরে — ৳৭০\n• ঢাকার বাইরে — ৳১৫০\nঅর্ডার কনফার্ম হলে ২-৩ দিনের মধ্যে পৌঁছে যাবে।";
    }

    private function contactLine(array $s, bool $standalone = false): string
    {
        $phone = $s['site_phone'] ?? $s['topbar_phone'] ?? '';
        $wa = $s['whatsapp_number'] ?? '';
        $parts = [];
        if ($phone) {
            $parts[] = '📞 কল: ' . $phone;
        }
        if ($wa) {
            $parts[] = '💬 WhatsApp: ' . $wa;
        }
        if (empty($parts)) {
            return '';
        }

        if ($standalone) {
            return "\n" . implode("\n", $parts);
        }

        // অন্য উত্তরের শেষে জোড়া লাগে — প্রতিবার একটু ভিন্ন করে, যাতে রোবটিক না লাগে
        $prefix = $this->pick([
            "\n\nআরও সাহায্য লাগলে — ",
            "\n\nযেকোনো প্রয়োজনে — ",
            "\n\nকথা বলতে চাইলে — ",
        ]);

        return $prefix . implode("\n", $parts);
    }

    private function money($value): string
    {
        $num = (float) $value;

        return $num == (int) $num ? number_format($num, 0) : number_format($num, 2);
    }

    /** শব্দে ভেঙে দেয় (punctuation বাদে) — exact word ম্যাচের জন্য */
    private function tokens(string $msg): array
    {
        return array_values(array_filter(preg_split('/[^\p{L}\p{N}]+/u', $msg)));
    }

    /** ঠিক শব্দ মিললে true — ছোট ইংরেজি শব্দ (hi, bye) অন্য শব্দের ভেতরে যেন না মেলে */
    private function hasWord(array $tokens, array $needles): bool
    {
        foreach ($needles as $n) {
            if (in_array(mb_strtolower($n), $tokens, true)) {
                return true;
            }
        }

        return false;
    }

    /** substring ম্যাচ — বাংলা বাক্যাংশের জন্য */
    private function has(string $msg, array $needles): bool
    {
        foreach ($needles as $n) {
            if (mb_stripos($msg, $n) !== false) {
                return true;
            }
        }

        return false;
    }

    private function pick(array $options): string
    {
        return $options[array_rand($options)];
    }
}

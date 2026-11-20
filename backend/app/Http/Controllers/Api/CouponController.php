<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * কুপন — কয়েনের মতোই ইচ্ছাকৃতভাবে /query/{table} এর বাইরে রাখা হয়েছে,
 * কারণ ওই এন্ডপয়েন্টে কোনো auth নেই। ছাড়ের অঙ্ক সবসময় সার্ভারে হিসাব হয়,
 * ফ্রন্টএন্ড থেকে কোনো টাকার পরিমাণ বিশ্বাস করা হয় না।
 */
class CouponController extends Controller
{
    /** কার্টে কোড লেখার পর: কুপনটি বৈধ কিনা ও কত ছাড় হবে */
    public function check(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:100'],
            'subtotal' => ['required', 'numeric', 'min:0'],
        ]);

        try {
            $coupon = $this->resolve($data['code'], (float) $data['subtotal']);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => [
            'code' => $coupon->code,
            'discount_type' => $this->normalizeType($coupon->discount_type),
            'discount_value' => (float) $coupon->discount_value,
            'min_order_amount' => (float) ($coupon->min_order_amount ?? 0),
            'discount' => $this->discountFor($coupon, (float) $data['subtotal']),
        ]]);
    }

    /**
     * অর্ডার তৈরি হওয়ার পর ছাড় বসানো। ছাড়, নতুন টোটাল এবং ব্যবহারের গণনা —
     * তিনটিই এখানে হয়, তাই কার্ট পেজ থেকে শুধু কোডটাই পাঠানো হয়।
     */
    public function apply(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_id' => ['required', 'string'],
            'code' => ['required', 'string', 'max:100'],
        ]);

        $order = DB::table('orders')->where('id', $data['order_id'])->first();
        if (! $order) {
            return response()->json(['message' => 'অর্ডার খুঁজে পাওয়া যায়নি।'], 404);
        }

        if (! empty($order->coupon_code)) {
            return response()->json(['message' => 'এই অর্ডারে ইতিমধ্যে কুপন ব্যবহার করা হয়েছে।'], 422);
        }

        // শুধু সদ্য তৈরি অর্ডারে — পুরনো অর্ডারে ফিরে গিয়ে ছাড় বসানো যাবে না
        if (Carbon::parse($order->created_at)->diffInMinutes(now()) > 30) {
            return response()->json(['message' => 'এই অর্ডারের সময় শেষ হয়ে গেছে।'], 422);
        }

        try {
            $result = DB::transaction(function () use ($order, $data) {
                $coupon = $this->resolve($data['code'], (float) $order->subtotal, lock: true);
                $discount = $this->discountFor($coupon, (float) $order->subtotal);

                // max_uses থাকলে শর্তসহ increment — দুইজন একসাথে শেষ ব্যবহারটি
                // নিতে চাইলে একজনই পাবে
                $claimed = DB::table('coupons')
                    ->where('id', $coupon->id)
                    ->when($coupon->max_uses !== null, fn ($q) => $q->whereColumn('used_count', '<', 'max_uses'))
                    ->increment('used_count');

                if ($claimed < 1) {
                    throw new \RuntimeException('এই কুপনের ব্যবহারের সীমা শেষ হয়ে গেছে।');
                }

                // কয়েনের ছাড় আগে বসে থাকলে সেটাও হিসাবে থাকে
                $newTotal = max(0, round(
                    (float) $order->subtotal
                    - $discount
                    - (float) ($order->coin_discount ?? 0)
                    + (float) ($order->delivery_charge ?? 0),
                    2
                ));

                DB::table('orders')->where('id', $order->id)->update([
                    'coupon_code' => $coupon->code,
                    'discount' => $discount,
                    'total' => $newTotal,
                    'updated_at' => now(),
                ]);

                return ['code' => $coupon->code, 'discount' => $discount, 'total' => $newTotal];
            });
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $result]);
    }

    /* ---------------------------------------------------------------- helpers */

    /** কোড খুঁজে বের করে সবগুলো শর্ত যাচাই করে — না মিললে কারণসহ ব্যর্থ হয় */
    private function resolve(string $code, float $subtotal, bool $lock = false): object
    {
        $query = DB::table('coupons')->whereRaw('LOWER(code) = ?', [mb_strtolower(trim($code))]);
        if ($lock) {
            $query->lockForUpdate();
        }

        $coupon = $query->first();

        if (! $coupon) {
            throw new \RuntimeException('এই কুপন কোডটি সঠিক নয়।');
        }

        if (! $coupon->is_active) {
            throw new \RuntimeException('এই কুপনটি এখন চালু নেই।');
        }

        if ($coupon->expires_at && Carbon::parse($coupon->expires_at)->isPast()) {
            throw new \RuntimeException('এই কুপনের মেয়াদ শেষ হয়ে গেছে।');
        }

        if ($coupon->max_uses !== null && (int) $coupon->used_count >= (int) $coupon->max_uses) {
            throw new \RuntimeException('এই কুপনের ব্যবহারের সীমা শেষ হয়ে গেছে।');
        }

        // ধরন percentage/fixed ছাড়া অন্য কিছু হলে (পুরনো ডেটায় হাতে লেখা ভুল)
        // কুপনটি কাজ করবে না — অনুমান করতে গেলে ভুল করে বিশাল ছাড় বসে যেতে পারে
        if ($this->normalizeType($coupon->discount_type) === null) {
            throw new \RuntimeException('এই কুপনটি সঠিকভাবে সেট করা নেই। অ্যাডমিন প্যানেল থেকে ছাড়ের ধরন ঠিক করুন।');
        }

        $min = (float) ($coupon->min_order_amount ?? 0);
        if ($min > 0 && $subtotal < $min) {
            throw new \RuntimeException('এই কুপন ব্যবহার করতে কমপক্ষে ৳'.rtrim(rtrim(number_format($min, 2, '.', ''), '0'), '.').' এর অর্ডার লাগবে।');
        }

        if ($this->discountFor($coupon, $subtotal) <= 0) {
            throw new \RuntimeException('এই কুপনে কোনো ছাড় পাওয়া যাচ্ছে না।');
        }

        return $coupon;
    }

    /**
     * ছাড়ের অঙ্ক। ছাড় কখনো সাবটোটালের চেয়ে বেশি হয় না — শতকরা ১০০ এর বেশি
     * বা fixed মান পণ্যের দামের চেয়ে বড় হলেও টোটাল ঋণাত্মক হবে না।
     */
    private function discountFor(object $coupon, float $subtotal): float
    {
        $type = $this->normalizeType($coupon->discount_type);
        if ($type === null) {
            return 0;
        }

        $value = (float) $coupon->discount_value;
        $discount = $type === 'fixed' ? $value : $subtotal * $value / 100;

        return round(min(max($discount, 0), $subtotal), 2);
    }

    /** চেনা ধরন হলে সেটাই, নাহলে null — অচেনা মান অনুমান করা হয় না */
    private function normalizeType(?string $type): ?string
    {
        $type = strtolower(trim((string) $type));

        return in_array($type, ['fixed', 'percentage'], true) ? $type : null;
    }
}

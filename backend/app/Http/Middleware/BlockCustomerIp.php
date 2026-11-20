<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * ব্লকড IP থেকে পুরো সাইট (সব API) বন্ধ থাকে।
 * ব্যতিক্রম: auth রুট (এডমিন যেন লগইন করতে পারে) এবং লগইন-করা এডমিন/সুপার এডমিন —
 * নাহলে ভুল করে নিজের IP ব্লক করলে এডমিন প্যানেল থেকেও চিরতরে আটকে যেতে হতো।
 */
class BlockCustomerIp
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('api/auth/*')) {
            return $next($request);
        }

        $ip = $request->ip();

        // এই মিডলওয়্যারটা সব API রুটে বসে। তাই DB পড়তে না পারলে (ডাটাবেস এখনো
        // ইমপোর্ট হয়নি, ভুল credential, টেবিল নেই) এখানে exception ছুঁড়লে গোটা
        // API — এমনকি /api/health পর্যন্ত — 500 দেয়, আর আসল সমস্যাটা ঢাকা পড়ে যায়।
        // ব্লকলিস্ট পড়া না গেলে তাই রিকোয়েস্ট ছেড়ে দেওয়াই নিরাপদ; আসল এরর তখন
        // যেই রুট সত্যিই DB চায় সেখান থেকেই আসবে।
        try {
            $blockedIps = Cache::remember(
                'blocked_ips',
                now()->addSeconds(30),
                fn () => DB::table('blocked_customers')->whereNotNull('ip_address')->pluck('ip_address')->all()
            );
        } catch (Throwable $e) {
            return $next($request);
        }

        if (! $ip || ! in_array($ip, $blockedIps, true)) {
            return $next($request);
        }

        try {
            $user = auth('sanctum')->user();
            if ($user && DB::table('user_roles')->where('user_id', $user->id)->whereIn('role', ['admin', 'super_admin'])->exists()) {
                return $next($request);
            }
        } catch (Throwable $e) {
            return $next($request);
        }

        return response()->json([
            'blocked' => true,
            'message' => 'আপনার এক্সেস সীমিত করা হয়েছে। বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।',
        ], 403);
    }
}

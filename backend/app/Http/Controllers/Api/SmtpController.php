<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SmtpSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderConfirmation;

class SmtpController extends Controller
{
    /**
     * Get current SMTP settings.
     */
    public function show()
    {
        $settings = SmtpSetting::getActive();
        
        if (!$settings) {
            return response()->json([
                'ok' => false,
                'message' => 'কোনো SMTP সেটিংস কনফিগার করা হয়নি',
                'data' => null,
            ]);
        }

        // Hide password
        $settings->makeHidden(['password']);
        $settings->password = $settings->password ? '********' : null;

        return response()->json([
            'ok' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Save or update SMTP settings.
     */
    public function save(Request $request)
    {
        $validated = $request->validate([
            'mailer' => 'sometimes|string|in:smtp,sendmail,mailgun,ses,postmark,log',
            'host' => 'required_with:mailer|string',
            'port' => 'required_with:host|integer|min:1|max:65535',
            'username' => 'nullable|string',
            'password' => 'nullable|string',
            'encryption' => 'nullable|string|in:ssl,tls,null',
            'from_address' => 'required|email',
            'from_name' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Deactivate all existing settings first if this one is active
        if ($request->is_active) {
            SmtpSetting::where('is_active', true)->update(['is_active' => false]);
        }

        $settings = SmtpSetting::getActive();

        if ($settings) {
            // Update existing
            if ($request->has('password') && empty($request->password)) {
                unset($validated['password']);
            }
            $settings->update($validated);
        } else {
            // Create new
            $settings = SmtpSetting::create($validated);
        }

        // Apply to config
        $this->applySmtpConfig($settings);

        return response()->json([
            'ok' => true,
            'message' => 'SMTP সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে',
            'data' => $settings->makeHidden(['password']),
        ]);
    }

    /**
     * Test SMTP connection by sending a test email.
     */
    public function test(Request $request)
    {
        $request->validate([
            'test_email' => 'required|email',
        ]);

        try {
            $settings = SmtpSetting::getActive();
            
            if (!$settings) {
                return response()->json([
                    'ok' => false,
                    'message' => 'কোনো সক্রিয় SMTP সেটিংস নেই',
                ], 400);
            }

            // Apply SMTP config dynamically
            $this->applySmtpConfig($settings);

            // Send test email
            Mail::raw('ইহা একটি টেস্ট ইমেইল। আপনার SMTP কনফিগারেশন সঠিকভাবে কাজ করছে।', function ($message) use ($request, $settings) {
                $message->to($request->test_email)
                    ->subject('Dream Mart - SMTP টেস্ট ইমেইল')
                    ->from($settings->from_address, $settings->from_name);
            });

            return response()->json([
                'ok' => true,
                'message' => 'টেস্ট ইমেইল সফলভাবে পাঠানো হয়েছে!',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'ok' => false,
                'message' => 'টেস্ট ইমেইল পাঠাতে ব্যর্থ: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Apply SMTP settings to Laravel config dynamically.
     */
    private function applySmtpConfig(SmtpSetting $settings)
    {
        config([
            'mail.default' => $settings->mailer ?? 'smtp',
            'mail.mailers.smtp.host' => $settings->host,
            'mail.mailers.smtp.port' => $settings->port,
            'mail.mailers.smtp.username' => $settings->username,
            'mail.mailers.smtp.password' => $settings->password,
            'mail.mailers.smtp.encryption' => $settings->encryption === 'null' ? null : $settings->encryption,
            'mail.from.address' => $settings->from_address,
            'mail.from.name' => $settings->from_name,
        ]);
    }
}
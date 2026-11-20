<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BkashSetting extends Model
{
    protected $table = 'bkash_settings';

    protected $fillable = [
        'app_key',
        'app_secret',
        'username',
        'password',
        'mode',
        'is_active',
    ];

    protected $hidden = [
        'app_secret',
        'password',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public static function getActive(): ?self
    {
        return self::where('is_active', true)->first();
    }

    public function baseUrl(): string
    {
        return $this->mode === 'live'
            ? 'https://tokenized.pay.bka.sh/v1.2.0-beta'
            : 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationDigest extends Model
{
    protected $fillable = [
        'user_id', 'period_type', 'period_start', 'period_end',
        'payload', 'status', 'scheduled_at', 'sent_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'period_start' => 'datetime',
        'period_end' => 'datetime',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

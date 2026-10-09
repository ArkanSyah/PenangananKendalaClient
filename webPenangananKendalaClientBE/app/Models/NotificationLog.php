<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationLog extends Model
{
    protected $fillable = [
        'batch_id', 'ticket_id', 'recipient_user_id', 'channel',
        'message', 'status', 'reason', 'channel_attempts', 'sent_at',
        'read_at',
    ];

    protected $casts = [
        'channel_attempts' => 'array',
        'sent_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(NotificationBatch::class, 'batch_id');
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }
}

<?php

namespace App\Services\Notification\Channels;

use App\Models\NotificationLog;

class InAppChannel
{
    public function send(int $userId, string $message, ?int $ticketId = null, ?int $batchId = null): array
    {
        NotificationLog::create([
            'batch_id' => $batchId,
            'ticket_id' => $ticketId,
            'recipient_user_id' => $userId,
            'channel' => 'in_app',
            'message' => $message,
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        return ['success' => true];
    }
}

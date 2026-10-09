<?php

namespace App\Services\Notification;

use App\Jobs\SendNotificationBatch;
use App\Models\NotificationBatch;
use Carbon\Carbon;

class NotificationAggregator
{
    public function handle(int $ticketId, ?string $oldStatus, string $newStatus, int $userId): void
    {
        $now = Carbon::now();

        if ($oldStatus === $newStatus) {
            return;
        }

        $window = (int) config('notification.debounce_seconds', 10);

        $batch = NotificationBatch::where('ticket_id', $ticketId)
            ->where('status', 'pending')
            ->where('expires_at', '>', $now)
            ->first();

        if ($batch) {
            $chain = $batch->event_chain ?? [];
            $chain[] = [
                'from' => $oldStatus,
                'to' => $newStatus,
                'at' => $now->toIso8601String(),
            ];
            $batch->update([
                'status_to' => $newStatus,
                'event_chain' => $chain,
                'last_event_at' => $now,
                'expires_at' => $now->copy()->addSeconds($window),
            ]);
        } else {
            $batch = NotificationBatch::create([
                'ticket_id' => $ticketId,
                'status_from' => $oldStatus,
                'status_to' => $newStatus,
                'event_chain' => [[
                    'from' => $oldStatus,
                    'to' => $newStatus,
                    'at' => $now->toIso8601String(),
                ]],
                'triggered_by_user_id' => $userId,
                'first_event_at' => $now,
                'last_event_at' => $now,
                'expires_at' => $now->copy()->addSeconds($window),
                'status' => 'pending',
            ]);
        }

        SendNotificationBatch::dispatch($batch->id)->delay($batch->expires_at);
    }
}

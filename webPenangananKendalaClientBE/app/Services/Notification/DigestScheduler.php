<?php

namespace App\Services\Notification;

use App\Jobs\SendNotificationDigest;
use App\Models\NotificationDigest;
use App\Models\NotificationLog;
use App\Models\NotificationPreference;
use Carbon\Carbon;

class DigestScheduler
{
    public function run(string $periodType): int
    {
        $prefs = NotificationPreference::where('digest_mode', $periodType)->get();
        $now = Carbon::now();

        $start = $periodType === 'daily'
            ? $now->copy()->subDay()
            : $now->copy()->subHour();

        $count = 0;

        foreach ($prefs as $pref) {
            $logs = NotificationLog::where('recipient_user_id', $pref->user_id)
                ->where('created_at', '>=', $start)
                ->where('created_at', '<=', $now)
                ->with('batch.ticket')
                ->orderBy('created_at', 'desc')
                ->get();

            if ($logs->isEmpty()) {
                continue;
            }

            $items = [];
            foreach ($logs as $log) {
                $ticket = $log->batch?->ticket;
                if (! $ticket) {
                    continue;
                }

                $status = $log->batch->status_to ?? '-';
                $items[] = [
                    'ticket_id' => $ticket->ticket_id,
                    'status' => $status,
                    'status_label' => config('notification.status_labels')[$status] ?? $status,
                    'title' => $ticket->title,
                    'at' => $log->created_at->toIso8601String(),
                ];
            }

            if (empty($items)) {
                continue;
            }

            $digest = NotificationDigest::create([
                'user_id' => $pref->user_id,
                'period_type' => $periodType,
                'period_start' => $start,
                'period_end' => $now,
                'payload' => [
                    'total' => count($items),
                    'items' => $items,
                ],
                'status' => 'pending',
                'scheduled_at' => $now,
            ]);

            SendNotificationDigest::dispatch($digest->id);
            $count++;
        }

        return $count;
    }
}

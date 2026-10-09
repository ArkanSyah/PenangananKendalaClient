<?php

namespace App\Console\Commands;

use App\Models\NotificationHold;
use App\Models\NotificationLog;
use App\Models\NotificationPreference;
use App\Services\Notification\NotificationRenderer;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ReleaseNotificationHolds extends Command
{
    protected $signature = 'notification:release-holds';

    protected $description = 'Release notification holds yang sudah jatuh tempo';

    public function handle(NotificationRenderer $renderer): int
    {
        $due = NotificationHold::where('status', 'pending')
            ->where('scheduled_release_at', '<=', Carbon::now())
            ->with(['recipient', 'batch.ticket'])
            ->get();

        if ($due->isEmpty()) {
            $this->info('Tidak ada hold yang jatuh tempo.');
            return self::SUCCESS;
        }

        $grouped = $due->groupBy('recipient_user_id');
        $released = 0;
        $failed = 0;

        foreach ($grouped as $userId => $holds) {
            $user = $holds->first()->recipient;
            if (! $user) {
                $holds->each(fn ($h) => $h->update(['status' => 'cancelled']));
                continue;
            }

            $pref = NotificationPreference::find($userId);
            if (! $pref || ! $pref->wa_enabled || ! $pref->phone) {
                $holds->each(fn ($h) => $h->update(['status' => 'cancelled']));
                continue;
            }

            $message = $this->buildMessage($holds, $renderer, $user);

            $wa = app(\App\Services\Notification\Channels\WhatsAppChannel::class);
            $result = $wa->send($pref->phone, $message);

            foreach ($holds as $hold) {
                $ticket = $hold->batch->ticket;

                NotificationLog::create([
                    'batch_id' => $hold->batch_id,
                    'ticket_id' => $ticket->id,
                    'recipient_user_id' => $userId,
                    'channel' => 'wa',
                    'message' => $message,
                    'status' => $result['success'] ? 'sent' : 'failed',
                    'reason' => $result['success'] ? null : ($result['reason'] ?? 'unknown'),
                    'sent_at' => $result['success'] ? now() : null,
                ]);

                $hold->update(['status' => $result['success'] ? 'released' : 'cancelled']);
            }

            if ($result['success']) {
                $released++;
            } else {
                $failed++;
            }
        }

        $this->info("Released: {$released} user, failed: {$failed} user.");

        return self::SUCCESS;
    }

    private function buildMessage($holds, NotificationRenderer $renderer, $user): string
    {
        if ($holds->count() === 1) {
            $hold = $holds->first();
            return $renderer->render($user, $hold->batch->ticket, $hold->batch, 'wa');
        }

        $lines = [];
        $lines[] = '*📊 Ringkasan Notifikasi (' . $holds->count() . ' update)*';
        $lines[] = '';

        foreach ($holds as $hold) {
            $ticket = $hold->batch->ticket;
            $statusLabel = config('notification.status_labels')[$hold->batch->status_to]
                ?? $hold->batch->status_to;

            $lines[] = '• ' . $ticket->ticket_id . ' — ' . $statusLabel;
        }

        $lines[] = '';
        $lines[] = 'Buka board: ' . rtrim(config('notification.frontend_url'), '/') . '/board';

        return implode("\n", $lines);
    }
}

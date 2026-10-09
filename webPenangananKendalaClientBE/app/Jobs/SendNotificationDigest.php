<?php

namespace App\Jobs;

use App\Models\NotificationDigest;
use App\Models\NotificationLog;
use App\Models\NotificationPreference;
use App\Services\Notification\Channels\EmailChannel;
use App\Services\Notification\Channels\WhatsAppChannel;
use App\Services\Notification\DigestRenderer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendNotificationDigest implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $digestId) {}

    public function handle(
        DigestRenderer $renderer,
        WhatsAppChannel $wa,
        EmailChannel $email
    ): void {
        $digest = NotificationDigest::find($this->digestId);
        if (! $digest || $digest->status !== 'pending') {
            return;
        }

        $pref = NotificationPreference::find($digest->user_id);
        if (! $pref) {
            $digest->update(['status' => 'skipped']);
            return;
        }

        $attempts = [];
        $sent = false;

        if ($pref->wa_enabled && $pref->phone) {
            $msg = $renderer->render($digest, 'wa');
            $res = $wa->send($pref->phone, $msg);
            $attempts[] = ['channel' => 'wa', 'result' => $res];
            if ($res['success']) {
                $sent = true;
                $this->logAttempt($digest, 'wa', $msg, 'sent', null, $attempts);
            }
        }

        if (! $sent && $pref->email_enabled && $pref->email_fallback) {
            $msg = $renderer->render($digest, 'email');
            $res = $email->send(
                $pref->email_fallback,
                'Ringkasan Notifikasi ' . $digest->period_type,
                $msg
            );
            $attempts[] = ['channel' => 'email', 'result' => $res];
            if ($res['success']) {
                $sent = true;
                $this->logAttempt($digest, 'email', $msg, 'sent', null, $attempts);
            }
        }

        if (! $sent) {
            $this->logAttempt(
                $digest,
                'log',
                $renderer->render($digest, 'email'),
                'failed',
                'no_channel',
                $attempts
            );
        }

        $digest->update([
            'status' => $sent ? 'sent' : 'skipped',
            'sent_at' => $sent ? now() : null,
        ]);
    }

    private function logAttempt($digest, string $channel, string $msg, string $status, ?string $reason, array $attempts): void
    {
        $firstTicketId = $digest->payload['items'][0]['ticket_id'] ?? null;
        $ticketId = null;

        if ($firstTicketId) {
            $ticket = \App\Models\Ticket::where('ticket_id', $firstTicketId)->first();
            $ticketId = $ticket?->id;
        }

        if (! $ticketId) {
            return;
        }

        NotificationLog::create([
            'batch_id' => null,
            'ticket_id' => $ticketId,
            'recipient_user_id' => $digest->user_id,
            'channel' => $channel,
            'message' => $msg,
            'status' => $status,
            'reason' => $reason,
            'channel_attempts' => $attempts,
            'sent_at' => $status === 'sent' ? now() : null,
        ]);
    }
}

<?php

namespace App\Services\Notification;

use App\Models\NotificationLog;
use App\Models\NotificationPreference;
use App\Models\User;
use App\Services\Notification\Channels\EmailChannel;
use App\Services\Notification\Channels\InAppChannel;
use App\Services\Notification\Channels\WhatsAppChannel;
use App\Models\NotificationHold;
use App\Services\Notification\QuietHoursChecker;
use Carbon\Carbon;

class NotificationDispatcher
{
    public function __construct(
        private WhatsAppChannel $wa,
        private EmailChannel $email,
        private InAppChannel $inApp,
    ) {}

    public function dispatch($recipients, $ticket, $batch, $renderer): void
    {
        foreach ($recipients as $user) {
            $pref = NotificationPreference::find($user->id);
            if (! $pref) {
                continue;
            }

            $attempts = [];
            $sent = false;

            $quietBypassStatuses = config('notification.quiet_hours.bypass_statuses', []);
            $isQuietBypass = in_array($batch->status_to, $quietBypassStatuses, true);
            $checker = app(QuietHoursChecker::class);

            if (! $isQuietBypass && $checker->isInQuietHours($user)) {
                $this->holdForQuietHours($user, $batch, $checker);

                if ($pref->in_app_enabled) {
                    $this->inApp->send(
                        $user->id,
                        $renderer->render($user, $ticket, $batch, 'in_app'),
                        $ticket->id,
                        $batch->id
                    );
                }

                continue;
            }

            $isCritical = in_array($batch->status_to, config('notification.frequency_cap.bypass_statuses', []), true);
            $waAllowed = $pref->wa_enabled
                && $pref->phone
                && ($isCritical || ! $this->hasReachedWaCap($user));

            if ($waAllowed) {
                $msg = $renderer->render($user, $ticket, $batch, 'wa');
                $res = $this->wa->send($pref->phone, $msg);
                $attempts[] = ['attempt' => 1, 'channel' => 'wa', 'result' => $res];
                if ($res['success']) {
                    $sent = true;
                    $this->log($batch, $ticket, $user, 'wa', $msg, 'sent', null, $attempts);
                } elseif ($this->wa->isTransientFailure($res)) {
                    $log = $this->log($batch, $ticket, $user, 'wa', $msg, 'failed', 'retry_scheduled', $attempts);
                    \App\Jobs\RetryWhatsAppNotification::dispatch(
                        $log->id,
                        $user->id,
                        $ticket->id,
                        $batch->id,
                        $msg,
                    )->delay(now()->addSeconds(30));
                    $sent = true;
                }
            }

            if (! $sent && $pref->email_enabled && $pref->email_fallback) {
                $msg = $renderer->render($user, $ticket, $batch, 'email');
                $res = $this->email->send(
                    $pref->email_fallback,
                    'Update Tiket ' . $ticket->ticket_id,
                    $msg
                );
                $attempts[] = ['channel' => 'email', 'result' => $res];
                if ($res['success']) {
                    $sent = true;
                    $this->log($batch, $ticket, $user, 'email', $msg, 'sent', null, $attempts);
                }
            }

            if (! $sent) {
                $this->log(
                    $batch,
                    $ticket,
                    $user,
                    'log',
                    $renderer->render($user, $ticket, $batch, 'email'),
                    'failed',
                    'no_channel',
                    $attempts
                );
            }

            if ($pref->in_app_enabled) {
                $this->inApp->send(
                    $user->id,
                    $renderer->render($user, $ticket, $batch, 'in_app'),
                    $ticket->id,
                    $batch->id
                );
            }
        }
    }

    private function log($batch, $ticket, $user, $channel, $msg, $status, $reason, $attempts): NotificationLog
    {
        return NotificationLog::create([
            'batch_id' => $batch->id,
            'ticket_id' => $ticket->id,
            'recipient_user_id' => $user->id,
            'channel' => $channel,
            'message' => $msg,
            'status' => $status,
            'reason' => $reason,
            'channel_attempts' => $attempts,
            'sent_at' => $status === 'sent' ? now() : null,
        ]);
    }

    private function hasReachedWaCap(User $user): bool
    {
        if (! config('notification.frequency_cap.enabled', true)) {
            return false;
        }

        $cap = config('notification.frequency_cap.by_role.' . $user->role)
            ?? config('notification.frequency_cap.default', 10);

        if ($cap <= 0) {
            return false;
        }

        $window = (int) config('notification.frequency_cap.window_hours', 24);
        $bypassStatuses = config('notification.frequency_cap.bypass_statuses', []);

        $count = NotificationLog::where('recipient_user_id', $user->id)
            ->where('channel', 'wa')
            ->where('status', 'sent')
            ->where('created_at', '>=', now()->subHours($window))
            ->whereHas('batch', function ($q) use ($bypassStatuses) {
                $q->whereNotIn('status_to', $bypassStatuses);
            })
            ->count();

        return $count >= $cap;
    }

    private function holdForQuietHours(User $user, $batch, QuietHoursChecker $checker): void
    {
        $releaseAt = $checker->nextReleaseTime($user);

        NotificationHold::firstOrCreate(
            [
                'recipient_user_id' => $user->id,
                'batch_id' => $batch->id,
            ],
            [
                'scheduled_release_at' => $releaseAt,
                'status' => 'pending',
            ]
        );
    }
}

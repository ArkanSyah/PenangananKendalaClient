<?php

namespace App\Services\Notification\Channels;

use Illuminate\Support\Facades\Mail;

class EmailChannel
{
    public function send(string $email, string $subject, string $message): array
    {
        if (! config('notification.channels.email.enabled')) {
            return ['success' => false, 'reason' => 'email_disabled'];
        }

        try {
            Mail::raw($message, function ($m) use ($email, $subject) {
                $m->to($email)->subject($subject);
            });
            return ['success' => true];
        } catch (\Throwable $e) {
            return ['success' => false, 'reason' => 'exception'];
        }
    }
}

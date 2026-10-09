<?php

namespace App\Services\Notification\Channels;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppChannel
{
    public function send(string $phone, string $message): array
    {
        if (! config('notification.channels.wa.enabled')) {
            return ['success' => false, 'reason' => 'wa_disabled'];
        }

        $token = config('notification.channels.wa.token');
        if (! $token) {
            return ['success' => false, 'reason' => 'no_token'];
        }

        try {
            $response = Http::withHeaders(['Authorization' => $token])
                ->timeout(10)
                ->post(config('notification.channels.wa.endpoint'), [
                    'target' => $phone,
                    'message' => $message,
                ]);

            return $response->successful()
                ? ['success' => true]
                : ['success' => false, 'reason' => 'http_' . $response->status()];
        } catch (\Throwable $e) {
            Log::error('WA send failed: ' . $e->getMessage());
            return ['success' => false, 'reason' => 'exception'];
        }
    }

    public function isTransientFailure(array $result): bool
    {
        if ($result['success'] ?? false) {
            return false;
        }

        $reason = $result['reason'] ?? '';

        if (in_array($reason, ['exception', 'timeout'], true)) {
            return true;
        }

        if (str_starts_with($reason, 'http_5')) {
            return true;
        }

        return false;
    }
}

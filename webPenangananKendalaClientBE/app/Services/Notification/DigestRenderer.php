<?php

namespace App\Services\Notification;

use App\Models\NotificationDigest;

class DigestRenderer
{
    public function render(NotificationDigest $digest, string $channel = 'wa'): string
    {
        $payload = $digest->payload ?? [];
        $items = $payload['items'] ?? [];
        $total = $payload['total'] ?? 0;
        $periodType = $digest->period_type;

        if ($channel !== 'wa') {
            return $this->renderPlain($periodType, $total);
        }

        return $this->renderWa($digest, $items, $total, $periodType);
    }

    private function renderWa(NotificationDigest $digest, array $items, int $total, string $periodType): string
    {
        $periodLabel = $periodType === 'daily'
            ? 'Harian — ' . $digest->period_end->translatedFormat('j M Y')
            : 'Jam ' . $digest->period_end->format('H:i');

        $lines = [];
        $lines[] = '*📊 Ringkasan ' . $periodLabel . '*';
        $lines[] = '';
        $lines[] = 'Total update: ' . $total . ' tiket';
        $lines[] = '';

        $maxItems = 10;
        $shown = 0;

        foreach ($items as $item) {
            if ($shown >= $maxItems) {
                break;
            }

            $ticketId = $item['ticket_id'] ?? '-';
            $statusLabel = $item['status_label'] ?? '-';

            $lines[] = '• ' . $ticketId . ' — ' . $statusLabel;
            $shown++;
        }

        if (count($items) > $maxItems) {
            $lines[] = '(dan ' . (count($items) - $maxItems) . ' lainnya)';
        }

        $lines[] = '';
        $lines[] = 'Buka board: ' . rtrim(config('notification.frontend_url'), '/') . '/board';

        return implode("\n", $lines);
    }

    private function renderPlain(string $periodType, int $total): string
    {
        return "Ringkasan {$periodType}: {$total} update tiket.";
    }
}

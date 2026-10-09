<?php

namespace App\Services\Notification;

use App\Models\NotificationLog;
use Carbon\Carbon;

class QuotaMonitor
{
    public function usage(): array
    {
        $limit = (int) config('notification.channels.wa.quota_per_month', 1000);
        $warningAt = (float) config('notification.channels.wa.quota_warning_at', 0.8);
        $criticalAt = (float) config('notification.channels.wa.quota_critical_at', 0.95);

        $startOfMonth = Carbon::now()->startOfMonth();

        $used = NotificationLog::where('channel', 'wa')
            ->where('status', 'sent')
            ->where('created_at', '>=', $startOfMonth)
            ->count();

        $percentage = $limit > 0 ? round(($used / $limit) * 100, 2) : 0.0;

        $status = 'normal';
        if ($limit > 0 && $used >= (int) ceil($limit * $criticalAt)) {
            $status = 'critical';
        } elseif ($limit > 0 && $used >= (int) ceil($limit * $warningAt)) {
            $status = 'warning';
        }

        return [
            'limit' => $limit,
            'used' => $used,
            'remaining' => max(0, $limit - $used),
            'percentage' => $percentage,
            'status' => $status,
            'period_start' => $startOfMonth->toIso8601String(),
            'period_end' => Carbon::now()->endOfMonth()->toIso8601String(),
            'warning_threshold' => (int) round($warningAt * 100),
            'critical_threshold' => (int) round($criticalAt * 100),
        ];
    }
}

<?php

namespace App\Console\Commands;

use App\Models\NotificationLog;
use App\Models\User;
use App\Services\Notification\Channels\EmailChannel;
use App\Services\Notification\Channels\InAppChannel;
use App\Services\Notification\QuotaMonitor;
use Carbon\Carbon;
use Illuminate\Console\Command;

class QuotaWarningCheck extends Command
{
    protected $signature = 'notification:quota-check';

    protected $description = 'Cek kuota WA, kirim warning ke admin kalau lewat threshold';

    public function handle(
        QuotaMonitor $monitor,
        InAppChannel $inApp,
        EmailChannel $email
    ): int {
        $usage = $monitor->usage();

        if ($usage['status'] === 'normal') {
            $this->info('Kuota normal: ' . $usage['percentage'] . '%');
            return self::SUCCESS;
        }

        $threshold = $usage['status'] === 'critical'
            ? $usage['critical_threshold']
            : $usage['warning_threshold'];

        $marker = "[QUOTA_WARNING_{$threshold}]";
        $startOfMonth = Carbon::now()->startOfMonth();

        $alreadySent = NotificationLog::where('channel', 'in_app')
            ->where('created_at', '>=', $startOfMonth)
            ->where('message', 'like', $marker . '%')
            ->exists();

        if ($alreadySent) {
            $this->info("Warning {$threshold}% sudah dikirim bulan ini.");
            return self::SUCCESS;
        }

        $admins = User::where('role', 'admin')->get();

        if ($admins->isEmpty()) {
            $this->warn('Tidak ada admin user.');
            return self::SUCCESS;
        }

        $message = $marker . ' Kuota WhatsApp ' . $usage['percentage'] . '% '
            . '(' . $usage['used'] . '/' . $usage['limit'] . '). '
            . 'Sisa ' . $usage['remaining'] . ' pesan bulan ini.';

        foreach ($admins as $admin) {
            $inApp->send($admin->id, $message, null, null);

            if ($usage['status'] === 'critical') {
                $pref = \App\Models\NotificationPreference::find($admin->id);
                if ($pref && $pref->email_enabled && $pref->email_fallback) {
                    $email->send(
                        $pref->email_fallback,
                        'Peringatan Kuota WhatsApp',
                        $message
                    );
                }
            }
        }

        $this->info("Warning {$threshold}% dikirim ke " . $admins->count() . ' admin.');

        return self::SUCCESS;
    }
}

<?php

namespace App\Console\Commands;

use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Console\Command;

class ActivateAllWaPreferences extends Command
{
    protected $signature = 'notification:activate-wa
                            {--role=* : Role spesifik (bisa multiple). Kosong = semua role}
                            {--phone= : Nomor WA untuk semua user (opsional)}
                            {--dry-run : Tampilkan yang akan diubah, tanpa eksekusi}';

    protected $description = 'Aktifkan WA untuk semua atau sebagian user';

    public function handle(): int
    {
        $roles = $this->option('role');
        $phone = $this->option('phone');
        $dryRun = (bool) $this->option('dry-run');

        $query = User::query();

        if (! empty($roles)) {
            $query->whereIn('role', $roles);
        }

        $users = $query->get();

        if ($users->isEmpty()) {
            $this->error('Tidak ada user yang match.');
            return self::FAILURE;
        }

        $count = 0;

        foreach ($users as $user) {
            $pref = NotificationPreference::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'email_fallback' => $user->email,
                    'in_app_enabled' => true,
                ]
            );

            $changes = ['wa_enabled' => true];

            if ($phone) {
                $changes['phone'] = $phone;
            }

            if ($dryRun) {
                $this->line("[DRY] {$user->email} ({$user->role}) -> " . json_encode($changes));
                continue;
            }

            $pref->update($changes);
            $count++;
        }

        if ($dryRun) {
            $this->info('Dry run selesai. Tidak ada perubahan disimpan.');
        } else {
            $this->info("Diaktifkan WA untuk {$count} user.");
        }

        return self::SUCCESS;
    }
}

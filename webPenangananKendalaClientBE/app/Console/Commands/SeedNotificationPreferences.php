<?php

namespace App\Console\Commands;

use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Console\Command;

class SeedNotificationPreferences extends Command
{
    protected $signature = 'notification:seed-preferences';

    protected $description = 'Buat default notification preference untuk semua user yang belum punya';

    public function handle(): int
    {
        $existing = NotificationPreference::pluck('user_id')->all();
        $users = User::whereNotIn('id', $existing)->get();

        if ($users->isEmpty()) {
            $this->info('Semua user sudah punya preference.');
            return self::SUCCESS;
        }

        foreach ($users as $user) {
            NotificationPreference::create([
                'user_id' => $user->id,
                'email_fallback' => $user->email,
                'wa_enabled' => false,
                'email_enabled' => false,
                'in_app_enabled' => true,
            ]);
        }

        $this->info("Dibuat {$users->count()} preference baru.");

        return self::SUCCESS;
    }
}

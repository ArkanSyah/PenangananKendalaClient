<?php

namespace App\Console\Commands;

use App\Services\Notification\DigestScheduler;
use Illuminate\Console\Command;

class SendNotificationDigests extends Command
{
    protected $signature = 'notification:send-digests
                            {--period=hourly : Period type (hourly atau daily)}';

    protected $description = 'Kirim digest notifikasi untuk user dengan digest_mode aktif';

    public function handle(DigestScheduler $scheduler): int
    {
        $period = $this->option('period');

        if (! in_array($period, ['hourly', 'daily'], true)) {
            $this->error('Period harus hourly atau daily.');
            return self::FAILURE;
        }

        $count = $scheduler->run($period);

        $this->info("Digest {$period}: {$count} dikirim.");

        return self::SUCCESS;
    }
}

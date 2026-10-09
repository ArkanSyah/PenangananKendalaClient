<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    app(\App\Services\Notification\DigestScheduler::class)->run('hourly');
})->hourly();

Schedule::call(function () {
    app(\App\Services\Notification\DigestScheduler::class)->run('daily');
})->dailyAt('08:00');

Schedule::command('notification:release-holds')->everyMinute();

Schedule::command('notification:send-digests', ['--period' => 'hourly'])
    ->hourly()
    ->between('08:00', '20:00');

Schedule::command('notification:send-digests', ['--period' => 'daily'])
    ->dailyAt('08:00');

Schedule::command('notification:quota-check')->dailyAt('08:00');



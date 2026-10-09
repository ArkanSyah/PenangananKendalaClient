<?php

namespace App\Services\Notification;

use App\Models\NotificationPreference;
use App\Models\User;
use Carbon\Carbon;

class QuietHoursChecker
{
    public function isInQuietHours(User $user): bool
    {
        if (! config('notification.quiet_hours.enabled', true)) {
            return false;
        }

        $pref = NotificationPreference::find($user->id);
        if (! $pref || ! $pref->quiet_hours_enabled) {
            return false;
        }

        $start = $pref->quiet_hours_start;
        $end = $pref->quiet_hours_end;

        if (! $start || ! $end) {
            return false;
        }

        $tz = $pref->timezone ?: 'Asia/Jakarta';
        $now = Carbon::now($tz);
        $nowMinutes = $now->hour * 60 + $now->minute;

        $startMinutes = $this->toMinutes($start);
        $endMinutes = $this->toMinutes($end);

        if ($startMinutes === $endMinutes) {
            return false;
        }

        if ($startMinutes < $endMinutes) {
            return $nowMinutes >= $startMinutes && $nowMinutes < $endMinutes;
        }

        return $nowMinutes >= $startMinutes || $nowMinutes < $endMinutes;
    }

    public function nextReleaseTime(User $user): Carbon
    {
        $pref = NotificationPreference::find($user->id);
        $tz = $pref->timezone ?? 'Asia/Jakarta';

        $hour = (int) config('notification.quiet_hours.release_hour', 8);
        $minute = (int) config('notification.quiet_hours.release_minute', 0);

        $release = Carbon::now($tz)->startOfDay()->addHours($hour)->addMinutes($minute);

        if ($release->lessThanOrEqualTo(Carbon::now($tz))) {
            $release->addDay();
        }

        return $release->setTimezone(config('app.timezone', 'UTC'));
    }

    private function toMinutes(string $time): int
    {
        $parts = explode(':', $time);
        return ((int) $parts[0]) * 60 + ((int) ($parts[1] ?? 0));
    }
}

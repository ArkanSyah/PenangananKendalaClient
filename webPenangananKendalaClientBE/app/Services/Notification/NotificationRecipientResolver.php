<?php

namespace App\Services\Notification;

use App\Models\NotificationPreference;
use App\Models\Ticket;
use App\Models\User;

class NotificationRecipientResolver
{
    private const STATUS_TO_FLAG = [
        'assigned' => 'notify_assigned',
        'resolved' => 'notify_resolved',
        'rejected' => 'notify_rejected',
        'escalated_to_owner' => 'notify_escalated',
    ];

    public function resolve(Ticket $ticket, string $status, int $senderId): array
    {
        $matrix = config('notification.recipients', []);
        $roleKeys = $matrix[$status] ?? [];

        if (empty($roleKeys)) {
            return [];
        }

        $recipients = collect();

        foreach ($roleKeys as $roleKey) {
            $users = $this->usersForRole($ticket, $roleKey);
            $recipients = $recipients->merge($users);
        }

        $recipients = $recipients->unique('id')->values();

        if (config('notification.excluded_sender', true)) {
            $recipients = $recipients->reject(fn ($u) => $u->id === $senderId)->values();
        }

        if ($recipients->isEmpty()) {
            $fallback = config('notification.fallback_roles')[$roleKeys[0]] ?? [];
            foreach ($fallback as $fbRole) {
                $recipients = $recipients->merge(User::where('role', $fbRole)->get());
            }
            $recipients = $recipients->unique('id')
                ->reject(fn ($u) => $u->id === $senderId)
                ->values();
        }

        return $recipients->filter(function ($user) use ($status) {
            $pref = NotificationPreference::find($user->id);
            if (! $pref) {
                return false;
            }

            if (isset(self::STATUS_TO_FLAG[$status])) {
                $flag = self::STATUS_TO_FLAG[$status];
                if (! $pref->{$flag}) {
                    return false;
                }
            }

            if (! $pref->wa_enabled && ! $pref->email_enabled && ! $pref->in_app_enabled) {
                return false;
            }

            return true;
        })->values()->all();
    }

    private function usersForRole(Ticket $ticket, string $roleKey)
    {
        return match ($roleKey) {
            'client' => User::where('id', $ticket->user_id)->get(),
            'programmer_assigned' => $ticket->claimed_programmer_id
                ? User::where('id', $ticket->claimed_programmer_id)->get()
                : collect(),
            'service_desk' => User::where('role', 'service_desk')->get(),
            'project_manager' => User::where('role', 'project_manager')->get(),
            'owner' => User::where('role', 'owner')->get(),
            default => collect(),
        };
    }
}

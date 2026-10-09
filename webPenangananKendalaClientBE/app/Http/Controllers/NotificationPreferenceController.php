<?php

namespace App\Http\Controllers;

use App\Models\NotificationLog;
use App\Models\NotificationPreference;
use Illuminate\Http\Request;

class NotificationPreferenceController extends Controller
{
    public function show(Request $request)
    {
        $pref = NotificationPreference::firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'email_fallback' => $request->user()->email,
                'wa_enabled' => false,
                'email_enabled' => false,
                'in_app_enabled' => true,
            ]
        );

        return response()->json(['data' => $pref]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'phone' => ['nullable', 'string', 'max:20'],
            'email_fallback' => ['nullable', 'email', 'max:100'],
            'wa_enabled' => ['boolean'],
            'email_enabled' => ['boolean'],
            'in_app_enabled' => ['boolean'],
            'notify_assigned' => ['boolean'],
            'notify_resolved' => ['boolean'],
            'notify_rejected' => ['boolean'],
            'notify_escalated' => ['boolean'],
            'notify_minor' => ['boolean'],
            'digest_mode' => ['in:realtime,hourly,daily'],
            'quiet_hours_enabled' => ['boolean'],
            'quiet_hours_start' => ['nullable', 'date_format:H:i,H:i:s'],
            'quiet_hours_end' => ['nullable', 'date_format:H:i,H:i:s'],
            'timezone' => ['nullable', 'string', 'max:50'],
        ]);

        $pref = NotificationPreference::firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'email_fallback' => $request->user()->email,
                'wa_enabled' => false,
                'email_enabled' => false,
                'in_app_enabled' => true,
            ]
        );

        $pref->update($validated);

        return response()->json(['data' => $pref->fresh()]);
    }

    public function logs(Request $request)
    {
        $logs = NotificationLog::where('recipient_user_id', $request->user()->id)
            ->orderBy('id', 'desc')
            ->paginate(20);

        return response()->json($logs);
    }

    public function previewDigest(Request $request)
    {
        $period = $request->query('period', 'daily');

        if (! in_array($period, ['hourly', 'daily'], true)) {
            return response()->json(['message' => 'Period harus hourly atau daily.'], 422);
        }

        $userId = $request->user()->id;
        $now = \Carbon\Carbon::now();
        $start = $period === 'daily'
            ? $now->copy()->subDay()
            : $now->copy()->subHour();

        $logs = \App\Models\NotificationLog::where('recipient_user_id', $userId)
            ->where('created_at', '>=', $start)
            ->where('created_at', '<=', $now)
            ->with('batch.ticket')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $isSample = $logs->isEmpty();

        $items = [];

        if ($isSample) {
            $items = [
                [
                    'ticket_id' => 'TCK-202610-0001',
                    'status_label' => 'Resolved',
                ],
                [
                    'ticket_id' => 'TCK-202610-0002',
                    'status_label' => 'In Progress',
                ],
            ];
        } else {
            foreach ($logs as $log) {
                $ticket = $log->batch?->ticket;
                if (! $ticket) {
                    continue;
                }
                $status = $log->batch->status_to ?? '-';
                $items[] = [
                    'ticket_id' => $ticket->ticket_id,
                    'status_label' => config('notification.status_labels')[$status] ?? $status,
                ];
            }
        }

        $digest = new \App\Models\NotificationDigest([
            'user_id' => $userId,
            'period_type' => $period,
            'period_start' => $start,
            'period_end' => $now,
            'payload' => [
                'total' => $isSample ? 2 : count($items),
                'items' => $items,
            ],
        ]);

        $renderer = app(\App\Services\Notification\DigestRenderer::class);
        $preview = $renderer->render($digest, 'wa');

        return response()->json([
            'preview' => $preview,
            'item_count' => count($items),
            'period' => $period,
            'is_sample' => $isSample,
        ]);
    }
}

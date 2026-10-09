<?php

namespace App\Http\Controllers;

use App\Models\NotificationLog;
use Illuminate\Http\Request;

class InAppNotificationController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $baseQuery = NotificationLog::where('recipient_user_id', $userId)
            ->where('channel', 'in_app')
            ->where('status', 'sent');

        $unreadCount = (clone $baseQuery)->whereNull('read_at')->count();

        $filter = $request->query('filter', 'all');
        $query = clone $baseQuery;

        if ($filter === 'unread') {
            $query->whereNull('read_at');
        } elseif ($filter === 'read') {
            $query->whereNotNull('read_at');
        }

        $query->with('ticket')->orderBy('created_at', 'desc');

        $perPageParam = $request->query('per_page');
        $isPaginated = $request->has('page') || $perPageParam !== null;

        if ($isPaginated) {
            $perPage = min(100, max(1, (int) ($perPageParam ?? 20)));
            $paginated = $query->paginate($perPage);

            $items = collect($paginated->items())->map(fn ($log) => $this->mapLog($log));

            return response()->json([
                'unread_count' => $unreadCount,
                'items' => $items,
                'pagination' => [
                    'current_page' => $paginated->currentPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                    'last_page' => $paginated->lastPage(),
                ],
            ]);
        }

        $items = $query->limit(50)->get()->map(fn ($log) => $this->mapLog($log));

        return response()->json([
            'unread_count' => $unreadCount,
            'items' => $items,
        ]);
    }

    public function markRead(Request $request, int $id)
    {
        $log = NotificationLog::where('id', $id)
            ->where('recipient_user_id', $request->user()->id)
            ->where('channel', 'in_app')
            ->firstOrFail();

        if ($log->read_at === null) {
            $log->update(['read_at' => now()]);
        }

        return response()->json(['data' => ['id' => $log->id, 'read_at' => $log->read_at?->toIso8601String()]]);
    }

    private function mapLog(NotificationLog $log): array
    {
        return [
            'id' => $log->id,
            'ticket_id' => $log->ticket?->ticket_id,
            'title' => $log->ticket?->title,
            'message' => $log->message,
            'read' => $log->read_at !== null,
            'created_at' => $log->created_at->toIso8601String(),
        ];
    }
}

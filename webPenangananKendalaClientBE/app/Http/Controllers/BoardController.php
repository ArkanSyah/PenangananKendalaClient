<?php

namespace App\Http\Controllers;

use App\Events\TicketStatusChanged;
use App\Models\ProgressLog;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BoardController extends Controller
{
    public function move(Request $request)
    {
        $validated = $request->validate([
            'ticket_id' => ['required', 'string', 'exists:tickets,ticket_id'],
            'new_status' => ['required', Rule::in([
                'pending_confirmation',
                'open',
                'escalated_to_pm',
                'waiting_programmer',
                'waiting_pm_approval',
                'assigned',
                'in_progress',
                'pending_review',
                'escalated_to_owner',
                'resolved',
                'closed',
                'rejected',
            ])],
        ]);

        $ticket = Ticket::where('ticket_id', $validated['ticket_id'])->firstOrFail();

        if ($ticket->status === $validated['new_status']) {
            return response()->json([
                'message' => 'Status tidak berubah',
                'data' => $ticket,
            ]);
        }

        $oldStatus = $ticket->status;
        $ticket->status = $validated['new_status'];
        $ticket->save();

        ProgressLog::create([
            'ticket_id'       => $ticket->id,
            'user_id'         => $request->user()->id,
            'previous_status' => $oldStatus,
            'new_status'      => $validated['new_status'],
            'notes'           => sprintf(
                'Status dipindahkan dari %s ke %s oleh %s melalui Board Monitoring.',
                $oldStatus,
                $validated['new_status'],
                $request->user()->name
            ),
            'is_internal'     => true,
        ]);

        if (config('notification.enabled')) {
            event(new TicketStatusChanged(
                $ticket,
                $oldStatus,
                $validated['new_status'],
                $request->user()->id
            ));
        }

        return response()->json([
            'message' => 'Status tiket berhasil diubah',
            'data' => $ticket->fresh(['creator', 'claimedProgrammer']),
        ]);
    }
}

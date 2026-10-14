<?php

namespace App\Http\Controllers;

use App\Models\ArchivedTicket;
use Illuminate\Http\Request;

class ArchivedTicketController extends Controller
{
    public function index(Request $request)
    {
        $query = ArchivedTicket::with(['archivedBy', 'creator']);

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('ticket_id', 'like', "%{$q}%")
                    ->orWhere('title', 'like', "%{$q}%");
            });
        }

        $archived = $query->orderByDesc('archived_at')->paginate(20);

        return response()->json($archived);
    }
}

<?php

namespace App\Http\Controllers;

use App\Services\Notification\QuotaMonitor;
use Illuminate\Http\Request;

class AdminQuotaController extends Controller
{
    public function show(Request $request, QuotaMonitor $monitor)
    {
        return response()->json([
            'data' => $monitor->usage(),
        ]);
    }
}

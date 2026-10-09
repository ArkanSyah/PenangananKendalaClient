<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notification_logs', function (Blueprint $table) {
            $table->timestamp('read_at')->nullable()->after('sent_at');
            $table->index(['recipient_user_id', 'channel', 'read_at'], 'notif_logs_recipient_channel_read_idx');
        });
    }

    public function down(): void
    {
        Schema::table('notification_logs', function (Blueprint $table) {
            $table->dropIndex('notif_logs_recipient_channel_read_idx');
            $table->dropColumn('read_at');
        });
    }
};

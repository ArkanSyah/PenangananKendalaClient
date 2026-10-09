<?php

namespace Database\Seeders;

use App\Models\NotificationLog;
use App\Models\ProgressLog;
use App\Models\Ticket;
use App\Models\TicketAssignment;
use App\Models\User;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        $client = User::where('role', 'client')->first();
        $sd = User::where('role', 'service_desk')->first();
        $pm = User::where('role', 'project_manager')->first();
        $prog1 = User::where('email', 'programmer@example.com')->first();
        $prog2 = User::where('email', 'programmer2@gmail.com')->first();
        $owner = User::where('role', 'owner')->first();

        if (!$client || !$sd || !$pm || !$prog1) {
            return;
        }

        // 1. Tiket Baru dari Klien (pending_confirmation)
        $t1 = Ticket::firstOrCreate(
            ['ticket_id' => 'TCK-202610-0001'],
            [
                'title' => 'Kendala Login Portal: Muncul Error 500 Internal Server Error',
                'description' => 'Saat mencoba masuk ke akun portal klien menggunakan browser Chrome, muncul layar putih dengan pesan Error 500 setelah memasukkan kredensial.',
                'category' => 'Software',
                'priority' => 'high',
                'status' => 'pending_confirmation',
                'user_id' => $client->id,
                'reporter_name' => $client->name,
                'reporter_contact' => '081234567890',
                'contact_method' => 'email',
            ]
        );
        ProgressLog::firstOrCreate(
            ['ticket_id' => $t1->id, 'new_status' => 'pending_confirmation'],
            [
                'user_id' => $client->id,
                'previous_status' => null,
                'notes' => 'Tiket kendala berhasil dibuat oleh klien melalui portal web.',
                'is_internal' => false,
            ]
        );

        // 2. Tiket Terkonfirmasi (open)
        $t2 = Ticket::firstOrCreate(
            ['ticket_id' => 'TCK-202610-0002'],
            [
                'title' => 'Permintaan Reset Password Email Operasional Cabang',
                'description' => 'Akun email operasional cabang Surabaya terkunci karena salah memasukkan password sebanyak 5 kali berturut-turut.',
                'category' => 'Akun',
                'priority' => 'medium',
                'status' => 'open',
                'user_id' => $client->id,
                'reporter_name' => 'Budi Santoso (Cabang Surabaya)',
                'reporter_contact' => '081987654321',
                'contact_method' => 'telepon',
            ]
        );
        ProgressLog::firstOrCreate(
            ['ticket_id' => $t2->id, 'new_status' => 'open'],
            [
                'user_id' => $sd->id,
                'previous_status' => 'pending_confirmation',
                'notes' => 'Tiket dikonfirmasi oleh Service Desk dan masuk ke antrean investigasi tingkat 1.',
                'is_internal' => false,
            ]
        );

        // 3. Tiket Eskalasi ke Project Manager (escalated_to_pm)
        $t3 = Ticket::firstOrCreate(
            ['ticket_id' => 'TCK-202610-0003'],
            [
                'title' => 'Koneksi API Payment Gateway Sering Mengalami Timeout',
                'description' => 'Transaksi pembayaran pelanggan gagal di atas jam 12:00 siang dengan response timeout dari gateway pembayaran.',
                'category' => 'Jaringan',
                'priority' => 'high',
                'status' => 'escalated_to_pm',
                'user_id' => $client->id,
                'internal_notes' => 'Memerlukan koordinasi tim programmer backend dan penyedia payment gateway pihak ketiga.',
                'assigned_to_role' => 'project_manager',
            ]
        );
        ProgressLog::firstOrCreate(
            ['ticket_id' => $t3->id, 'new_status' => 'escalated_to_pm'],
            [
                'user_id' => $sd->id,
                'previous_status' => 'open',
                'notes' => 'Kendala kompleks memerlukan analisis arsitektur, dieskalasi ke Project Manager.',
                'is_internal' => true,
            ]
        );

        // 4. Tiket Rilis untuk Claim Programmer (waiting_programmer)
        $t4 = Ticket::firstOrCreate(
            ['ticket_id' => 'TCK-202610-0004'],
            [
                'title' => 'Bug Formatting Laporan PDF Transaksi Bulanan',
                'description' => 'Tabel transaksi terpotong di halaman kedua pada saat cetak laporan PDF periode September 2026.',
                'category' => 'Software',
                'priority' => 'medium',
                'status' => 'waiting_programmer',
                'user_id' => $client->id,
                'internal_notes' => 'Tersedia di pool claim tiket programmer. Estimasi 4 jam pengerjaan.',
            ]
        );
        ProgressLog::firstOrCreate(
            ['ticket_id' => $t4->id, 'new_status' => 'waiting_programmer'],
            [
                'user_id' => $pm->id,
                'previous_status' => 'escalated_to_pm',
                'notes' => 'PM merilis tiket ke daftar Available Tickets agar dapat di-claim oleh programmer yang memiliki waktu luang.',
                'is_internal' => true,
            ]
        );

        // 5. Tiket Sedang Dikerjakan (in_progress)
        $t5 = Ticket::firstOrCreate(
            ['ticket_id' => 'TCK-202610-0005'],
            [
                'title' => 'Optimalisasi Query Dashboard Admin yang Lambat',
                'description' => 'Halaman rekapitulasi data tahunan membutuhkan waktu loading lebih dari 8 detik.',
                'category' => 'Software',
                'priority' => 'high',
                'status' => 'in_progress',
                'user_id' => $client->id,
                'claimed_programmer_id' => $prog1->id,
            ]
        );
        TicketAssignment::firstOrCreate(
            ['ticket_id' => $t5->id, 'programmer_id' => $prog1->id],
            [
                'pm_id' => $pm->id,
                'estimated_hours' => 6.00,
                'estimated_unit' => 'hours',
            ]
        );
        ProgressLog::firstOrCreate(
            ['ticket_id' => $t5->id, 'new_status' => 'in_progress'],
            [
                'user_id' => $prog1->id,
                'previous_status' => 'assigned',
                'notes' => 'Sedang melakukan profiling query SQL dan menambahkan indeks pada kolom created_at serta status.',
                'is_internal' => true,
            ]
        );

        // 6. Tiket Menunggu Review PM (pending_review)
        $t6 = Ticket::firstOrCreate(
            ['ticket_id' => 'TCK-202610-0006'],
            [
                'title' => 'Pembaruan Tampilan Notifikasi Badge di Mobile Browser',
                'description' => 'Badge notifikasi warna merah tidak muncul di browser Firefox mobile.',
                'category' => 'Software',
                'priority' => 'low',
                'status' => 'pending_review',
                'user_id' => $client->id,
                'claimed_programmer_id' => $prog2 ? $prog2->id : $prog1->id,
            ]
        );
        TicketAssignment::firstOrCreate(
            ['ticket_id' => $t6->id, 'programmer_id' => $prog2 ? $prog2->id : $prog1->id],
            [
                'pm_id' => $pm->id,
                'estimated_hours' => 3.00,
                'estimated_unit' => 'hours',
            ]
        );
        ProgressLog::firstOrCreate(
            ['ticket_id' => $t6->id, 'new_status' => 'pending_review'],
            [
                'user_id' => $prog2 ? $prog2->id : $prog1->id,
                'previous_status' => 'in_progress',
                'notes' => 'Solusi Canvas Dynamic Favicon fallback telah diimplementasikan dan diuji di Firefox mobile. Menunggu review PM.',
                'is_internal' => true,
            ]
        );

        // 7. Tiket Eskalasi ke Owner (escalated_to_owner)
        $t7 = Ticket::firstOrCreate(
            ['ticket_id' => 'TCK-202610-0007'],
            [
                'title' => 'Penggantian Switch Hub Utama Server Rack Gedung B',
                'description' => 'Port 1-8 pada core switch rack gedung B rusak fisik dan sering down, memerlukan pengadaan perangkat baru senilai Rp 15.000.000.',
                'category' => 'Hardware',
                'priority' => 'high',
                'status' => 'escalated_to_owner',
                'user_id' => $client->id,
                'internal_notes' => 'Memerlukan approval anggaran pengadaan hardware baru dari Company Owner.',
                'assigned_to_role' => 'owner',
            ]
        );
        ProgressLog::firstOrCreate(
            ['ticket_id' => $t7->id, 'new_status' => 'escalated_to_owner'],
            [
                'user_id' => $pm->id,
                'previous_status' => 'escalated_to_pm',
                'notes' => 'Eskalasi pengajuan anggaran perangkat keras pengganti ke Company Owner.',
                'is_internal' => true,
            ]
        );

        // 8. Tiket Selesai / Resolved (resolved)
        $t8 = Ticket::firstOrCreate(
            ['ticket_id' => 'TCK-202610-0008'],
            [
                'title' => 'Sinkronisasi Jam Server NTP dengan Database',
                'description' => 'Selisih waktu 2 menit antara server aplikasi dan database master.',
                'category' => 'Software',
                'priority' => 'low',
                'status' => 'resolved',
                'user_id' => $client->id,
                'claimed_programmer_id' => $prog1->id,
            ]
        );
        ProgressLog::firstOrCreate(
            ['ticket_id' => $t8->id, 'new_status' => 'resolved'],
            [
                'user_id' => $pm->id,
                'previous_status' => 'pending_review',
                'notes' => 'Konfigurasi chrony daemon selesai disinkronkan ke id.pool.ntp.org. Solusi disetujui (OK).',
                'is_internal' => false,
            ]
        );

        // 9. Tiket Ditutup (closed)
        $t9 = Ticket::firstOrCreate(
            ['ticket_id' => 'TCK-202610-0009'],
            [
                'title' => 'Penambahan Akses User Baru Divisi Keuangan',
                'description' => 'Akun baru untuk staf akuntansi atas nama Rina Wulandari.',
                'category' => 'Akun',
                'priority' => 'low',
                'status' => 'closed',
                'user_id' => $client->id,
            ]
        );
        ProgressLog::firstOrCreate(
            ['ticket_id' => $t9->id, 'new_status' => 'closed'],
            [
                'user_id' => $sd->id,
                'previous_status' => 'resolved',
                'notes' => 'Akun berhasil dibuat dan kredensial sementara telah dikirimkan via email resmi. Tiket ditutup.',
                'is_internal' => false,
            ]
        );

        // 10. Tiket Walk-in oleh Service Desk
        $t10 = Ticket::firstOrCreate(
            ['ticket_id' => 'TCK-202610-0010'],
            [
                'title' => 'Laporan Walk-in: Monitor Display Ruang Rapat Tidak Menampilkan Gambar',
                'description' => 'Klien tamu melaporkan kabel HDMI ruang rapat utama 301 tidak menampilkan sinyal ke proyektor.',
                'category' => 'Hardware',
                'priority' => 'medium',
                'status' => 'open',
                'user_id' => $sd->id,
                'reporter_name' => 'Pak Hendra (Tamu Eksternal PT Mitra)',
                'reporter_contact' => 'hendra@mitra.co.id',
                'contact_method' => 'walk_in',
                'contact_method_notes' => 'Melapor langsung ke meja resepsionis lantai 1.',
            ]
        );
        ProgressLog::firstOrCreate(
            ['ticket_id' => $t10->id, 'new_status' => 'open'],
            [
                'user_id' => $sd->id,
                'previous_status' => null,
                'notes' => 'Tiket walk-in dibuat oleh staf Service Desk atas nama pelapor tamu eksternal.',
                'is_internal' => false,
            ]
        );

        // Seed Contoh In-App Notifications untuk User
        NotificationLog::firstOrCreate(
            ['ticket_id' => $t3->id, 'recipient_user_id' => $pm->id, 'channel' => 'in_app'],
            [
                'status' => 'sent',
                'message' => 'Tiket TCK-202610-0003 dieskalasikan ke Anda oleh Service Desk.',
                'sent_at' => now()->subMinutes(30),
                'created_at' => now()->subMinutes(30),
            ]
        );

        NotificationLog::firstOrCreate(
            ['ticket_id' => $t4->id, 'recipient_user_id' => $prog1->id, 'channel' => 'in_app'],
            [
                'status' => 'sent',
                'message' => 'Tiket baru tersedia untuk di-claim: Bug Formatting Laporan PDF.',
                'sent_at' => now()->subHours(2),
                'created_at' => now()->subHours(2),
            ]
        );

        NotificationLog::firstOrCreate(
            ['ticket_id' => $t7->id, 'recipient_user_id' => $owner->id, 'channel' => 'in_app'],
            [
                'status' => 'sent',
                'message' => 'Pengajuan persetujuan pengadaan hardware baru untuk tiket TCK-202610-0007.',
                'sent_at' => now()->subHours(1),
                'created_at' => now()->subHours(1),
            ]
        );
    }
}

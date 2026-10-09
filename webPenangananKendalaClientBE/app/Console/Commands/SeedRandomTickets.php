<?php

namespace App\Console\Commands;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SeedRandomTickets extends Command
{
    protected $signature = 'tickets:seed-random
                            {--count=30 : Jumlah ticket yang digenerate}
                            {--clear : Hapus dulu semua ticket hasil seed}';

    protected $description = 'Generate random tickets untuk testing board monitoring';

    private const STATUSES = [
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
    ];

    private const PRIORITIES = ['high', 'medium', 'low', 'belum_ditentukan'];

    private const CATEGORIES = ['Jaringan', 'Hardware', 'Software', 'Akun', 'Lainnya'];

    private const TITLES = [
        'Login page error saat submit',
        'Tidak bisa download file lampiran',
        'Aplikasi crash saat buka menu laporan',
        'Koneksi database timeout',
        'Email notifikasi tidak terkirim',
        'Tampilan berantakan di layar mobile',
        'Tombol simpan tidak responsif',
        'Data tidak sinkron antar halaman',
        'Session expired terlalu cepat',
        'Grafik dashboard tidak muncul',
        'Filter pencarian tidak bekerja',
        'Export PDF gagal di halaman detail',
        'Upload attachment stuck di 99 persen',
        'Pagination lompat halaman saat filter aktif',
    ];

    private const DESCRIPTIONS = [
        'Saat user melakukan aksi, sistem tidak memberi respons apapun dalam 30 detik terakhir.',
        'Halaman menampilkan loading terus tanpa progress. Coba refresh beberapa kali, tetap sama.',
        'Muncul pesan error tidak jelas di console browser. Fitur sebelumnya berjalan normal.',
        'Data yang ditampilkan berbeda antara list dan halaman detail.',
        'Setelah submit form, muncul notifikasi sukses tapi data tidak tersimpan di database.',
        'User melaporkan kejadian ini terjadi secara konsisten sejak kemarin.',
        'Bug hanya muncul di browser tertentu, tidak bisa direproduksi di semua environment.',
    ];

    public function handle()
    {
        if ($this->option('clear')) {
            $deleted = Ticket::where('reporter_name', '[SEED]')->delete();
            $this->info("Cleared {$deleted} seeded tickets.");
        }

        $clients = User::where('role', 'client')->get();
        $programmers = User::where('role', 'programmer')->get();

        if ($clients->isEmpty()) {
            $this->error('Tidak ada user dengan role client. Seed user dulu.');
            return self::FAILURE;
        }

        $count = (int) $this->option('count');
        $yearMonth = Carbon::now()->format('Ym');

        $lastTicket = Ticket::where('ticket_id', 'like', "TCK-{$yearMonth}-%")
            ->orderBy('ticket_id', 'desc')
            ->first();

        $lastSeq = $lastTicket
            ? (int) substr($lastTicket->ticket_id, -4)
            : 0;

        $created = 0;

        for ($i = 1; $i <= $count; $i++) {
            $seq = $lastSeq + $i;
            $ticketId = sprintf('TCK-%s-%04d', $yearMonth, $seq);

            $status = self::STATUSES[array_rand(self::STATUSES)];
            $priority = self::PRIORITIES[array_rand(self::PRIORITIES)];
            $client = $clients->random();

            $claimedProgrammerId = null;
            $needsProgrammer = ! in_array($status, [
                'pending_confirmation',
                'open',
                'escalated_to_pm',
            ]);

            if ($needsProgrammer && $programmers->isNotEmpty()) {
                if (random_int(0, 1) === 1) {
                    $claimedProgrammerId = $programmers->random()->id;
                }
            }

            Ticket::create([
                'ticket_id' => $ticketId,
                'title' => self::TITLES[array_rand(self::TITLES)],
                'description' => self::DESCRIPTIONS[array_rand(self::DESCRIPTIONS)],
                'category' => self::CATEGORIES[array_rand(self::CATEGORIES)],
                'priority' => $priority,
                'status' => $status,
                'user_id' => $client->id,
                'claimed_programmer_id' => $claimedProgrammerId,
                'reporter_name' => '[SEED]',
                'contact_method_notes' => 'Auto-generated untuk testing board',
            ]);

            $created++;
        }

        $this->info("Created {$created} tickets dengan prefix TCK-{$yearMonth}-.");
        $this->info('Jalankan dengan --clear untuk hapus semua ticket seed.');

        return self::SUCCESS;
    }
}

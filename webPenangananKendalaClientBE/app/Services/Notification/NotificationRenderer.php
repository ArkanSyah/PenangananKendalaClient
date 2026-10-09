<?php

namespace App\Services\Notification;

use App\Models\NotificationBatch;
use App\Models\Ticket;
use App\Models\User;

class NotificationRenderer
{
    private const STATUS_EMOJI = [
        'assigned' => '🎫',
        'resolved' => '✅',
        'rejected' => '❌',
        'escalated_to_owner' => '⬆️',
    ];

    private const PRIORITY_EMOJI = [
        'high' => '🔴',
        'medium' => '🟠',
        'low' => '🟢',
        'belum_ditentukan' => '⚪',
    ];

    public function render(User $recipient, Ticket $ticket, NotificationBatch $batch, string $channel = 'wa'): string
    {
        $status = $batch->status_to;
        $role = $recipient->role ?? 'default';

        if ($channel !== 'wa') {
            return $this->renderPlain($ticket, $batch);
        }

        return match ($status) {
            'assigned' => $this->renderAssigned($ticket, $batch),
            'resolved' => $role === 'client'
                ? $this->renderResolvedToClient($ticket, $batch)
                : $this->renderResolvedToStaff($ticket, $batch),
            'rejected' => $role === 'client'
                ? $this->renderRejectedToClient($ticket, $batch)
                : $this->renderRejectedToStaff($ticket, $batch),
            'escalated_to_owner' => $this->renderEscalatedToOwner($ticket, $batch),
            'pending_confirmation' => $this->renderPendingConfirmation($ticket, $batch),
            'open' => $this->renderOpen($ticket, $batch),
            'escalated_to_pm' => $this->renderEscalatedToPm($ticket, $batch),
            'waiting_programmer' => $this->renderWaitingProgrammer($ticket, $batch),
            'waiting_pm_approval' => $this->renderWaitingPmApproval($ticket, $batch),
            'in_progress' => $this->renderInProgress($ticket, $batch),
            'pending_review' => $this->renderPendingReview($ticket, $batch),
            'closed' => $this->renderClosed($ticket, $batch),
            default => $this->renderGeneric($ticket, $batch),
        };
    }

    private function renderAssigned(Ticket $ticket, NotificationBatch $batch): string
    {
        return "*🎫 Tiket Baru untuk Anda*\n\n"
            . $this->ticketBlock($ticket)
            . "\nPrioritas : {$this->priorityLine($ticket->priority)}\n"
            . "Client    : {$this->truncate($this->clientName($ticket), 30)}\n\n"
            . "Buka: {$this->ticketUrl($ticket)}";
    }

    private function renderResolvedToClient(Ticket $ticket, NotificationBatch $batch): string
    {
        $chain = $this->chainLine($batch);

        return "*✅ Tiket Anda Selesai*\n\n"
            . $this->ticketBlock($ticket)
            . "\nStatus : Resolved{$chain}\n\n"
            . "Silakan konfirmasi:\n"
            . $this->ticketUrl($ticket);
    }

    private function renderResolvedToStaff(Ticket $ticket, NotificationBatch $batch): string
    {
        return "*✅ Tiket Resolved*\n\n"
            . $this->ticketBlock($ticket)
            . "\nProgrammer : {$this->truncate($this->programmerName($ticket), 30)}\n"
            . "Client     : {$this->truncate($this->clientName($ticket), 30)}\n\n"
            . "Buka: {$this->ticketUrl($ticket)}";
    }

    private function renderRejectedToClient(Ticket $ticket, NotificationBatch $batch): string
    {
        return "*❌ Tiket Anda Ditolak*\n\n"
            . $this->ticketBlock($ticket)
            . "\nStatus : Rejected\n\n"
            . "Buka untuk detail:\n"
            . $this->ticketUrl($ticket);
    }

    private function renderRejectedToStaff(Ticket $ticket, NotificationBatch $batch): string
    {
        return "*❌ Tiket Ditolak*\n\n"
            . $this->ticketBlock($ticket)
            . "\nClient : {$this->truncate($this->clientName($ticket), 30)}\n\n"
            . "Buka: {$this->ticketUrl($ticket)}";
    }

    private function renderEscalatedToOwner(Ticket $ticket, NotificationBatch $batch): string
    {
        return "*⬆️ Tiket Dieskalasi ke Anda*\n\n"
            . $this->ticketBlock($ticket)
            . "\nPrioritas : {$this->priorityLine($ticket->priority)}\n"
            . "Client    : {$this->truncate($this->clientName($ticket), 30)}\n\n"
            . "Butuh keputusan Anda:\n"
            . $this->ticketUrl($ticket);
    }

    private function renderGeneric(Ticket $ticket, NotificationBatch $batch): string
    {
        $statusLabel = $this->label($batch->status_to);
        $chain = $this->chainLine($batch);

        return "*🎫 Tiket Diperbarui*\n\n"
            . $this->ticketBlock($ticket)
            . "\nStatus    : {$statusLabel}{$chain}\n"
            . "Prioritas : {$this->priorityLine($ticket->priority)}\n\n"
            . "Buka: {$this->ticketUrl($ticket)}";
    }

    private function renderPendingConfirmation(Ticket $ticket, NotificationBatch $batch): string
    {
        return "*⏳ Tiket Baru Menunggu Konfirmasi*\n\n"
            . $this->ticketBlock($ticket)
            . "\nPrioritas : {$this->priorityLine($ticket->priority)}\n"
            . "Client    : {$this->truncate($this->clientName($ticket), 30)}\n\n"
            . "Butuh konfirmasi Anda:\n"
            . $this->ticketUrl($ticket);
    }

    private function renderOpen(Ticket $ticket, NotificationBatch $batch): string
    {
        return "*📂 Tiket Baru Dibuka*\n\n"
            . $this->ticketBlock($ticket)
            . "\nPrioritas : {$this->priorityLine($ticket->priority)}\n"
            . "Client    : {$this->truncate($this->clientName($ticket), 30)}\n\n"
            . "Buka: {$this->ticketUrl($ticket)}";
    }

    private function renderEscalatedToPm(Ticket $ticket, NotificationBatch $batch): string
    {
        return "*⬆️ Tiket Dieskalasi ke Anda*\n\n"
            . $this->ticketBlock($ticket)
            . "\nPrioritas : {$this->priorityLine($ticket->priority)}\n"
            . "Client    : {$this->truncate($this->clientName($ticket), 30)}\n\n"
            . "Butuh review Anda:\n"
            . $this->ticketUrl($ticket);
    }

    private function renderWaitingProgrammer(Ticket $ticket, NotificationBatch $batch): string
    {
        return "*⏳ Tiket Menunggu Programmer*\n\n"
            . $this->ticketBlock($ticket)
            . "\nPrioritas : {$this->priorityLine($ticket->priority)}\n"
            . "Client    : {$this->truncate($this->clientName($ticket), 30)}\n\n"
            . "Buka: {$this->ticketUrl($ticket)}";
    }

    private function renderWaitingPmApproval(Ticket $ticket, NotificationBatch $batch): string
    {
        return "*⏳ Tiket Menunggu Approval Anda*\n\n"
            . $this->ticketBlock($ticket)
            . "\nPrioritas : {$this->priorityLine($ticket->priority)}\n"
            . "Client    : {$this->truncate($this->clientName($ticket), 30)}\n\n"
            . "Butuh approval Anda:\n"
            . $this->ticketUrl($ticket);
    }

    private function renderInProgress(Ticket $ticket, NotificationBatch $batch): string
    {
        return "*🔨 Tiket Anda Sedang Dikerjakan*\n\n"
            . $this->ticketBlock($ticket)
            . "\nProgrammer : {$this->truncate($this->programmerName($ticket), 30)}\n\n"
            . "Buka: {$this->ticketUrl($ticket)}";
    }

    private function renderPendingReview(Ticket $ticket, NotificationBatch $batch): string
    {
        return "*👀 Tiket Menunggu Review Anda*\n\n"
            . $this->ticketBlock($ticket)
            . "\nProgrammer : {$this->truncate($this->programmerName($ticket), 30)}\n"
            . "Client     : {$this->truncate($this->clientName($ticket), 30)}\n\n"
            . "Buka: {$this->ticketUrl($ticket)}";
    }

    private function renderClosed(Ticket $ticket, NotificationBatch $batch): string
    {
        return "*🔒 Tiket Anda Telah Ditutup*\n\n"
            . $this->ticketBlock($ticket)
            . "\nStatus : Closed\n\n"
            . "Buka untuk detail:\n"
            . $this->ticketUrl($ticket);
    }

    private function renderPlain(Ticket $ticket, NotificationBatch $batch): string
    {
        return "Tiket {$ticket->ticket_id} diperbarui ke {$this->label($batch->status_to)}.";
    }

    private function ticketBlock(Ticket $ticket): string
    {
        return $ticket->ticket_id . "\n"
            . $this->truncate($ticket->title, 60) . "\n";
    }

    private function chainLine(NotificationBatch $batch): string
    {
        $chain = collect($batch->event_chain ?? [])
            ->filter(fn ($e) => ($e['from'] ?? null) !== ($e['to'] ?? null))
            ->values()
            ->all();
        $maxChain = (int) config('notification.max_chain_display', 3);
        $netChanged = $batch->status_from !== $batch->status_to;

        if (! $netChanged || count($chain) <= 1) {
            return '';
        }

        $steps = array_map(
            fn ($e) => $this->label($e['to']),
            array_slice($chain, 0, $maxChain)
        );

        $text = "\nRiwayat: " . implode(' -> ', $steps);

        if (count($chain) > $maxChain) {
            $text .= ' (dan ' . (count($chain) - $maxChain) . ' perubahan lain)';
        }

        return $text;
    }

    private function priorityLine(?string $priority): string
    {
        $key = $priority ?: 'belum_ditentukan';
        $emoji = self::PRIORITY_EMOJI[$key] ?? '⚪';
        $label = match ($key) {
            'high' => 'High',
            'medium' => 'Medium',
            'low' => 'Low',
            default => '—',
        };

        return "{$emoji} {$label}";
    }

    private function clientName(Ticket $ticket): string
    {
        return $ticket->creator->name ?? '-';
    }

    private function programmerName(Ticket $ticket): string
    {
        return $ticket->claimedProgrammer->name ?? 'Belum di-assign';
    }

    private function truncate(?string $text, int $max): string
    {
        if ($text === null || $text === '') {
            return '-';
        }

        if (mb_strlen($text) <= $max) {
            return $text;
        }

        return mb_substr($text, 0, $max - 3) . '...';
    }

    private function ticketUrl(Ticket $ticket): string
    {
        return rtrim(config('notification.frontend_url'), '/') . '/tickets/' . $ticket->ticket_id;
    }

    private function label(string $status): string
    {
        return config('notification.status_labels')[$status]
            ?? ucwords(str_replace('_', ' ', $status));
    }
}

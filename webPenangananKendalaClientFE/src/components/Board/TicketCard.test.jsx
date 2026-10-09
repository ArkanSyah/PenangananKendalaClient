import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import TicketCard from './TicketCard';

const mockTicket = {
  id: 6,
  ticket_id: 'TCK-202609-0006',
  title: 'Login page error',
  priority: 'high',
  status: 'pending_review',
  updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  user: { name: 'PT ABC' },
  claimed_programmer: { name: 'Budi Santoso' },
};

function renderCard(ticket = mockTicket, onClick = vi.fn()) {
  return render(
    <DndContext>
      <TicketCard ticket={ticket} onClick={onClick} />
    </DndContext>
  );
}

describe('TicketCard', () => {
  it('menampilkan ticket_id', () => {
    renderCard();
    expect(screen.getByText('TCK-202609-0006')).toBeInTheDocument();
  });

  it('menampilkan judul', () => {
    renderCard();
    expect(screen.getByText('Login page error')).toBeInTheDocument();
  });

  it('badge priority High', () => {
    renderCard();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('nama programmer', () => {
    renderCard();
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
  });

  it('fallback "Belum di-assign" kalau programmer null', () => {
    renderCard({ ...mockTicket, claimed_programmer: null });
    expect(screen.getByText('Belum di-assign')).toBeInTheDocument();
  });

  it('fallback "-" kalau client null', () => {
    renderCard({ ...mockTicket, user: null });
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('waktu relatif "3 hari lalu"', () => {
    renderCard();
    expect(screen.getByText('3 hari lalu')).toBeInTheDocument();
  });

  it('border merah untuk priority high', () => {
    const { container } = renderCard();
    expect(container.firstChild.className).toContain('border-red-500');
  });

  it('border oranye untuk priority medium', () => {
    const { container } = renderCard({ ...mockTicket, priority: 'medium' });
    expect(container.firstChild.className).toContain('border-orange-500');
  });

  it('border abu untuk priority belum_ditentukan', () => {
    const { container } = renderCard({ ...mockTicket, priority: 'belum_ditentukan' });
    expect(container.firstChild.className).toContain('border-gray-300');
  });

  it('panggil onClick saat diklik', () => {
    const onClick = vi.fn();
    renderCard(mockTicket, onClick);
    fireEvent.click(screen.getByText('Login page error'));
    expect(onClick).toHaveBeenCalledWith(mockTicket);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteTicketModal from './DeleteTicketModal';

const mockTicket = {
  ticket_id: 'TCK-202610-0001',
  title: 'Test Ticket',
};

describe('DeleteTicketModal', () => {
  it('renders ticket info', () => {
    render(
      <DeleteTicketModal
        ticket={mockTicket}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText(/TCK-202610-0001/)).toBeInTheDocument();
    expect(screen.getByText('Hapus Tiket')).toBeInTheDocument();
  });

  it('calls onCancel when Batal clicked', () => {
    const onCancel = vi.fn();
    render(
      <DeleteTicketModal
        ticket={mockTicket}
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText('Batal'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onConfirm with reason on submit', () => {
    const onConfirm = vi.fn();
    render(
      <DeleteTicketModal
        ticket={mockTicket}
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );
    const textarea = screen.getByPlaceholderText('Alasan penghapusan...');
    fireEvent.change(textarea, { target: { value: 'Duplicate' } });
    fireEvent.click(screen.getByText('Hapus'));
    expect(onConfirm).toHaveBeenCalledWith('Duplicate');
  });

  it('returns null when ticket is null', () => {
    const { container } = render(
      <DeleteTicketModal ticket={null} onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });
});

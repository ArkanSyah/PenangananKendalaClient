import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TicketDetailModal from './TicketDetailModal';
import * as ticketsApi from '../../api/tickets';
import * as boardUtils from '../../utils/boardUtils';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../api/tickets');
vi.mock('../../utils/boardUtils', async () => {
  const actual = await vi.importActual('../../utils/boardUtils');
  return {
    ...actual,
    canUserEditTitle: vi.fn(),
  };
});

vi.mock('../../AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, role: 'owner' } }),
}));

const mockTicket = {
  id: 1,
  ticket_id: 'TCK-202610-0001',
  title: 'Original Title',
  status: 'open',
  description: 'Desc',
};

describe('TicketDetailModal — edit title', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows pencil icon for executive', () => {
    boardUtils.canUserEditTitle.mockReturnValue(true);
    render(<TicketDetailModal ticket={mockTicket} onClose={() => {}} />);
    expect(screen.getByTitle('Edit judul')).toBeInTheDocument();
  });

  it('hides pencil icon for non-executive', () => {
    boardUtils.canUserEditTitle.mockReturnValue(false);
    render(<TicketDetailModal ticket={mockTicket} onClose={() => {}} />);
    expect(screen.queryByTitle('Edit judul')).not.toBeInTheDocument();
  });

  it('enters edit mode on pencil click', () => {
    boardUtils.canUserEditTitle.mockReturnValue(true);
    render(<TicketDetailModal ticket={mockTicket} onClose={() => {}} />);
    fireEvent.click(screen.getByTitle('Edit judul'));
    expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument();
  });

  it('cancels edit on Escape', () => {
    boardUtils.canUserEditTitle.mockReturnValue(true);
    render(<TicketDetailModal ticket={mockTicket} onClose={() => {}} />);
    fireEvent.click(screen.getByTitle('Edit judul'));
    const input = screen.getByDisplayValue('Original Title');
    fireEvent.change(input, { target: { value: 'Changed' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByDisplayValue('Changed')).not.toBeInTheDocument();
  });

  it('saves title on Enter', async () => {
    boardUtils.canUserEditTitle.mockReturnValue(true);
    ticketsApi.updateTicketTitle.mockResolvedValue({
      message: 'ok',
      ticket: { ...mockTicket, title: 'New Title' },
    });
    render(<TicketDetailModal ticket={mockTicket} onClose={() => {}} />);
    fireEvent.click(screen.getByTitle('Edit judul'));
    const input = screen.getByDisplayValue('Original Title');
    fireEvent.change(input, { target: { value: 'New Title' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => {
      expect(ticketsApi.updateTicketTitle).toHaveBeenCalledWith('TCK-202610-0001', 'New Title');
    });
  });

  it('shows error for empty title', async () => {
    boardUtils.canUserEditTitle.mockReturnValue(true);
    render(<TicketDetailModal ticket={mockTicket} onClose={() => {}} />);
    fireEvent.click(screen.getByTitle('Edit judul'));
    const input = screen.getByDisplayValue('Original Title');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByText('Judul tidak boleh kosong.')).toBeInTheDocument();
    });
  });
});

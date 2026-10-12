import axios from 'axios';

export async function deleteTicket(ticketId, reason = '') {
  const response = await axios.delete(`/tickets/${ticketId}`, {
    data: { reason },
  });
  return response.data;
}

export async function restoreTicket(ticketId) {
  const response = await axios.post(`/tickets/${ticketId}/restore`);
  return response.data;
}

export async function fetchArchivedTickets(params = {}) {
  const response = await axios.get('/archived-tickets', { params });
  return response.data;
}

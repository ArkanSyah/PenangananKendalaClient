import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import axios from 'axios';
import BoardColumn from '../components/Board/BoardColumn';
import TicketDetailModal from '../components/Board/TicketDetailModal';
import DeleteTicketModal from '../components/Board/DeleteTicketModal';
import Toast from '../components/Board/Toast';
import { STATUS_ORDER } from '../constants/statusMapping';
import {
  groupTicketsByStatus,
  loadBoardLayout,
  saveBoardLayout,
  applyLayout,
  canUserDrag,
  canUserArchive,
  canUserDelete,
} from '../utils/boardUtils';
import { deleteTicket } from '../api/tickets';
import { useAuth } from '../AuthContext';

export default function BoardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const canDrag = canUserDrag(user);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/tickets');
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setTickets(data);
      const g = groupTicketsByStatus(data);
      const layout = loadBoardLayout();
      setGrouped(applyLayout(g, layout));
    } catch (err) {
      setError(err.message || 'Gagal memuat tiket');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleDeleteConfirm = async (reason) => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteTicket(deleteTarget.ticket_id, reason);
      setDeleteTarget(null);
      await fetchTickets();
      setToast({ message: 'Tiket berhasil dipindahkan ke arsip', type: 'success' });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Gagal menghapus tiket',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const ticketId = active.id;
    const newStatus = over.id;

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    if (ticket.status === newStatus) return;

    const previousGrouped = grouped;

    setGrouped((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((status) => {
        updated[status] = updated[status].filter((t) => t.id !== ticketId);
      });
      updated[newStatus] = [
        ...(updated[newStatus] || []),
        { ...ticket, status: newStatus },
      ];
      return updated;
    });

    try {
      await axios.patch('/board/move', {
        ticket_id: ticket.ticket_id,
        new_status: newStatus,
      });

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );

      const layout = {};
      Object.keys(grouped).forEach((status) => {
        layout[status] = (grouped[status] || []).map((t) => t.id);
      });
      saveBoardLayout(layout);

      setToast({ message: 'Status tiket berhasil diubah', type: 'success' });
    } catch (err) {
      setGrouped(previousGrouped);
      setToast({
        message: err.response?.data?.message || 'Gagal mengubah status',
        type: 'error',
      });
    }
  }

  if (loading) return <div className="p-6 text-gray-500">Memuat tiket...</div>;
  if (error) return <div className="p-6 text-[#C62828]">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Board Monitoring
        </h1>
        {canUserArchive(user) && (
          <button
            type="button"
            onClick={() => navigate('/archive')}
            className="flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            title="Lihat arsip tiket"
          >
            <Archive className="h-4 w-4" />
            Arsip
          </button>
        )}
      </div>

      {!canDrag && (
        <div className="mb-4 px-4 py-2 bg-[#FBC02D]/10 border border-[#FBC02D]/40 rounded-lg text-sm text-[#8a6800]">
          Mode read-only — Hanya owner/admin yang bisa memindahkan card
        </div>
      )}

      <div className="overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 min-h-[70vh]">
            {STATUS_ORDER.map((status) => (
              <BoardColumn
                key={status}
                status={status}
                tickets={grouped[status] || []}
                onCardClick={setSelectedTicket}
                onDelete={canUserDelete(user) ? setDeleteTarget : null}
                user={user}
              />
            ))}
          </div>
        </DndContext>
      </div>

      <TicketDetailModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />

      <DeleteTicketModal
        ticket={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

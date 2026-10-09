import { useDroppable } from '@dnd-kit/core';
import TicketCard from './TicketCard';
import { STATUS_LABEL } from '../../constants/statusMapping';

export default function BoardColumn({ status, tickets, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col w-[280px] shrink-0">
      <div className="sticky top-0 z-10 bg-gray-50 border-b-2 border-gray-200 pb-2 mb-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-gray-700">
            {STATUS_LABEL[status] || status}
          </h3>
          <span className="text-xs font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
            {tickets.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`
          flex-1 space-y-2 min-h-[200px] rounded-lg p-2 transition-colors
          ${isOver ? 'bg-blue-50' : 'bg-gray-100/50'}
        `}
      >
        {tickets.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-6 italic">
            Tidak ada tiket
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onClick={onCardClick} />
          ))
        )}
      </div>
    </div>
  );
}

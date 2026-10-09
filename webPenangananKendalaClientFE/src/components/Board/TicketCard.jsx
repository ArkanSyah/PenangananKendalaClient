import { useDraggable } from '@dnd-kit/core';
import { User, Building2, Clock } from 'lucide-react';
import { PRIORITY_CONFIG } from '../../constants/statusMapping';
import { formatRelativeTime } from '../../utils/boardUtils';

export default function TicketCard({ ticket, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: ticket.id });

  const priority =
    PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.belum_ditentukan;

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(ticket)}
      className={`
        bg-white rounded-lg shadow-sm cursor-grab active:cursor-grabbing
        ${priority.border}
        ${isDragging ? 'opacity-50 shadow-lg' : 'hover:shadow-md'}
        transition-shadow p-3 select-none
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-gray-500">
          {ticket.ticket_id}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.badge}`}
        >
          {priority.label}
        </span>
      </div>

      <h4 className="text-sm font-semibold text-gray-800 mb-3 line-clamp-2">
        {ticket.title}
      </h4>

      <div className="space-y-1 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <User size={12} className="text-gray-400 shrink-0" />
          <span className="truncate">
            {ticket.claimed_programmer?.name || 'Belum di-assign'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Building2 size={12} className="text-gray-400 shrink-0" />
          <span className="truncate">{ticket.creator?.name || '-'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-gray-400 shrink-0" />
          <span>{formatRelativeTime(ticket.updated_at)}</span>
        </div>
      </div>
    </div>
  );
}

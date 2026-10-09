import { Clock } from 'lucide-react';

export default function QuietHoursPicker({ start, end, onChange, disabled = false }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-gray-400 shrink-0" />
        <span className="text-xs text-gray-500">Dari</span>
      </div>
      <input
        type="time"
        value={start}
        disabled={disabled}
        onChange={(e) => onChange({ start: e.target.value, end })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#005662] disabled:opacity-50"
      />
      <span className="text-xs text-gray-500">sampai</span>
      <input
        type="time"
        value={end}
        disabled={disabled}
        onChange={(e) => onChange({ start, end: e.target.value })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#005662] disabled:opacity-50"
      />
    </div>
  );
}

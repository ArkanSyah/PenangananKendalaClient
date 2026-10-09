import { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles =
    type === 'success'
      ? 'bg-green-50 text-green-800 border-green-200'
      : 'bg-red-50 text-red-800 border-red-200';

  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg ${styles}`}>
        <Icon size={16} className="shrink-0" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

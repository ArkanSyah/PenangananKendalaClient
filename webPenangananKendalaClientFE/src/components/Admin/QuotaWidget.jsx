import { useEffect, useState } from 'react';
import { Gauge, AlertTriangle } from 'lucide-react';
import { getQuotaUsage } from '../../api/admin';

const STATUS_STYLES = {
  normal: {
    bar: 'bg-[#005662]',
    badge: 'bg-[#005662]/10 text-[#005662]',
    label: 'Normal',
  },
  warning: {
    bar: 'bg-[#FBC02D]',
    badge: 'bg-[#FBC02D]/15 text-[#8a6800]',
    label: 'Warning',
  },
  critical: {
    bar: 'bg-[#C62828]',
    badge: 'bg-[#C62828]/10 text-[#C62828]',
    label: 'Critical',
  },
};

export default function QuotaWidget() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await getQuotaUsage();
        if (cancelled) return;
        setUsage(data);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Gagal memuat kuota');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Gauge size={16} />
          <span>Memuat kuota...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center gap-2 text-sm text-[#C62828]">
          <AlertTriangle size={16} />
          <span>Gagal memuat kuota</span>
        </div>
      </div>
    );
  }

  if (!usage) return null;

  const styles = STATUS_STYLES[usage.status] || STATUS_STYLES.normal;
  const percentage = Math.min(100, Math.max(0, usage.percentage));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gauge size={18} className="text-[#005662]" />
          <h3 className="text-sm font-semibold text-gray-800">
            Kuota WhatsApp
          </h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles.badge}`}>
          {styles.label}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-2xl font-bold text-gray-800">
            {usage.used}
            <span className="text-sm font-normal text-gray-500">
              {' '}/ {usage.limit}
            </span>
          </span>
          <span className="text-sm text-gray-500">
            {usage.percentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${styles.bar}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Sisa {usage.remaining} pesan bulan ini
      </p>
    </div>
  );
}

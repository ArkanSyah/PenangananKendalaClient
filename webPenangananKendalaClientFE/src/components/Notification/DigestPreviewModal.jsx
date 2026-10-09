import { useEffect, useState } from 'react';
import { X, Loader2, Info } from 'lucide-react';
import axios from 'axios';

export default function DigestPreviewModal({ period, onClose }) {
  const [preview, setPreview] = useState(null);
  const [isSample, setIsSample] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get('/notification/preview-digest', {
          params: { period },
        });
        if (cancelled) return;
        setPreview(res.data.preview);
        setIsSample(res.data.is_sample);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Gagal memuat preview');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [period]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            Contoh Notifikasi {period === 'daily' ? 'Harian' : 'Per Jam'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-6">
              <Loader2 size={16} className="animate-spin" />
              <span>Memuat contoh...</span>
            </div>
          ) : error ? (
            <div className="text-sm text-[#C62828] py-6">Error: {error}</div>
          ) : (
            <>
              {isSample && (
                <div className="flex items-start gap-2 mb-3 px-3 py-2 rounded-lg bg-[#FBC02D]/10 text-xs text-[#8a6800]">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <span>
                    Ini contoh. Belum ada notifikasi pada periode ini, jadi
                    kami pakai data dummy.
                  </span>
                </div>
              )}
              <div className="rounded-lg bg-[#005662]/5 border border-[#005662]/10 p-3">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words font-sans">
                  {preview}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

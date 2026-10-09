import { useEffect, useState } from 'react';
import { Save, Loader2, Eye } from 'lucide-react';
import PreferenceToggle from '../components/Notification/PreferenceToggle';
import DigestModeSelector from '../components/Notification/DigestModeSelector';
import DigestPreviewModal from '../components/Notification/DigestPreviewModal';
import QuietHoursPicker from '../components/Notification/QuietHoursPicker';
import { getPreferences, updatePreferences } from '../api/notification';

export default function NotificationSettings() {
  const [pref, setPref] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [previewPeriod, setPreviewPeriod] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await getPreferences();
        if (cancelled) return;
        setPref(data);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Gagal memuat preferensi');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function update(field, value) {
    setPref((prev) => ({ ...prev, [field]: value }));
    setFeedback(null);
  }

  async function handleSave() {
    try {
      setSaving(true);
      setFeedback(null);
      const updated = await updatePreferences({
        phone: pref.phone,
        email_fallback: pref.email_fallback,
        wa_enabled: pref.wa_enabled,
        email_enabled: pref.email_enabled,
        in_app_enabled: pref.in_app_enabled,
        notify_assigned: pref.notify_assigned,
        notify_resolved: pref.notify_resolved,
        notify_rejected: pref.notify_rejected,
        notify_escalated: pref.notify_escalated,
        notify_minor: pref.notify_minor,
        digest_mode: pref.digest_mode,
        quiet_hours_enabled: pref.quiet_hours_enabled,
        quiet_hours_start: pref.quiet_hours_start,
        quiet_hours_end: pref.quiet_hours_end,
      });
      setPref(updated);
      setFeedback({ type: 'success', message: 'Preferensi disimpan.' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menyimpan preferensi.',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-500">Memuat preferensi...</div>;
  }
  if (error) {
    return <div className="p-6 text-[#C62828]">Error: {error}</div>;
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        Notifikasi
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Atur bagaimana kamu menerima pemberitahuan perubahan status tiket.
      </p>

      <section className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">
          Kontak
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Nomor telepon dan email untuk menerima notifikasi.
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Nomor WhatsApp
            </label>
            <input
              type="tel"
              value={pref.phone || ''}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#005662]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Email cadangan
            </label>
            <input
              type="email"
              value={pref.email_fallback || ''}
              onChange={(e) => update('email_fallback', e.target.value)}
              placeholder="nama@domain.com"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#005662]"
            />
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">
          Kanal Notifikasi
        </h2>
        <p className="text-xs text-gray-500 mb-2">
          Pilih kanal yang aktif. Kalau WhatsApp gagal, sistem pakai email.
        </p>
        <div className="divide-y divide-gray-100">
          <PreferenceToggle
            label="Notifikasi WhatsApp"
            description="Kirim ke nomor WhatsApp di atas"
            checked={pref.wa_enabled}
            onChange={(v) => update('wa_enabled', v)}
          />
          <PreferenceToggle
            label="Notifikasi Email"
            description="Kirim ke email cadangan"
            checked={pref.email_enabled}
            onChange={(v) => update('email_enabled', v)}
          />
          <PreferenceToggle
            label="Notifikasi In-App"
            description="Tampilkan di dalam aplikasi"
            checked={pref.in_app_enabled}
            onChange={(v) => update('in_app_enabled', v)}
          />
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">
          Jenis Notifikasi
        </h2>
        <p className="text-xs text-gray-500 mb-2">
          Pilih event yang ingin kamu terima notifikasinya.
        </p>
        <div className="divide-y divide-gray-100">
          <PreferenceToggle
            label="Tiket ditugaskan"
            description="Saat tiket di-assign ke programmer"
            checked={pref.notify_assigned}
            onChange={(v) => update('notify_assigned', v)}
          />
          <PreferenceToggle
            label="Tiket selesai"
            description="Saat status tiket berubah jadi Resolved"
            checked={pref.notify_resolved}
            onChange={(v) => update('notify_resolved', v)}
          />
          <PreferenceToggle
            label="Tiket ditolak"
            description="Saat tiket di-reject"
            checked={pref.notify_rejected}
            onChange={(v) => update('notify_rejected', v)}
          />
          <PreferenceToggle
            label="Eskalasi ke Owner"
            description="Saat tiket di-escalate ke owner"
            checked={pref.notify_escalated}
            onChange={(v) => update('notify_escalated', v)}
          />
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">
          Mode Pengiriman
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Real-time untuk segera, atau ringkasan untuk mengurangi jumlah pesan.
        </p>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <DigestModeSelector
              value={pref.digest_mode}
              onChange={(v) => update('digest_mode', v)}
            />
          </div>
          <button
            type="button"
            onClick={() => setPreviewPeriod(pref.digest_mode)}
            disabled={pref.digest_mode === 'realtime'}
            className="shrink-0 mt-0.5 inline-flex items-center gap-1 text-xs text-[#005662] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
          >
            <Eye size={14} />
            Lihat Contoh
          </button>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 mb-1">
              Jam Tenang
            </h2>
            <p className="text-xs text-gray-500">
              Tidak ada notifikasi masuk di rentang jam ini.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={pref.quiet_hours_enabled}
            aria-label="Aktifkan jam tenang"
            onClick={() => update('quiet_hours_enabled', !pref.quiet_hours_enabled)}
            className={`
              relative inline-flex h-6 w-11 shrink-0 rounded-full
              transition-colors focus:outline-none
              ${pref.quiet_hours_enabled ? 'bg-[#005662]' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow
                transform transition-transform
                ${pref.quiet_hours_enabled ? 'translate-x-5' : 'translate-x-0.5'}
              `}
            />
          </button>
        </div>
        {pref.quiet_hours_enabled && (
          <QuietHoursPicker
            start={pref.quiet_hours_start || '20:00'}
            end={pref.quiet_hours_end || '08:00'}
            onChange={({ start, end }) => {
              update('quiet_hours_start', start);
              update('quiet_hours_end', end);
            }}
          />
        )}
      </section>

      {feedback && (
        <div
          className={`
            mb-4 px-4 py-2 rounded-lg text-sm border
            ${feedback.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-[#C62828] border-red-200'}
          `}
        >
          {feedback.message}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2 bg-[#005662] text-white text-sm font-medium rounded-lg hover:bg-[#003d46] disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      {previewPeriod && previewPeriod !== 'realtime' && (
        <DigestPreviewModal
          period={previewPeriod}
          onClose={() => setPreviewPeriod(null)}
        />
      )}
    </div>
  );
}

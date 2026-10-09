const OPTIONS = [
  { value: 'realtime', label: 'Real-time', description: 'Kirim segera saat ada perubahan status' },
  { value: 'hourly', label: 'Ringkasan per jam', description: 'Gabungkan notifikasi setiap jam' },
  { value: 'daily', label: 'Ringkasan harian', description: 'Satu email ringkasan per hari, jam 08:00' },
];

export default function DigestModeSelector({ value, onChange, disabled = false }) {
  return (
    <div className="space-y-2">
      {OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`
              w-full text-left px-4 py-3 rounded-lg border transition-colors
              ${selected
                ? 'border-[#005662] bg-[#005662]/5'
                : 'border-gray-200 hover:border-gray-300'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <p className={`text-sm font-medium ${selected ? 'text-[#005662]' : 'text-gray-800'}`}>
              {opt.label}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
          </button>
        );
      })}
    </div>
  );
}

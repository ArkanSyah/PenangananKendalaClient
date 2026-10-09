import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect, useState } from 'react';

export default function PWAPrompt() {
  const [visible, setVisible] = useState(false);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW() {},
    onRegisterError() {},
  });

  useEffect(() => {
    if (needRefresh) setVisible(true);
  }, [needRefresh]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg bg-slate-900 text-white shadow-xl p-4">
      <p className="text-sm font-medium">Versi baru tersedia.</p>
      <div className="mt-3 flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="rounded px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600"
        >
          Nanti
        </button>
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="rounded px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500"
        >
          Reload
        </button>
      </div>
    </div>
  );
}

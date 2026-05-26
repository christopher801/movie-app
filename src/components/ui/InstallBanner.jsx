// src/components/ui/InstallBanner.jsx
import { usePWA } from '../../hooks/usePWA'
import { MdDownload, MdClose, MdWifiOff } from 'react-icons/md'

export default function InstallBanner() {
  const { installPrompt, isInstalled, isOnline, promptInstall } = usePWA()

  return (
    <>
      {/* Offline toast */}
      {!isOnline && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 bg-dark-700 border border-dark-500 text-white px-4 py-2.5 rounded-xl shadow-2xl animate-slide-up">
          <MdWifiOff size={18} className="text-yellow-400" />
          <span className="text-sm">Sin conexión — modo offline</span>
        </div>
      )}

      {/* Install banner */}
      {installPrompt && !isInstalled && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998] w-[calc(100%-2rem)] max-w-sm animate-slide-up">
          <div className="bg-dark-800 border border-dark-500 rounded-2xl p-4 shadow-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
              <img src="/icons/icon-72x72.png" alt="StreamVox" className="w-8 h-8 rounded-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Instalar StreamVox</p>
              <p className="text-xs text-dark-300">Acceso rápido desde tu pantalla</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={promptInstall}
                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all"
              >
                <MdDownload size={15} /> Instalar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

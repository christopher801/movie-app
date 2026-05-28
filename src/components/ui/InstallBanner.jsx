// src/components/ui/InstallBanner.jsx
import { useState } from 'react'
import { usePWA } from '../../hooks/usePWA'
import { MdDownload, MdClose, MdWifiOff } from 'react-icons/md'

export default function InstallBanner() {
  const { installPrompt, isInstalled, isOnline, promptInstall } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  return (
    <>
      {/* ── Offline badge ── */}
      {!isOnline && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999]
                        flex items-center gap-2
                        bg-dark-700 border border-dark-500 text-white
                        px-4 py-2.5 rounded-xl shadow-2xl animate-slide-up
                        whitespace-nowrap">
          <MdWifiOff size={18} className="text-yellow-400" />
          <span className="text-sm">Sin conexión — modo offline</span>
        </div>
      )}

      {/* ── Install banner ── */}
      {installPrompt && !isInstalled && !dismissed && (
        <div className="fixed bottom-0 left-0 right-0 z-[9998]
                        px-3 pb-4 sm:px-0 sm:pb-0
                        sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2
                        sm:w-auto sm:max-w-sm
                        animate-slide-up">

          <div className="bg-dark-800 border border-dark-600
                          rounded-2xl shadow-2xl
                          flex items-center gap-3 p-4
                          w-full">

            {/* App icon */}
            <div className="w-11 h-11 rounded-xl bg-brand-600
                            flex items-center justify-center shrink-0 shadow-lg">
              <img
                src="/icons/icon-72x72.png"
                alt="StreamVox"
                className="w-9 h-9 rounded-lg"
                onError={e => { e.target.style.display = 'none' }}
              />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-tight">
                Instalar StreamVox
              </p>
              <p className="text-xs text-dark-300 mt-0.5">
                Acceso rápido desde tu pantalla de inicio
              </p>
            </div>

            {/* Install button */}
            <button
              onClick={promptInstall}
              className="shrink-0 flex items-center gap-1.5
                         bg-brand-600 hover:bg-brand-500 active:scale-95
                         text-white text-xs font-semibold
                         px-3 py-2 rounded-lg transition-all"
            >
              <MdDownload size={15} />
              Instalar
            </button>

            {/* Close / Dismiss button */}
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 w-7 h-7 flex items-center justify-center
                         rounded-full text-dark-400 hover:text-white
                         hover:bg-dark-600 transition-all active:scale-90"
              aria-label="Cerrar"
            >
              <MdClose size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
// src/hooks/usePWA.js
import { useState, useEffect } from 'react'

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled,   setIsInstalled]   = useState(false)
  const [isOnline,      setIsOnline]      = useState(navigator.onLine)
  const [swRegistered,  setSwRegistered]  = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => { console.log('[SW] Registered:', reg.scope); setSwRegistered(true) })
      .catch(err => console.warn('[SW] Failed:', err))
  }, [])

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)')
    setIsInstalled(mq.matches)
    const handler = (e) => setIsInstalled(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const promptInstall = async () => {
    if (!installPrompt) return false
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') { setInstallPrompt(null); setIsInstalled(true) }
    return outcome === 'accepted'
  }

  return { installPrompt, isInstalled, isOnline, swRegistered, promptInstall }
}

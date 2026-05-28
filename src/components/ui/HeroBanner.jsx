// src/components/ui/HeroBanner.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MdPlayArrow, MdInfoOutline, MdAdd, MdCheck } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import { addToWatchlist, removeFromWatchlist } from '../../services/firestore'
import toast from 'react-hot-toast'

export default function HeroBanner({ contents = [] }) {
  const { t }    = useTranslation()
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (contents.length <= 1) return
    const interval = setInterval(() => setCurrent(p => (p + 1) % contents.length), 7000)
    return () => clearInterval(interval)
  }, [contents.length])

  if (!contents.length) return (
    <div className="h-[56vw] min-h-[320px] max-h-screen bg-dark-900 animate-pulse" />
  )

  const item = contents[current]
  const inWatchlist = profile?.watchlist?.includes(item.id)
  const backdrop = item.backdropUrl || item.posterUrl || ''

  const handleWatchlist = async () => {
    if (!user) { toast.error('Sign in required'); return }
    setLoading(true)
    try {
      if (inWatchlist) { await removeFromWatchlist(user.uid, item.id); toast.success('Removed') }
      else             { await addToWatchlist(user.uid, item.id);      toast.success('Added to list') }
      await refreshProfile()
    } catch { toast.error('Error') }
    setLoading(false)
  }

  return (
    <div className="relative w-full overflow-hidden"
      style={{ height: 'min(56vw, 85vh)', minHeight: '320px' }}>

      {/* ── Backdrop image ── */}
      <div className="absolute inset-0">
        {backdrop ? (
          <img
            key={item.id}
            src={backdrop}
            alt={item.title}
            className="w-full h-full object-cover object-center animate-fade-in"
          />
        ) : (
          <div className="w-full h-full bg-dark-800" />
        )}
        {/* bottom fade to page bg */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />
        {/* left fade for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/90 via-dark-950/40 to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 h-full flex items-end px-4 sm:px-8 lg:px-16 pb-10 sm:pb-16 lg:pb-20">
        <div className="w-full max-w-lg animate-slide-up">

          {/* Badge */}
          <span className="badge bg-brand-600 text-white mb-3 inline-flex">
            {item.type === 'movie' ? t('movie') : t('serie')}
          </span>

          {/* Title — responsive font size */}
          <h1 className="font-display text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl
                         text-white leading-none mb-3 tracking-wide drop-shadow-lg
                         line-clamp-2">
            {item.title.toUpperCase()}
          </h1>

          {/* Meta row */}
          <div className="flex items-center flex-wrap gap-2 mb-3 text-xs sm:text-sm text-dark-200">
            <span>{item.year}</span>
            {item.duration && <span>{item.duration} {t('min')}</span>}
            {item.rating > 0 && (
              <span className="flex items-center gap-0.5 text-yellow-400">
                ★ {item.rating.toFixed(1)}
              </span>
            )}
            {item.genres?.slice(0, 2).map(g => (
              <span key={g} className="border border-dark-500 rounded px-2 py-0.5">{g}</span>
            ))}
          </div>

          {/* Description — hidden on very small screens */}
          <p className="hidden sm:block text-dark-100 text-sm leading-relaxed line-clamp-2 mb-6 max-w-md">
            {item.description}
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate(`/content/${item.id}`)}
              className="flex items-center gap-1.5 bg-white text-black font-semibold
                         text-sm px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg
                         hover:bg-dark-100 transition-all active:scale-95"
            >
              <MdPlayArrow size={20} /> {t('watchNow')}
            </button>

            <button
              onClick={handleWatchlist}
              disabled={loading}
              className="flex items-center gap-1.5 btn-ghost text-sm px-4 py-2.5 sm:px-5 sm:py-3"
            >
              {inWatchlist ? <MdCheck size={18} /> : <MdAdd size={18} />}
              <span className="hidden xs:inline">
                {inWatchlist ? t('removeFromList') : t('addToList')}
              </span>
            </button>

            <button
              onClick={() => navigate(`/content/${item.id}`)}
              className="hidden sm:flex items-center gap-1.5 btn-ghost text-sm"
            >
              <MdInfoOutline size={18} /> {t('moreInfo')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Dots ── */}
      {contents.length > 1 && (
        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 flex gap-1.5 z-10">
          {contents.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 sm:w-8 bg-brand-500' : 'w-1.5 sm:w-2 bg-dark-400 hover:bg-dark-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

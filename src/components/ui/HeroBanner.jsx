// src/components/ui/HeroBanner.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MdPlayArrow, MdInfoOutline, MdAdd, MdCheck } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import { addToWatchlist, removeFromWatchlist } from '../../services/firestore'
import toast from 'react-hot-toast'

export default function HeroBanner({ contents = [] }) {
  const { t }     = useTranslation()
  const navigate  = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (contents.length <= 1) return
    const interval = setInterval(() => setCurrent(p => (p + 1) % contents.length), 7000)
    return () => clearInterval(interval)
  }, [contents.length])

  if (!contents.length) return (
    <div className="h-screen bg-dark-900 animate-pulse" />
  )

  const item = contents[current]
  const inWatchlist = profile?.watchlist?.includes(item.id)

  const handleWatchlist = async () => {
    if (!user) { toast.error('Sign in required'); return }
    setLoading(true)
    try {
      if (inWatchlist) { await removeFromWatchlist(user.uid, item.id); toast.success('Removed') }
      else             { await addToWatchlist(user.uid, item.id);     toast.success('Added to list') }
      await refreshProfile()
    } catch { toast.error('Error') }
    setLoading(false)
  }

  const backdrop = item.backdropUrl || item.posterUrl || `https://via.placeholder.com/1920x1080/0f0f0f/222?text=`

  return (
    <div className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          key={item.id}
          src={backdrop}
          alt={item.title}
          className="w-full h-full object-cover animate-fade-in"
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-end pb-24 sm:items-center sm:pb-0 px-4 sm:px-8 lg:px-16">
        <div className="max-w-xl animate-slide-up">
          {/* Type badge */}
          <span className="badge bg-brand-600 text-white mb-4 inline-flex">
            {item.type === 'movie' ? t('movie') : t('serie')}
          </span>

          {/* Title */}
          <h1 className="font-display text-5xl sm:text-7xl text-white leading-none mb-4 tracking-wide">
            {item.title.toUpperCase()}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4 text-sm text-dark-200">
            <span>{item.year}</span>
            {item.duration && <span>{item.duration} {t('min')}</span>}
            {item.rating > 0 && (
              <span className="flex items-center gap-1 text-yellow-400">
                ★ {item.rating.toFixed(1)}
              </span>
            )}
            {item.genres?.slice(0, 2).map(g => (
              <span key={g} className="border border-dark-500 rounded px-2 py-0.5 text-xs">{g}</span>
            ))}
          </div>

          {/* Description */}
          <p className="text-dark-100 text-sm leading-relaxed line-clamp-3 mb-8 max-w-md">
            {item.description}
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate(`/content/${item.id}`)}
              className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-dark-100 transition-all active:scale-95"
            >
              <MdPlayArrow size={22} /> {t('watchNow')}
            </button>

            <button
              onClick={handleWatchlist}
              disabled={loading}
              className="flex items-center gap-2 btn-ghost"
            >
              {inWatchlist ? <MdCheck size={20} /> : <MdAdd size={20} />}
              {inWatchlist ? t('removeFromList') : t('addToList')}
            </button>

            <button
              onClick={() => navigate(`/content/${item.id}`)}
              className="flex items-center gap-2 btn-ghost"
            >
              <MdInfoOutline size={20} /> {t('moreInfo')}
            </button>
          </div>
        </div>
      </div>

      {/* Dots */}
      {contents.length > 1 && (
        <div className="absolute bottom-8 right-8 flex gap-2 z-10">
          {contents.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-brand-500' : 'w-2 bg-dark-500 hover:bg-dark-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

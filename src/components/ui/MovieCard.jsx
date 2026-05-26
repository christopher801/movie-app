// src/components/ui/MovieCard.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MdPlayArrow, MdAdd, MdStar, MdCheck } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import { addToWatchlist, removeFromWatchlist } from '../../services/firestore'
import toast from 'react-hot-toast'

export default function MovieCard({ content, size = 'md' }) {
  const { t }                = useTranslation()
  const { user, profile, refreshProfile } = useAuth()
  const [hovered, setHovered] = useState(false)
  const [loading,  setLoading]  = useState(false)

  const inWatchlist = profile?.watchlist?.includes(content.id)

  const handleWatchlist = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Sign in to use your watchlist'); return }
    setLoading(true)
    try {
      if (inWatchlist) {
        await removeFromWatchlist(user.uid, content.id)
        toast.success('Removed from list')
      } else {
        await addToWatchlist(user.uid, content.id)
        toast.success('Added to list')
      }
      await refreshProfile()
    } catch { toast.error('Error') }
    setLoading(false)
  }

  const sizeClass = {
    sm: 'w-32 sm:w-36',
    md: 'w-40 sm:w-44',
    lg: 'w-52 sm:w-56',
  }[size]

  const poster = content.posterUrl || `https://via.placeholder.com/300x450/1e1e1e/555?text=${encodeURIComponent(content.title)}`

  return (
    <div
      className={`${sizeClass} shrink-0 card-movie`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/content/${content.id}`}>
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
          <img
            src={poster}
            alt={content.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`} />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {content.type === 'series' && (
              <span className="badge bg-brand-600/90 text-white">Serie</span>
            )}
            {content.featured && (
              <span className="badge bg-yellow-500/90 text-yellow-900">TOP</span>
            )}
          </div>

          {/* Actions on hover */}
          {hovered && (
            <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-2 animate-slide-up">
              <Link
                to={`/content/${content.id}`}
                className="flex-1 flex items-center justify-center gap-1 bg-white text-black text-xs font-semibold py-2 rounded-lg hover:bg-dark-100 transition-colors"
              >
                <MdPlayArrow size={18} /> Play
              </Link>
              <button
                onClick={handleWatchlist}
                disabled={loading}
                className="w-9 h-9 flex items-center justify-center bg-dark-700/80 border border-dark-500 rounded-lg hover:bg-dark-600 transition-colors"
              >
                {inWatchlist ? <MdCheck size={18} className="text-brand-400" /> : <MdAdd size={18} />}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-2 px-0.5">
          <p className="text-sm font-medium truncate">{content.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-dark-300">{content.year}</span>
            {content.rating > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-yellow-400">
                <MdStar size={12} /> {content.rating.toFixed(1)}
              </span>
            )}
            {content.duration && (
              <span className="text-xs text-dark-300">{content.duration} {t('min')}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

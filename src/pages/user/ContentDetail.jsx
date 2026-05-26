// src/pages/user/ContentDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/ui/Navbar'
import StarRating from '../../components/ui/StarRating'
import ContentRow from '../../components/ui/ContentRow'
import {
  getContentById, getEpisodes, incrementViews,
  addToWatchlist, removeFromWatchlist, getUserRating, getContents
} from '../../services/firestore'
import { useAuth } from '../../context/AuthContext'
import { MdPlayArrow, MdAdd, MdCheck, MdCalendarToday, MdTimer } from 'react-icons/md'
import toast from 'react-hot-toast'

export default function ContentDetail() {
  const { id }           = useParams()
  const { t }            = useTranslation()
  const navigate         = useNavigate()
  const { user, profile, refreshProfile } = useAuth()

  const [content,    setContent]    = useState(null)
  const [episodes,   setEpisodes]   = useState([])
  const [related,    setRelated]    = useState([])
  const [userRating, setUserRating] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [showTrailer, setShowTrailer] = useState(false)
  const [wlLoading,  setWlLoading]  = useState(false)
  const [activeSeason, setActiveSeason] = useState(1)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [c, rel] = await Promise.all([
        getContentById(id),
        getContents({ status: 'published' }, null, 8)
      ])
      setContent(c)
      setRelated(rel.data.filter(r => r.id !== id))
      if (c?.type === 'series') {
        const eps = await getEpisodes(id)
        setEpisodes(eps)
      }
      if (user) {
        const r = await getUserRating(user.uid, id)
        setUserRating(r)
      }
      await incrementViews(id)
      setLoading(false)
    }
    load()
  }, [id, user])

  const inWatchlist = profile?.watchlist?.includes(id)

  const handleWatchlist = async () => {
    if (!user) { toast.error('Sign in required'); return }
    setWlLoading(true)
    if (inWatchlist) { await removeFromWatchlist(user.uid, id); toast.success('Removed') }
    else             { await addToWatchlist(user.uid, id);     toast.success('Added to list') }
    await refreshProfile()
    setWlLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-dark-950 pt-20">
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-8 py-8">
        <div className="aspect-video skeleton rounded-2xl mb-6" />
        <div className="h-8 skeleton rounded mb-3 w-64" />
        <div className="h-4 skeleton rounded mb-2 w-full" />
        <div className="h-4 skeleton rounded w-3/4" />
      </div>
    </div>
  )

  if (!content) return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <p className="text-dark-300">Content not found</p>
    </div>
  )

  const seasons = [...new Set(episodes.map(e => e.season))].sort()

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      {/* Backdrop */}
      <div className="relative h-64 sm:h-96 overflow-hidden">
        <img
          src={content.backdropUrl || content.posterUrl}
          alt={content.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-950" />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-16">
        <div className="flex flex-col sm:flex-row gap-8">

          {/* Poster */}
          <div className="shrink-0">
            <img
              src={content.posterUrl}
              alt={content.title}
              className="w-40 sm:w-52 aspect-[2/3] object-cover rounded-xl shadow-2xl"
            />
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 sm:pt-16">
            <div className="flex items-center gap-3 mb-2">
              <span className="badge bg-brand-600 text-white">
                {content.type === 'movie' ? t('movie') : t('serie')}
              </span>
              {content.status === 'draft' && (
                <span className="badge bg-yellow-500/20 text-yellow-400">Draft</span>
              )}
            </div>

            <h1 className="font-display text-4xl sm:text-6xl text-white tracking-wider mb-3">
              {content.title.toUpperCase()}
            </h1>

            {/* Meta */}
            <div className="flex items-center flex-wrap gap-4 mb-4 text-sm text-dark-200">
              <span className="flex items-center gap-1"><MdCalendarToday size={14} /> {content.year}</span>
              {content.duration && (
                <span className="flex items-center gap-1"><MdTimer size={14} /> {content.duration} {t('min')}</span>
              )}
              {content.genres?.map(g => (
                <span key={g} className="border border-dark-500 rounded px-2 py-0.5 text-xs">{g}</span>
              ))}
            </div>

            <p className="text-dark-100 leading-relaxed mb-6 max-w-2xl">{content.description}</p>

            {/* Cast / Director */}
            {content.director && (
              <p className="text-sm text-dark-300 mb-1"><span className="text-dark-100 font-medium">{t('director')}:</span> {content.director}</p>
            )}
            {content.cast && (
              <p className="text-sm text-dark-300 mb-6"><span className="text-dark-100 font-medium">{t('cast')}:</span> {content.cast}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap mb-6">
              <button
                onClick={() => navigate(`/watch/${content.id}`)}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3 rounded-xl transition-all active:scale-95 animate-pulse-brand"
              >
                <MdPlayArrow size={22} /> {t('watchNow')}
              </button>

              <button onClick={handleWatchlist} disabled={wlLoading} className="flex items-center gap-2 btn-ghost">
                {inWatchlist ? <MdCheck size={20} /> : <MdAdd size={20} />}
                {inWatchlist ? t('removeFromList') : t('addToList')}
              </button>

              {content.trailerUrl && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2 btn-ghost"
                >
                  {t('trailer')}
                </button>
              )}
            </div>

            {/* Rating */}
            <div>
              <p className="text-sm text-dark-300 mb-2">{t('rateThis')}:</p>
              <StarRating
                contentId={id}
                currentRating={content.rating}
                userRating={userRating}
                onRated={(avg, val) => {
                  setContent(p => ({ ...p, rating: avg }))
                  setUserRating(val)
                }}
              />
            </div>
          </div>
        </div>

        {/* Episodes (series) */}
        {content.type === 'series' && episodes.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl tracking-wider mb-4">{t('episodes').toUpperCase()}</h2>

            {/* Season tabs */}
            {seasons.length > 1 && (
              <div className="flex gap-2 mb-6">
                {seasons.map(s => (
                  <button
                    key={s}
                    onClick={() => setActiveSeason(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeSeason === s ? 'bg-brand-600 text-white' : 'bg-dark-700 text-dark-200 hover:bg-dark-600'
                    }`}
                  >
                    {t('season')} {s}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {episodes
                .filter(e => e.season === activeSeason)
                .map(ep => (
                  <div key={ep.id} className="flex items-center gap-4 bg-dark-800 hover:bg-dark-700 rounded-xl p-4 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/watch/${content.id}?ep=${ep.id}`)}>
                    <div className="w-10 h-10 rounded-lg bg-dark-600 flex items-center justify-center shrink-0 font-mono text-sm">
                      {ep.episode}
                    </div>
                    {ep.thumbnailUrl && (
                      <img src={ep.thumbnailUrl} alt="" className="w-24 aspect-video object-cover rounded-lg" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{ep.title}</p>
                      <p className="text-sm text-dark-300 line-clamp-1">{ep.description}</p>
                    </div>
                    {ep.duration && (
                      <span className="text-xs text-dark-300 shrink-0">{ep.duration} {t('min')}</span>
                    )}
                    <MdPlayArrow size={20} className="text-dark-400 group-hover:text-brand-400 transition-colors shrink-0" />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12">
            <ContentRow title={t('recommended')} contents={related} />
          </div>
        )}
      </div>

      {/* Trailer modal */}
      {showTrailer && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div className="w-full max-w-4xl aspect-video" onClick={e => e.stopPropagation()}>
            <iframe
              src={content.trailerUrl?.replace('watch?v=', 'embed/')}
              className="w-full h-full rounded-xl"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  )
}

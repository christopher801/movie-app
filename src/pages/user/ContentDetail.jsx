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
import { useSEO, seoContent } from '../../hooks/useSEO'

export default function ContentDetail() {
  const { id }     = useParams()
  const { t }      = useTranslation()
  const navigate   = useNavigate()
  const { user, profile, refreshProfile } = useAuth()

  const [content,      setContent]      = useState(null)
  const [episodes,     setEpisodes]     = useState([])
  const [related,      setRelated]      = useState([])
  const [userRating,   setUserRating]   = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [showTrailer,  setShowTrailer]  = useState(false)
  const [wlLoading,    setWlLoading]    = useState(false)
  const [activeSeason, setActiveSeason] = useState(1)

  useSEO(seoContent(content))

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
    else             { await addToWatchlist(user.uid, id);      toast.success('Added to list') }
    await refreshProfile()
    setWlLoading(false)
  }

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="h-48 sm:h-72 skeleton" />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4">
          <div className="w-28 sm:w-40 aspect-[2/3] skeleton rounded-xl shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-6 skeleton rounded w-3/4" />
            <div className="h-4 skeleton rounded w-1/2" />
            <div className="h-4 skeleton rounded w-full" />
            <div className="h-4 skeleton rounded w-5/6" />
          </div>
        </div>
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

      {/* ── Backdrop ── */}
      <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden">
        <img
          src={content.backdropUrl || content.posterUrl}
          alt={content.title}
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-dark-950" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent" />
      </div>

      {/* ── Main content — overlaps backdrop ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 md:-mt-28 relative z-10 pb-16">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8">

          {/* Poster */}
          <div className="shrink-0 self-start">
            <img
              src={content.posterUrl}
              alt={content.title}
              className="w-28 sm:w-40 md:w-48 lg:w-52 aspect-[2/3] object-cover rounded-xl shadow-2xl ring-2 ring-dark-700"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-0 sm:pt-10 md:pt-14 lg:pt-20">

            {/* Badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="badge bg-brand-600 text-white">
                {content.type === 'movie' ? t('movie') : t('serie')}
              </span>
              {content.status === 'draft' && (
                <span className="badge bg-yellow-500/20 text-yellow-400">Draft</span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl
                           text-white tracking-wider mb-3 leading-tight">
              {content.title.toUpperCase()}
            </h1>

            {/* Meta */}
            <div className="flex items-center flex-wrap gap-2 sm:gap-4 mb-4 text-xs sm:text-sm text-dark-200">
              <span className="flex items-center gap-1">
                <MdCalendarToday size={13} /> {content.year}
              </span>
              {content.duration && (
                <span className="flex items-center gap-1">
                  <MdTimer size={13} /> {content.duration} {t('min')}
                </span>
              )}
              {content.genres?.map(g => (
                <span key={g} className="border border-dark-500 rounded px-2 py-0.5">{g}</span>
              ))}
            </div>

            {/* Description */}
            <p className="text-dark-100 text-sm leading-relaxed mb-4 line-clamp-3 sm:line-clamp-none">
              {content.description}
            </p>

            {/* Cast / Director */}
            {content.director && (
              <p className="text-xs sm:text-sm text-dark-300 mb-1">
                <span className="text-dark-100 font-medium">{t('director')}:</span> {content.director}
              </p>
            )}
            {content.cast && (
              <p className="text-xs sm:text-sm text-dark-300 mb-4 line-clamp-1 sm:line-clamp-none">
                <span className="text-dark-100 font-medium">{t('cast')}:</span> {content.cast}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap mb-5">
              <button
                onClick={() => navigate(`/watch/${content.id}`)}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500
                           text-white font-semibold text-sm sm:text-base
                           px-5 py-2.5 sm:px-8 sm:py-3 rounded-xl
                           transition-all active:scale-95 animate-pulse-brand"
              >
                <MdPlayArrow size={20} /> {t('watchNow')}
              </button>

              <button
                onClick={handleWatchlist}
                disabled={wlLoading}
                className="flex items-center gap-2 btn-ghost text-sm sm:text-base px-4 py-2.5 sm:py-3"
              >
                {inWatchlist ? <MdCheck size={18} /> : <MdAdd size={18} />}
                <span className="hidden xs:inline">
                  {inWatchlist ? t('removeFromList') : t('addToList')}
                </span>
              </button>

              {content.trailerUrl && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="btn-ghost text-sm px-4 py-2.5"
                >
                  {t('trailer')}
                </button>
              )}
            </div>

            {/* Star rating */}
            <div>
              <p className="text-xs sm:text-sm text-dark-300 mb-2">{t('rateThis')}:</p>
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

        {/* ── Episodes (series) ── */}
        {content.type === 'series' && episodes.length > 0 && (
          <div className="mt-10 sm:mt-14">
            <h2 className="font-display text-xl sm:text-2xl tracking-wider mb-4">
              {t('episodes').toUpperCase()}
            </h2>

            {/* Season tabs */}
            {seasons.length > 1 && (
              <div className="flex gap-2 mb-5 overflow-x-auto row-scroll pb-1">
                {seasons.map(s => (
                  <button
                    key={s}
                    onClick={() => setActiveSeason(s)}
                    className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeSeason === s
                        ? 'bg-brand-600 text-white'
                        : 'bg-dark-700 text-dark-200 hover:bg-dark-600'
                    }`}
                  >
                    {t('season')} {s}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {episodes
                .filter(e => e.season === activeSeason)
                .map(ep => (
                  <div
                    key={ep.id}
                    className="flex items-center gap-3 bg-dark-800 hover:bg-dark-700
                               rounded-xl p-3 sm:p-4 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/watch/${content.id}?ep=${ep.id}`)}
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-dark-600
                                    flex items-center justify-center shrink-0 font-mono text-sm">
                      {ep.episode}
                    </div>
                    {ep.thumbnailUrl && (
                      <img src={ep.thumbnailUrl} alt=""
                        className="hidden sm:block w-20 aspect-video object-cover rounded-lg shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{ep.title}</p>
                      <p className="text-xs text-dark-300 line-clamp-1 hidden sm:block">
                        {ep.description}
                      </p>
                    </div>
                    {ep.duration && (
                      <span className="text-xs text-dark-300 shrink-0 hidden sm:inline">
                        {ep.duration} {t('min')}
                      </span>
                    )}
                    <MdPlayArrow size={18}
                      className="text-dark-400 group-hover:text-brand-400 transition-colors shrink-0" />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── Related ── */}
        {related.length > 0 && (
          <div className="mt-10 sm:mt-14">
            <ContentRow title={t('recommended')} contents={related} />
          </div>
        )}
      </div>

      {/* ── Trailer modal ── */}
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

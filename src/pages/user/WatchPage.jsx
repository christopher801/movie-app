// src/pages/user/WatchPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import VideoPlayer from '../../components/player/VideoPlayer'
import { getContentById, getEpisodes } from '../../services/firestore'

export default function WatchPage() {
  const { id }            = useParams()
  const [params]          = useSearchParams()
  const episodeId         = params.get('ep')

  const [content,  setContent]  = useState(null)
  const [episodes, setEpisodes] = useState([])
  const [activeEp, setActiveEp] = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const load = async () => {
      const c = await getContentById(id)
      setContent(c)
      if (c?.type === 'series') {
        const eps = await getEpisodes(id)
        setEpisodes(eps)
        setActiveEp(episodeId ? eps.find(e => e.id === episodeId) : eps[0])
      }
      setLoading(false)
    }
    load()
  }, [id, episodeId])

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!content) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-dark-300">
      Content not found
    </div>
  )

  // For series, use episode video; for movie use content directly
  const playContent = activeEp
    ? { ...content, videoCloudinaryId: activeEp.videoCloudinaryId, youtubeUrl: activeEp.youtubeUrl }
    : content

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Player */}
        <div className="flex-1 flex items-center justify-center p-0 lg:p-4">
          <div className="w-full max-w-6xl">
            <VideoPlayer content={playContent} episodeId={activeEp?.id} />
          </div>
        </div>

        {/* Episode list (series) */}
        {content.type === 'series' && episodes.length > 0 && (
          <div className="lg:w-80 bg-dark-900 border-l border-dark-700 overflow-y-auto">
            <div className="p-4 border-b border-dark-700">
              <h3 className="font-display tracking-wider text-lg">{content.title.toUpperCase()}</h3>
              <p className="text-xs text-dark-300">{episodes.length} episodes</p>
            </div>
            <div className="divide-y divide-dark-800">
              {episodes.map(ep => (
                <button
                  key={ep.id}
                  onClick={() => setActiveEp(ep)}
                  className={`w-full text-left p-4 hover:bg-dark-700 transition-colors flex gap-3 ${
                    activeEp?.id === ep.id ? 'bg-dark-700 border-l-2 border-brand-500' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded bg-dark-600 flex items-center justify-center text-xs font-mono shrink-0">
                    {ep.episode}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{ep.title}</p>
                    <p className="text-xs text-dark-300">S{ep.season} E{ep.episode}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

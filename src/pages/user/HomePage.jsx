// src/pages/user/HomePage.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/ui/Navbar'
import HeroBanner from '../../components/ui/HeroBanner'
import ContentRow from '../../components/ui/ContentRow'
import { useSEO, seoHome } from '../../hooks/useSEO'
import { getFeaturedContent, getContents, getContinueWatching } from '../../services/firestore'
import { useAuth } from '../../context/AuthContext'

export default function HomePage() {
  const { t }    = useTranslation()
  useSEO(seoHome())
  const { user } = useAuth()

  const [featured,   setFeatured]   = useState([])
  const [trending,   setTrending]   = useState([])
  const [newContent, setNewContent] = useState([])
  const [topRated,   setTopRated]   = useState([])
  const [continueW,  setContinueW]  = useState([])
  const [movies,     setMovies]     = useState([])
  const [series,     setSeries]     = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [feat, trend, newC, top, movs, sers] = await Promise.all([
          getFeaturedContent(),
          getContents({ status: 'published', orderBy: 'views' }, null, 15),
          getContents({ status: 'published', orderBy: 'createdAt' }, null, 15),
          getContents({ status: 'published', orderBy: 'rating' }, null, 15),
          getContents({ status: 'published', type: 'movie' }, null, 12),
          getContents({ status: 'published', type: 'series' }, null, 12),
        ])
        setFeatured(feat)
        setTrending(trend.data)
        setNewContent(newC.data)
        setTopRated(top.data)
        setMovies(movs.data)
        setSeries(sers.data)
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!user) return
    const loadContinue = async () => {
      const cw = await getContinueWatching(user.uid)
      if (cw.length) {
        // Get full content objects for continue watching
        const ids = cw.map(c => c.contentId)
        const { getContentById } = await import('../../services/firestore')
        const results = await Promise.all(ids.map(id => getContentById(id)))
        setContinueW(results.filter(Boolean))
      }
    }
    loadContinue()
  }, [user])

  if (loading) return (
    <div className="min-h-screen bg-dark-950">
      <div className="h-screen bg-dark-900 animate-pulse" />
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-950 noise">
      <Navbar />
      <HeroBanner contents={featured.length ? featured : trending.slice(0, 5)} />

      <div className="pb-16 -mt-12 relative z-10">
        {continueW.length > 0 && (
          <ContentRow title={t('continueWatching')} contents={continueW} />
        )}
        <ContentRow title={t('trending')}     contents={trending}   />
        <ContentRow title={t('newReleases')}  contents={newContent} />
        <ContentRow title={t('topRated')}     contents={topRated}   />
        <ContentRow title={t('popularMovies')} contents={movies}    />
        <ContentRow title={t('popularSeries')} contents={series}    />
      </div>
    </div>
  )
}

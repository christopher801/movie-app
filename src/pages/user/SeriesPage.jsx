// src/pages/user/SeriesPage.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/ui/Navbar'
import MovieCard from '../../components/ui/MovieCard'
import { useSEO, seoSeries } from '../../hooks/useSEO'
import { getContents } from '../../services/firestore'

export default function SeriesPage() {
  const { t }            = useTranslation()
  useSEO(seoSeries())
  const [series,  setSeries]  = useState([])
  const [loading, setLoading] = useState(true)
  const [lastDoc, setLastDoc] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [sort,    setSort]    = useState('createdAt')

  const load = async (reset = false) => {
    setLoading(true)
    const result = await getContents({ status: 'published', type: 'series', orderBy: sort }, reset ? null : lastDoc, 24)
    setSeries(p => reset ? result.data : [...p, ...result.data])
    setLastDoc(result.lastDoc)
    setHasMore(result.hasMore)
    setLoading(false)
  }

  useEffect(() => { load(true) }, [sort])

  return (
    <div className="min-h-screen bg-dark-950 pt-16">
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-4xl text-white mb-6 tracking-wider">{t('series').toUpperCase()}</h1>

        <div className="flex gap-3 mb-8">
          <select value={sort} onChange={e => setSort(e.target.value)} className="input-dark w-auto text-sm">
            <option value="createdAt">Newest</option>
            <option value="views">Most Viewed</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {series.map(s => <MovieCard key={s.id} content={s} size="sm" />)}
          {loading && Array(12).fill(0).map((_, i) => (
            <div key={i} className="aspect-[2/3] skeleton rounded-xl" />
          ))}
        </div>

        {hasMore && !loading && (
          <div className="flex justify-center mt-8">
            <button onClick={() => load()} className="btn-ghost">Load more</button>
          </div>
        )}
      </div>
    </div>
  )
}

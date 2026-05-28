// src/pages/user/SeriesPage.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/ui/Navbar'
import MovieCard from '../../components/ui/MovieCard'
import { useSEO, seoSeries } from '../../hooks/useSEO'
import { getContents } from '../../services/firestore'

export default function SeriesPage() {
  const { t } = useTranslation()
  useSEO(seoSeries())

  const [series,  setSeries]  = useState([])
  const [loading, setLoading] = useState(true)
  const [lastDoc, setLastDoc] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [sort,    setSort]    = useState('createdAt')

  const load = async (reset = false) => {
    setLoading(true)
    const result = await getContents(
      { status: 'published', type: 'series', orderBy: sort },
      reset ? null : lastDoc, 24
    )
    setSeries(p => reset ? result.data : [...p, ...result.data])
    setLastDoc(result.lastDoc)
    setHasMore(result.hasMore)
    setLoading(false)
  }

  useEffect(() => { load(true) }, [sort])

  return (
    <div className="min-h-screen bg-dark-950 pt-16">
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        <h1 className="font-display text-3xl sm:text-4xl text-white mb-5 tracking-wider">
          {t('series').toUpperCase()}
        </h1>

        {/* Sort filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto row-scroll pb-1">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="input-dark shrink-0 w-auto text-sm py-2"
          >
            <option value="createdAt">Más recientes</option>
            <option value="views">Más vistas</option>
            <option value="rating">Mejor valoradas</option>
          </select>
        </div>

        {/* Grid — 2 cols mobile */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
          {series.map(s => <MovieCard key={s.id} content={s} size="sm" />)}
          {loading && Array(12).fill(0).map((_, i) => (
            <div key={i} className="aspect-[2/3] skeleton rounded-xl" />
          ))}
        </div>

        {hasMore && !loading && (
          <div className="flex justify-center mt-8">
            <button onClick={() => load()} className="btn-ghost px-8">Cargar más</button>
          </div>
        )}

        {!loading && series.length === 0 && (
          <div className="text-center py-20 text-dark-400">
            <p className="text-lg">No hay series disponibles</p>
          </div>
        )}
      </div>
    </div>
  )
}

// src/pages/user/MoviesPage.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/ui/Navbar'
import MovieCard from '../../components/ui/MovieCard'
import { getContents, getGenres } from '../../services/firestore'

export default function MoviesPage() {
  const { t }             = useTranslation()
  const [movies,   setMovies]   = useState([])
  const [genres,   setGenres]   = useState([])
  const [selected, setSelected] = useState('')
  const [sort,     setSort]     = useState('createdAt')
  const [loading,  setLoading]  = useState(true)
  const [lastDoc,  setLastDoc]  = useState(null)
  const [hasMore,  setHasMore]  = useState(true)

  const loadMovies = async (reset = false) => {
    setLoading(true)
    const filters = { status: 'published', type: 'movie', orderBy: sort }
    if (selected) filters.genre = selected
    const result = await getContents(filters, reset ? null : lastDoc, 24)
    setMovies(p => reset ? result.data : [...p, ...result.data])
    setLastDoc(result.lastDoc)
    setHasMore(result.hasMore)
    setLoading(false)
  }

  useEffect(() => { loadMovies(true) }, [sort, selected])

  useEffect(() => {
    getGenres().then(setGenres)
  }, [])

  return (
    <div className="min-h-screen bg-dark-950 pt-16">
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-4xl text-white mb-6 tracking-wider">{t('movies').toUpperCase()}</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="input-dark w-auto text-sm"
          >
            <option value="">{t('genres')} — {t('loading').replace('...','')}</option>
            {genres.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
          </select>

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="input-dark w-auto text-sm"
          >
            <option value="createdAt">Newest</option>
            <option value="views">Most Viewed</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {movies.map(m => <MovieCard key={m.id} content={m} size="sm" />)}
          {loading && Array(12).fill(0).map((_, i) => (
            <div key={i} className="aspect-[2/3] skeleton rounded-xl" />
          ))}
        </div>

        {hasMore && !loading && (
          <div className="flex justify-center mt-8">
            <button onClick={() => loadMovies()} className="btn-ghost">
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

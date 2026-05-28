// src/pages/user/MoviesPage.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/ui/Navbar'
import MovieCard from '../../components/ui/MovieCard'
import { useSEO, seoMovies } from '../../hooks/useSEO'
import { getContents, getGenres } from '../../services/firestore'

export default function MoviesPage() {
  const { t } = useTranslation()
  useSEO(seoMovies())

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
  useEffect(() => { getGenres().then(setGenres) }, [])

  return (
    <div className="min-h-screen bg-dark-950 pt-16">
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        <h1 className="font-display text-3xl sm:text-4xl text-white mb-5 tracking-wider">
          {t('movies').toUpperCase()}
        </h1>

        {/* Filters — scroll horizontally on mobile */}
        <div className="flex gap-2 mb-6 overflow-x-auto row-scroll pb-1">
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="input-dark shrink-0 w-auto text-sm py-2"
          >
            <option value="">Todos los géneros</option>
            {genres.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
          </select>

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="input-dark shrink-0 w-auto text-sm py-2"
          >
            <option value="createdAt">Más recientes</option>
            <option value="views">Más vistos</option>
            <option value="rating">Mejor valorados</option>
          </select>
        </div>

        {/* Grid — 2 cols on mobile, up to 6 on desktop */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
          {movies.map(m => <MovieCard key={m.id} content={m} size="sm" />)}
          {loading && Array(12).fill(0).map((_, i) => (
            <div key={i} className="aspect-[2/3] skeleton rounded-xl" />
          ))}
        </div>

        {hasMore && !loading && (
          <div className="flex justify-center mt-8">
            <button onClick={() => loadMovies()} className="btn-ghost px-8">
              Cargar más
            </button>
          </div>
        )}

        {!loading && movies.length === 0 && (
          <div className="text-center py-20 text-dark-400">
            <p className="text-lg">No hay películas disponibles</p>
          </div>
        )}
      </div>
    </div>
  )
}

// src/pages/user/SearchPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/ui/Navbar'
import MovieCard from '../../components/ui/MovieCard'
import { useSEO, seoSearch } from '../../hooks/useSEO'
import { searchContents } from '../../services/firestore'
import { MdSearch } from 'react-icons/md'

export default function SearchPage() {
  const { t }              = useTranslation()
  useSEO(seoSearch(query))
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef              = useRef(null)
  const debounce              = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSearch = (value) => {
    setQuery(value)
    clearTimeout(debounce.current)
    if (!value.trim()) { setResults([]); return }
    debounce.current = setTimeout(async () => {
      setLoading(true)
      const r = await searchContents(value.trim())
      setResults(r)
      setLoading(false)
    }, 400)
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-16">
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search bar */}
        <div className="relative max-w-2xl mx-auto mb-10">
          <MdSearch size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-300" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder={`${t('search')} — ${t('movies')}, ${t('series')}...`}
            className="input-dark pl-12 text-lg py-4"
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {Array(12).fill(0).map((_, i) => <div key={i} className="aspect-[2/3] skeleton rounded-xl" />)}
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-dark-300 text-sm mb-4">{results.length} results for <span className="text-white">"{query}"</span></p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {results.map(c => <MovieCard key={c.id} content={c} size="sm" />)}
            </div>
          </>
        ) : query ? (
          <div className="text-center py-16 text-dark-300">
            <MdSearch size={48} className="mx-auto mb-4 opacity-30" />
            <p>{t('noResults')}</p>
          </div>
        ) : (
          <div className="text-center py-16 text-dark-400">
            <MdSearch size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">Start typing to search...</p>
          </div>
        )}
      </div>
    </div>
  )
}

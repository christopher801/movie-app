// src/pages/user/WatchlistPage.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/ui/Navbar'
import MovieCard from '../../components/ui/MovieCard'
import { getWatchlistContents } from '../../services/firestore'
import { useAuth } from '../../context/AuthContext'
import { MdBookmarkBorder } from 'react-icons/md'

export default function WatchlistPage() {
  const { t }             = useTranslation()
  const { profile }       = useAuth()
  const [items,  setItems]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const contents = await getWatchlistContents(profile?.watchlist || [])
      setItems(contents)
      setLoading(false)
    }
    load()
  }, [profile?.watchlist])

  return (
    <div className="min-h-screen bg-dark-950 pt-16">
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display text-4xl text-white mb-8 tracking-wider">{t('myList').toUpperCase()}</h1>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {Array(8).fill(0).map((_, i) => <div key={i} className="aspect-[2/3] skeleton rounded-xl" />)}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {items.map(c => <MovieCard key={c.id} content={c} size="sm" />)}
          </div>
        ) : (
          <div className="text-center py-24 text-dark-400">
            <MdBookmarkBorder size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">Your list is empty.</p>
            <p className="text-sm mt-1">Add movies and series to watch later.</p>
          </div>
        )}
      </div>
    </div>
  )
}

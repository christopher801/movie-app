import { useState, useEffect } from 'react'
import MovieCard from '../components/MovieCard'
import Loader from '../components/Loader'
import { movieApi } from '../services/tmdbApi'

const Upcoming = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchUpcomingMovies()
  }, [page])

  const fetchUpcomingMovies = async () => {
    try {
      setLoading(true)
      const response = await movieApi.getUpcoming(page)
      setMovies(response.data.results)
      setError(null)
    } catch (err) {
      console.error('Error fetching upcoming movies:', err)
      setError('Failed to load movies. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading && page === 1) return <Loader />
  if (error && page === 1) return <div className="alert alert-danger">{error}</div>

  return (
    <div>
      <h1 className="mb-4">Upcoming Movies</h1>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {movies.map((movie) => (
          <div key={movie.id} className="col">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Upcoming
import { useState, useEffect } from 'react'
import MovieCard from '../components/MovieCard'
import Loader from '../components/Loader'
import { movieApi } from '../services/tmdbApi'

const Home = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPopularMovies()
  }, [])

  const fetchPopularMovies = async () => {
    try {
      setLoading(true)
      const response = await movieApi.getPopular()
      setMovies(response.data.results)
      setError(null)
    } catch (err) {
      console.error('Error fetching popular movies:', err)
      setError('Failed to load movies. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />
  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div>
      <h1 className="mb-4">Popular Movies</h1>
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

export default Home
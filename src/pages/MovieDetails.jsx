import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Loader from '../components/Loader'
import { movieApi, getImageUrl } from '../services/tmdbApi'

const MovieDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMovieDetails()
  }, [id])

  const fetchMovieDetails = async () => {
    try {
      setLoading(true)
      const response = await movieApi.getDetails(id)
      setMovie(response.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching movie details:', err)
      setError('Failed to load movie details. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) return <Loader />
  if (error) return <div className="alert alert-danger">{error}</div>
  if (!movie) return <div className="alert alert-warning">Movie not found</div>

  return (
    <div className="movie-details">
      <button 
        className="btn btn-outline-secondary mb-4" 
        onClick={() => navigate(-1)}
      >
        <i className="bi bi-arrow-left"></i> Back
      </button>

      <div className="row">
        <div className="col-lg-4 mb-4">
          <img 
            src={getImageUrl(movie.poster_path, 'w500')} 
            className="img-fluid rounded shadow" 
            alt={movie.title}
          />
        </div>
        
        <div className="col-lg-8">
          <h1 className="mb-3">{movie.title}</h1>
          
          <div className="mb-4">
            <span className="badge bg-primary me-2">{movie.release_date?.split('-')[0]}</span>
            <span className="badge bg-secondary me-2">{formatRuntime(movie.runtime)}</span>
            <span className="badge bg-success">
              <i className="bi bi-star-fill me-1"></i>
              {movie.vote_average?.toFixed(1)}
            </span>
          </div>

          <div className="mb-4">
            <h5>Genres</h5>
            <div className="d-flex flex-wrap gap-2">
              {movie.genres?.map(genre => (
                <span key={genre.id} className="badge bg-info">
                  {genre.name}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h5>Overview</h5>
            <p className="lead">{movie.overview}</p>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <h6>Original Language</h6>
              <p className="text-uppercase">{movie.original_language}</p>
            </div>
            <div className="col-md-6 mb-3">
              <h6>Status</h6>
              <p>{movie.status}</p>
            </div>
            <div className="col-md-6 mb-3">
              <h6>Budget</h6>
              <p>${movie.budget?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="col-md-6 mb-3">
              <h6>Revenue</h6>
              <p>${movie.revenue?.toLocaleString() || 'N/A'}</p>
            </div>
          </div>

          {movie.homepage && (
            <div className="mt-4">
              <a 
                href={movie.homepage} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Official Website
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieDetails
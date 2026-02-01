import { Link } from 'react-router-dom'
import { getImageUrl } from '../services/tmdbApi'

const MovieCard = ({ movie }) => {
  const { id, title, poster_path, vote_average, release_date } = movie

  return (
    <div className="movie-card h-100">
      <div className="card h-100 shadow-sm">
        <img 
          src={getImageUrl(poster_path, 'w500')} 
          className="card-img-top" 
          alt={title}
          style={{ height: '300px', objectFit: 'cover' }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-truncate">{title}</h5>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="badge bg-warning text-dark">
              <i className="bi bi-star-fill me-1"></i>
              {vote_average?.toFixed(1) || 'N/A'}
            </span>
            <small className="text-muted">
              {release_date ? new Date(release_date).getFullYear() : 'N/A'}
            </small>
          </div>
          <Link 
            to={`/movie/${id}`} 
            className="btn btn-outline-primary mt-auto"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
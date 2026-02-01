import { useState, useEffect } from 'react'
import MovieCard from '../components/MovieCard'
import Loader from '../components/Loader'
import { movieApi } from '../services/tmdbApi'

const Popular = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchPopularMovies()
  }, [page])

  const fetchPopularMovies = async () => {
    try {
      setLoading(true)
      const response = await movieApi.getPopular(page)
      setMovies(response.data.results)
      setTotalPages(response.data.total_pages)
      setError(null)
    } catch (err) {
      console.error('Error fetching popular movies:', err)
      setError('Failed to load movies. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo(0, 0)
  }

  if (loading && page === 1) return <Loader />
  if (error && page === 1) return <div className="alert alert-danger">{error}</div>

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

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Page navigation" className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </button>
            </li>
            
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1
              return (
                <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                </li>
              )
            })}

            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  )
}

export default Popular
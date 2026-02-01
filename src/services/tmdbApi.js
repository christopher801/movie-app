import axios from 'axios'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL
const IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'en-US',
  },
})

// Helper functions
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Image'
  return `${IMAGE_BASE_URL}/${size}${path}`
}

// Movie endpoints
export const movieApi = {
  // Get popular movies
  getPopular: (page = 1) => 
    tmdbApi.get('/movie/popular', { params: { page } }),

  // Get top rated movies
  getTopRated: (page = 1) => 
    tmdbApi.get('/movie/top_rated', { params: { page } }),

  // Get upcoming movies
  getUpcoming: (page = 1) => 
    tmdbApi.get('/movie/upcoming', { params: { page } }),

  // Get movie details
  getDetails: (id) => 
    tmdbApi.get(`/movie/${id}`, {
      params: { append_to_response: 'credits,videos' }
    }),

  // Search movies
  search: (query, page = 1) => 
    tmdbApi.get('/search/movie', { 
      params: { query, page } 
    }),

  // Get movie credits
  getCredits: (id) => 
    tmdbApi.get(`/movie/${id}/credits`),
}

export default tmdbApi
// src/i18n/index.js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      // Nav
      home: 'Home', movies: 'Movies', series: 'Series',
      watchlist: 'My List', search: 'Search', profile: 'Profile',
      signIn: 'Sign In', signUp: 'Sign Up', signOut: 'Sign Out',
      // Hero
      watchNow: 'Watch Now', addToList: 'Add to List', removeFromList: 'Remove',
      moreInfo: 'More Info', continueWatching: 'Continue Watching',
      // Content
      trending: 'Trending Now', newReleases: 'New Releases',
      topRated: 'Top Rated', recommended: 'Recommended for You',
      myList: 'My List', popularMovies: 'Popular Movies',
      popularSeries: 'Popular Series',
      // Details
      cast: 'Cast', director: 'Director', genres: 'Genres',
      release: 'Release Year', duration: 'Duration', episodes: 'Episodes',
      season: 'Season', episode: 'Episode', trailer: 'Watch Trailer',
      rating: 'Rating', rateThis: 'Rate this',
      // Auth
      email: 'Email', password: 'Password', name: 'Full Name',
      forgotPassword: 'Forgot password?', orContinueWith: 'or continue with',
      noAccount: "Don't have an account?", haveAccount: 'Already have an account?',
      // Admin
      dashboard: 'Dashboard', manageContent: 'Manage Content',
      manageUsers: 'Manage Users', addContent: 'Add Content',
      editContent: 'Edit Content', deleteContent: 'Delete',
      published: 'Published', draft: 'Draft', totalViews: 'Total Views',
      uploadVideo: 'Upload Video', uploadPoster: 'Upload Poster',
      youtubeUrl: 'YouTube URL', title: 'Title', description: 'Description',
      type: 'Type', movie: 'Movie', serie: 'Series', genre: 'Genre',
      year: 'Year', minutes: 'min', save: 'Save', cancel: 'Cancel',
      confirmDelete: 'Are you sure you want to delete this?',
      // Misc
      noResults: 'No results found', loading: 'Loading...',
      error: 'Something went wrong', retry: 'Try again',
      min: 'min', seasons: 'seasons',
    }
  },
  es: {
    translation: {
      home: 'Inicio', movies: 'Películas', series: 'Series',
      watchlist: 'Mi Lista', search: 'Buscar', profile: 'Perfil',
      signIn: 'Iniciar sesión', signUp: 'Registrarse', signOut: 'Cerrar sesión',
      watchNow: 'Ver ahora', addToList: 'Agregar a mi lista', removeFromList: 'Quitar',
      moreInfo: 'Más info', continueWatching: 'Continuar viendo',
      trending: 'Tendencias', newReleases: 'Nuevos lanzamientos',
      topRated: 'Mejor valorados', recommended: 'Recomendados para ti',
      myList: 'Mi lista', popularMovies: 'Películas populares',
      popularSeries: 'Series populares',
      cast: 'Reparto', director: 'Director', genres: 'Géneros',
      release: 'Año de estreno', duration: 'Duración', episodes: 'Episodios',
      season: 'Temporada', episode: 'Episodio', trailer: 'Ver tráiler',
      rating: 'Valoración', rateThis: 'Valorar',
      email: 'Correo electrónico', password: 'Contraseña', name: 'Nombre completo',
      forgotPassword: '¿Olvidaste tu contraseña?', orContinueWith: 'o continuar con',
      noAccount: '¿No tienes cuenta?', haveAccount: '¿Ya tienes cuenta?',
      dashboard: 'Panel', manageContent: 'Gestionar contenido',
      manageUsers: 'Gestionar usuarios', addContent: 'Agregar contenido',
      editContent: 'Editar contenido', deleteContent: 'Eliminar',
      published: 'Publicado', draft: 'Borrador', totalViews: 'Vistas totales',
      uploadVideo: 'Subir video', uploadPoster: 'Subir póster',
      youtubeUrl: 'URL de YouTube', title: 'Título', description: 'Descripción',
      type: 'Tipo', movie: 'Película', serie: 'Serie', genre: 'Género',
      year: 'Año', minutes: 'min', save: 'Guardar', cancel: 'Cancelar',
      confirmDelete: '¿Seguro que quieres eliminar esto?',
      noResults: 'Sin resultados', loading: 'Cargando...',
      error: 'Algo salió mal', retry: 'Intentar de nuevo',
      min: 'min', seasons: 'temporadas',
    }
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('lang') || 'es',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

export default i18n

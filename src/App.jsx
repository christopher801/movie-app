// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages
import LandingPage   from './pages/user/LandingPage'
import HomePage      from './pages/user/HomePage'
import MoviesPage    from './pages/user/MoviesPage'
import SeriesPage    from './pages/user/SeriesPage'
import ContentDetail from './pages/user/ContentDetail'
import WatchPage     from './pages/user/WatchPage'
import WatchlistPage from './pages/user/WatchlistPage'
import SearchPage    from './pages/user/SearchPage'
import ProfilePage   from './pages/user/ProfilePage'
import AuthPage      from './pages/user/AuthPage'

// Admin
import AdminLayout    from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminContents  from './pages/admin/AdminContents'
import AdminUsers     from './pages/admin/AdminUsers'
import ContentForm    from './pages/admin/ContentForm'

// ── Guards ────────────────────────────────────────────────────────

// Redirige vers /home si déjà connecté, sinon affiche le contenu
const PublicOnlyRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? <Navigate to="/home" replace /> : children
}

// Redirige vers / (landing) si pas connecté
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/" replace />
}

// Redirige vers /auth si pas connecté, vers / si pas admin
const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth()
  if (!user)    return <Navigate to="/auth"  replace />
  if (!isAdmin) return <Navigate to="/home"  replace />
  return children
}

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>

      {/* Landing — seulement si pas connecté */}
      <Route path="/" element={
        <PublicOnlyRoute><LandingPage /></PublicOnlyRoute>
      } />

      {/* Auth — seulement si pas connecté */}
      <Route path="/auth" element={
        <PublicOnlyRoute><AuthPage /></PublicOnlyRoute>
      } />

      {/* Home — protégé */}
      <Route path="/home" element={
        <ProtectedRoute><HomePage /></ProtectedRoute>
      } />

      {/* Contenu — protégé */}
      <Route path="/movies"      element={<ProtectedRoute><MoviesPage    /></ProtectedRoute>} />
      <Route path="/series"      element={<ProtectedRoute><SeriesPage    /></ProtectedRoute>} />
      <Route path="/search"      element={<ProtectedRoute><SearchPage    /></ProtectedRoute>} />
      <Route path="/content/:id" element={<ProtectedRoute><ContentDetail /></ProtectedRoute>} />
      <Route path="/watch/:id"   element={<ProtectedRoute><WatchPage     /></ProtectedRoute>} />
      <Route path="/watchlist"   element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
      <Route path="/profile"     element={<ProtectedRoute><ProfilePage   /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index                    element={<AdminDashboard />} />
        <Route path="contents"          element={<AdminContents  />} />
        <Route path="contents/new"      element={<ContentForm    />} />
        <Route path="contents/edit/:id" element={<ContentForm    />} />
        <Route path="users"             element={<AdminUsers     />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

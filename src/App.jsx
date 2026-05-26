// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// User pages
import HomePage       from './pages/user/HomePage'
import MoviesPage     from './pages/user/MoviesPage'
import SeriesPage     from './pages/user/SeriesPage'
import ContentDetail  from './pages/user/ContentDetail'
import WatchPage      from './pages/user/WatchPage'
import WatchlistPage  from './pages/user/WatchlistPage'
import SearchPage     from './pages/user/SearchPage'
import ProfilePage    from './pages/user/ProfilePage'
import AuthPage       from './pages/user/AuthPage'

// Admin pages
import AdminLayout    from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminContents  from './pages/admin/AdminContents'
import AdminUsers     from './pages/admin/AdminUsers'
import ContentForm    from './pages/admin/ContentForm'

// Guards
const PrivateRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/auth" replace />
}

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth()
  if (!user)    return <Navigate to="/auth"  replace />
  if (!isAdmin) return <Navigate to="/"      replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/auth" element={<AuthPage />} />

      {/* User */}
      <Route path="/"         element={<HomePage />} />
      <Route path="/movies"   element={<MoviesPage />} />
      <Route path="/series"   element={<SeriesPage />} />
      <Route path="/search"   element={<SearchPage />} />
      <Route path="/content/:id" element={<ContentDetail />} />

      <Route path="/watch/:id"      element={<PrivateRoute><WatchPage /></PrivateRoute>} />
      <Route path="/watchlist"      element={<PrivateRoute><WatchlistPage /></PrivateRoute>} />
      <Route path="/profile"        element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index                        element={<AdminDashboard />} />
        <Route path="contents"              element={<AdminContents />} />
        <Route path="contents/new"          element={<ContentForm />} />
        <Route path="contents/edit/:id"     element={<ContentForm />} />
        <Route path="users"                 element={<AdminUsers />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

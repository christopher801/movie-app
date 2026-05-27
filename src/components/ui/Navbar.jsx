// src/components/ui/Navbar.jsx
import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import {
  MdSearch, MdBookmark, MdPerson, MdOutlineAdminPanelSettings,
  MdMenu, MdClose, MdLogout
} from 'react-icons/md'
import i18n from '../../i18n'

export default function Navbar() {
  const { t }    = useTranslation()
  const { user, profile, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const [lang,     setLang]     = useState(i18n.language)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Después de logout → landing page
  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const toggleLang = () => {
    const next = lang === 'es' ? 'en' : 'es'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
    setLang(next)
  }

  const nl  = 'text-dark-200 hover:text-white text-sm font-medium transition-colors duration-200'
  const anl = 'text-white font-semibold'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-dark-950/95 backdrop-blur-sm shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo → /home (ya está autenticado si ve la navbar) */}
          <Link to="/home" className="flex items-center gap-2 shrink-0">
            <span className="font-display text-3xl text-brand-500 tracking-wide leading-none">STREAM</span>
            <span className="font-display text-3xl text-white tracking-wide leading-none">VOX</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/home"      className={({ isActive }) => isActive ? anl : nl} end>{t('home')}</NavLink>
            <NavLink to="/movies"    className={({ isActive }) => isActive ? anl : nl}>{t('movies')}</NavLink>
            <NavLink to="/series"    className={({ isActive }) => isActive ? anl : nl}>{t('series')}</NavLink>
            <NavLink to="/watchlist" className={({ isActive }) => isActive ? anl : nl}>{t('watchlist')}</NavLink>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link to="/search" className="text-dark-200 hover:text-white transition-colors p-1.5">
              <MdSearch size={22} />
            </Link>

            {/* Lang toggle */}
            <button
              onClick={toggleLang}
              className="text-xs font-mono font-medium text-dark-200 hover:text-white border border-dark-500 hover:border-dark-300 px-2 py-1 rounded transition-all"
            >
              {lang.toUpperCase()}
            </button>

            {/* User dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(p => !p)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-semibold">
                    {profile?.displayName?.[0]?.toUpperCase() || '?'}
                  </div>
                </button>

                {dropOpen && (
                  <div className="absolute right-0 top-11 w-52 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-dark-600">
                      <p className="text-sm font-medium truncate">{profile?.displayName}</p>
                      <p className="text-xs text-dark-300 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-100 hover:bg-dark-700 hover:text-white transition-colors">
                        <MdPerson size={16} /> {t('profile')}
                      </Link>
                      <Link to="/watchlist" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-100 hover:bg-dark-700 hover:text-white transition-colors">
                        <MdBookmark size={16} /> {t('watchlist')}
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setDropOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-400 hover:bg-dark-700 hover:text-brand-300 transition-colors">
                          <MdOutlineAdminPanelSettings size={16} /> Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-100 hover:bg-dark-700 hover:text-white transition-colors w-full text-left">
                        <MdLogout size={16} /> {t('signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button className="md:hidden text-white p-1" onClick={() => setMenuOpen(p => !p)}>
              {menuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-dark-700 mt-2 pt-4 animate-fade-in">
            <div className="flex flex-col gap-3">
              <NavLink to="/home"      onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? anl : nl} end>{t('home')}</NavLink>
              <NavLink to="/movies"    onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? anl : nl}>{t('movies')}</NavLink>
              <NavLink to="/series"    onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? anl : nl}>{t('series')}</NavLink>
              <NavLink to="/watchlist" onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? anl : nl}>{t('watchlist')}</NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

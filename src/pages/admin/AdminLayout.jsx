// src/pages/admin/AdminLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  MdDashboard, MdMovie, MdPeople, MdAdd,
  MdLogout, MdChevronLeft
} from 'react-icons/md'

const links = [
  { to: '/admin',           label: 'Dashboard',   icon: MdDashboard, end: true },
  { to: '/admin/contents',  label: 'Contents',    icon: MdMovie },
  { to: '/admin/users',     label: 'Users',       icon: MdPeople },
]

export default function AdminLayout() {
  const { logout, profile } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-dark-900 border-r border-dark-700 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-dark-700">
          <span className="font-display text-2xl text-brand-500">STREAM</span>
          <span className="font-display text-2xl text-white">VOX</span>
          <p className="text-xs text-dark-400 mt-0.5 font-mono">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                    : 'text-dark-300 hover:bg-dark-700 hover:text-white'
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}

          <NavLink
            to="/admin/contents/new"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mt-4 ${
                isActive ? 'bg-brand-600 text-white' : 'bg-dark-700 hover:bg-dark-600 text-dark-200 hover:text-white'
              }`
            }
          >
            <MdAdd size={18} /> Add Content
          </NavLink>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-dark-700 space-y-1">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-white truncate">{profile?.displayName}</p>
            <p className="text-xs text-dark-400 font-mono">admin</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-dark-300 hover:bg-dark-700 hover:text-white transition-all w-full"
          >
            <MdChevronLeft size={18} /> Back to site
          </button>
          <button
            onClick={() => logout().then(() => navigate('/auth'))}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-dark-300 hover:bg-dark-700 hover:text-brand-400 transition-all w-full"
          >
            <MdLogout size={18} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

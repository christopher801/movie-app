// src/pages/admin/AdminLayout.jsx
import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  MdDashboard, MdMovie, MdPeople, MdAdd,
  MdLogout, MdChevronLeft, MdMenu, MdClose
} from 'react-icons/md'

const links = [
  { to: '/admin',          label: 'Dashboard', icon: MdDashboard, end: true },
  { to: '/admin/contents', label: 'Contents',  icon: MdMovie },
  { to: '/admin/users',    label: 'Users',     icon: MdPeople },
]

export default function AdminLayout() {
  const { logout, profile } = useAuth()
  const navigate            = useNavigate()
  const [open, setOpen]     = useState(false)

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
        : 'text-dark-300 hover:bg-dark-700 hover:text-white'
    }`

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-dark-700 flex items-center justify-between">
        <div>
          <span className="font-display text-2xl text-brand-500">STREAM</span>
          <span className="font-display text-2xl text-white">VOX</span>
          <p className="text-xs text-dark-400 mt-0.5 font-mono">Admin Panel</p>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setOpen(false)}
          className="md:hidden w-8 h-8 flex items-center justify-center
                     rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-all"
        >
          <MdClose size={20} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={() => setOpen(false)}
            className={navLinkClass}
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}

        <NavLink
          to="/admin/contents/new"
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mt-4 ${
              isActive
                ? 'bg-brand-600 text-white'
                : 'bg-dark-700 hover:bg-dark-600 text-dark-200 hover:text-white'
            }`
          }
        >
          <MdAdd size={18} /> Add Content
        </NavLink>
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-dark-700 space-y-1 shrink-0">
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-white truncate">{profile?.displayName}</p>
          <p className="text-xs text-dark-400 font-mono">admin</p>
        </div>
        <button
          onClick={() => { navigate('/home'); setOpen(false) }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-dark-300
                     hover:bg-dark-700 hover:text-white transition-all w-full"
        >
          <MdChevronLeft size={18} /> Back to site
        </button>
        <button
          onClick={() => logout().then(() => navigate('/auth'))}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-dark-300
                     hover:bg-dark-700 hover:text-brand-400 transition-all w-full"
        >
          <MdLogout size={18} /> Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-dark-950 flex">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-56 bg-dark-900 border-r border-dark-700 flex-col shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer sidebar ── */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-64 z-50
        bg-dark-900 border-r border-dark-700
        flex flex-col
        transition-transform duration-300 ease-in-out
        md:hidden
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3
                           bg-dark-900 border-b border-dark-700 sticky top-0 z-30">
          <button
            onClick={() => setOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg
                       text-dark-300 hover:text-white hover:bg-dark-700 transition-all"
          >
            <MdMenu size={22} />
          </button>
          <div>
            <span className="font-display text-xl text-brand-500">STREAM</span>
            <span className="font-display text-xl text-white">VOX</span>
          </div>
          <span className="text-xs text-dark-400 font-mono ml-1 mt-1">Admin</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

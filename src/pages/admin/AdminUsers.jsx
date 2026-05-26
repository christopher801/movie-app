// src/pages/admin/AdminUsers.jsx
import { useState, useEffect } from 'react'
import { onUsersChange, updateUserProfile } from '../../services/firestore'
import toast from 'react-hot-toast'
import { MdPeople, MdSearch, MdShield, MdOutlineShield } from 'react-icons/md'
import { format } from 'date-fns'

export default function AdminUsers() {
  const [users,   setUsers]   = useState([])
  const [query,   setQuery]   = useState('')
  const [filter,  setFilter]  = useState('all')

  useEffect(() => {
    const unsub = onUsersChange(setUsers)
    return unsub
  }, [])

  const toggleRole = async (user) => {
    const next = user.role === 'admin' ? 'user' : 'admin'
    if (!confirm(`Set ${user.displayName} as ${next}?`)) return
    await updateUserProfile(user.id, { role: next })
    toast.success(`Role updated to ${next}`)
  }

  const filtered = users
    .filter(u => filter === 'all' || u.role === filter)
    .filter(u => !query ||
      u.displayName?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase())
    )

  const adminCount = users.filter(u => u.role === 'admin').length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wider text-white">USERS</h1>
        <p className="text-dark-400 text-sm mt-1">
          {users.length} total · {adminCount} admin{adminCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search users..." className="input-dark pl-9 text-sm py-2" />
        </div>
        {['all','user','admin'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-900">
            <tr>
              {['User','Joined','Watchlist','Role','Actions'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-mono uppercase tracking-wider text-dark-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-dark-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-600/80 flex items-center justify-center text-sm font-semibold shrink-0">
                      {u.displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{u.displayName || 'No name'}</p>
                      <p className="text-xs text-dark-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-dark-300">
                  {u.createdAt?.toDate
                    ? format(u.createdAt.toDate(), 'MMM d, yyyy')
                    : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-dark-300">
                  {u.watchlist?.length || 0} items
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${u.role === 'admin' ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30' : 'bg-dark-600 text-dark-300'}`}>
                    {u.role || 'user'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleRole(u)}
                    title={u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                      u.role === 'admin'
                        ? 'text-brand-400 hover:bg-brand-500/10'
                        : 'text-dark-400 hover:text-white hover:bg-dark-600'
                    }`}
                  >
                    {u.role === 'admin' ? <MdShield size={18} /> : <MdOutlineShield  size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-dark-400">
            <MdPeople size={40} className="mx-auto mb-3 opacity-20" />
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  )
}

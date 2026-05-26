// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAdminStats, onContentsChange } from '../../services/firestore'
import { MdMovie, MdPeople, MdPublish, MdTrendingUp, MdAdd, MdVisibility } from 'react-icons/md'

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [recent,  setRecent]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats().then(s => { setStats(s); setLoading(false) })

    const unsub = onContentsChange(contents => {
      setRecent(contents.slice(0, 8))
    })
    return unsub
  }, [])

  const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-3xl font-display tracking-wider text-white mb-1">
        {loading ? <span className="skeleton h-8 w-16 block rounded" /> : value}
      </p>
      <p className="text-sm text-dark-400">{label}</p>
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl tracking-wider text-white">DASHBOARD</h1>
          <p className="text-dark-400 text-sm mt-1">StreamVox admin panel</p>
        </div>
        <Link to="/admin/contents/new" className="btn-brand flex items-center gap-2">
          <MdAdd size={18} /> Add Content
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Contents" value={stats?.totalContents} icon={MdMovie}      color="bg-brand-600/20 text-brand-400" />
        <StatCard label="Published"      value={stats?.publishedCount} icon={MdPublish}   color="bg-green-600/20 text-green-400" />
        <StatCard label="Total Users"    value={stats?.totalUsers}     icon={MdPeople}    color="bg-blue-600/20 text-blue-400" />
        <StatCard label="Drafts"         value={stats ? stats.totalContents - stats.publishedCount : 0}
          icon={MdTrendingUp} color="bg-yellow-600/20 text-yellow-400" />
      </div>

      {/* Recent content */}
      <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
          <h2 className="font-medium">Recent content</h2>
          <Link to="/admin/contents" className="text-sm text-brand-400 hover:text-brand-300">View all →</Link>
        </div>

        <table className="w-full">
          <thead className="bg-dark-900">
            <tr>
              {['Title','Type','Status','Views','Rating'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-mono uppercase tracking-wider text-dark-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {recent.map(c => (
              <tr key={c.id} className="hover:bg-dark-700 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={c.posterUrl || `https://via.placeholder.com/40x60/1e1e1e/555`} alt=""
                      className="w-8 aspect-[2/3] object-cover rounded" />
                    <div>
                      <p className="font-medium text-sm truncate max-w-xs">{c.title}</p>
                      <p className="text-xs text-dark-400">{c.year}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${c.type === 'movie' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {c.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${c.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-dark-300">
                  <span className="flex items-center gap-1"><MdVisibility size={14} /> {c.views || 0}</span>
                </td>
                <td className="px-6 py-4 text-sm text-yellow-400">
                  {c.rating > 0 ? `★ ${c.rating.toFixed(1)}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

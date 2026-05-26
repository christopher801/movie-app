// src/pages/admin/AdminContents.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { onContentsChange, deleteContent, updateContent } from '../../services/firestore'
import toast from 'react-hot-toast'
import { MdEdit, MdDelete, MdAdd, MdVisibility, MdPublish, MdUnpublished, MdSearch, MdMovie } from 'react-icons/md'

export default function AdminContents() {
  const [contents, setContents] = useState([])
  const [query,    setQuery]    = useState('')
  const [filter,   setFilter]   = useState('all')

  useEffect(() => {
    const unsub = onContentsChange(setContents)
    return unsub
  }, [])

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return
    await deleteContent(id)
    toast.success('Deleted')
  }

  const toggleStatus = async (c) => {
    const next = c.status === 'published' ? 'draft' : 'published'
    await updateContent(c.id, { ...c, status: next })
    toast.success(`Marked as ${next}`)
  }

  const filtered = contents
    .filter(c => filter === 'all' || c.type === filter || c.status === filter)
    .filter(c => !query || c.title.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl tracking-wider text-white">CONTENTS</h1>
          <p className="text-dark-400 text-sm mt-1">{contents.length} total items</p>
        </div>
        <Link to="/admin/contents/new" className="btn-brand flex items-center gap-2">
          <MdAdd size={18} /> Add Content
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search titles..."
            className="input-dark pl-9 text-sm py-2"
          />
        </div>
        {['all','movie','series','published','draft'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-900">
            <tr>
              {['Content','Type','Status','Views','Rating','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-dark-400 first:pl-6 last:pr-6">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-dark-700/50 transition-colors">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.posterUrl || `https://via.placeholder.com/40x60/1e1e1e/555?text=?`}
                      alt="" className="w-8 aspect-[2/3] object-cover rounded shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate max-w-xs">{c.title}</p>
                      <p className="text-xs text-dark-400">{c.year}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${c.type === 'movie' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {c.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${c.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-dark-300">
                  <span className="flex items-center gap-1"><MdVisibility size={14} /> {c.views || 0}</span>
                </td>
                <td className="px-4 py-3 text-sm text-yellow-400">
                  {c.rating > 0 ? `★ ${c.rating.toFixed(1)}` : '—'}
                </td>
                <td className="px-4 pr-6 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(c)}
                      title={c.status === 'published' ? 'Unpublish' : 'Publish'}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        c.status === 'published' ? 'text-green-400 hover:bg-green-500/10' : 'text-yellow-400 hover:bg-yellow-500/10'
                      }`}
                    >
                      {c.status === 'published' ? <MdPublish size={16} /> : <MdUnpublished size={16} />}
                    </button>
                    <Link
                      to={`/admin/contents/edit/${c.id}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-300 hover:text-white hover:bg-dark-600 transition-colors"
                    >
                      <MdEdit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(c.id, c.title)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-400 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-dark-400">
            <MdMovie size={40} className="mx-auto mb-3 opacity-20" />
            <p>No content found</p>
          </div>
        )}
      </div>
    </div>
  )
}

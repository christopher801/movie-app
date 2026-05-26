// src/pages/admin/ContentForm.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  getContentById, addContent, updateContent,
  getEpisodes, addEpisode, updateEpisode, deleteEpisode, getGenres, addGenre
} from '../../services/firestore'
import { uploadToCloudinary } from '../../services/cloudinary'
import toast from 'react-hot-toast'
import {
  MdCloudUpload, MdYoutubeSearchedFor, MdAdd, MdDelete,
  MdSave, MdArrowBack, MdEdit, MdMovie, MdTv
} from 'react-icons/md'

const GENRE_LIST = [
  'Action','Adventure','Animation','Comedy','Crime','Documentary',
  'Drama','Fantasy','Horror','Mystery','Romance','Sci-Fi','Thriller','Western'
]

export default function ContentForm() {
  const { id }     = useParams()
  const isEdit     = Boolean(id)
  const navigate   = useNavigate()
  const { t }      = useTranslation()

  const [form, setForm] = useState({
    title: '', description: '', type: 'movie', year: new Date().getFullYear(),
    duration: '', genres: [], director: '', cast: '',
    status: 'draft', featured: false,
    // Media
    posterUrl: '', backdropUrl: '', trailerUrl: '',
    videoCloudinaryId: '', youtubeUrl: '',
  })

  const [episodes,     setEpisodes]     = useState([])
  const [newEp,        setNewEp]        = useState({ season: 1, episode: 1, title: '', description: '', duration: '', youtubeUrl: '', videoCloudinaryId: '' })
  const [editingEp,    setEditingEp]    = useState(null)
  const [showEpForm,   setShowEpForm]   = useState(false)

  // Upload states
  const [posterUpload,  setPosterUpload]  = useState({ progress: 0, loading: false })
  const [backdropUpload, setBackdropUpload] = useState({ progress: 0, loading: false })
  const [videoUpload,   setVideoUpload]   = useState({ progress: 0, loading: false })
  const [epVideoUpload, setEpVideoUpload] = useState({ progress: 0, loading: false })

  const [saving,   setSaving]   = useState(false)
  const [loading,  setLoading]  = useState(isEdit)
  const [videoMode, setVideoMode] = useState('youtube') // 'youtube' | 'cloudinary'
  const [epVideoMode, setEpVideoMode] = useState('youtube')

  useEffect(() => {
    if (!isEdit) return
    const load = async () => {
      const content = await getContentById(id)
      if (content) {
        setForm(content)
        setVideoMode(content.youtubeUrl ? 'youtube' : 'cloudinary')
        if (content.type === 'series') {
          const eps = await getEpisodes(id)
          setEpisodes(eps)
        }
      }
      setLoading(false)
    }
    load()
  }, [id, isEdit])

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const toggleGenre = (g) => {
    setForm(p => ({
      ...p,
      genres: p.genres.includes(g) ? p.genres.filter(x => x !== g) : [...p.genres, g]
    }))
  }

  // ── Upload helpers ──────────────────────────────────────────────
  const handleImageUpload = async (file, field, setUpload) => {
    if (!file) return
    setUpload({ progress: 0, loading: true })
    try {
      const res = await uploadToCloudinary(
        file,
        (p) => setUpload({ progress: p, loading: true }),
        'image'
      )
      set(field, res.secure_url)
      toast.success('Image uploaded')
    } catch (e) { toast.error(e.message) }
    setUpload({ progress: 0, loading: false })
  }

  const handleVideoUpload = async (file) => {
    if (!file) return
    setVideoUpload({ progress: 0, loading: true })
    try {
      const res = await uploadToCloudinary(
        file,
        (p) => setVideoUpload({ progress: p, loading: true }),
        'video'
      )
      set('videoCloudinaryId', res.public_id)
      set('youtubeUrl', '')
      toast.success('Video uploaded')
    } catch (e) { toast.error(e.message) }
    setVideoUpload({ progress: 0, loading: false })
  }

  const handleEpVideoUpload = async (file) => {
    if (!file) return
    setEpVideoUpload({ progress: 0, loading: true })
    try {
      const res = await uploadToCloudinary(
        file,
        (p) => setEpVideoUpload({ progress: p, loading: true }),
        'video'
      )
      const target = editingEp ? setEditingEp : setNewEp
      target(p => ({ ...p, videoCloudinaryId: res.public_id, youtubeUrl: '' }))
      toast.success('Episode video uploaded')
    } catch (e) { toast.error(e.message) }
    setEpVideoUpload({ progress: 0, loading: false })
  }

  // ── Save main content ───────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const data = {
        ...form,
        year: parseInt(form.year),
        duration: form.duration ? parseInt(form.duration) : null,
      }
      if (videoMode === 'youtube') data.videoCloudinaryId = ''
      else data.youtubeUrl = ''

      if (isEdit) await updateContent(id, data)
      else        await addContent(data)

      toast.success(isEdit ? 'Updated!' : 'Content added!')
      navigate('/admin/contents')
    } catch (e) { toast.error(e.message) }
    setSaving(false)
  }

  // ── Episode CRUD ────────────────────────────────────────────────
  const handleAddEpisode = async () => {
    if (!newEp.title) { toast.error('Episode title required'); return }
    try {
      const epData = { ...newEp, season: parseInt(newEp.season), episode: parseInt(newEp.episode) }
      if (epVideoMode === 'youtube') epData.videoCloudinaryId = ''
      else epData.youtubeUrl = ''
      const epId = await addEpisode(id, epData)
      setEpisodes(p => [...p, { id: epId, ...epData }])
      setNewEp({ season: 1, episode: episodes.length + 2, title: '', description: '', duration: '', youtubeUrl: '', videoCloudinaryId: '' })
      setShowEpForm(false)
      toast.success('Episode added')
    } catch (e) { toast.error(e.message) }
  }

  const handleUpdateEpisode = async () => {
    if (!editingEp) return
    try {
      await updateEpisode(id, editingEp.id, editingEp)
      setEpisodes(p => p.map(e => e.id === editingEp.id ? editingEp : e))
      setEditingEp(null)
      toast.success('Episode updated')
    } catch (e) { toast.error(e.message) }
  }

  const handleDeleteEpisode = async (epId, title) => {
    if (!confirm(`Delete episode "${title}"?`)) return
    await deleteEpisode(id, epId)
    setEpisodes(p => p.filter(e => e.id !== epId))
    toast.success('Episode deleted')
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const UploadProgress = ({ state, label }) => state.loading ? (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-dark-300 mb-1">
        <span>{label}</span><span>{state.progress}%</span>
      </div>
      <div className="h-1 bg-dark-600 rounded-full overflow-hidden">
        <div className="h-full bg-brand-500 rounded-full transition-all duration-200" style={{ width: `${state.progress}%` }} />
      </div>
    </div>
  ) : null

  const InputField = ({ label, value, onChange, type = 'text', placeholder, className = '' }) => (
    <div className={className}>
      <label className="block text-xs font-mono uppercase tracking-wider text-dark-400 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} className="input-dark text-sm" />
    </div>
  )

  const EpisodeForm = ({ ep, setEp, onSave, onCancel, label, epVidMode, setEpVidMode }) => (
    <div className="bg-dark-700 border border-dark-500 rounded-xl p-5 space-y-4">
      <h4 className="font-medium text-sm">{label}</h4>
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Season" value={ep.season} onChange={v => setEp(p => ({ ...p, season: v }))} type="number" />
        <InputField label="Episode #" value={ep.episode} onChange={v => setEp(p => ({ ...p, episode: v }))} type="number" />
      </div>
      <InputField label="Title" value={ep.title} onChange={v => setEp(p => ({ ...p, title: v }))} />
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-dark-400 mb-1.5">Description</label>
        <textarea value={ep.description} onChange={e => setEp(p => ({ ...p, description: e.target.value }))}
          rows={2} className="input-dark text-sm resize-none" />
      </div>
      <InputField label="Duration (min)" value={ep.duration} onChange={v => setEp(p => ({ ...p, duration: v }))} type="number" />

      {/* Episode video */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-dark-400 mb-2">Video Source</label>
        <div className="flex gap-2 mb-3">
          {['youtube','cloudinary'].map(m => (
            <button key={m} type="button" onClick={() => setEpVidMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${epVidMode === m ? 'bg-brand-600 text-white' : 'bg-dark-600 text-dark-300 hover:bg-dark-500'}`}>
              {m}
            </button>
          ))}
        </div>
        {epVidMode === 'youtube' ? (
          <input type="url" value={ep.youtubeUrl} onChange={e => setEp(p => ({ ...p, youtubeUrl: e.target.value, videoCloudinaryId: '' }))}
            placeholder="https://youtube.com/watch?v=..." className="input-dark text-sm" />
        ) : (
          <div>
            <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-dark-500 hover:border-brand-500 rounded-xl p-4 transition-colors">
              <MdCloudUpload size={20} className="text-dark-400" />
              <span className="text-sm text-dark-300">Upload episode video</span>
              <input type="file" accept="video/*" className="hidden"
                onChange={e => e.target.files[0] && handleEpVideoUpload(e.target.files[0])} />
            </label>
            {ep.videoCloudinaryId && (
              <p className="text-xs text-green-400 mt-1">✓ Video uploaded: {ep.videoCloudinaryId.slice(-20)}</p>
            )}
            <UploadProgress state={epVideoUpload} label="Uploading episode video..." />
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onSave} className="btn-brand text-sm py-2 flex items-center gap-1">
          <MdSave size={16} /> {label.includes('Add') ? 'Add Episode' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost text-sm py-2">{t('cancel')}</button>
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin/contents')} className="text-dark-300 hover:text-white transition-colors">
          <MdArrowBack size={22} />
        </button>
        <div>
          <h1 className="font-display text-3xl tracking-wider text-white">
            {isEdit ? 'EDIT CONTENT' : 'ADD CONTENT'}
          </h1>
          <p className="text-dark-400 text-sm mt-0.5">
            {isEdit ? `Editing: ${form.title}` : 'Create a new movie or series'}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Type selector */}
        <section className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <h2 className="text-sm font-mono uppercase tracking-wider text-dark-400 mb-4">Content Type</h2>
          <div className="flex gap-3">
            {[['movie','Movie', MdMovie],['series','Series', MdTv]].map(([val, label, Icon]) => (
              <button key={val} type="button" onClick={() => set('type', val)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 font-medium transition-all ${
                  form.type === val ? 'border-brand-500 bg-brand-600/10 text-brand-400' : 'border-dark-600 text-dark-300 hover:border-dark-400'
                }`}>
                <Icon size={20} /> {label}
              </button>
            ))}
          </div>
        </section>

        {/* Basic info */}
        <section className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-wider text-dark-400 mb-2">Basic Information</h2>

          <InputField label="Title *" value={form.title} onChange={v => set('title', v)} placeholder="Enter title..." />

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-dark-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={4} placeholder="Synopsis..." className="input-dark text-sm resize-none" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InputField label="Year" value={form.year} onChange={v => set('year', v)} type="number" />
            {form.type === 'movie' && (
              <InputField label="Duration (min)" value={form.duration} onChange={v => set('duration', v)} type="number" placeholder="120" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Director" value={form.director} onChange={v => set('director', v)} placeholder="Name..." />
            <InputField label="Cast" value={form.cast} onChange={v => set('cast', v)} placeholder="Actor 1, Actor 2..." />
          </div>
        </section>

        {/* Genres */}
        <section className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
          <h2 className="text-sm font-mono uppercase tracking-wider text-dark-400 mb-4">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {GENRE_LIST.map(g => (
              <button key={g} type="button" onClick={() => toggleGenre(g)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  form.genres.includes(g) ? 'bg-brand-600 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
                }`}>
                {g}
              </button>
            ))}
          </div>
        </section>

        {/* Media - Images */}
        <section className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-mono uppercase tracking-wider text-dark-400">Images</h2>

          {/* Poster */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-dark-400 mb-2">Poster (2:3)</label>
            <div className="flex gap-4 items-start">
              {form.posterUrl && (
                <img src={form.posterUrl} alt="poster" className="w-20 aspect-[2/3] object-cover rounded-lg shrink-0" />
              )}
              <div className="flex-1 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-dark-500 hover:border-brand-500 rounded-xl p-4 transition-colors">
                  <MdCloudUpload size={20} className="text-dark-400" />
                  <span className="text-sm text-dark-300">Upload poster image</span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0], 'posterUrl', setPosterUpload)} />
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-dark-600" />
                  <span className="text-xs text-dark-500">or URL</span>
                  <div className="flex-1 h-px bg-dark-600" />
                </div>
                <input type="url" value={form.posterUrl} onChange={e => set('posterUrl', e.target.value)}
                  placeholder="https://..." className="input-dark text-sm" />
                <UploadProgress state={posterUpload} label="Uploading poster..." />
              </div>
            </div>
          </div>

          {/* Backdrop */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-dark-400 mb-2">Backdrop (16:9)</label>
            <div className="space-y-2">
              {form.backdropUrl && (
                <img src={form.backdropUrl} alt="backdrop" className="w-full h-32 object-cover rounded-lg" />
              )}
              <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-dark-500 hover:border-brand-500 rounded-xl p-4 transition-colors">
                <MdCloudUpload size={20} className="text-dark-400" />
                <span className="text-sm text-dark-300">Upload backdrop image</span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0], 'backdropUrl', setBackdropUpload)} />
              </label>
              <input type="url" value={form.backdropUrl} onChange={e => set('backdropUrl', e.target.value)}
                placeholder="https://..." className="input-dark text-sm" />
              <UploadProgress state={backdropUpload} label="Uploading backdrop..." />
            </div>
          </div>

          {/* Trailer URL */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-dark-400 mb-1.5">
              <span className="flex items-center gap-1"><MdYoutubeSearchedFor size={14} /> Trailer URL (YouTube)</span>
            </label>
            <input type="url" value={form.trailerUrl} onChange={e => set('trailerUrl', e.target.value)}
              placeholder="https://youtube.com/watch?v=..." className="input-dark text-sm" />
          </div>
        </section>

        {/* Video source (only for movies, or series intro) */}
        {form.type === 'movie' && (
          <section className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-wider text-dark-400">Video Source</h2>

            <div className="flex gap-2">
              {['youtube','cloudinary'].map(m => (
                <button key={m} type="button" onClick={() => setVideoMode(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    videoMode === m ? 'bg-brand-600 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}>
                  {m === 'youtube' ? '▶ YouTube' : '☁ Cloudinary'}
                </button>
              ))}
            </div>

            {videoMode === 'youtube' ? (
              <input type="url" value={form.youtubeUrl} onChange={e => set('youtubeUrl', e.target.value)}
                placeholder="https://youtube.com/watch?v=..." className="input-dark text-sm" />
            ) : (
              <div>
                <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-dark-500 hover:border-brand-500 rounded-xl p-5 transition-colors">
                  <MdCloudUpload size={24} className="text-dark-400" />
                  <div>
                    <p className="text-sm text-dark-200">Click to upload video file</p>
                    <p className="text-xs text-dark-400 mt-0.5">MP4, MOV, AVI — up to 2GB</p>
                  </div>
                  <input type="file" accept="video/*" className="hidden"
                    onChange={e => e.target.files[0] && handleVideoUpload(e.target.files[0])} />
                </label>
                {form.videoCloudinaryId && (
                  <p className="text-xs text-green-400 mt-2">✓ Cloudinary ID: {form.videoCloudinaryId}</p>
                )}
                <UploadProgress state={videoUpload} label="Uploading video to Cloudinary..." />
              </div>
            )}
          </section>
        )}

        {/* Publish settings */}
        <section className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-wider text-dark-400">Publish Settings</h2>

          <div className="flex gap-3">
            {['draft','published'].map(s => (
              <button key={s} type="button" onClick={() => set('status', s)}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                  form.status === s
                    ? s === 'published' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                    : 'border-dark-600 text-dark-400 hover:border-dark-400'
                }`}>
                {s}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)}
              className="w-4 h-4 accent-brand-500 rounded" />
            <span className="text-sm text-dark-200">Feature on homepage hero banner</span>
          </label>
        </section>

        {/* Episodes (series only) */}
        {form.type === 'series' && isEdit && (
          <section className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-mono uppercase tracking-wider text-dark-400">
                Episodes ({episodes.length})
              </h2>
              <button type="button" onClick={() => { setShowEpForm(p => !p); setEditingEp(null) }}
                className="btn-ghost text-sm py-2 flex items-center gap-1">
                <MdAdd size={16} /> Add Episode
              </button>
            </div>

            {/* Add episode form */}
            {showEpForm && (
              <div className="mb-6">
                <EpisodeForm
                  ep={newEp} setEp={setNewEp}
                  onSave={handleAddEpisode}
                  onCancel={() => setShowEpForm(false)}
                  label="Add Episode"
                  epVidMode={epVideoMode} setEpVidMode={setEpVideoMode}
                />
              </div>
            )}

            {/* Episodes list */}
            <div className="space-y-3">
              {episodes.sort((a,b) => a.season - b.season || a.episode - b.episode).map(ep => (
                <div key={ep.id}>
                  {editingEp?.id === ep.id ? (
                    <EpisodeForm
                      ep={editingEp} setEp={setEditingEp}
                      onSave={handleUpdateEpisode}
                      onCancel={() => setEditingEp(null)}
                      label="Edit Episode"
                      epVidMode={epVideoMode} setEpVidMode={setEpVideoMode}
                    />
                  ) : (
                    <div className="flex items-center gap-4 bg-dark-700 rounded-xl p-4">
                      <div className="w-10 h-10 rounded-lg bg-dark-600 flex items-center justify-center font-mono text-sm shrink-0">
                        {ep.episode}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{ep.title}</p>
                        <p className="text-xs text-dark-400">S{ep.season} E{ep.episode} {ep.duration ? `· ${ep.duration}min` : ''}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`badge text-xs ${ep.youtubeUrl ? 'bg-red-500/20 text-red-400' : ep.videoCloudinaryId ? 'bg-blue-500/20 text-blue-400' : 'bg-dark-600 text-dark-400'}`}>
                          {ep.youtubeUrl ? 'YT' : ep.videoCloudinaryId ? 'Cloud' : 'No video'}
                        </span>
                        <button onClick={() => setEditingEp(ep)}
                          className="w-8 h-8 flex items-center justify-center text-dark-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors">
                          <MdEdit size={15} />
                        </button>
                        <button onClick={() => handleDeleteEpisode(ep.id, ep.title)}
                          className="w-8 h-8 flex items-center justify-center text-dark-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors">
                          <MdDelete size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {episodes.length === 0 && !showEpForm && (
                <p className="text-center py-8 text-dark-500 text-sm">No episodes yet. Add the first one.</p>
              )}
            </div>

            {form.type === 'series' && !isEdit && (
              <p className="text-xs text-dark-400 mt-4 text-center">
                Save the series first, then add episodes from the edit page.
              </p>
            )}
          </section>
        )}

        {form.type === 'series' && !isEdit && (
          <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-center">
            <p className="text-sm text-dark-300">💡 Save the series first, then you can add episodes from the edit page.</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-brand flex items-center gap-2 py-3 px-8 disabled:opacity-60"
          >
            {saving
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <MdSave size={18} />
            }
            {isEdit ? 'Save Changes' : 'Add Content'}
          </button>
          <button type="button" onClick={() => navigate('/admin/contents')} className="btn-ghost py-3 px-6">
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

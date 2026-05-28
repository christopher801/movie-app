// src/pages/admin/ContentForm.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  getContentById, addContent, updateContent,
  getEpisodes, addEpisode, updateEpisode, deleteEpisode, getGenres
} from '../../services/firestore'
import { uploadToCloudinary } from '../../services/cloudinary'
import toast from 'react-hot-toast'
import {
  MdCloudUpload, MdYoutubeSearchedFor, MdAdd, MdDelete,
  MdSave, MdArrowBack, MdEdit, MdMovie, MdTv
} from 'react-icons/md'

// ─────────────────────────────────────────────────────────────────
// ⚠️ InputField MUST be outside ContentForm component.
//    If defined inside, React remounts it on every render →
//    input loses focus after every keystroke.
// ─────────────────────────────────────────────────────────────────
const InputField = ({ label, value, onChange, type = 'text', placeholder, className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-mono uppercase tracking-wider text-dark-400 mb-1.5">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-dark text-sm"
    />
  </div>
)

const GENRE_LIST = [
  'Action','Adventure','Animation','Comedy','Crime','Documentary',
  'Drama','Fantasy','Horror','Mystery','Romance','Sci-Fi','Thriller','Western'
]

export default function ContentForm() {
  const { id }   = useParams()
  const isEdit   = Boolean(id)
  const navigate = useNavigate()
  const { t }    = useTranslation()

  const [form, setForm] = useState({
    title: '', description: '', type: 'movie',
    year: new Date().getFullYear(), duration: '',
    genres: [], director: '', cast: '',
    status: 'draft', featured: false,
    posterUrl: '', backdropUrl: '', trailerUrl: '',
    videoCloudinaryId: '', youtubeUrl: '',
  })

  const [episodes,     setEpisodes]     = useState([])
  const [newEp,        setNewEp]        = useState({ season: 1, episode: 1, title: '', description: '', duration: '', youtubeUrl: '', videoCloudinaryId: '' })
  const [editingEp,    setEditingEp]    = useState(null)
  const [showEpForm,   setShowEpForm]   = useState(false)

  const [posterUpload,   setPosterUpload]   = useState({ progress: 0, loading: false })
  const [backdropUpload, setBackdropUpload] = useState({ progress: 0, loading: false })
  const [videoUpload,    setVideoUpload]    = useState({ progress: 0, loading: false })
  const [epVideoUpload,  setEpVideoUpload]  = useState({ progress: 0, loading: false })

  const [saving,      setSaving]      = useState(false)
  const [loading,     setLoading]     = useState(isEdit)
  const [videoMode,   setVideoMode]   = useState('youtube')
  const [epVideoMode, setEpVideoMode] = useState('youtube')

  // ── Load existing content ───────────────────────────────────────
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

  const toggleGenre = (g) =>
    setForm(p => ({
      ...p,
      genres: p.genres.includes(g)
        ? p.genres.filter(x => x !== g)
        : [...p.genres, g]
    }))

  // ── Image upload ────────────────────────────────────────────────
  const handleImageUpload = async (file, field, setUpload) => {
    if (!file) return
    setUpload({ progress: 0, loading: true })
    try {
      const res = await uploadToCloudinary(file, p => setUpload({ progress: p, loading: true }), 'image')
      set(field, res.secure_url)
      toast.success('Image uploaded')
    } catch (e) { toast.error(e.message) }
    setUpload({ progress: 0, loading: false })
  }

  // ── Video upload ────────────────────────────────────────────────
  const handleVideoUpload = async (file) => {
    if (!file) return
    setVideoUpload({ progress: 0, loading: true })
    try {
      const res = await uploadToCloudinary(file, p => setVideoUpload({ progress: p, loading: true }), 'video')
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
      const res = await uploadToCloudinary(file, p => setEpVideoUpload({ progress: p, loading: true }), 'video')
      const setter = editingEp ? setEditingEp : setNewEp
      setter(p => ({ ...p, videoCloudinaryId: res.public_id, youtubeUrl: '' }))
      toast.success('Episode video uploaded')
    } catch (e) { toast.error(e.message) }
    setEpVideoUpload({ progress: 0, loading: false })
  }

  // ── Save ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const data = {
        ...form,
        year:     parseInt(form.year),
        duration: form.duration ? parseInt(form.duration) : null,
      }
      if (videoMode === 'youtube') data.videoCloudinaryId = ''
      else                         data.youtubeUrl = ''

      if (isEdit) await updateContent(id, data)
      else        await addContent(data)

      toast.success(isEdit ? 'Updated!' : 'Content added!')
      navigate('/admin/contents')
    } catch (e) { toast.error(e.message) }
    setSaving(false)
  }

  // ── Episodes ────────────────────────────────────────────────────
  const handleAddEpisode = async () => {
    if (!newEp.title) { toast.error('Episode title required'); return }
    try {
      const epData = { ...newEp, season: parseInt(newEp.season), episode: parseInt(newEp.episode) }
      if (epVideoMode === 'youtube') epData.videoCloudinaryId = ''
      else                           epData.youtubeUrl = ''
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
    if (!confirm(`Delete "${title}"?`)) return
    await deleteEpisode(id, epId)
    setEpisodes(p => p.filter(e => e.id !== epId))
    toast.success('Deleted')
  }

  // ── Sub-components ──────────────────────────────────────────────
  const UploadProgress = ({ state, label }) => state.loading ? (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-dark-300 mb-1">
        <span>{label}</span><span>{state.progress}%</span>
      </div>
      <div className="h-1 bg-dark-600 rounded-full overflow-hidden">
        <div className="h-full bg-brand-500 rounded-full transition-all duration-200"
          style={{ width: `${state.progress}%` }} />
      </div>
    </div>
  ) : null

  // EpisodeForm is OK inside because it doesn't contain InputField
  // and its own inputs use direct onChange without re-defining components
  const EpisodeFormInner = ({ ep, setEp, onSave, onCancel, label }) => (
    <div className="bg-dark-700 border border-dark-500 rounded-xl p-4 space-y-4">
      <h4 className="font-medium text-sm">{label}</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-dark-400 mb-1.5">Season</label>
          <input type="number" value={ep.season}
            onChange={e => setEp(p => ({ ...p, season: e.target.value }))}
            className="input-dark text-sm" />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-dark-400 mb-1.5">Episode #</label>
          <input type="number" value={ep.episode}
            onChange={e => setEp(p => ({ ...p, episode: e.target.value }))}
            className="input-dark text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-dark-400 mb-1.5">Title</label>
        <input type="text" value={ep.title}
          onChange={e => setEp(p => ({ ...p, title: e.target.value }))}
          className="input-dark text-sm" placeholder="Episode title..." />
      </div>
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-dark-400 mb-1.5">Description</label>
        <textarea value={ep.description} rows={2}
          onChange={e => setEp(p => ({ ...p, description: e.target.value }))}
          className="input-dark text-sm resize-none" />
      </div>
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-dark-400 mb-1.5">Duration (min)</label>
        <input type="number" value={ep.duration}
          onChange={e => setEp(p => ({ ...p, duration: e.target.value }))}
          className="input-dark text-sm" />
      </div>

      {/* Episode video mode */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-dark-400 mb-2">Video Source</label>
        <div className="flex gap-2 mb-3">
          {['youtube','cloudinary'].map(m => (
            <button key={m} type="button" onClick={() => setEpVideoMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                epVideoMode === m ? 'bg-brand-600 text-white' : 'bg-dark-600 text-dark-300 hover:bg-dark-500'
              }`}>
              {m}
            </button>
          ))}
        </div>
        {epVideoMode === 'youtube' ? (
          <input type="url" value={ep.youtubeUrl}
            onChange={e => setEp(p => ({ ...p, youtubeUrl: e.target.value, videoCloudinaryId: '' }))}
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
              <p className="text-xs text-green-400 mt-1">✓ {ep.videoCloudinaryId.slice(-24)}</p>
            )}
            <UploadProgress state={epVideoUpload} label="Uploading..." />
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onSave}
          className="btn-brand text-sm py-2 px-4 flex items-center gap-1">
          <MdSave size={15} /> {label.includes('Add') ? 'Add' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost text-sm py-2 px-4">
          {t('cancel')}
        </button>
      </div>
    </div>
  )

  // ── Loading ─────────────────────────────────────────────────────
  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <button onClick={() => navigate('/admin/contents')}
          className="text-dark-300 hover:text-white transition-colors p-1">
          <MdArrowBack size={22} />
        </button>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl tracking-wider text-white">
            {isEdit ? 'EDIT CONTENT' : 'ADD CONTENT'}
          </h1>
          <p className="text-dark-400 text-xs sm:text-sm mt-0.5">
            {isEdit ? `Editing: ${form.title}` : 'Create a new movie or series'}
          </p>
        </div>
      </div>

      <div className="space-y-5 sm:space-y-6">

        {/* ── Type selector ── */}
        <section className="bg-dark-800 border border-dark-600 rounded-2xl p-4 sm:p-6">
          <h2 className="text-xs font-mono uppercase tracking-wider text-dark-400 mb-4">Content Type</h2>
          <div className="flex gap-3">
            {[['movie','Movie', MdMovie],['series','Series', MdTv]].map(([val, label, Icon]) => (
              <button key={val} type="button" onClick={() => set('type', val)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 rounded-xl border-2 text-sm font-medium transition-all ${
                  form.type === val
                    ? 'border-brand-500 bg-brand-600/10 text-brand-400'
                    : 'border-dark-600 text-dark-300 hover:border-dark-400'
                }`}>
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Basic info ── */}
        <section className="bg-dark-800 border border-dark-600 rounded-2xl p-4 sm:p-6 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-dark-400">Basic Information</h2>

          {/* Using InputField defined OUTSIDE — no focus loss */}
          <InputField
            label="Title *"
            value={form.title}
            onChange={v => set('title', v)}
            placeholder="Enter title..."
          />

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-dark-400 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={4}
              placeholder="Synopsis..."
              className="input-dark text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <InputField
              label="Year"
              value={form.year}
              onChange={v => set('year', v)}
              type="number"
            />
            {form.type === 'movie' && (
              <InputField
                label="Duration (min)"
                value={form.duration}
                onChange={v => set('duration', v)}
                type="number"
                placeholder="120"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <InputField
              label="Director"
              value={form.director}
              onChange={v => set('director', v)}
              placeholder="Name..."
            />
            <InputField
              label="Cast"
              value={form.cast}
              onChange={v => set('cast', v)}
              placeholder="Actor 1, Actor 2..."
            />
          </div>
        </section>

        {/* ── Genres ── */}
        <section className="bg-dark-800 border border-dark-600 rounded-2xl p-4 sm:p-6">
          <h2 className="text-xs font-mono uppercase tracking-wider text-dark-400 mb-4">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {GENRE_LIST.map(g => (
              <button key={g} type="button" onClick={() => toggleGenre(g)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  form.genres.includes(g)
                    ? 'bg-brand-600 text-white'
                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
                }`}>
                {g}
              </button>
            ))}
          </div>
        </section>

        {/* ── Images ── */}
        <section className="bg-dark-800 border border-dark-600 rounded-2xl p-4 sm:p-6 space-y-5">
          <h2 className="text-xs font-mono uppercase tracking-wider text-dark-400">Images</h2>

          {/* Poster */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-dark-400 mb-2">Poster (2:3)</label>
            <div className="flex gap-3 sm:gap-4 items-start">
              {form.posterUrl && (
                <img src={form.posterUrl} alt="poster"
                  className="w-16 sm:w-20 aspect-[2/3] object-cover rounded-lg shrink-0" />
              )}
              <div className="flex-1 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed
                                  border-dark-500 hover:border-brand-500 rounded-xl p-3 sm:p-4 transition-colors">
                  <MdCloudUpload size={18} className="text-dark-400 shrink-0" />
                  <span className="text-sm text-dark-300">Upload poster</span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0], 'posterUrl', setPosterUpload)} />
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-dark-600" />
                  <span className="text-xs text-dark-500">or URL</span>
                  <div className="flex-1 h-px bg-dark-600" />
                </div>
                <input type="url" value={form.posterUrl}
                  onChange={e => set('posterUrl', e.target.value)}
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
                <img src={form.backdropUrl} alt="backdrop"
                  className="w-full h-24 sm:h-32 object-cover rounded-lg" />
              )}
              <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed
                                border-dark-500 hover:border-brand-500 rounded-xl p-3 sm:p-4 transition-colors">
                <MdCloudUpload size={18} className="text-dark-400 shrink-0" />
                <span className="text-sm text-dark-300">Upload backdrop</span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0], 'backdropUrl', setBackdropUpload)} />
              </label>
              <input type="url" value={form.backdropUrl}
                onChange={e => set('backdropUrl', e.target.value)}
                placeholder="https://..." className="input-dark text-sm" />
              <UploadProgress state={backdropUpload} label="Uploading backdrop..." />
            </div>
          </div>

          {/* Trailer */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-dark-400 mb-1.5">
              <span className="flex items-center gap-1">
                <MdYoutubeSearchedFor size={14} /> Trailer URL (YouTube)
              </span>
            </label>
            <input type="url" value={form.trailerUrl}
              onChange={e => set('trailerUrl', e.target.value)}
              placeholder="https://youtube.com/watch?v=..." className="input-dark text-sm" />
          </div>
        </section>

        {/* ── Video source (movies only) ── */}
        {form.type === 'movie' && (
          <section className="bg-dark-800 border border-dark-600 rounded-2xl p-4 sm:p-6 space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wider text-dark-400">Video Source</h2>
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
              <input type="url" value={form.youtubeUrl}
                onChange={e => set('youtubeUrl', e.target.value)}
                placeholder="https://youtube.com/watch?v=..." className="input-dark text-sm" />
            ) : (
              <div>
                <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed
                                  border-dark-500 hover:border-brand-500 rounded-xl p-4 sm:p-5 transition-colors">
                  <MdCloudUpload size={22} className="text-dark-400 shrink-0" />
                  <div>
                    <p className="text-sm text-dark-200">Click to upload video</p>
                    <p className="text-xs text-dark-400 mt-0.5">MP4, MOV, AVI — up to 2GB</p>
                  </div>
                  <input type="file" accept="video/*" className="hidden"
                    onChange={e => e.target.files[0] && handleVideoUpload(e.target.files[0])} />
                </label>
                {form.videoCloudinaryId && (
                  <p className="text-xs text-green-400 mt-2">✓ ID: {form.videoCloudinaryId}</p>
                )}
                <UploadProgress state={videoUpload} label="Uploading video..." />
              </div>
            )}
          </section>
        )}

        {/* ── Publish settings ── */}
        <section className="bg-dark-800 border border-dark-600 rounded-2xl p-4 sm:p-6 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-dark-400">Publish Settings</h2>
          <div className="flex gap-3">
            {['draft','published'].map(s => (
              <button key={s} type="button" onClick={() => set('status', s)}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                  form.status === s
                    ? s === 'published'
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                    : 'border-dark-600 text-dark-400 hover:border-dark-400'
                }`}>
                {s}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.featured}
              onChange={e => set('featured', e.target.checked)}
              className="w-4 h-4 accent-brand-500 rounded" />
            <span className="text-sm text-dark-200">Feature on homepage hero banner</span>
          </label>
        </section>

        {/* ── Episodes (series + edit mode only) ── */}
        {form.type === 'series' && isEdit && (
          <section className="bg-dark-800 border border-dark-600 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-mono uppercase tracking-wider text-dark-400">
                Episodes ({episodes.length})
              </h2>
              <button type="button"
                onClick={() => { setShowEpForm(p => !p); setEditingEp(null) }}
                className="btn-ghost text-sm py-1.5 px-3 flex items-center gap-1">
                <MdAdd size={16} /> Add Episode
              </button>
            </div>

            {showEpForm && (
              <div className="mb-5">
                <EpisodeFormInner
                  ep={newEp} setEp={setNewEp}
                  onSave={handleAddEpisode}
                  onCancel={() => setShowEpForm(false)}
                  label="Add Episode"
                />
              </div>
            )}

            <div className="space-y-2">
              {episodes
                .sort((a,b) => a.season - b.season || a.episode - b.episode)
                .map(ep => (
                  <div key={ep.id}>
                    {editingEp?.id === ep.id ? (
                      <EpisodeFormInner
                        ep={editingEp} setEp={setEditingEp}
                        onSave={handleUpdateEpisode}
                        onCancel={() => setEditingEp(null)}
                        label="Edit Episode"
                      />
                    ) : (
                      <div className="flex items-center gap-3 bg-dark-700 rounded-xl p-3 sm:p-4">
                        <div className="w-9 h-9 rounded-lg bg-dark-600 flex items-center justify-center font-mono text-sm shrink-0">
                          {ep.episode}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{ep.title}</p>
                          <p className="text-xs text-dark-400">S{ep.season} E{ep.episode}{ep.duration ? ` · ${ep.duration}min` : ''}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`badge text-xs hidden sm:inline-flex ${
                            ep.youtubeUrl ? 'bg-red-500/20 text-red-400'
                            : ep.videoCloudinaryId ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-dark-600 text-dark-400'
                          }`}>
                            {ep.youtubeUrl ? 'YT' : ep.videoCloudinaryId ? 'Cloud' : 'No video'}
                          </span>
                          <button onClick={() => setEditingEp(ep)}
                            className="w-8 h-8 flex items-center justify-center text-dark-400
                                       hover:text-white hover:bg-dark-600 rounded-lg transition-colors">
                            <MdEdit size={15} />
                          </button>
                          <button onClick={() => handleDeleteEpisode(ep.id, ep.title)}
                            className="w-8 h-8 flex items-center justify-center text-dark-400
                                       hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors">
                            <MdDelete size={15} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              {episodes.length === 0 && !showEpForm && (
                <p className="text-center py-8 text-dark-500 text-sm">No episodes yet.</p>
              )}
            </div>
          </section>
        )}

        {form.type === 'series' && !isEdit && (
          <div className="bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-center">
            <p className="text-sm text-dark-300">
              💡 Save the series first, then add episodes from the edit page.
            </p>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex gap-3 pb-8">
          <button type="button" onClick={handleSave} disabled={saving}
            className="btn-brand flex items-center gap-2 py-3 px-6 sm:px-8 disabled:opacity-60">
            {saving
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <MdSave size={18} />
            }
            {isEdit ? 'Save Changes' : 'Add Content'}
          </button>
          <button type="button" onClick={() => navigate('/admin/contents')}
            className="btn-ghost py-3 px-5 sm:px-6">
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

// src/pages/user/ProfilePage.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/ui/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useSEO, seoProfile } from '../../hooks/useSEO'
import { updateUserProfile } from '../../services/firestore'
import { updateProfile } from 'firebase/auth'
import { auth } from '../../services/firebase'
import toast from 'react-hot-toast'
import { MdPerson, MdEmail, MdEdit, MdSave } from 'react-icons/md'

export default function ProfilePage() {
  const { t }                           = useTranslation()
  useSEO(seoProfile())
  const { user, profile, refreshProfile } = useAuth()
  const [editing,   setEditing]   = useState(false)
  const [name,      setName]      = useState(profile?.displayName || '')
  const [loading,   setLoading]   = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateProfile(auth.currentUser, { displayName: name })
      await updateUserProfile(user.uid, { displayName: name })
      await refreshProfile()
      setEditing(false)
      toast.success('Profile updated')
    } catch { toast.error('Error') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-16">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8">
          {/* Avatar */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-brand-600 flex items-center justify-center text-3xl font-display">
              {profile?.displayName?.[0]?.toUpperCase() || '?'}
            </div>
          </div>

          <h1 className="font-display text-3xl text-center tracking-wider mb-8">
            {t('profile').toUpperCase()}
          </h1>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs text-dark-300 uppercase tracking-wider mb-1">
                <MdPerson size={14} /> {t('name')}
              </label>
              {editing ? (
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-dark"
                />
              ) : (
                <p className="text-white font-medium py-2">{profile?.displayName}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs text-dark-300 uppercase tracking-wider mb-1">
                <MdEmail size={14} /> {t('email')}
              </label>
              <p className="text-dark-300 py-2">{user?.email}</p>
            </div>

            <div>
              <label className="text-xs text-dark-300 uppercase tracking-wider">Role</label>
              <p className="py-2">
                <span className={`badge ${profile?.role === 'admin' ? 'bg-brand-600/20 text-brand-400' : 'bg-dark-600 text-dark-200'}`}>
                  {profile?.role || 'user'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={loading} className="btn-brand flex-1 flex items-center justify-center gap-2">
                  <MdSave size={18} /> {t('save')}
                </button>
                <button onClick={() => setEditing(false)} className="btn-ghost flex-1">{t('cancel')}</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-ghost flex-1 flex items-center justify-center gap-2">
                <MdEdit size={18} /> Edit Profile
              </button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-dark-600 text-center text-xs text-dark-400">
            Member since {profile?.createdAt?.toDate?.()?.getFullYear?.() || '—'}
          </div>
        </div>
      </div>
    </div>
  )
}

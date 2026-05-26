// src/pages/user/AuthPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { MdEmail, MdLock, MdPerson } from 'react-icons/md'
import { FcGoogle } from 'react-icons/fc'


export default function AuthPage() {
  const { t }          = useTranslation()
  const { login, register, loginWithGoogle } = useAuth()
  const navigate       = useNavigate()
  const [mode,    setMode]    = useState('login') // 'login' | 'register'
  const [email,   setEmail]   = useState('')
  const [password, setPassword] = useState('')
  const [name,    setName]    = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        toast.success('Welcome back!')
      } else {
        if (!name) { toast.error('Name required'); setLoading(false); return }
        await register(email, password, name)
        toast.success('Account created!')
      }
      navigate('/')
    } catch (e) {
      toast.error(e.message?.replace('Firebase: ', '').replace(' (auth/wrong-password).', '') || 'Error')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      await loginWithGoogle()
      toast.success('Welcome!')
      navigate('/')
    } catch (e) { toast.error(e.message || 'Error') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      {/* Background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <span className="font-display text-5xl text-brand-500 tracking-wide">STREAM</span>
            <span className="font-display text-5xl text-white tracking-wide">VOX</span>
          </Link>
        </div>

        <div className="bg-dark-800/80 backdrop-blur border border-dark-600 rounded-2xl p-8">
          {/* Mode toggle */}
          <div className="flex gap-1 bg-dark-700 rounded-xl p-1 mb-8">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === m ? 'bg-brand-600 text-white shadow-lg' : 'text-dark-300 hover:text-white'
                }`}
              >
                {m === 'login' ? t('signIn') : t('signUp')}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <MdPerson size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                <input
                  type="text"
                  placeholder={t('name')}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-dark pl-10"
                />
              </div>
            )}

            <div className="relative">
              <MdEmail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
              <input
                type="email"
                placeholder={t('email')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-dark pl-10"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div className="relative">
              <MdLock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
              <input
                type="password"
                placeholder={t('password')}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-dark pl-10"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-brand w-full mt-6 flex items-center justify-center py-3 text-base disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : mode === 'login' ? t('signIn') : t('signUp')}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-dark-600" />
            <span className="text-xs text-dark-400">{t('orContinueWith')}</span>
            <div className="flex-1 h-px bg-dark-600" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="btn-ghost w-full flex items-center justify-center gap-3 py-3"
          >
            <FcGoogle size={20} /> Google
          </button>

          <p className="text-center text-sm text-dark-400 mt-6">
            {mode === 'login' ? t('noAccount') : t('haveAccount')}{' '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-brand-400 hover:text-brand-300 font-medium">
              {mode === 'login' ? t('signUp') : t('signIn')}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

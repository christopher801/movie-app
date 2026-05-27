// src/pages/user/LandingPage.jsx
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useEffect } from 'react'
import { useSEO, seoLanding } from '../../hooks/useSEO'
import {
  MdPlayCircle, MdDevices, MdDownload,
  MdHd, MdFamilyRestroom, MdStar
} from 'react-icons/md'

const FEATURES = [
  { icon: MdHd,             title: 'HD & 4K',          desc: 'Calidad de imagen excepcional en todos tus dispositivos.' },
  { icon: MdDevices,        title: 'Multidispositivo',  desc: 'Mira en tu teléfono, tablet, laptop o TV sin interrupciones.' },
  { icon: MdDownload,       title: 'Sin anuncios',      desc: 'Disfruta tu contenido favorito sin interrupciones.' },
  { icon: MdFamilyRestroom, title: 'Para toda la familia', desc: 'Contenido para todas las edades en un solo lugar.' },
  { icon: MdStar,           title: 'Lo mejor del cine', desc: 'Películas y series seleccionadas de todo el mundo.' },
  { icon: MdPlayCircle,     title: 'Siempre disponible',desc: 'Accede cuando quieras, donde quieras, 24/7.' },
]

const FAQS = [
  { q: '¿Qué es StreamVox?',            a: 'StreamVox es una plataforma de streaming donde puedes ver películas y series en cualquier momento y desde cualquier dispositivo.' },
  { q: '¿Cómo creo mi cuenta?',         a: 'Haz clic en "Comenzar gratis", elige tu método de registro (email o Google) y en segundos tendrás acceso a todo el catálogo.' },
  { q: '¿Puedo ver contenido sin conexión?', a: 'StreamVox es una PWA instalable. Puedes instalarla en tu dispositivo para un acceso más rápido, aunque el streaming requiere conexión.' },
  { q: '¿En qué dispositivos puedo verlo?', a: 'En cualquier dispositivo con navegador moderno: teléfonos, tablets, laptops y computadoras de escritorio.' },
]

export default function LandingPage() {
  const { t }    = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  // SEO
  useSEO(seoLanding())

  // Si ya está logueado → home
  useEffect(() => {
    if (user) navigate('/home', { replace: true })
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-dark-950 text-white overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur border-b border-dark-800">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-3xl leading-none">
            <span className="text-brand-500">STREAM</span>
            <span className="text-white">VOX</span>
          </span>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/auth?mode=login')}    className="text-sm text-dark-200 hover:text-white transition-colors px-4 py-2">{t('signIn')}</button>
            <button onClick={() => navigate('/auth?mode=register')} className="btn-brand text-sm py-2 px-5">{t('signUp')}</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-brand-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-800/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {[
            { top: '15%', left:  '3%',  rotate: '-8deg',  opacity: 0.18 },
            { top: '55%', left:  '2%',  rotate: '-4deg',  opacity: 0.12 },
            { top: '20%', right: '4%',  rotate:  '7deg',  opacity: 0.18 },
            { top: '60%', right: '2%',  rotate:  '5deg',  opacity: 0.12 },
            { top: '38%', left:  '10%', rotate: '-6deg',  opacity: 0.10 },
            { top: '35%', right: '8%',  rotate:  '6deg',  opacity: 0.10 },
          ].map((s, i) => (
            <div key={i} className="absolute w-24 sm:w-32 aspect-[2/3] rounded-xl bg-gradient-to-br from-dark-700 to-dark-800 border border-dark-600 shadow-2xl"
              style={{ top: s.top, left: s.left, right: s.right, transform: `rotate(${s.rotate})`, opacity: s.opacity }} />
          ))}
        </div>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-600/15 border border-brand-600/30 text-brand-400 text-xs font-mono uppercase tracking-widest px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            Tu plataforma de streaming
          </div>
          <h1 className="font-display text-6xl sm:text-8xl lg:text-9xl tracking-wide leading-none mb-6">
            <span className="text-white">STREAM</span><span className="text-brand-500">VOX</span>
          </h1>
          <p className="text-dark-200 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl mx-auto">
            Películas y series sin límites. Crea tu cuenta gratis y empieza a disfrutar ahora mismo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/auth?mode=register')}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base px-8 py-4 rounded-xl transition-all active:scale-95 animate-pulse-brand w-full sm:w-auto justify-center">
              <MdPlayCircle size={22} /> Comenzar gratis
            </button>
            <button onClick={() => navigate('/auth?mode=login')} className="btn-ghost text-base px-8 py-4 rounded-xl w-full sm:w-auto">
              Ya tengo cuenta
            </button>
          </div>
          <p className="text-dark-400 text-sm mt-8">Sin tarjeta de crédito · Sin compromisos · Cancela cuando quieras</p>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-500 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-dark-500" />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl tracking-wider mb-4">TODO LO QUE <span className="text-brand-500">NECESITAS</span></h2>
            <p className="text-dark-300 max-w-md mx-auto">Una experiencia de streaming completa, rápida y sin complicaciones.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-dark-800/60 border border-dark-700 hover:border-brand-600/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl bg-brand-600/15 border border-brand-600/20 flex items-center justify-center mb-4 group-hover:bg-brand-600/25 transition-colors">
                  <Icon size={24} className="text-brand-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-dark-300 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOWCASE BANNER ── */}
      <section className="py-16 px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="relative bg-gradient-to-r from-brand-600/20 via-dark-800 to-dark-800 border border-brand-600/25 rounded-3xl p-10 sm:p-16 overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 justify-between">
              <div className="max-w-lg">
                <h2 className="font-display text-4xl sm:text-5xl tracking-wider mb-4 leading-tight">EMPIEZA A VER <span className="text-brand-500">HOY MISMO</span></h2>
                <p className="text-dark-200 leading-relaxed">Crea tu cuenta en segundos y accede a todo el catálogo de películas y series. Sin límites, sin esperas.</p>
              </div>
              <button onClick={() => navigate('/auth?mode=register')}
                className="shrink-0 flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-lg px-10 py-4 rounded-xl transition-all active:scale-95 whitespace-nowrap">
                <MdPlayCircle size={24} /> Crear cuenta gratis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-4xl tracking-wider text-center mb-12">PREGUNTAS <span className="text-brand-500">FRECUENTES</span></h2>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group bg-dark-800 border border-dark-600 hover:border-dark-500 rounded-2xl overflow-hidden transition-colors">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-medium list-none">
                  {q}
                  <span className="text-brand-500 text-xl transition-transform group-open:rotate-45 shrink-0 ml-4">+</span>
                </summary>
                <p className="px-6 pb-5 text-dark-300 text-sm leading-relaxed border-t border-dark-700 pt-4">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-dark-800 py-10 px-6">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-2xl"><span className="text-brand-500">STREAM</span><span className="text-white">VOX</span></span>
          <p className="text-dark-500 text-sm">© {new Date().getFullYear()} StreamVox. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-sm text-dark-400">
            <button onClick={() => navigate('/auth?mode=register')} className="hover:text-white transition-colors">Registrarse</button>
            <button onClick={() => navigate('/auth?mode=login')}    className="hover:text-white transition-colors">Iniciar sesión</button>
          </div>
        </div>
      </footer>
    </div>
  )
}

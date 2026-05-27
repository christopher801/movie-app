// src/hooks/useSEO.js
// Hook pou mete meta tags dinamikman pou chak paj

const BASE_URL = 'https://streamvox-one.vercel.app'
const DEFAULT  = {
  title:       'StreamVox — Tu plataforma de streaming',
  description: 'Mira películas y series en HD sin límites. Crea tu cuenta gratis y empieza a disfrutar ahora mismo.',
  image:       `${BASE_URL}/og-image.png`,
  type:        'website',
}

function setMeta(name, content, isProperty = false) {
  if (!content) return
  const attr = isProperty ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href, extra = {}) {
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
  Object.entries(extra).forEach(([k, v]) => el.setAttribute(k, v))
}

function setHreflang(lang, url) {
  let el = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'alternate')
    el.setAttribute('hreflang', lang)
    document.head.appendChild(el)
  }
  el.setAttribute('href', url)
}

export function useSEO({
  title,
  description,
  image,
  type       = 'website',
  path       = '',
  noindex    = false,
  schema     = null,
  // For content pages (movies/series)
  content    = null,
} = {}) {

  const finalTitle = title
    ? `${title} | StreamVox`
    : DEFAULT.title

  const finalDesc  = description || DEFAULT.description
  const finalImage = image       || DEFAULT.image
  const canonical  = `${BASE_URL}${path}`
  const esUrl      = `${BASE_URL}/es${path}`
  const enUrl      = `${BASE_URL}/en${path}`

  // ── Title ────────────────────────────────────────────────────
  document.title = finalTitle

  // ── Basic meta ───────────────────────────────────────────────
  setMeta('description',        finalDesc)
  setMeta('robots',             noindex ? 'noindex,nofollow' : 'index,follow')
  setMeta('author',             'StreamVox')
  setMeta('viewport',           'width=device-width, initial-scale=1.0')

  // ── Open Graph ───────────────────────────────────────────────
  setMeta('og:title',           finalTitle,  true)
  setMeta('og:description',     finalDesc,   true)
  setMeta('og:image',           finalImage,  true)
  setMeta('og:image:width',     '1200',      true)
  setMeta('og:image:height',    '630',       true)
  setMeta('og:url',             canonical,   true)
  setMeta('og:type',            type,        true)
  setMeta('og:site_name',       'StreamVox', true)
  setMeta('og:locale',          'es_ES',     true)
  setMeta('og:locale:alternate','en_US',     true)

  // ── Twitter Card ─────────────────────────────────────────────
  setMeta('twitter:card',        'summary_large_image')
  setMeta('twitter:title',       finalTitle)
  setMeta('twitter:description', finalDesc)
  setMeta('twitter:image',       finalImage)
  setMeta('twitter:image:alt',   finalTitle)
  setMeta('twitter:site',        '@streamvox')

  // ── Video specific OG (for content pages) ────────────────────
  if (content) {
    setMeta('og:type',           'video.movie', true)
    setMeta('video:release_date', String(content.year || ''), true)
    if (content.duration)
      setMeta('video:duration',  String(content.duration * 60), true) // seconds
    if (content.genres?.length)
      setMeta('video:tag',       content.genres.join(', '), true)
    if (content.director)
      setMeta('video:director',  content.director, true)
  }

  // ── Canonical ────────────────────────────────────────────────
  setLink('canonical', canonical)

  // ── Hreflang ─────────────────────────────────────────────────
  setHreflang('es',    esUrl)
  setHreflang('en',    enUrl)
  setHreflang('x-default', canonical)

  // ── JSON-LD Structured Data ───────────────────────────────────
  const schemaId = 'streamvox-schema'
  let schemaEl   = document.getElementById(schemaId)

  const defaultSchema = {
    '@context':   'https://schema.org',
    '@type':      'WebSite',
    name:         'StreamVox',
    url:          BASE_URL,
    description:  DEFAULT.description,
    potentialAction: {
      '@type':     'SearchAction',
      target:      `${BASE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  const finalSchema = schema || defaultSchema

  if (!schemaEl) {
    schemaEl = document.createElement('script')
    schemaEl.id   = schemaId
    schemaEl.type = 'application/ld+json'
    document.head.appendChild(schemaEl)
  }
  schemaEl.textContent = JSON.stringify(finalSchema, null, 2)
}

// ── Preset helpers ────────────────────────────────────────────────

export function seoLanding() {
  return {
    title:       'StreamVox — Tu plataforma de streaming',
    description: 'Mira películas y series en HD sin límites. Crea tu cuenta gratis y empieza a disfrutar ahora mismo.',
    path:        '/',
    schema: {
      '@context':   'https://schema.org',
      '@type':      'WebSite',
      name:         'StreamVox',
      url:          BASE_URL,
      description:  'Tu plataforma de streaming — Películas y Series',
      potentialAction: {
        '@type':       'SearchAction',
        target:        `${BASE_URL}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
      publisher: {
        '@type': 'Organization',
        name:    'StreamVox',
        logo: {
          '@type': 'ImageObject',
          url:     `${BASE_URL}/icons/icon-512x512.png`,
        },
      },
    },
  }
}

export function seoHome() {
  return {
    title:       'Inicio — Películas y Series',
    description: 'Descubre las mejores películas y series. Tendencias, nuevos lanzamientos y los mejor valorados.',
    path:        '/home',
  }
}

export function seoMovies() {
  return {
    title:       'Películas — Catálogo completo',
    description: 'Explora nuestro catálogo completo de películas. Acción, drama, comedia, terror y mucho más en HD.',
    path:        '/movies',
    schema: {
      '@context': 'https://schema.org',
      '@type':    'CollectionPage',
      name:       'Películas — StreamVox',
      url:        `${BASE_URL}/movies`,
      description:'Catálogo completo de películas en StreamVox',
    },
  }
}

export function seoSeries() {
  return {
    title:       'Series — Catálogo completo',
    description: 'Explora todas las series disponibles. Temporadas completas, nuevos episodios y los clásicos que no puedes perderte.',
    path:        '/series',
    schema: {
      '@context': 'https://schema.org',
      '@type':    'CollectionPage',
      name:       'Series — StreamVox',
      url:        `${BASE_URL}/series`,
      description:'Catálogo completo de series en StreamVox',
    },
  }
}

export function seoSearch(query = '') {
  return {
    title:       query ? `"${query}" — Búsqueda` : 'Buscar películas y series',
    description: query
      ? `Resultados de búsqueda para "${query}" en StreamVox`
      : 'Busca entre miles de películas y series en StreamVox.',
    path:        '/search',
    noindex:     true, // search pages should not be indexed
  }
}

export function seoWatchlist() {
  return {
    title:       'Mi Lista',
    description: 'Tu lista personal de películas y series guardadas en StreamVox.',
    path:        '/watchlist',
    noindex:     true,
  }
}

export function seoProfile() {
  return {
    title:       'Mi Perfil',
    description: 'Gestiona tu perfil y preferencias en StreamVox.',
    path:        '/profile',
    noindex:     true,
  }
}

export function seoContent(content) {
  if (!content) return {}
  const isMovie  = content.type === 'movie'
  const BASE_URL = 'https://streamvox-one.vercel.app'

  return {
    title:       content.title,
    description: content.description
      ? content.description.slice(0, 155) + (content.description.length > 155 ? '...' : '')
      : `${isMovie ? 'Película' : 'Serie'} — ${content.title} (${content.year}) en StreamVox`,
    image:       content.backdropUrl || content.posterUrl,
    type:        'video.movie',
    path:        `/content/${content.id}`,
    content,
    schema: {
      '@context':    'https://schema.org',
      '@type':       isMovie ? 'Movie' : 'TVSeries',
      name:          content.title,
      description:   content.description,
      image:         content.posterUrl,
      datePublished: String(content.year),
      ...(content.director && {
        director: { '@type': 'Person', name: content.director },
      }),
      ...(content.cast && {
        actor: content.cast.split(',').map(name => ({
          '@type': 'Person',
          name:    name.trim(),
        })),
      }),
      ...(content.genres?.length && {
        genre: content.genres,
      }),
      ...(content.rating > 0 && {
        aggregateRating: {
          '@type':       'AggregateRating',
          ratingValue:   content.rating,
          bestRating:    5,
          worstRating:   1,
          ratingCount:   content.ratingCount || 1,
        },
      }),
      ...(isMovie && content.duration && {
        duration: `PT${content.duration}M`,
      }),
      url: `${BASE_URL}/content/${content.id}`,
    },
  }
}

// src/services/sitemap.js
// Generates sitemap.xml dynamically from Firestore content
// Call this from a Vercel serverless function or on build

import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from './firebase'

const BASE_URL = 'https://streamvox-one.vercel.app'

const STATIC_PAGES = [
  { url: '/',       changefreq: 'weekly',  priority: '1.0' },
  { url: '/movies', changefreq: 'daily',   priority: '0.9' },
  { url: '/series', changefreq: 'daily',   priority: '0.9' },
  { url: '/search', changefreq: 'monthly', priority: '0.5' },
]

export async function generateSitemap() {
  // Fetch all published content
  const snap = await getDocs(
    query(collection(db, 'contents'), where('status', '==', 'published'))
  )

  const contentPages = snap.docs.map(doc => {
    const data = doc.data()
    const lastmod = data.updatedAt?.toDate?.()?.toISOString().split('T')[0]
      || new Date().toISOString().split('T')[0]
    return {
      url:        `/content/${doc.id}`,
      changefreq: 'weekly',
      priority:   '0.8',
      lastmod,
    }
  })

  const allPages = [...STATIC_PAGES, ...contentPages]
  const today    = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allPages.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${page.lastmod || today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="es" href="${BASE_URL}/es${page.url}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en${page.url}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${page.url}"/>
  </url>`).join('\n')}
</urlset>`

  return xml
}

// Static fallback sitemap (used if Firestore not available)
export function generateStaticSitemap() {
  const today = new Date().toISOString().split('T')[0]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${STATIC_PAGES.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="es" href="${BASE_URL}/es${page.url}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en${page.url}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${page.url}"/>
  </url>`).join('\n')}
</urlset>`
  return xml
}

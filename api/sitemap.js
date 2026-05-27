// api/sitemap.js — Vercel Serverless Function
// Generates sitemap.xml dynamically
// URL: https://streamvox-one.vercel.app/api/sitemap

const BASE_URL = 'https://streamvox-one.vercel.app'

const STATIC_PAGES = [
  { url: '/',       changefreq: 'weekly',  priority: '1.0' },
  { url: '/movies', changefreq: 'daily',   priority: '0.9' },
  { url: '/series', changefreq: 'daily',   priority: '0.9' },
  { url: '/search', changefreq: 'monthly', priority: '0.5' },
]

export default function handler(req, res) {
  const today = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${STATIC_PAGES.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="es" href="${BASE_URL}${page.url}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}${page.url}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${page.url}"/>
  </url>`).join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
  res.status(200).send(xml)
}

const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

// ── StreamVox brand colors ──────────────────────────────────────
const RED    = '#e41008'
const BLACK  = '#080808'
const WHITE  = '#ffffff'

// ── Sizes needed for PWA ────────────────────────────────────────
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

function drawIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx    = canvas.getContext('2d')
  const cx     = size / 2
  const cy     = size / 2
  const r      = size * 0.44   // outer circle radius
  const pad    = size * 0.08

  // ── Background circle ──
  ctx.fillStyle = BLACK
  ctx.beginPath()
  ctx.arc(cx, cy, cx, 0, Math.PI * 2)
  ctx.fill()

  // ── Red filled circle ──
  ctx.fillStyle = RED
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // ── Play triangle (white) ──
  const triSize = r * 0.65
  const tx = cx + triSize * 0.15   // slight right offset for visual center
  const ty = cy

  ctx.fillStyle = WHITE
  ctx.beginPath()
  ctx.moveTo(tx - triSize * 0.45, ty - triSize * 0.56)
  ctx.lineTo(tx + triSize * 0.62, ty)
  ctx.lineTo(tx - triSize * 0.45, ty + triSize * 0.56)
  ctx.closePath()
  ctx.fill()

  // ── "SV" text for larger icons ──
  if (size >= 192) {
    const fontSize = size * 0.095
    ctx.font = `900 ${fontSize}px sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.textAlign   = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('STREAMVOX', cx, cy + r * 0.78)
  }

  return canvas
}

function drawMaskable(size) {
  // Maskable: safe zone = 80% center → pad icon inside
  const canvas = createCanvas(size, size)
  const ctx    = canvas.getContext('2d')
  const cx     = size / 2
  const cy     = size / 2
  const safe   = size * 0.4    // radius of safe zone

  // Full background
  ctx.fillStyle = RED
  ctx.fillRect(0, 0, size, size)

  // Play triangle
  const triSize = safe * 0.75
  const tx = cx + triSize * 0.12
  const ty = cy

  ctx.fillStyle = WHITE
  ctx.beginPath()
  ctx.moveTo(tx - triSize * 0.48, ty - triSize * 0.58)
  ctx.lineTo(tx + triSize * 0.65, ty)
  ctx.lineTo(tx - triSize * 0.48, ty + triSize * 0.58)
  ctx.closePath()
  ctx.fill()

  return canvas
}

function drawFavicon(size) {
  const canvas = createCanvas(size, size)
  const ctx    = canvas.getContext('2d')
  const cx     = size / 2
  const cy     = size / 2
  const r      = cx - 1

  // Red circle
  ctx.fillStyle = RED
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // Play triangle
  const t = r * 0.55
  ctx.fillStyle = WHITE
  ctx.beginPath()
  ctx.moveTo(cx - t * 0.4 + t * 0.1, cy - t * 0.5)
  ctx.lineTo(cx + t * 0.65,           cy)
  ctx.lineTo(cx - t * 0.4 + t * 0.1, cy + t * 0.5)
  ctx.closePath()
  ctx.fill()

  return canvas
}

// ── Output dirs ──────────────────────────────────────────────────
const iconsDir = path.join(__dirname, 'public', 'icons')
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true })

// ── Generate all sizes ───────────────────────────────────────────
console.log('\n🎬 StreamVox Icon Generator\n')

SIZES.forEach(size => {
  // Standard icon
  const canvas = drawIcon(size)
  const out    = path.join(iconsDir, `icon-${size}x${size}.png`)
  fs.writeFileSync(out, canvas.toBuffer('image/png'))
  console.log(`  ✅ icon-${size}x${size}.png`)
})

// Maskable icons (192 + 512)
;[192, 512].forEach(size => {
  const canvas = drawMaskable(size)
  const out    = path.join(iconsDir, `icon-${size}x${size}-maskable.png`)
  fs.writeFileSync(out, canvas.toBuffer('image/png'))
  console.log(`  ✅ icon-${size}x${size}-maskable.png  (maskable)`)
})

// Apple touch icon (180x180)
const appleCanvas = drawIcon(180)
const appleOut = path.join(__dirname, 'public', 'apple-touch-icon.png')
fs.writeFileSync(appleOut, appleCanvas.toBuffer('image/png'))
console.log(`  ✅ apple-touch-icon.png (180x180)`)

// Favicon (32x32)
const favCanvas = drawFavicon(32)
const favOut = path.join(__dirname, 'public', 'favicon-32.png')
fs.writeFileSync(favOut, favCanvas.toBuffer('image/png'))
console.log(`  ✅ favicon-32.png`)

// OG image placeholder (1200x630)
const ogCanvas = createCanvas(1200, 630)
const ogCtx    = ogCanvas.getContext('2d')

// Background gradient sim
ogCtx.fillStyle = BLACK
ogCtx.fillRect(0, 0, 1200, 630)

// Red accent bar left
ogCtx.fillStyle = RED
ogCtx.fillRect(0, 0, 8, 630)

// Big play circle
const ogCx = 200, ogCy = 315, ogR = 120
ogCtx.fillStyle = RED
ogCtx.beginPath()
ogCtx.arc(ogCx, ogCy, ogR, 0, Math.PI * 2)
ogCtx.fill()

ogCtx.fillStyle = WHITE
ogCtx.beginPath()
ogCtx.moveTo(ogCx - 35, ogCy - 55)
ogCtx.lineTo(ogCx + 65, ogCy)
ogCtx.lineTo(ogCx - 35, ogCy + 55)
ogCtx.closePath()
ogCtx.fill()

// STREAMVOX text
ogCtx.fillStyle = WHITE
ogCtx.font = 'bold 110px sans-serif'
ogCtx.textBaseline = 'middle'
ogCtx.fillText('STREAM', 360, 280)
ogCtx.fillStyle = RED
ogCtx.fillText('VOX', 360, 390)

// Tagline
ogCtx.fillStyle = 'rgba(255,255,255,0.45)'
ogCtx.font = '32px sans-serif'
ogCtx.fillText('Your streaming platform', 362, 470)

const ogOut = path.join(__dirname, 'public', 'og-image.png')
fs.writeFileSync(ogOut, ogCanvas.toBuffer('image/png'))
console.log(`  ✅ og-image.png (1200x630)`)

console.log('\n✨ All icons generated in public/icons/\n')

// ── Print manifest snippet ───────────────────────────────────────
console.log('── Paste in manifest.webmanifest ──────────────────────')
const manifestIcons = [
  ...SIZES.map(s => ({
    src: `/icons/icon-${s}x${s}.png`,
    sizes: `${s}x${s}`,
    type: 'image/png',
    purpose: 'any'
  })),
  { src: '/icons/icon-192x192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
  { src: '/icons/icon-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
]
console.log(JSON.stringify(manifestIcons, null, 2))

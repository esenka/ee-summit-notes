import * as THREE from 'three'
import type { Note } from '../types'
import { hashString } from '../utils'
import { COLORS, NOTE_COLORS, WISH_COLOR } from './palette'

const SIZE = 256
const PAD = 26
const cache = new Map<string, THREE.CanvasTexture>()

export const noteColor = (note: Note) => NOTE_COLORS[hashString(note.id) % NOTE_COLORS.length]
/** Deterministic slight tilt per note, in radians. */
export const noteTilt = (note: Note) => (((hashString(note.id) >> 4) % 100) / 100 - 0.5) * 0.18

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
      if (lines.length === maxLines) break
    } else {
      line = next
    }
  }
  if (lines.length < maxLines && line) lines.push(line)
  else if (lines.length === maxLines) lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '…')
  return lines
}

/** A post-it as a canvas texture: pastel paper for the "what", gold glow for the wish. */
export function getNoteTexture(note: Note, wish: boolean): THREE.CanvasTexture {
  const key = `${note.id}:${wish ? 'wish' : 'what'}`
  const cached = cache.get(key)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!

  // paper
  ctx.save()
  if (wish) {
    ctx.shadowColor = 'rgba(201, 151, 43, 0.95)'
    ctx.shadowBlur = 22
  } else {
    ctx.shadowColor = 'rgba(62, 55, 42, 0.38)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetY = 7
  }
  ctx.fillStyle = wish ? WISH_COLOR : noteColor(note)
  ctx.beginPath()
  ctx.roundRect(PAD, PAD, SIZE - PAD * 2, SIZE - PAD * 2, 5)
  ctx.fill()
  ctx.restore()

  // a hint of a lifted corner
  ctx.fillStyle = 'rgba(0,0,0,0.06)'
  ctx.beginPath()
  ctx.moveTo(SIZE - PAD, SIZE - PAD)
  ctx.lineTo(SIZE - PAD - 26, SIZE - PAD)
  ctx.lineTo(SIZE - PAD, SIZE - PAD - 26)
  ctx.closePath()
  ctx.fill()

  // text
  ctx.fillStyle = '#3A352C'
  ctx.font = '400 34px Caveat, cursive'
  ctx.textBaseline = 'top'
  const text = wish ? note.wish : note.what
  const lines = wrapText(ctx, text, SIZE - PAD * 2 - 28, 5)
  lines.forEach((l, i) => ctx.fillText(l, PAD + 16, PAD + 18 + i * 36))

  if (wish) {
    // the "?" mark of the fourth dimension
    ctx.fillStyle = COLORS.wish
    ctx.beginPath()
    ctx.arc(SIZE - PAD - 16, PAD + 16, 19, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#FFFDF6'
    ctx.font = '700 26px "Helvetica Neue", Helvetica, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('?', SIZE - PAD - 16, PAD + 18)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  cache.set(key, texture)
  return texture
}

export function clearNoteTextureCache() {
  cache.forEach((t) => t.dispose())
  cache.clear()
}

let glyphTexture: THREE.CanvasTexture | null = null

/** Shared "encoding" texture: a faint grid of glyphs a new note resolves from. */
export function getGlyphTexture(): THREE.CanvasTexture {
  if (glyphTexture) return glyphTexture
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  ctx.strokeStyle = 'rgba(62, 92, 118, 0.35)'
  ctx.lineWidth = 1
  const cells = 8
  const span = SIZE - PAD * 2
  for (let i = 0; i <= cells; i++) {
    const p = PAD + (span / cells) * i
    ctx.beginPath(); ctx.moveTo(p, PAD); ctx.lineTo(p, SIZE - PAD); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(PAD, p); ctx.lineTo(SIZE - PAD, p); ctx.stroke()
  }
  ctx.fillStyle = 'rgba(62, 92, 118, 0.8)'
  ctx.font = '400 18px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const glyphs = '0101·+×01'
  for (let x = 0; x < cells; x++) {
    for (let y = 0; y < cells; y++) {
      if ((hashString(`${x},${y}`) & 3) === 0) continue
      const g = glyphs[hashString(`g${x},${y}`) % glyphs.length]
      ctx.fillText(g, PAD + (span / cells) * (x + 0.5), PAD + (span / cells) * (y + 0.5))
    }
  }
  glyphTexture = new THREE.CanvasTexture(canvas)
  glyphTexture.colorSpace = THREE.SRGBColorSpace
  return glyphTexture
}

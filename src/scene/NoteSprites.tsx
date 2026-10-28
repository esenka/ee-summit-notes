import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { ANCHORS } from '../anchors'
import { filteredNotes, useApp } from '../store'
import type { Anchor, Note } from '../types'
import { hashString, usePrefersReducedMotion } from '../utils'
import { getGlyphTexture, getNoteTexture, noteTilt } from './textures'

const MAX_PER_ANCHOR = 7
const NOTE_SCALE = 0.27

/** Notes created in roughly the last few seconds materialize; older ones just sit there. */
const materialized = new Set<string>()

const UP = new THREE.Vector3(0, 1, 0)

/** Offsets fan out in the plane facing the anchor's preferred camera, so notes
 *  never sink into the wall or the body behind the anchor. */
function offsetFor(anchor: Anchor, i: number): [number, number, number] {
  const dir = new THREE.Vector3(...anchor.cameraPosition).sub(new THREE.Vector3(...anchor.position)).normalize()
  const u = new THREE.Vector3().crossVectors(dir, UP).normalize()
  const v = new THREE.Vector3().crossVectors(u, dir).normalize()
  const angle = (hashString(anchor.id) % 7) + i * 2.4
  const radius = 0.21 + 0.05 * i
  return new THREE.Vector3(...anchor.position)
    .addScaledVector(u, Math.cos(angle) * radius)
    .addScaledVector(v, Math.sin(angle) * radius * 0.8)
    .addScaledVector(dir, 0.1 + 0.02 * i)
    .toArray() as [number, number, number]
}

export function NoteSprites() {
  const notes = useApp((s) => s.notes)
  const filterAnchor = useApp((s) => s.filterAnchor)
  const filterMethod = useApp((s) => s.filterMethod)
  const wishOnly = useApp((s) => s.wishOnly)
  const notesVisible = useApp((s) => s.notesVisible)

  // Canvas textures need the handwriting font; wait for it once.
  const [fontsReady, setFontsReady] = useState(false)
  useEffect(() => {
    Promise.all([document.fonts.load('400 34px Caveat'), document.fonts.load('700 26px "Helvetica Neue"')])
      .catch(() => undefined)
      .then(() => setFontsReady(true))
  }, [])

  const placed = useMemo(() => {
    const visible = filteredNotes({ notes, filterAnchor, filterMethod, wishOnly })
    const byAnchor = new Map<string, Note[]>()
    for (const n of visible) {
      const list = byAnchor.get(n.anchorId) ?? []
      if (list.length < MAX_PER_ANCHOR) list.push(n)
      byAnchor.set(n.anchorId, list)
    }
    const out: { note: Note; position: [number, number, number] }[] = []
    for (const anchor of ANCHORS) {
      const list = byAnchor.get(anchor.id) ?? []
      list.forEach((note, i) => out.push({ note, position: offsetFor(anchor, i) }))
    }
    return out
  }, [notes, filterAnchor, filterMethod, wishOnly])

  if (!fontsReady || !notesVisible) return null
  return (
    <group>
      {placed.map(({ note, position }) => (
        <NoteSprite key={note.id} note={note} position={position} wish={wishOnly && !!note.wish.trim()} />
      ))}
    </group>
  )
}

function NoteSprite({ note, position, wish }: { note: Note; position: [number, number, number]; wish: boolean }) {
  const openNote = useApp((s) => s.openNote)
  const selectAnchor = useApp((s) => s.selectAnchor)
  const reduced = usePrefersReducedMotion()
  const [hovered, setHovered] = useState(false)

  const texture = useMemo(() => getNoteTexture(note, wish), [note, wish])
  const tilt = noteTilt(note)

  // "Encoding" entrance: fresh notes resolve from a glyph grid into paper.
  const isNew = !materialized.has(note.id) && Date.now() - new Date(note.createdAt).getTime() < 15_000
  const birth = useRef<number | null>(null)
  const sprite = useRef<THREE.Sprite>(null)
  const glyph = useRef<THREE.Sprite>(null)
  const animating = useRef(isNew && !reduced)
  useEffect(() => {
    materialized.add(note.id)
  }, [note.id])

  useFrame(({ clock }) => {
    const s = sprite.current
    const g = glyph.current
    if (!s) return
    const base = hovered ? NOTE_SCALE * 1.12 : NOTE_SCALE
    if (animating.current) {
      if (birth.current === null) birth.current = clock.elapsedTime
      const t = Math.min((clock.elapsedTime - birth.current) / 1.1, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      s.scale.setScalar(base * ease)
      ;(s.material as THREE.SpriteMaterial).opacity = Math.min(t * 2.2, 1)
      if (g) {
        g.scale.setScalar(base * (0.7 + 0.3 * ease))
        ;(g.material as THREE.SpriteMaterial).opacity = Math.max(0.9 * (1 - t * 1.4), 0)
      }
      if (t >= 1) animating.current = false
    } else {
      s.scale.setScalar(base)
      ;(s.material as THREE.SpriteMaterial).opacity = 1
      if (g) (g.material as THREE.SpriteMaterial).opacity = 0
    }
  })

  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 5) return
    selectAnchor(note.anchorId)
    openNote(note.id)
  }

  return (
    <group position={position}>
      <sprite
        ref={sprite}
        scale={NOTE_SCALE}
        onClick={click}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <spriteMaterial map={texture} transparent rotation={tilt} depthWrite={false} />
      </sprite>
      {isNew && !reduced && (
        <sprite ref={glyph} scale={NOTE_SCALE * 0.7}>
          <spriteMaterial map={getGlyphTexture()} transparent rotation={tilt} depthWrite={false} opacity={0.9} />
        </sprite>
      )}
    </group>
  )
}

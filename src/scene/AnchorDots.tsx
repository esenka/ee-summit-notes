import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type * as THREE from 'three'
import { ANCHORS } from '../anchors'
import { useApp } from '../store'
import type { Anchor } from '../types'
import { usePrefersReducedMotion } from '../utils'
import { Interactive } from './Interactive'
import { COLORS } from './palette'

export function AnchorDots() {
  const notes = useApp((s) => s.notes)
  const notesVisible = useApp((s) => s.notesVisible)
  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const n of notes) m.set(n.anchorId, (m.get(n.anchorId) ?? 0) + 1)
    return m
  }, [notes])

  // The hide-post-its toggle clears the dots and badges too, for a clean scene.
  if (!notesVisible) return null

  return (
    <group>
      {ANCHORS.map((a, i) => (
        <AnchorDot key={a.id} anchor={a} count={counts.get(a.id) ?? 0} phase={i * 1.7} />
      ))}
    </group>
  )
}

function AnchorDot({ anchor, count, phase }: { anchor: Anchor; count: number; phase: number }) {
  const dot = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Mesh>(null)
  const hovered = useApp((s) => s.hoveredAnchor === anchor.id)
  const reduced = usePrefersReducedMotion()

  useFrame(({ clock }) => {
    if (!dot.current || !halo.current) return
    if (reduced) {
      dot.current.scale.setScalar(1)
      halo.current.scale.setScalar(1.6)
      return
    }
    const t = clock.elapsedTime * 2 + phase
    dot.current.scale.setScalar(1 + Math.sin(t) * 0.12)
    const pulse = (t * 0.5) % 1
    halo.current.scale.setScalar(1 + pulse * 1.6)
    const mat = halo.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.35 * (1 - pulse)
  })

  return (
    <group position={anchor.position}>
      <Interactive anchorId={anchor.id}>
        <mesh ref={dot}>
          <sphereGeometry args={[0.026, 16, 12]} />
          <meshBasicMaterial color={hovered ? '#5F82A3' : COLORS.accent} />
        </mesh>
        {/* generous invisible hit area, also the touch target on phones */}
        <mesh>
          <sphereGeometry args={[0.085, 8, 6]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </Interactive>
      <mesh ref={halo}>
        <sphereGeometry args={[0.026, 16, 12]} />
        <meshBasicMaterial color={COLORS.accent} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      {/* Badge and tooltip stay mounted (visibility via CSS) — conditional
          mounting of drei <Html> races React's unmount and throws. */}
      <Html position={[0.05, 0.07, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <span className="anchor-badge" style={{ visibility: count > 0 ? 'visible' : 'hidden' }}>{count}</span>
      </Html>
      <Html position={[0, 0.14, 0]} center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
        <div className="anchor-tooltip" style={{ visibility: hovered ? 'visible' : 'hidden' }}>
          <strong>{anchor.label}</strong>
          <span>{anchor.hint}</span>
        </div>
      </Html>
    </group>
  )
}

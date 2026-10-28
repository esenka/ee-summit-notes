import { useCallback, type ReactNode } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useApp } from '../store'
import { COLORS } from './palette'

/** Wraps meshes so hovering/clicking them targets an anchor. */
export function Interactive({ anchorId, children }: { anchorId: string; children: ReactNode }) {
  const setHovered = useApp((s) => s.setHovered)
  const selectAnchor = useApp((s) => s.selectAnchor)

  const over = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      setHovered(anchorId)
      document.body.style.cursor = 'pointer'
    },
    [anchorId, setHovered],
  )
  const out = useCallback(() => {
    setHovered(null)
    document.body.style.cursor = 'auto'
  }, [setHovered])
  const click = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      // An orbit drag that started on this mesh is not a click.
      if (e.delta > 5) return
      selectAnchor(anchorId)
    },
    [anchorId, selectAnchor],
  )

  return (
    <group onPointerOver={over} onPointerOut={out} onClick={click}>
      {children}
    </group>
  )
}

/** Standard material that glows softly while its anchor is hovered or selected. */
export function PartMaterial({ anchorId, color, roughness = 0.7 }: { anchorId: string; color: string; roughness?: number }) {
  const hovered = useApp((s) => s.hoveredAnchor === anchorId)
  const selected = useApp((s) => s.selectedAnchor === anchorId)
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={0.02}
      emissive={COLORS.accent}
      emissiveIntensity={hovered ? 0.32 : selected ? 0.16 : 0}
    />
  )
}

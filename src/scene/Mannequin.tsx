import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { ANCHORS } from '../anchors'
import { useApp } from '../store'
import { Interactive, PartMaterial } from './Interactive'
import { COLORS } from './palette'

/**
 * The human figure, loaded from a GLB (see public/models/figure.glb) and
 * rendered with the same warm-bone material as the rest of the scene.
 *
 * The model is a single mesh, so body regions can't be separate click
 * targets; instead a click (or hover) on the figure maps to the nearest
 * body anchor from anchors.ts. The previous primitive-built figure is kept
 * in MannequinProcedural.tsx as an asset-free fallback.
 */
const FIGURE_URL = '/models/figure.glb'
const FIGURE_HEIGHT = 1.75
/** Hits farther than this from every body anchor count as "whole body". */
const REGION_RADIUS = 0.45

const BODY_ANCHORS = ANCHORS.filter((a) => a.kind === 'body' && a.id !== 'whole-body')
const BODY_IDS = new Set(ANCHORS.filter((a) => a.kind === 'body').map((a) => a.id))

function nearestBodyAnchor(point: THREE.Vector3): string {
  let best = 'whole-body'
  let bestDist = REGION_RADIUS
  for (const a of BODY_ANCHORS) {
    const d = point.distanceTo(new THREE.Vector3(...a.position))
    if (d < bestDist) {
      best = a.id
      bestDist = d
    }
  }
  return best
}

export function Mannequin() {
  const { scene } = useGLTF(FIGURE_URL)
  const setHovered = useApp((s) => s.setHovered)
  const selectAnchor = useApp((s) => s.selectAnchor)
  const hoveredBody = useApp((s) => (s.hoveredAnchor ? BODY_IDS.has(s.hoveredAnchor) : false))

  const { material, scale, offset } = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.body,
      roughness: 0.7,
      metalness: 0.02,
      emissive: COLORS.accent,
      emissiveIntensity: 0,
    })
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.material = material
        obj.castShadow = true
      }
    })
    // Normalize: stand on the floor at the origin, FIGURE_HEIGHT tall.
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = FIGURE_HEIGHT / size.y
    const offset: [number, number, number] = [-center.x * scale, -box.min.y * scale, -center.z * scale]
    return { material, scale, offset }
  }, [scene])

  useEffect(() => {
    material.emissiveIntensity = hoveredBody ? 0.22 : 0
  }, [material, hoveredBody])

  const move = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(nearestBodyAnchor(e.point))
    document.body.style.cursor = 'pointer'
  }
  const out = () => {
    setHovered(null)
    document.body.style.cursor = 'auto'
  }
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 5) return
    selectAnchor(nearestBodyAnchor(e.point))
  }

  return (
    <group>
      <primitive
        object={scene}
        position={offset}
        scale={scale}
        onPointerMove={move}
        onPointerOut={out}
        onClick={click}
      />

      {/* Rug under the figure keeps a generous whole-body click target */}
      <Interactive anchorId="whole-body">
        <mesh receiveShadow position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.95, 48]} />
          <PartMaterial anchorId="whole-body" color={COLORS.rug} roughness={0.95} />
        </mesh>
      </Interactive>
    </group>
  )
}

useGLTF.preload(FIGURE_URL)

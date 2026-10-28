import { useEffect, useRef, type ComponentRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { anchorById } from '../anchors'
import { useApp } from '../store'

export const DEFAULT_CAMERA: [number, number, number] = [2.9, 1.9, 3.7]
export const DEFAULT_TARGET: [number, number, number] = [0, 1.05, 0]

type ControlsRef = ComponentRef<typeof OrbitControls>

/** OrbitControls plus smooth fly-to animations for anchor focus / reset. */
export function CameraRig({ autoRotate = false }: { autoRotate?: boolean }) {
  const controls = useRef<ControlsRef>(null)
  const focusRequest = useApp((s) => s.focusRequest)
  const resetSeq = useApp((s) => s.resetSeq)
  const goal = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>(null)

  useEffect(() => {
    if (!focusRequest) return
    const anchor = anchorById.get(focusRequest.anchorId)
    if (!anchor) return
    const pos = new THREE.Vector3(...anchor.cameraPosition)
    const target = new THREE.Vector3(...anchor.position)
    // Keep the goal safely inside maxPolarAngle, otherwise the fly-to
    // animation fights the controls' clamp and the camera jitters.
    const minLift = Math.sin(0.08) * pos.distanceTo(target)
    if (pos.y - target.y < minLift) pos.y = target.y + minLift
    goal.current = { pos, target }
  }, [focusRequest])

  useEffect(() => {
    if (resetSeq === 0) return
    goal.current = {
      pos: new THREE.Vector3(...DEFAULT_CAMERA),
      target: new THREE.Vector3(...DEFAULT_TARGET),
    }
  }, [resetSeq])

  useFrame((state, dt) => {
    const c = controls.current
    const g = goal.current
    if (!c || !g) return
    // Exponential damping toward the goal, frame-rate independent
    const t = 1 - Math.pow(0.002, Math.min(dt, 0.05))
    state.camera.position.lerp(g.pos, t)
    c.target.lerp(g.target, t)
    if (state.camera.position.distanceTo(g.pos) < 0.02 && c.target.distanceTo(g.target) < 0.02) {
      goal.current = null
    }
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      onStart={() => (goal.current = null)}
      enableDamping
      dampingFactor={0.08}
      target={DEFAULT_TARGET}
      minDistance={0.7}
      maxDistance={8}
      maxPolarAngle={Math.PI / 2 - 0.04}
      autoRotate={autoRotate}
      autoRotateSpeed={0.6}
      enablePan={false}
    />
  )
}

import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useApp } from '../store'
import { AnchorDots } from './AnchorDots'
import { CameraRig, DEFAULT_CAMERA } from './CameraRig'
import { Mannequin } from './Mannequin'
import { NoteSprites } from './NoteSprites'
import { COLORS } from './palette'
import { Room } from './Room'

/**
 * The shared 3D scene. The main page renders it interactive;
 * projector mode renders it auto-rotating with pointer events off.
 */
export function Scene({ autoRotate = false, interactive = true }: { autoRotate?: boolean; interactive?: boolean }) {
  const wishOnly = useApp((s) => s.wishOnly)
  const clearSelection = useApp((s) => s.clearSelection)
  // In the "wish I knew" view the room dims; the unlit note sprites keep glowing.
  const dim = wishOnly ? 0.28 : 1
  // Distinguish orbit drags from clicks for the deselect-on-miss behaviour.
  const downAt = useRef<[number, number] | null>(null)

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: DEFAULT_CAMERA, fov: 42 }}
      style={interactive ? undefined : { pointerEvents: 'none' }}
      onPointerDown={(e) => (downAt.current = [e.clientX, e.clientY])}
      onPointerMissed={(e) => {
        if (!interactive) return
        const d = downAt.current
        if (d && Math.hypot(e.clientX - d[0], e.clientY - d[1]) > 5) return
        clearSelection()
      }}
      aria-label="3D room with a human figure. Post-it notes are attached to body regions and room objects."
    >
      <color attach="background" args={[wishOnly ? '#45413A' : COLORS.background]} />
      <hemisphereLight args={['#FFF7EA', '#C9BFA8', 0.85 * dim]} />
      <directionalLight
        position={[-4.6, 3.1, -0.2]}
        intensity={2.4 * dim}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-3.5}
        shadow-camera-right={3.5}
        shadow-camera-top={4}
        shadow-camera-bottom={-2}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0, 2.15, 0.3]} intensity={5 * dim} distance={7} decay={1.6} color="#FFE3B8" />
      <Room />
      <Mannequin />
      <AnchorDots />
      <NoteSprites />
      <CameraRig autoRotate={autoRotate} />
    </Canvas>
  )
}

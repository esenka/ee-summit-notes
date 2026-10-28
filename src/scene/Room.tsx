import * as THREE from 'three'
import { Interactive, PartMaterial } from './Interactive'
import { COLORS } from './palette'

/**
 * A minimal room: floor, two walls, a window with daylight, plant, chair,
 * desk and a pendant lamp. Walls are single-sided planes facing inward,
 * so the orbiting camera can always see into the room.
 */
export function Room() {
  return (
    <group>
      {/* Floor */}
      <Interactive anchorId="floor">
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[5, 4.4]} />
          <PartMaterial anchorId="floor" color={COLORS.floor} roughness={0.9} />
        </mesh>
      </Interactive>

      {/* Back wall */}
      <Interactive anchorId="walls">
        <mesh receiveShadow position={[0, 1.45, -2.2]}>
          <planeGeometry args={[5, 2.9]} />
          <PartMaterial anchorId="walls" color={COLORS.wall} roughness={0.95} />
        </mesh>
        {/* Left wall segments around the window opening */}
        {(
          [
            { pos: [-2.5, 1.45, -1.525], size: [1.35, 2.9] },
            { pos: [-2.5, 1.45, 1.325], size: [1.75, 2.9] },
            { pos: [-2.5, 0.4, -0.2], size: [1.3, 0.8] },
            { pos: [-2.5, 2.6, -0.2], size: [1.3, 0.6] },
          ] as { pos: [number, number, number]; size: [number, number] }[]
        ).map((seg, i) => (
          <mesh key={i} receiveShadow position={seg.pos} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={seg.size} />
            <PartMaterial anchorId="walls" color={COLORS.wallSide} roughness={0.95} />
          </mesh>
        ))}
      </Interactive>

      {/* Window: frame + glass in the left-wall opening */}
      <Interactive anchorId="window">
        <group position={[-2.48, 1.55, -0.2]}>
          {/* frame: top, bottom, two sides, plus a centre mullion */}
          <mesh castShadow position={[0, 0.75, 0]}>
            <boxGeometry args={[0.08, 0.06, 1.34]} />
            <PartMaterial anchorId="window" color={COLORS.wood} />
          </mesh>
          <mesh castShadow position={[0, -0.75, 0]}>
            <boxGeometry args={[0.08, 0.06, 1.34]} />
            <PartMaterial anchorId="window" color={COLORS.wood} />
          </mesh>
          <mesh castShadow position={[0, 0, -0.65]}>
            <boxGeometry args={[0.08, 1.56, 0.06]} />
            <PartMaterial anchorId="window" color={COLORS.wood} />
          </mesh>
          <mesh castShadow position={[0, 0, 0.65]}>
            <boxGeometry args={[0.08, 1.56, 0.06]} />
            <PartMaterial anchorId="window" color={COLORS.wood} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.06, 1.5, 0.035]} />
            <PartMaterial anchorId="window" color={COLORS.wood} />
          </mesh>
          <mesh position={[0.01, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[1.3, 1.5]} />
            <meshStandardMaterial color={COLORS.glass} transparent opacity={0.16} roughness={0.15} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </Interactive>

      {/* Plant → nature & biophilia */}
      <Interactive anchorId="plant">
        <group position={[1.75, 0, -1.55]}>
          <mesh castShadow position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.17, 0.13, 0.32, 20]} />
            <PartMaterial anchorId="plant" color={COLORS.pot} />
          </mesh>
          <mesh castShadow position={[0, 0.48, 0]}>
            <cylinderGeometry args={[0.018, 0.024, 0.38, 8]} />
            <PartMaterial anchorId="plant" color={COLORS.woodDark} />
          </mesh>
          <mesh castShadow position={[0, 0.88, 0]} scale={[1, 0.82, 1]}>
            <icosahedronGeometry args={[0.3, 1]} />
            <PartMaterial anchorId="plant" color={COLORS.leaf} roughness={0.85} />
          </mesh>
          <mesh castShadow position={[0.17, 0.68, 0.1]}>
            <icosahedronGeometry args={[0.19, 1]} />
            <PartMaterial anchorId="plant" color={COLORS.leafDark} roughness={0.85} />
          </mesh>
          <mesh castShadow position={[-0.16, 0.66, -0.07]}>
            <icosahedronGeometry args={[0.17, 1]} />
            <PartMaterial anchorId="plant" color={COLORS.leafDark} roughness={0.85} />
          </mesh>
        </group>
      </Interactive>

      {/* Chair → posture & comfort */}
      <Interactive anchorId="chair">
        <group position={[1.6, 0, -0.35]} rotation={[0, -2.0, 0]}>
          <mesh castShadow position={[0, 0.45, 0]}>
            <boxGeometry args={[0.42, 0.05, 0.42]} />
            <PartMaterial anchorId="chair" color={COLORS.wood} />
          </mesh>
          {(
            [
              [-0.18, -0.18],
              [-0.18, 0.18],
              [0.18, -0.18],
              [0.18, 0.18],
            ] as const
          ).map(([x, z]) => (
            <mesh key={`${x}${z}`} castShadow position={[x, 0.22, z]}>
              <cylinderGeometry args={[0.016, 0.016, 0.44, 10]} />
              <PartMaterial anchorId="chair" color={COLORS.woodDark} />
            </mesh>
          ))}
          <mesh castShadow position={[0, 0.74, -0.2]} rotation={[-0.1, 0, 0]}>
            <boxGeometry args={[0.42, 0.52, 0.04]} />
            <PartMaterial anchorId="chair" color={COLORS.wood} />
          </mesh>
        </group>
      </Interactive>

      {/* Desk with a couple of books (scene dressing, not an anchor) */}
      <group position={[-1.3, 0, -1.85]}>
        <mesh castShadow position={[0, 0.73, 0]}>
          <boxGeometry args={[1.2, 0.05, 0.5]} />
          <meshStandardMaterial color={COLORS.wood} roughness={0.7} />
        </mesh>
        {(
          [
            [-0.55, -0.2],
            [-0.55, 0.2],
            [0.55, -0.2],
            [0.55, 0.2],
          ] as const
        ).map(([x, z]) => (
          <mesh key={`${x}${z}`} castShadow position={[x, 0.36, z]}>
            <cylinderGeometry args={[0.02, 0.02, 0.72, 10]} />
            <meshStandardMaterial color={COLORS.woodDark} roughness={0.7} />
          </mesh>
        ))}
        <mesh castShadow position={[-0.3, 0.775, -0.05]} rotation={[0, 0.15, 0]}>
          <boxGeometry args={[0.22, 0.035, 0.3]} />
          <meshStandardMaterial color="#CBDCEA" roughness={0.8} />
        </mesh>
        <mesh castShadow position={[-0.28, 0.81, -0.03]} rotation={[0, -0.1, 0]}>
          <boxGeometry args={[0.2, 0.03, 0.27]} />
          <meshStandardMaterial color="#F6D4C3" roughness={0.8} />
        </mesh>
      </group>

      {/* Pendant lamp */}
      <Interactive anchorId="lamp">
        <group position={[0, 0, 0.3]}>
          <mesh position={[0, 2.66, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.48, 6]} />
            <PartMaterial anchorId="lamp" color="#55504A" />
          </mesh>
          <mesh castShadow position={[0, 2.33, 0]}>
            <cylinderGeometry args={[0.055, 0.23, 0.2, 24, 1, true]} />
            <meshStandardMaterial
              color={COLORS.brass}
              roughness={0.45}
              metalness={0.35}
              side={THREE.DoubleSide}
              emissive="#FFD9A0"
              emissiveIntensity={0.25}
            />
          </mesh>
          <mesh position={[0, 2.26, 0]}>
            <sphereGeometry args={[0.045, 16, 12]} />
            <meshStandardMaterial color="#FFF3DC" emissive="#FFD9A0" emissiveIntensity={1.6} />
          </mesh>
        </group>
      </Interactive>
    </group>
  )
}

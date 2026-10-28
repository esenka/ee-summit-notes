import { Interactive, PartMaterial } from './Interactive'
import { COLORS } from './palette'
/**
 * Asset-free fallback figure built from primitives. Not currently rendered:
 * Mannequin.tsx loads the GLB. Swap the import in Scene.tsx to use this one.
 */
export function MannequinProcedural() {
  const skin = COLORS.body
  return (
    <group>
      {/* Head + neck → brain */}
      <Interactive anchorId="brain">
        <mesh castShadow position={[0, 1.62, 0]}>
          <sphereGeometry args={[0.12, 32, 24]} />
          <PartMaterial anchorId="brain" color={skin} />
        </mesh>
        <mesh castShadow position={[0, 1.47, 0]}>
          <cylinderGeometry args={[0.045, 0.055, 0.12, 16]} />
          <PartMaterial anchorId="brain" color={skin} />
        </mesh>
      </Interactive>

      {/* Eyes */}
      <Interactive anchorId="eyes">
        {([-0.045, 0.045] as const).map((x) => (
          <mesh key={x} position={[x, 1.64, 0.105]}>
            <sphereGeometry args={[0.02, 16, 12]} />
            <PartMaterial anchorId="eyes" color="#6B655A" roughness={0.4} />
          </mesh>
        ))}
      </Interactive>

      {/* Ears */}
      <Interactive anchorId="ears">
        {([-0.118, 0.118] as const).map((x) => (
          <mesh key={x} position={[x, 1.62, 0]} scale={[0.5, 1, 0.8]}>
            <sphereGeometry args={[0.032, 16, 12]} />
            <PartMaterial anchorId="ears" color={skin} />
          </mesh>
        ))}
      </Interactive>

      {/* Chest + shoulders → heart (lungs & skin reachable via their dots) */}
      <Interactive anchorId="heart">
        <mesh castShadow position={[0, 1.18, 0]}>
          <capsuleGeometry args={[0.17, 0.34, 8, 24]} />
          <PartMaterial anchorId="heart" color={skin} />
        </mesh>
        <mesh castShadow position={[0, 1.4, 0]} scale={[1.18, 0.55, 0.8]}>
          <sphereGeometry args={[0.17, 24, 16]} />
          <PartMaterial anchorId="heart" color={skin} />
        </mesh>
      </Interactive>

      {/* Pelvis / belly → gut */}
      <Interactive anchorId="gut">
        <mesh castShadow position={[0, 0.96, 0]} scale={[1, 0.78, 0.9]}>
          <sphereGeometry args={[0.16, 24, 16]} />
          <PartMaterial anchorId="gut" color={skin} />
        </mesh>
      </Interactive>

      {/* Arms → skin */}
      <Interactive anchorId="skin">
        {([-1, 1] as const).map((side) => (
          <group key={side}>
            <mesh castShadow position={[side * 0.24, 1.24, 0]} rotation={[0, 0, side * -0.18]}>
              <capsuleGeometry args={[0.05, 0.26, 6, 16]} />
              <PartMaterial anchorId="skin" color={skin} />
            </mesh>
            <mesh castShadow position={[side * 0.295, 0.97, 0.02]} rotation={[0.08, 0, side * -0.08]}>
              <capsuleGeometry args={[0.044, 0.24, 6, 16]} />
              <PartMaterial anchorId="skin" color={skin} />
            </mesh>
          </group>
        ))}
      </Interactive>

      {/* Hands */}
      <Interactive anchorId="hands">
        {([-1, 1] as const).map((side) => (
          <mesh key={side} castShadow position={[side * 0.325, 0.82, 0.05]} scale={[0.8, 1.15, 1]}>
            <sphereGeometry args={[0.055, 16, 12]} />
            <PartMaterial anchorId="hands" color={skin} />
          </mesh>
        ))}
      </Interactive>

      {/* Legs + feet → feet */}
      <Interactive anchorId="feet">
        {([-1, 1] as const).map((side) => (
          <group key={side}>
            <mesh castShadow position={[side * 0.095, 0.7, 0]}>
              <capsuleGeometry args={[0.075, 0.34, 6, 16]} />
              <PartMaterial anchorId="feet" color={skin} />
            </mesh>
            <mesh castShadow position={[side * 0.095, 0.3, 0]}>
              <capsuleGeometry args={[0.055, 0.32, 6, 16]} />
              <PartMaterial anchorId="feet" color={skin} />
            </mesh>
            <mesh castShadow position={[side * 0.095, 0.05, 0.06]}>
              <boxGeometry args={[0.09, 0.08, 0.24]} />
              <PartMaterial anchorId="feet" color={skin} />
            </mesh>
          </group>
        ))}
      </Interactive>

      {/* Rug under the figure → whole body */}
      <Interactive anchorId="whole-body">
        <mesh receiveShadow position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.95, 48]} />
          <PartMaterial anchorId="whole-body" color={COLORS.rug} roughness={0.95} />
        </mesh>
      </Interactive>
    </group>
  )
}

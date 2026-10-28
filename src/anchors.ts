import type { Anchor } from './types'

/**
 * Registry of everything a note can attach to.
 * To add a new anchor point: add an entry here, then (optionally) tag a mesh
 * in the scene with the same anchor id so hovering/clicking it selects the anchor.
 * Everything else — dots, badges, filters, the submit form — picks it up automatically.
 */
export const ANCHORS: Anchor[] = [
  // Body regions (mannequin stands at the origin, ~1.75 units tall)
  { id: 'brain', label: 'Brain & head', hint: 'cognition, stress, attention', kind: 'body', position: [0, 1.74, 0], cameraPosition: [0.8, 1.95, 1.7] },
  { id: 'eyes', label: 'Eyes', hint: 'gaze, light, visual comfort', kind: 'body', position: [0, 1.63, 0.14], cameraPosition: [0.3, 1.75, 1.6] },
  { id: 'ears', label: 'Ears', hint: 'sound and acoustics', kind: 'body', position: [0.1, 1.65, 0], cameraPosition: [1.6, 1.8, 0.6] },
  { id: 'skin', label: 'Skin', hint: 'thermal comfort, touch, arousal', kind: 'body', position: [0.26, 1.15, 0.05], cameraPosition: [1.5, 1.5, 1.4] },
  { id: 'heart', label: 'Heart', hint: 'heart rate, emotion, arousal', kind: 'body', position: [-0.06, 1.3, 0.14], cameraPosition: [-0.5, 1.45, 1.7] },
  { id: 'lungs', label: 'Lungs', hint: 'breath and air quality', kind: 'body', position: [0.08, 1.37, 0.14], cameraPosition: [0.6, 1.55, 1.7] },
  { id: 'gut', label: 'Gut', hint: 'interoception, gut feeling', kind: 'body', position: [0, 1.02, 0.14], cameraPosition: [0.4, 1.25, 1.7] },
  { id: 'hands', label: 'Hands', hint: 'touch, making, interaction', kind: 'body', position: [-0.3, 0.73, 0.08], cameraPosition: [-1.3, 1.0, 1.5] },
  { id: 'feet', label: 'Feet', hint: 'movement, ground, wayfinding', kind: 'body', position: [0.12, 0.08, 0.12], cameraPosition: [0.7, 0.7, 1.8] },
  { id: 'whole-body', label: 'Whole body', hint: 'posture, presence, behaviour', kind: 'body', position: [-0.55, 1.45, 0], cameraPosition: [-1.9, 1.6, 2.5] },

  // Room objects
  { id: 'window', label: 'Window', hint: 'daylight and view', kind: 'room', position: [-2.42, 1.55, -0.2], cameraPosition: [-0.3, 1.7, 1.7] },
  { id: 'plant', label: 'Plant', hint: 'nature & biophilia', kind: 'room', position: [1.75, 1.05, -1.55], cameraPosition: [0.5, 1.4, -0.2] },
  { id: 'chair', label: 'Chair', hint: 'posture & comfort', kind: 'room', position: [1.6, 1.0, -0.35], cameraPosition: [0.3, 1.4, 1.4] },
  // Keep fly-to goals above their targets: OrbitControls clamps the polar
  // angle just short of horizontal, and a goal below the target makes the
  // camera fight the clamp every frame (visible as jitter).
  { id: 'lamp', label: 'Pendant lamp', hint: 'artificial light', kind: 'room', position: [0, 2.3, 0.3], cameraPosition: [1.2, 2.55, 2.1] },
  { id: 'walls', label: 'Walls & ceiling', hint: 'space and volume', kind: 'room', position: [-0.9, 2.05, -2.12], cameraPosition: [-0.2, 2.5, 1.0] },
  { id: 'floor', label: 'Floor', hint: 'ground, material, movement', kind: 'room', position: [0.9, 0.04, 1.1], cameraPosition: [1.1, 1.5, 2.7] },
]

export const anchorById = new Map(ANCHORS.map((a) => [a.id, a]))

export function anchorLabel(id: string): string {
  return anchorById.get(id)?.label ?? id
}

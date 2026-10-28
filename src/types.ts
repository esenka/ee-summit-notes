export type AnchorKind = 'body' | 'room'

export interface Anchor {
  id: string
  label: string
  /** Short subtitle shown in tooltips and pickers, e.g. "nature & biophilia" */
  hint: string
  kind: AnchorKind
  /** World position of the anchor dot */
  position: [number, number, number]
  /** Preferred camera position when focusing this anchor */
  cameraPosition: [number, number, number]
}

export interface Note {
  id: string
  anchorId: string
  /** What do people study? */
  what: string
  /** Using what methods? (free text) */
  how: string
  /** Why? */
  why: string
  /** What do they wish they knew? — the 4th dimension */
  wish: string
  /** Method tags picked from the preset list or typed */
  methods: string[]
  /** Optional name or role; null = anonymous */
  author: string | null
  hidden: boolean
  createdAt: string
}

export type NewNote = Omit<Note, 'id' | 'hidden' | 'createdAt'>

export const FIELD_LIMIT = 140

export const METHOD_PRESETS = [
  'EEG',
  'fNIRS',
  'Heart rate / HRV',
  'Skin conductance',
  'Eye tracking',
  'Motion capture',
  'Surveys',
  'Interviews',
  'VR / simulation',
  'Fieldwork',
  'Environmental sensors',
  'Cortisol / biomarkers',
] as const

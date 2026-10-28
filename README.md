# Encoding Experiences Summit: interactive note wall

A live-event web app for the **Encoding Experiences Summit**: attendees pin
post-it notes onto an interactive 3D human figure standing in a calm room.
Each note encodes four dimensions of how we measure human experience in
neuroarchitecture:

1. **What** do people study?
2. **Using what methods?**
3. **Why?**
4. **What do they wish they knew?** The "4th dimension", shown glowing gold.

Built with Vite + React + TypeScript + @react-three/fiber/drei, Zustand, and
Supabase (with an in-memory demo fallback).

## Pages

| Route | Purpose |
| --- | --- |
| `#/` | The 3D room. Click a pulsing dot (or a body part / object) to read and add notes. |
| `#/submit` | Mobile-first form reached from the projector QR code. |
| `#/projector` | Full-screen auto-rotating view with title, cycling recent notes, and the QR code. |
| `#/admin` | Password-protected moderation (hide / delete notes). |

Other features: hover tooltips, note counts per anchor, camera fly-to on
selection, live updates between clients, search + filters (anchor, method,
"wish I knew" only), a dimmed **Wish I knew** view, and JSON/CSV export
(filenames prefixed `encoding-experiences-summit`).

## Run locally

```bash
npm install
npm run dev
```

With no `.env` present the app runs in **demo mode**: 12 seed notes, stored in
memory, synced across tabs of the same browser. Admin password in demo mode is
`demo`.

> This repo's `.npmrc` points npm at an Autodesk Artifactory mirror (the public
> registry is blocked on the corporate network). Delete `.npmrc` if you are on
> a normal network.

## Connect Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run [supabase/schema.sql](supabase/schema.sql).
   **Edit the `crypt('change-me', …)` line first**: that string becomes the
   admin password for `#/admin`.
3. Copy `env.example` to `.env` and fill in the project URL and anon key
   (Project Settings → API).
4. Restart `npm run dev`. The "demo mode" badge disappears and notes are
   shared live between all devices via Supabase Realtime.

Security model: row-level security lets anyone insert notes and read visible
ones; there are no public update/delete policies. Moderation goes through
`security definer` functions that check the password against a bcrypt hash in
an RLS-locked table, so the anon key alone can never hide or delete anything.

## Deploy (Vercel or Netlify)

The app is a static SPA using hash routing, so no rewrite rules are needed.

- **Vercel**: import the repo → framework "Vite" → add the two `VITE_…`
  environment variables → deploy.
- **Netlify**: build command `npm run build`, publish directory `dist`, same
  environment variables.

Then point the projector browser at `https://your-site/#/projector`; the QR
code it shows links to `#/submit` on the same origin automatically.

## Project structure

```
src/
  anchors.ts          anchor registry (ids, labels, 3D positions, camera targets)
  types.ts            Note shape, field limit, method presets
  store.ts            Zustand app state + filtering/search helpers
  seed.ts             12 example notes (demo mode)
  export.ts           JSON / CSV download
  backend/            storage adapters: supabase.ts, memory.ts (demo), index.ts (picker)
  scene/              everything inside the <Canvas>
    Scene.tsx         canvas, lights, wish-view dimming
    Mannequin.tsx     procedural figure (swap point for a GLB)
    Room.tsx          floor, walls, window, plant, chair, desk, lamp
    AnchorDots.tsx    pulsing dots, count badges, tooltips
    NoteSprites.tsx   post-it sprites + "encoding" materialize animation
    CameraRig.tsx     orbit controls + fly-to/reset animation
    textures.ts       canvas-drawn post-it / glyph textures
  ui/                 DOM panels: header, note form, lists, modal
  pages/              Home, Submit, Projector, Admin
supabase/schema.sql   tables, RLS policies, admin functions, realtime
tools/                dev-only Playwright scripts (screenshot, flow test)
```

## Swap the mannequin for a custom GLB

The figure in [src/scene/Mannequin.tsx](src/scene/Mannequin.tsx) is built from
primitives so the app needs no assets. To use your own model:

1. Put `figure.glb` in `public/models/`.
2. Replace the body of `Mannequin` with drei's loader:

   ```tsx
   import { useGLTF } from '@react-three/drei'

   export function Mannequin() {
     const { scene } = useGLTF('/models/figure.glb')
     return <primitive object={scene} />
   }
   useGLTF.preload('/models/figure.glb')
   ```

3. Keep clickable regions by wrapping named meshes of the GLB in
   `<Interactive anchorId="…">` groups (clone sub-objects out of the scene, or
   set `object.userData.anchorId` and handle it in a group-level `onClick`).
4. Scale/position the model so it stands on the floor at the origin at about
   1.75 units tall; the anchor dots in `anchors.ts` assume that pose, so
   adjust their `position` values to sit on your model's surface.

The anchor dots are independent of the figure's meshes, so notes, counts, and
camera fly-tos keep working even if you skip step 3.

## Add a new anchor point

Add one entry to `ANCHORS` in [src/anchors.ts](src/anchors.ts):

```ts
{ id: 'door', label: 'Door', hint: 'thresholds & transitions', kind: 'room',
  position: [x, y, z],          // where the dot sits
  cameraPosition: [x, y, z] },  // where the camera flies to
```

The dot, count badge, tooltip, filters, and the submit page's anchor picker all
derive from this list. Optionally wrap a mesh in
`<Interactive anchorId="door">` so hovering/clicking the object itself selects
it. Anchor ids are stored on notes, so don't rename ids after the event starts.

## Export & analysis

"More > Export JSON / CSV" downloads everything currently visible to the
client (hidden notes are excluded; use the Supabase dashboard for a raw dump).
CSV columns: `id, anchor_id, anchor_label, what, how, why, wish, methods,
author, created_at`.

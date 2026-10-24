# Credits & Asset Licences

All 3D geometry, shaders, textures, studio environment maps, choreography, and audio in **KUMO·SOFT° (云沫造物)** are 100% procedurally generated in-code or use open-source OFL / MIT / Apache-2.0 packages. No real-world corporate trademarks or copyrighted third-party media are used.

## Invented Brand Identity
- **KUMO·SOFT° / 云沫造物** — Original fictional tactile industrial design & sensory research studio created specifically for this 10-second motion-design film.

## Fonts (SIL Open Font License 1.1)
- **Plus Jakarta Sans** (`@fontsource/plus-jakarta-sans`) — Designed by Tokotype. Licensed under the SIL Open Font License 1.1 (OFL-1.1).
- **Outfit** (`@fontsource/outfit`) — Designed by Rodrigo Fuenzalida. Licensed under the SIL Open Font License 1.1 (OFL-1.1).
- **Noto Sans Simplified Chinese (Noto Sans SC)** (`@fontsource/noto-sans-sc`) — Designed by Google. Licensed under the SIL Open Font License 1.1 (OFL-1.1).
- **JetBrains Mono** (`@fontsource/jetbrains-mono`) — Designed by JetBrains. Licensed under the SIL Open Font License 1.1 (OFL-1.1).

## Software Libraries & Rendering Stack
- **Three.js** (`three`, including `RoomEnvironment`) — MIT License.
- **React & React DOM** (`react`, `react-dom`) — MIT License.
- **Lucide Icons** (`lucide-react`) — ISC License.
- **Tailwind CSS** (`tailwindcss`) — MIT License.

## Procedural Visual & Audio Assets (CC0 / Public Domain / Original Code)
- **Studio Softbox HDRI & Cyclorama**: Procedurally synthesized in `src/film/StudioScene.ts` via `THREE.PMREMGenerator` and custom GLSL shaders.
- **Micro-Grain & Contact Shadow Textures**: Deterministically synthesized via HTML5 2D `<canvas>` in `src/film/StudioScene.ts` using seeded hash functions.
- **ASMR Sound Design & Musical Score**: 100% mathematically synthesized at 48,000 Hz stereo in `src/film/soundEngine.ts` (Minnaert acoustic bubble chirps, soft-body sub-bass thuds, formant jelly squishes, and modal glass chimes) and mastered with FFmpeg EBU R128 `loudnorm` to −14.0 LUFS integrated, true peak ≤ −1.0 dBTP.

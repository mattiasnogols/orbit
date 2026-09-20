# Orbit

A 3D, interactive model of the solar system.

> **Status:** core, time controls, hover info, focus, CRUD & textures are implemented. 
> Unit tests and the performance pass are still pending.

## Tech stack

- **three** - scene, geometries, materials, lighting
- `three/addons/controls/OrbitControls.js` - orbit, zoom
- **Vite** - zero-config, ESM, fast HMR, simple production build
- **JavaScript (ESM)** with JSDoc types - plain DOM; easy to read
- **Custom DOM** - kid-friendly panels and sliders
- **Vitest** - scaling, orbital math
- `stats.js` - FPS check during the performance pass

## Requirements

- Node 18+

## Getting started

```bash
npm install
npm run dev
```

Scaffolded with:

```bash
npm create vite@latest . -- --template vanilla
npm install three
npm install -D vitest
```

## Textures

Planet, Sun, Moon and Saturn-ring maps live in `public/textures/`.
Sources and licence: `public/textures/CREDITS.md` (Solar System Scope, CC BY 4.0).

## Scaling & orbit rules

- Compress distances more than sizes so planets are not crowded near the Sun.
- Add a toggle: linear mode + huge scene for users who want true ratios.
- Default: circular orbits, planets on the XZ plane, counter-clockwise.
- Angular speed derives directly from the editable period, so changing "year length"
  changes motion immediately.

## Design decisions

- Size and distance use separate sqrt mappings
- The Sun uses a fixed radius outside the size mapping.
- Point light at origin with `decay = 0` keeps distant planets lit; low ambient reveals night sides.

## UI layout

- Centred top time bar: Play/Pause, speed down/up buttons.
- Right-hand panel: tree of planets with moons; CRUD

## Performance target

60 fps with the 8 planets + default moons.

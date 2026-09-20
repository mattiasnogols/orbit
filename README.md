# Orbit

A 3D, interactive model of the solar system.

> **Status:** core, time controls, hover info, focus, CRUD & textures are implemented.
> The performance pass is in progress (shared geometry, throttled picking and UI updates).

## Tech stack

- **three** - scene, geometries, materials, lighting
- `three/addons/controls/OrbitControls.js` - orbit, zoom
- **Vite** - zero-config, ESM, fast HMR, simple production build
- **JavaScript (ESM)** - plain DOM; easy to read
- **Custom DOM** - kid-friendly panels and sliders
- **Vitest** - unit tests (scaling, orbit, time, store, scene sync, focus)
- `stats.js` - FPS check during the performance pass

## Requirements

- Node 22.12+ (Vitest 5 requirement); Vite itself also runs on Node 18+

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
- "Realistic scale" toggle: linear mappings and a much larger scene; sizes and distances keep true
  relative ratios within their own mapping (the Sun keeps its fixed radius).
- Default: circular orbits, planets on the XZ plane, counter-clockwise when viewed from +Y.
- Angular speed derives directly from the editable period, so changing "year length"
  changes motion immediately.

## Design decisions

- Size and distance use separate sqrt mappings
- The Sun uses a fixed radius outside the size mapping.
- Point light at origin with `decay = 0` keeps distant planets lit; low ambient reveals night sides.

## UI layout

- Centred top time bar: Play/Pause, speed down/up buttons.
- Right-hand panel: tree of planets with moons; CRUD; "Realistic scale" toggle.

## Performance target

60 fps with the 8 planets + default moons.

## Feature flags

- `?stats` - show the `stats.js` FPS panel
- `?bodies=N` - add N stress planets with moons for performance testing
- `?realism` - start with the realistic scale toggle enabled

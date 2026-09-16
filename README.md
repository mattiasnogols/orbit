- Render the Sun, 8 planets, orbits, and moons;
- scale sizes and distances proportionally;
- animate orbits and spins, with user control of simulation time;
- support CRUD for planets and moons (name, size, colour, orbital speed, distance);
- show a hover tooltip with name, size, and distance from the centre;
- render enough to recognise Earth/Jupiter (textures + rotation);
- stay smooth and console-clean under interaction and body creation.

**Vite** - Zero-config dev server, ESM, fast HMR, simple production build
**JavaScript (ESM)**, JSDoc types - Task allows plain DOM; no compile friction; easy to read/grow
**three**
`three/addons/controls/OrbitControls.js`
**Custom DOM** - Kid-friendly panels/sliders;
**Vitest** - Unit-test pure logic (scaling, orbital math)
`stats.js` - FPS check during performance pass;

Node 18+ is required (verified locally: Node v18.19.1, npm 9.2.0).

```bash
npm create vite@latest . -- --template vanilla
npm install three
npm install -D vitest
```

Texture assets placed in `public/textures/`:
- Planet Texture Maps wiki (link in `TASK.md`)

Add `public/textures/CREDITS.md` with source URLs and licences.

```js
{
  id: 'earth',
  type: 'planet',            // star | planet | moon
  parentId: null,            // moon -> planet id
  name: 'Earth',
  radiusKm: 6371,
  distanceAU: 1.0,           // planets: from Sun; moons store distanceKm from planet
  distanceKm: 384400,        // moons only
  periodDays: 365.26,        // orbital period (also drives orbital speed)
  rotationHours: 23.93,      // spin period
  axialTiltDeg: 23.44,
  color: '#4f7fd6',
  texture: 'earth.jpg',
  ringTexture: null,
  startAngle: 0,
}

// simulation state
{
  paused: false,
  speed: 1,
  daysPerSecond: 2,
  simDays: 0,
  bodies: Map<id, bodyRecord>,
  selection: { selectedId, hoveredId }   // UI/scene refs kept separately
}
```
Guidelines:

- Compress distances more than sizes so planets are not crowded near the Sun.
- Add a "realism" toggle as a bonus: linear mode + huge scene for users who want true ratios.
- Default: circular orbits, planets on the XZ plane, counter-clockwise.
- Angular speed derives directly from the editable period, so changing "year length"
  changes motion immediately:

Layout: centred top time bar; collapsible right-hand panel; bottom-left help legend; floating tooltip.
Play/Pause (Space), speed down/up buttons
Tree of planets with nested moons; each row has focus, edit, delete;
  "Add planet" button and "Add moon" inside a planet.
"Restore solar system defaults" calls the seed data again.

Target: 60 fps with the 8 planets + default moons;


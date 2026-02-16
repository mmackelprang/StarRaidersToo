# Findings

## 3D Model Investigation (Feb 2026)

### Answer: iOS 3D models were NOT migrated

Audio was migrated (78 .mp3 files), but all 3D models are **procedurally generated** from Babylon.js primitives (CreateBox, CreateSphere, CreateCylinder). This is why enemies look "blocky."

### iOS Source Assets (at /d/prj/zylondefenders/zylons/)

| File | Size | Description |
|------|------|-------------|
| HumonScout.scn | 7.1 MB | Primary enemy scout — detailed 3D model |
| HumonHunter.scn | 419 KB | Heavy destroyer variant |
| HumonFighter.scn | 640 KB | Fighter variant (defined but unused in code) |
| zylonStation.scn | 3.1 MB | Starbase/repair station |
| galacticmap.scn | 13 MB | 3D galaxy map with quadrants |
| galacticmap.dae | 29 MB | Collada mesh for galaxy visualization |
| Scanner.scn | 24 KB | Tactical scanner display |
| meteor_NM_7366.scn | 175 KB | Meteor/asteroid with normal maps |
| 6x .scnp files | ~46 KB | Particle effects (explosions, torpedoes, shields) |

PBR texture sets also exist: BaseColor, AO, Emissive, Height, Metallic, Normal, Roughness maps.

### Current Procedural Models (in src/models/)

**HumonScoutModel.ts** (45 lines):
- Body: CreateBox (2×1.5×4), Cockpit: CreateSphere (8 segments!), Wings: 2× CreateBox
- Solid red emissive color, zero textures

**HumonDestroyerModel.ts** (65 lines):
- Body: CreateBox (3.5×2×6), Spike: CreateCylinder (6 tessellation!), Wings + Nacelles
- Solid dark red, zero textures

**ZylonStationModel.ts** (63 lines):
- Hub: CreateCylinder (8 tessellation = octagonal), Torus ring, 4 arm boxes, tip spheres
- Solid blue, zero textures

### Why They Look Blocky
- Spheres: 8 segments (should be 32+)
- Cylinders: 6 tessellation (should be 16+)
- No curved surfaces, no textures, no normal maps
- Flat emissive-only materials (no PBR)
- 5-8 primitives per ship total

### Format Challenge
- .scn files are Apple binary property lists (bplist00) — NOT directly usable on web
- Would need Xcode export to .glb/.gltf (or .dae → converter pipeline)
- The galacticmap.dae is already in Collada format and could potentially be converted

### Key Code References
- `src/entities/HumonShip.ts:62-67` — calls procedural model creators
- `src/entities/ZylonStation.ts:20-25` — calls procedural model creator
- iOS `HumonShip.swift:107-126` — loads SCNScene(named: "HumonScout.scn")
- iOS `Starbase.swift:20-24` — loads SCNScene(named: "zylonStation.scn")
- Physics bounding boxes match iOS exactly (enemies: 10×5×5, station: 10×10×10)

### README States (line 74)
"Programmatic models: All 3D models are built from Babylon.js primitives (no imported mesh files) for zero external asset dependencies."

### FUTURE_WORK.md States
"Ship detail: Procedural models are functional but basic. Could add more geometric detail, glow effects, or emissive textures."

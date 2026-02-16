# Task Plan: Upgrade 3D Models

## Objective
Replace blocky procedural ship models (5-8 primitives, flat colors) with significantly more detailed versions. The iOS source has detailed .scn models but they're Apple binary format and no Mac is available for export. Strategy: dramatically improve procedural geometry + upgrade materials + add visual effects. Then extract real iOS meshes via Python-based .scn converter.

## Current State
All phases complete. Procedural models upgraded, then real iOS meshes extracted via custom Python converter and embedded as .glb files. PR #5 merged to main.

## Phases

### Phase 1: Upgrade Materials to PBR
- [x] Replace `StandardMaterial` with `PBRMetallicRoughnessMaterial` in ShipMaterials.ts
- [x] Create procedural DynamicTexture for hull panel-line effects
- [x] Add metallic/roughness properties for realistic space-ship look
- [x] Add emissive accent colors (engine glows, cockpit lights, station warning lights)
- [x] Add a scene light source (HemisphericLight) for PBR to respond to
- Status: COMPLETE
- Files: `src/models/ShipMaterials.ts`, `src/scene/SceneSetup.ts`

### Phase 2: Redesign Humon Scout Model
- [x] Increase from 4 → ~21 primitives
- [x] Replace box body with tapered/angular fuselage
- [x] Upgrade cockpit from 8-seg sphere → 32-seg sphere with distinct canopy material
- [x] Redesign wings: angled sweep, wing-tip fins, panel surface detail
- [x] Add engine exhaust cones with emissive glow
- [x] Add structural detail: dorsal spine
- Status: COMPLETE
- Files: `src/models/HumonScoutModel.ts`

### Phase 3: Redesign Humon Destroyer Model
- [x] Increase from 7 → ~27 primitives
- [x] Multi-section fuselage (command section + hull + engineering)
- [x] Bridge/command tower, weapon turrets, keel, antenna
- [x] Engine nacelles with exhaust glow
- Status: COMPLETE
- Files: `src/models/HumonDestroyerModel.ts`

### Phase 4: Redesign Zylon Station Model
- [x] Increase from 10 → ~45 primitives
- [x] Dome hub, disc body, docking ring, truss arms, hanging pylons
- [x] Amber lights and beacon
- Status: COMPLETE
- Files: `src/models/ZylonStationModel.ts`

### Phase 5: Verification & Polish
- [x] `npx tsc --noEmit` passes
- [x] Visual check in browser
- [x] Performance check: no frame rate drops
- Status: COMPLETE

### Phase 6: .scn Binary Extraction (Stretch Goal)
- [x] Built `tools/scn2glb.py` — pure Python converter for Apple SceneKit .scn → glTF Binary (.glb)
- [x] Handles NSKeyedArchiver binary plists, SCNGeometry vertex/normal/UV extraction
- [x] Handles quad primitives (fan triangulation), NSArray format variants
- [x] Texture extraction with path resolution through NSDictionary wrappers
- [x] Texture downscaling via Pillow (--max-texture flag, default 2048)
- [x] LOD selection: picks smallest mesh above 500 verts (--high-poly to override)
- [x] Successfully converted 6/7 iOS models (Scanner.scn skipped — parametric only)
- Status: COMPLETE
- Files: `tools/scn2glb.py`, `public/models/*.glb` (gitignored)

### Conversion Results
| Model | Vertices | Triangles | Textures | Size |
|-------|----------|-----------|----------|------|
| HumonHunter.glb | 7,702 | 3,882 | 3 (PBR) | 9.1 MB |
| HumonScout.glb | 12,522 | 8,348 | 2 | 2.5 MB |
| zylonStation.glb | 63,792 | 21,264 | 0 | 2.1 MB |
| meteor_NM_7366.glb | 4,194 | 8,384 | 3 | 1.9 MB |
| galacticmap.glb | 29,800 | 14,900 | 0 | 786 KB |
| HumonFighter.glb | 1,360 | 680 | 0 | 48 KB |

## Decisions Log
| Decision | Rationale | Date |
|----------|-----------|------|
| Procedural improvement over .scn export | No Mac available; .scn is Apple binary format | Feb 2026 |
| PBR materials with procedural textures | iOS UV textures are atlas-mapped to .scn geometry; won't map to our primitives | Feb 2026 |
| Skip .scn extraction for now | Complex NSKeyedArchiver binary; stretch goal only | Feb 2026 |
| Built Python .scn converter after all | plistlib can parse NSKeyedArchiver; vertex data is raw float32 | Feb 2026 |
| Texture downscale to 2048 max | HumonHunter had 4096x4096 PBR textures → 84MB .glb; 2048 brings it to 9MB | Feb 2026 |
| Low-poly LOD by default | HumonScout 126K-vert mesh unnecessary for web; 12K-vert LOD is sufficient | Feb 2026 |
| MIN_VERTS=500 threshold | Prevents picking bounding box cubes (36 verts) as the "smallest" geometry | Feb 2026 |

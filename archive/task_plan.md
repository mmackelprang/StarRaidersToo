# Task Plan: Upgrade 3D Models

## Objective
Replace blocky procedural ship models (5-8 primitives, flat colors) with significantly more detailed versions. The iOS source has detailed .scn models but they're Apple binary format and no Mac is available for export. Strategy: dramatically improve procedural geometry + upgrade materials + add visual effects.

## Current State
- **HumonScoutModel.ts**: 4 primitives (box body, 8-segment sphere cockpit, 2 box wings). Solid red.
- **HumonDestroyerModel.ts**: 7 primitives (box body, 6-tessellation cone, 2 box wings, 2 low-poly nacelles). Solid dark red.
- **ZylonStationModel.ts**: 10 primitives (8-sided cylinder hub, torus ring, 4 box arms, 4 low-poly sphere tips). Solid blue.
- **ShipMaterials.ts**: StandardMaterial only, emissive+diffuse colors, zero textures.

## Phases

### Phase 1: Upgrade Materials to PBR
- [ ] Replace `StandardMaterial` with `PBRMetallicRoughnessMaterial` in ShipMaterials.ts
- [ ] Create procedural DynamicTexture for hull panel-line effects (since iOS UV textures won't map to our geometry)
- [ ] Add metallic/roughness properties for realistic space-ship look
- [ ] Add emissive accent colors (engine glows, cockpit lights, station warning lights)
- [ ] Add a scene light source (PointLight or HemisphericLight) for PBR to respond to
- Status: NOT STARTED
- Files: `src/models/ShipMaterials.ts`, `src/scene/SceneSetup.ts`

### Phase 2: Redesign Humon Scout Model
- [ ] Increase from 4 → ~20 primitives
- [ ] Replace box body with tapered/angular fuselage (multiple boxes at angles, or CreateLathe)
- [ ] Upgrade cockpit from 8-seg sphere → 32-seg sphere with distinct canopy material
- [ ] Redesign wings: angled sweep, wing-tip fins, panel surface detail
- [ ] Add engine exhaust cones (rear-facing cylinders with emissive glow)
- [ ] Add structural detail: antenna, hull ridges, weapon hardpoints
- [ ] Higher tessellation on all curved surfaces (16+ segments)
- Status: NOT STARTED
- Files: `src/models/HumonScoutModel.ts`

### Phase 3: Redesign Humon Destroyer Model
- [ ] Increase from 7 → ~25 primitives
- [ ] Heavier, more aggressive silhouette than scout
- [ ] Multi-section fuselage (command section + hull + engineering)
- [ ] Forward spike: higher tessellation (16+), more menacing
- [ ] Larger angular wings with surface greebles (small box/cylinder details)
- [ ] Engine nacelles: detailed with exhaust glow, intake scoops
- [ ] Bridge/command tower section
- [ ] Weapon turret details
- Status: NOT STARTED
- Files: `src/models/HumonDestroyerModel.ts`

### Phase 4: Redesign Zylon Station Model
- [ ] Increase from 10 → ~35 primitives
- [ ] Reference iOS screenshot: dome-shaped top, hanging pylons, arm-mounted modules
- [ ] Central hub: larger, multi-tiered (disc + dome + underbelly)
- [ ] Docking ring: thicker, segmented with docking ports
- [ ] Arms: structural trusses (pairs of thin boxes), end modules with antenna
- [ ] Add hanging pylons/struts below the hub
- [ ] Add surface detail: windows (emissive dots), hull plating panels
- [ ] Station lights: emissive accent materials in orange/amber (matching iOS screenshot)
- Status: NOT STARTED
- Files: `src/models/ZylonStationModel.ts`

### Phase 5: Verification & Polish
- [ ] `npx tsc --noEmit` passes
- [ ] Visual check in browser: all 3 models render correctly
- [ ] Performance check: no frame rate drops from added geometry
- [ ] Models look good from multiple angles (fore view, aft view, galactic map approach)
- [ ] Consistent visual style across all models
- Status: NOT STARTED

### Phase 6: (Stretch) Attempt .scn Binary Extraction
- [ ] Try parsing .scn binary with Python plistlib + NSKeyedUnarchiver logic
- [ ] If mesh vertex/face data can be extracted, convert to .glb
- [ ] Replace procedural models with imported meshes + iOS PBR textures
- Status: NOT STARTED — only if Phases 1-5 complete and user wants more

## Decisions Log
| Decision | Rationale | Date |
|----------|-----------|------|
| Procedural improvement over .scn export | No Mac available; .scn is Apple binary format | Feb 2026 |
| PBR materials with procedural textures | iOS UV textures are atlas-mapped to .scn geometry; won't map to our primitives | Feb 2026 |
| Skip .scn extraction for now | Complex NSKeyedArchiver binary; stretch goal only | Feb 2026 |

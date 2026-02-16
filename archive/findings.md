# Findings

## 3D Model Investigation (Feb 2026)

### Answer: iOS 3D models were NOT migrated
Audio was migrated (78 .mp3 files), but all 3D models were **procedurally generated** from Babylon.js primitives (CreateBox, CreateSphere, CreateCylinder). This is why enemies looked "blocky."

### iOS Source Assets (at /d/prj/zylondefenders/zylons/)

| File | Size | Description |
|------|------|-------------|
| HumonScout.scn | 7.1 MB | Primary enemy scout — 2 geometries (12K + 126K verts) |
| HumonHunter.scn | 419 KB | Heavy destroyer — 7,702 verts, 5-bone skeleton, PBR textures |
| HumonFighter.scn | 640 KB | Fighter — 3 geometries, Wings_low at 1,360 verts |
| zylonStation.scn | 3.1 MB | Starbase — 63,792 verts (Zstation) + 36 verts (Cube bounding box) |
| galacticmap.scn | 13 MB | 134 geometries, Ring_8 at 29,800 verts is largest |
| Scanner.scn | 24 KB | Parametric only (SCNTube, SCNTorus) — not convertible |
| meteor_NM_7366.scn | 175 KB | Meteor — 4,194 verts, 8,384 tris |
| 6x .scnp files | ~46 KB | Particle effects (explosions, torpedoes, shields) |

PBR texture sets: BaseColor, AO, Emissive, Height, Metallic, Normal, Roughness maps (up to 4096x4096).

### .scn Binary Format (NSKeyedArchiver)

Key discoveries from building the converter:

- **Format**: Binary plist (`bplist00`) using NSKeyedArchiver serialization
- **Structure**: `$objects` array with UID cross-references, `$top.root` points to the scene root
- **NSArray quirk**: Two serialization formats — `NS.objects: [uid, ...]` AND `NS.object.0`, `NS.object.1`, etc.
- **NSDictionary**: Uses `NS.keys` + `NS.objects` parallel arrays
- **SCNGeometrySource**: Raw `data` field (float32 LE), with `vectorCount`, `componentsPerVector`, `dataStride`, `dataOffset`
- **SCNGeometryElement**: `primitiveType` (0=triangles, 4=polygons/quads), `bytesPerIndex` (2=uint16, 4=uint32)
- **Texture paths**: Stored in SCNMaterialProperty → `image` → NSDictionary → `path` (not directly on the property)
- **Quad triangulation**: Fan method — polygon [a,b,c,d] → triangles [a,b,c] + [a,c,d]

### Key Code References
- `src/entities/HumonShip.ts:62-67` — calls procedural model creators
- `src/entities/ZylonStation.ts:20-25` — calls procedural model creator
- iOS `HumonShip.swift:107-126` — loads SCNScene(named: "HumonScout.scn")
- iOS `Starbase.swift:20-24` — loads SCNScene(named: "zylonStation.scn")
- Physics bounding boxes match iOS exactly (enemies: 10x5x5, station: 10x10x10)

# Progress Log

## Session Log
| Timestamp | Action | Result |
|-----------|--------|--------|
| Feb 2026 | Investigated 3D model status | iOS .scn models NOT migrated; only procedural primitives exist |
| Feb 2026 | Searched for iOS source assets | Found .scn models + PBR texture sets in /d/prj/zylondefenders/ |
| Feb 2026 | Checked iOS screenshots | Station is highly detailed high-poly model; huge gap from current |
| Feb 2026 | Checked PBR textures | UV atlas textures — won't map to procedural geometry |
| Feb 2026 | Checked available tools | No Mac, no Blender, no assimp; Python available |
| Feb 2026 | Created task plan | 6-phase plan: PBR materials → Scout → Destroyer → Station → Verify → (Stretch) .scn extract |
| Feb 2026 | Phase 1: PBR materials | Added HemisphericLight to SceneSetup.ts, rewrote ShipMaterials.ts with 7 PBR material functions |
| Feb 2026 | Phase 2: Scout redesign | 4 → ~21 primitives: tapered fuselage, swept wings w/ fins, engine exhausts with glow, dorsal spine |
| Feb 2026 | Phase 3: Destroyer redesign | 7 → ~27 primitives: multi-section hull, bridge tower, weapon turrets, detailed nacelles, keel, antenna |
| Feb 2026 | Phase 4: Station redesign | 10 → ~45 primitives: dome hub, disc body, docking ring, truss arms, hanging pylons, amber lights, beacon |
| Feb 2026 | Phase 5: Verification | tsc --noEmit clean, fixed unused variable, starfield lighting unaffected |
| Feb 2026 | Created FUTURE-WORK.md | Comprehensive iOS gap analysis: 4 conversion options, 15 feature gaps, 5-phase implementation plan |
| Feb 2026 | Investigated .scn binary format | NSKeyedArchiver binary plists; vertex data extractable with Python plistlib |
| Feb 2026 | Built tools/scn2glb.py v1 | Pure Python .scn → .glb converter; initial run converted HumonHunter + meteor |
| Feb 2026 | Fixed NSArray format bug | Some .scn files use NS.object.N keys instead of NS.objects list |
| Feb 2026 | Fixed quad primitive support | HumonScout uses primitiveType 4 (polygons); added fan triangulation |
| Feb 2026 | Fixed texture path resolution | Texture paths stored in NSDictionary wrapper, not directly on material property |
| Feb 2026 | Conversion run 2 | 6/7 models converted; HumonHunter 84MB (4K textures), HumonScout 126K verts (high-poly) |
| Feb 2026 | Added texture downscaling | Pillow-based resize with --max-texture flag; 4096→2048 reduces HumonHunter to 9MB |
| Feb 2026 | Added LOD selection | --high-poly flag; MIN_VERTS=500 threshold skips bounding boxes; HumonScout now 12K verts |
| Feb 2026 | Final conversion | 6 models converted: total ~16.4MB (down from ~95MB). Scanner.scn skipped (parametric) |
| Feb 2026 | Committed & merged | scn2glb.py committed; .glb files gitignored; PR #5 merged to main |

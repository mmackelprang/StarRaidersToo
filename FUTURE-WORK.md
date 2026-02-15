# Future Work — StarRaidersToo

This document tracks all known gaps between the original iOS Zylon Defenders game and this TypeScript/Babylon.js port, with implementation plans for closing each gap.

---

## 1. Converting iOS 3D Models (.scn) to Web-Ready Format

The iOS game uses Apple SceneKit `.scn` files with PBR texture sets. These are binary property list archives (`bplist00`) containing serialized `NSKeyedArchiver` objects — they cannot be loaded directly in a browser. The current TS port uses procedural Babylon.js geometry as a substitute.

### Source Assets

Located at the iOS project path (not checked into this repo):

| File | Size | Description |
|------|------|-------------|
| `HumonScout.scn` | 7.1 MB | Primary enemy scout ship |
| `HumonHunter.scn` | 419 KB | Destroyer / hunter-class ship |
| `HumonFighter.scn` | 640 KB | Fighter variant (defined but unused in iOS code) |
| `zylonStation.scn` | 3.1 MB | Zylon starbase / repair station |
| `galacticmap.scn` | 13 MB | 3D galaxy map visualization |
| `galacticmap.dae` | 29 MB | Collada mesh for galaxy (already web-convertible) |
| `Scanner.scn` | 24 KB | Tactical scanner display model |
| `meteor_NM_7366.scn` | 175 KB | Asteroid with normal maps |
| 6x `.scnp` files | ~46 KB | Particle system definitions |

PBR texture sets (per model):
- `HUMON Textures/Atari 1_BaseColor.png`, `_AO.png`, `_Emissive.png`, `_Height.png`, `_Metallic.png`, `_Normal.png`, `_Roughness.png`
- `BaseStarTextures/Atari 2_BaseColor.png`, `_AO.png`, `_Emissive.png`, `_Height.png`, `_Metallic.png`, `_Normal.png`, `_Roughness.png`

### Option A: Export via Mac + Xcode (Recommended)

Requires a Mac with Xcode installed. This is the most reliable path.

**Step 1 — Open in Xcode Scene Editor**
```
1. Open the iOS project in Xcode (zylondefenders.xcodeproj)
2. Navigate to the zylons/ folder in the project navigator
3. Double-click any .scn file to open in the SceneKit Editor
4. Verify the model renders correctly with materials
```

**Step 2 — Export to Collada (.dae)**
```
1. In the SceneKit Editor, select File → Export Scene...
2. Choose "Collada (.dae)" as the format
3. Save each model:
   - HumonScout.scn  → HumonScout.dae
   - HumonHunter.scn → HumonHunter.dae
   - zylonStation.scn → ZylonStation.dae
4. Ensure "Include embedded textures" is checked if available
```

**Step 3 — Convert Collada to glTF/GLB**
```bash
# Install the glTF pipeline tool
npm install -g gltf-pipeline
# Or use the Khronos COLLADA2GLTF converter
npm install -g collada2gltf

# Convert each .dae to .glb (binary glTF, single file)
collada2gltf -i HumonScout.dae -o HumonScout.glb
collada2gltf -i HumonHunter.dae -o HumonHunter.glb
collada2gltf -i ZylonStation.dae -o ZylonStation.glb

# Alternative using gltf-pipeline for optimization
gltf-pipeline -i HumonScout.gltf -o HumonScout.glb --draco.compressionLevel=7
```

**Step 4 — Apply PBR Textures (if not embedded)**
```
If textures were not embedded during export:
1. Open each .gltf (text format) in a text editor
2. Add material references to the PBR texture files:
   - baseColorTexture → Atari 1_BaseColor.png
   - metallicRoughnessTexture → combine Metallic + Roughness channels
   - normalTexture → Atari 1_Normal.png
   - occlusionTexture → Atari 1_AO.png
   - emissiveTexture → Atari 1_Emissive.png
3. Re-pack to .glb: gltf-pipeline -i model.gltf -o model.glb
```

**Step 5 — Optimize for Web**
```bash
# Compress with Draco (reduces file size 60-90%)
gltf-pipeline -i model.glb -o model-optimized.glb --draco.compressionLevel=7

# Or use gltfpack for aggressive optimization
gltfpack -i model.glb -o model-optimized.glb -tc -cc

# Target sizes: <500KB per ship model, <1MB for station
```

**Step 6 — Integrate into Babylon.js**
```typescript
// In each model file (e.g., HumonScoutModel.ts):
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF';

export async function loadHumonScoutModel(scene: Scene, parent: TransformNode): Promise<void> {
  const result = await SceneLoader.ImportMeshAsync('', '/models/', 'HumonScout.glb', scene);
  result.meshes.forEach(mesh => { mesh.parent = parent; });
  // Scale to match physics bounding box (10w x 5h x 5d)
  parent.scaling = new Vector3(0.06, 0.06, 0.06); // adjust per model
}
```

**Step 7 — Update Entity Classes**
```
1. Change model creation from synchronous to async (await loadHumonScoutModel)
2. Add loading state / placeholder while model loads
3. Place .glb files in public/models/
4. Update vite.config.ts if needed for asset handling
5. Remove procedural model code once .glb models are verified
```

### Option B: Export via Blender (Mac or Windows)

Requires Blender with the SceneKit import plugin, which has limited support.

```
1. Install Blender (blender.org)
2. Install a .scn importer plugin (community-maintained, reliability varies)
   - Search: "Blender SceneKit importer" or "blender .scn import"
   - Alternative: use Apple's scntool CLI (Mac only) to convert .scn → .dae first
3. Import the .dae or .scn into Blender
4. Verify mesh integrity and material assignments
5. Export as glTF 2.0 (.glb):
   File → Export → glTF 2.0
   - Format: GLB
   - Include: Selected Objects
   - Transform: +Y Up
   - Geometry: Apply Modifiers, UVs, Normals, Tangents
   - Material: Export Materials
6. Follow Steps 5-7 from Option A
```

### Option C: Collada Direct Conversion (galacticmap.dae only)

The `galacticmap.dae` file is already in Collada format and can be converted without a Mac:

```bash
npm install -g collada2gltf
collada2gltf -i galacticmap.dae -o galacticmap.glb
gltf-pipeline -i galacticmap.glb -o galacticmap-optimized.glb --draco.compressionLevel=7
```

### Option D: Python Binary Extraction (Experimental)

Attempt to parse the `.scn` binary directly. This is fragile and may not work for all models.

```python
import plistlib

# .scn files are NSKeyedArchiver binary plists
with open('HumonScout.scn', 'rb') as f:
    data = plistlib.load(f)

# Navigate the $objects array looking for mesh geometry data
# SCNGeometrySource contains vertex positions, normals, UVs
# SCNGeometryElement contains triangle index data
# This requires understanding NSKeyedArchiver serialization format

# If successful, write extracted vertices/faces to .obj or .gltf
```

This approach requires deep knowledge of Apple's `NSKeyedArchiver` format and SceneKit's internal class hierarchy. It is not recommended unless all other options are exhausted.

---

## 2. Feature Gap Analysis

### 2.1 Gameplay Mechanics

#### Troop Movement & Station Siege (HIGH PRIORITY)
- **iOS**: Humon forces advance between sectors every `4800/difficulty` frames. When all 4 sectors adjacent to a starbase are enemy-occupied, a siege begins. After N update cycles, the starbase is destroyed. This creates strategic time pressure.
- **TS Status**: Framework exists (`TroopMovementManager.ts`). Timing interval calculated, siege detection checks adjacency, `siegedStations` array maintained. But **no actual movement logic** and **no destruction timer**.
- **Files**: `src/galaxy/TroopMovementManager.ts`

#### Ship System Damage Cascade (MEDIUM PRIORITY)
- **iOS**: Hull, engine, scanner, and shield subsystems degrade through Functional → Damaged → Severely Damaged → Destroyed states. Damage affects gameplay: engine damage reduces max speed, scanner damage degrades radar, hull damage triggers warnings.
- **TS Status**: `ShipSystems` interface with all 6 subsystems defined in `types.ts`. `ZylonShip.ts` tracks states. `CombatManager.ts` sets damage states on hits. But **damage has zero gameplay effect** — it's dead code. Only shield strength actually matters.
- **Files**: `src/entities/ZylonShip.ts`, `src/combat/CombatManager.ts`, `src/types.ts`

#### Fighter Ship Type (LOW PRIORITY)
- **iOS**: Three enemy classes — Scout, Fighter, Destroyer — with different stats and potentially different behaviors.
- **TS Status**: `ShipType.Fighter` enum exists (value 1) but `HumonShip.ts` only checks for `Destroyer`, and Fighter falls through to the Scout model. No `HumonFighterModel.ts` exists. No distinct AI or stats for fighters.
- **Files**: `src/entities/HumonShip.ts`, `src/types.ts`

#### Pause System (LOW PRIORITY)
- **iOS**: Pauses scene rendering and physics with a restart button overlay.
- **TS Status**: `paused` flag exists in `Game.ts` and `GameStateManager.ts`. The game loop checks it (`if (!this.gameOver && !this.paused)`). But **`paused` is never set to `true`** — no keybinding, no button, no UI.
- **Files**: `src/Game.ts`, `src/core/GameStateManager.ts`

### 2.2 Audio

#### Damage Report Voice Clips (MEDIUM PRIORITY)
- **iOS**: When ship systems take damage, the computer voice plays contextual clips (e.g., "Inner hull failure", "Grid warp governor malfunction", "Plasma manifold failure").
- **TS Status**: All 11 damage report audio files are converted and loaded in the audio manifest:
  `babelfishCircuitFailure`, `empathyCircuitDamaged`, `genderIdentityEnforcement`, `gridCoreFailureImminent`, `gridwarpGovernorMalfunction`, `innerHullFailure`, `outerHullFailure`, `plasmaManifoldFailure`, `proximateImprobabilityDriveDetected`, `ReallyreallyBad`, `viralIntrusionDetected`
  But **no method calls them** — they are loaded and orphaned.
- **Files**: `src/audio/SoundEffects.ts`, `src/audio/AudioPreloader.ts`

#### Shield Percentage Voice (MEDIUM PRIORITY)
- **iOS**: When shields take a hit, the computer announces "Shields [percentage] percent" or "Shields failure".
- **TS Status**: `VoiceAnnouncer.announceShields(percentage)` is **fully implemented** — rounds to nearest 10%, plays the correct clip sequence. But it is **never called** from `Game.ts` or `CombatManager.ts`. Pure dead code.
- **Files**: `src/audio/VoiceAnnouncer.ts`, `src/Game.ts`

#### Full Sector Name Voice Clips (LOW PRIORITY)
- **iOS**: Uses full sector name clips (`AlphaSector`, `BetaSector`, etc.) for rich announcements.
- **TS Status**: Full clips available but the current announcer uses shorter `alpha`/`beta`/`gamma`/`delta` clips instead. Functional but less polished.
- **Files**: `src/audio/VoiceAnnouncer.ts`

### 2.3 Visual Effects

#### 3D Models (PARTIALLY ADDRESSED)
- **iOS**: High-poly meshes with UV-mapped PBR textures (BaseColor, Normal, Metallic, Roughness, AO, Emissive, Height maps). Models are 419KB–7.1MB .scn files.
- **TS Status**: Upgraded from flat-color primitives to PBR procedural geometry (Scout: 21 primitives, Destroyer: 27, Station: 45). Recognizable silhouettes with metallic/emissive materials. Still missing organic detail, panel lines, and surface wear from UV textures.
- **Resolution**: See Section 1 (Model Conversion) above.

#### Repair Beam Visual (MEDIUM PRIORITY)
- **iOS**: Animated additive-blend beam from station to player ship during repair sequence. Visible 3D effect with glow.
- **TS Status**: Repair is audio + state change only. `EntitySpawner.ts` calls `ship.repair()` after an 8-second delay. **No visual beam whatsoever.**
- **Files**: `src/entities/ZylonStation.ts`, `src/entities/EntitySpawner.ts`

#### Scanner Gaussian Blur (LOW PRIORITY)
- **iOS**: Scan beam has a gaussian blur filter (radius 5) for a soft glow effect.
- **TS Status**: Plain canvas rendering with a semi-transparent green line. No blur or glow.
- **Files**: `src/ui/ScannerDisplay.ts`

#### Crosshair Texture (LOW PRIORITY)
- **iOS**: Uses a textured sprite (`xenonHUD.png`) for the targeting reticle.
- **TS Status**: DOM-based green crosshair lines. Functional but less detailed.
- **Files**: `src/ui/HudOverlay.ts`

### 2.4 Companion Controller / Networking

#### WebSocket Companion App (LOW PRIORITY)
- **iOS**: Multipeer Connectivity framework (`MCController.swift`) for local network companion device control. Service type "zylons".
- **TS Status**: `CompanionProtocol.ts` parses commands, `CommandRouter.ts` routes them, `WebSocketServer.ts` is a stub with `simulateCommand()`. Three commands (Abort, Attack, Tac) are parsed but not routed. No actual WebSocket server runs.
- **Files**: `src/network/CompanionProtocol.ts`, `src/network/WebSocketServer.ts`, `src/network/CommandRouter.ts`

### 2.5 UI Polish

#### MFi / Extended Gamepad (DONE)
- **iOS**: GCExtendedGamepad support with thumbstick, triggers, shoulder buttons.
- **TS Status**: Implemented via standard Gamepad API in `GamepadController.ts`. Left stick steering, A/RT fire, LT shields, B view toggle, LB map.

#### Telemetry WOPR Sound (LOW PRIORITY)
- **iOS**: Typewriter-style WOPR sound effect plays during telemetry text display (each character triggers a subtle click/beep).
- **TS Status**: `TelemetryAudio.ts` exists as a framework but the per-character WOPR beep is not wired to the prologue or game-over typewriter displays.
- **Files**: `src/audio/TelemetryAudio.ts`, `src/screens/PrologueScreen.ts`, `src/ui/GameOverScreen.ts`

---

## 3. Implementation Plan

### Phase 1: Wire Orphaned Systems (Quick Wins)
**Effort**: Small — code exists, just needs to be connected.

| Task | Files to Modify | Description |
|------|----------------|-------------|
| Call `announceShields()` on shield hit | `CombatManager.ts` or `Game.ts` | After shield damage, call `voiceAnnouncer.announceShields(ship.shieldStrength)` |
| Play damage report voices | `CombatManager.ts`, `SoundEffects.ts` | Add `playDamageReport(system)` method, call when subsystem state changes |
| Add pause keybinding (P or Escape) | `Game.ts` | Toggle `this.paused`, show/hide a simple pause overlay |
| Wire WOPR telemetry audio | `PrologueScreen.ts`, `GameOverScreen.ts` | Play per-character beep during typewriter effect |

### Phase 2: Gameplay Depth (Ship Systems & Troop Movement)
**Effort**: Medium — logic needs to be designed and implemented.

| Task | Files to Modify | Description |
|------|----------------|-------------|
| Ship system damage effects | `Game.ts`, `ZylonShip.ts`, `CombatManager.ts` | Engine damage → reduce max speed. Scanner damage → degrade radar (fewer blips, shorter range). Hull damage → warnings + game over at Destroyed. |
| Troop movement AI | `TroopMovementManager.ts`, `GalaxyMapModel.ts` | Every update interval: pick random enemy sector, move 1-2 ships to random adjacent sector. Track occupation changes. |
| Station siege timer | `TroopMovementManager.ts`, `Game.ts` | When station surrounded for N updates, destroy it. Announce to player. Check all-stations-lost game-over condition. |
| Fighter ship variant | `HumonShip.ts`, new `HumonFighterModel.ts` | Create intermediate model between Scout and Destroyer. Give Fighter distinct AI (more aggressive maneuvers, faster firing). |

### Phase 3: Visual Polish
**Effort**: Medium — new rendering code needed.

| Task | Files to Modify | Description |
|------|----------------|-------------|
| Repair beam effect | `ZylonStation.ts`, `EntitySpawner.ts` | Create a glowing cylinder or ribbon mesh from station to ship origin. Animate with emissive pulsing over 8-second repair. Dispose on complete. |
| Scanner beam glow | `ScannerDisplay.ts` | Apply CSS `filter: blur(2px)` on the beam canvas layer, or draw a wider semi-transparent beam behind the main line. |
| Crosshair texture | `HudOverlay.ts` | Replace DOM lines with an `<img>` or SVG reticle for a more detailed look. |

### Phase 4: 3D Model Import (Requires Mac Access)
**Effort**: Large — requires hardware and pipeline setup.

| Task | Description |
|------|-------------|
| Export .scn → .dae via Xcode | Follow Section 1, Option A, Steps 1-2 |
| Convert .dae → .glb with PBR textures | Follow Section 1, Option A, Steps 3-5 |
| Integrate .glb into Babylon.js | Follow Section 1, Option A, Steps 6-7 |
| Optimize for web (Draco compression) | Target <500KB per ship, <1MB for station |
| Convert galacticmap.dae → .glb | Section 1, Option C — no Mac needed |
| Fallback: keep procedural models | If .glb unavailable, current PBR procedurals serve as fallback |

### Phase 5: Companion Controller (Stretch)
**Effort**: Large — requires new UI and server infrastructure.

| Task | Files to Modify | Description |
|------|----------------|-------------|
| Implement WebSocket server | `WebSocketServer.ts` | Use a Vite plugin or small Express sidecar to run a real WS server |
| Build companion HTML page | New file: `public/companion.html` | Mobile-friendly control panel with buttons for all commands |
| Wire remaining commands | `CommandRouter.ts` | Implement Abort (cancel warp), Attack (auto-target), Tac (toggle tactical) |
| Connection UI | `HudOverlay.ts` | Show connection status indicator when companion is linked |

---

## 4. Priority Summary

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| **P0** | Wire `announceShields()` | Trivial | Immediate audio feedback on combat hits |
| **P0** | Wire damage report voices | Small | 11 voice clips brought to life |
| **P0** | Add pause (P key) | Small | Basic expected game feature |
| **P1** | Ship system damage effects | Medium | Adds survival depth and tension |
| **P1** | Troop movement + siege | Medium | Core strategic pressure loop |
| **P1** | Repair beam visual | Small | Starbase visits feel rewarding |
| **P2** | Fighter ship variant | Medium | Enemy variety |
| **P2** | Scanner beam glow | Small | Visual polish |
| **P2** | WOPR telemetry audio | Small | Atmospheric detail |
| **P3** | 3D model import (.glb) | Large | Highest visual fidelity |
| **P3** | Companion controller | Large | Multiplayer novelty |

# Future Work — StarRaidersToo

Intentional stubs and planned features that are not bugs — documented here for future development.

## Companion Controller (Network)

**Files**: `src/network/CompanionProtocol.ts`, `src/network/WebSocketServer.ts`, `src/network/CommandRouter.ts`

The companion controller system is scaffolded but not fully connected. It allows a second device (phone/tablet) to control the game via WebSocket commands.

- **CompanionProtocol.ts**: Parses/serializes commands. Three command types are parsed but not yet routed to game actions:
  - `ABORT` — abort current warp
  - `ATTACK` — auto-target nearest enemy
  - `TAC` — toggle tactical display
- **WebSocketServer.ts**: Entire class is a stub with `simulateCommand()` for testing. No actual WebSocket server is started. Needs a real WebSocket implementation (e.g., `ws` package or native WebSocket server behind a proxy).
- **CommandRouter.ts**: Routes parsed commands to game actions. Works for implemented commands (Speed, Fire, Shields, Fore, Aft, Grid). Needs handlers for abort/attack/tac.

**To complete**: Implement a WebSocket server (likely via a small Express/Fastify sidecar or Vite plugin), build the companion app UI (separate HTML page), and wire the three missing command handlers.

## Troop Movement System

**File**: `src/galaxy/TroopMovementManager.ts`

The troop movement manager tracks frame counts and fires updates at difficulty-scaled intervals (4800/difficulty frames between updates). However, the actual movement logic is a stub — it calls `update()` on the galaxy model but doesn't implement the iOS game's strategic AI where Humon forces move between sectors, attack starbases, and besiege stations.

**iOS behavior to port**:
- Humon ships randomly move to adjacent sectors each update interval
- If Humon ships reach a starbase sector, they begin a siege
- After N updates of siege, the starbase is destroyed
- This creates time pressure — the player must defend starbases

**To complete**: Implement `executeTroopMovement()` with sector adjacency logic, siege counters per starbase, and starbase destruction events.

## Audio Enhancements

- **Damage report voice clips**: 11 damage report audio files exist (`babelfishCircuitFailure`, `empathyCircuitDamaged`, `genderIdentityEnforcement`, `gridCoreFailureImminent`, `gridwarpGovernorMalfunction`, `innerHullFailure`, `outerHullFailure`, `plasmaManifoldFailure`, `proximateImprobabilityDriveDetected`, `ReallyreallyBad`, `viralIntrusionDetected`). These should play when ship systems take damage, matching the iOS behavior.
- **Shield percentage voice**: `Shields10` through `Shields100` + `ShieldsFailure` + `percent` clips are converted and loaded but the `VoiceAnnouncer.announceShields()` method is not yet called from Game.ts during shield hit events.
- **Sector name voice clips**: `AlphaSector`, `BetaSector`, `GammaSector`, `DeltaSector` are available but not used — the current announcer uses the shorter `alpha`/`beta`/`gamma`/`delta` clips.

## Visual Polish

- **Motion blur**: Currently uses CSS filter (`PostProcessing.ts`). Could be upgraded to a Babylon.js post-processing pipeline for GPU-accelerated blur.
- **Particle effects**: Explosion, shield hit, torpedo trail particles exist but could be tuned for visual impact.
- **Ship detail**: Procedural models are functional but basic. Could add more geometric detail, glow effects, or emissive textures.

## Mobile / Touch Optimization

- Touch joystick works but hasn't been tested extensively on mobile browsers
- On-screen fire/shield buttons needed for mobile (currently keyboard/gamepad only for those actions)
- Performance monitoring (`PerformanceMonitor.ts`) tracks FPS but doesn't yet trigger adaptive quality reduction

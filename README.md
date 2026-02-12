# Star Raiders Too

A browser-based 3D space combat game ported from the iOS game *Zylon Defenders*, itself a tribute to the classic 1979 Atari *Star Raiders* by Doug Neubauer.

Defend the Zylon Empire against Humon invaders across a 128-sector galaxy. Warp between sectors, engage enemies with torpedoes, dock at starbases for repairs, and manage your ship's energy to survive.

## Tech Stack

- **3D Engine**: [Babylon.js](https://www.babylonjs.com/) (TypeScript-first, closest to SceneKit)
- **HUD / UI**: HTML/CSS overlays on the 3D canvas
- **Audio**: Web Audio API (OscillatorNode for tones, AudioBuffer for samples)
- **Input**: Touch joystick, keyboard (WASD/arrows), and Gamepad API
- **Build**: Vite + TypeScript (strict mode)
- **Tests**: Vitest (276 tests)

## Getting Started

```bash
npm install
npm run dev       # Start dev server at localhost:5173
npm run build     # Production build
npm run test      # Run all tests
npm run test:watch # Watch mode
```

## Controls

| Input | Action |
|-------|--------|
| **WASD / Arrow keys** | Steer ship |
| **Space** | Fire torpedo |
| **V** | Toggle fore/aft view |
| **G** | Toggle galactic map |
| **T** | Toggle tactical display |

### Gamepad (Standard mapping)

| Button | Action |
|--------|--------|
| Left Stick | Steer (scaled /40) |
| RT / A | Fire torpedo |
| LT | Toggle shields |
| B | Toggle fore/aft view |
| LB | Toggle galactic map |

## Architecture

The game follows a screen-based flow managed by `ScreenManager`:

```
Main Menu -> Prologue (optional) -> Game -> Game Over -> Main Menu
```

### Core Systems

| Directory | Purpose |
|-----------|---------|
| `src/scene/` | Babylon.js scene setup, starfield, camera rig, warp effect, entity spawner |
| `src/entities/` | ZylonShip (player), HumonShip (enemy AI), ZylonStation, Torpedo |
| `src/combat/` | CombatManager, CollisionHandler, TorpedoPool |
| `src/galaxy/` | GalaxyMapModel (128 sectors), SectorGrid, TroopMovementManager |
| `src/input/` | InputManager (unified), JoystickController, GamepadController |
| `src/audio/` | AudioManager, PhotonSoundPool, EngineSound, VoiceAnnouncer, SoundEffects |
| `src/ui/` | HudOverlay, ScannerDisplay, TacticalDisplay, AlertSystem, GalacticMap3D |
| `src/screens/` | MainMenu, PrologueScreen, GameOverScreen |
| `src/models/` | Procedural 3D ship models (HumonScout, HumonDestroyer, ZylonStation) |
| `src/particles/` | ExplosionEffect, TorpedoTrail |
| `src/network/` | CompanionProtocol, WebSocketServer (stub), CommandRouter |
| `src/core/` | Constants, types, GameStateManager, RankCalculator, ScreenManager |

### Key Design Decisions

- **Ship at origin**: The player ship sits at the world origin. `SectorObjectsNode` rotates around it via quaternion multiplication to simulate steering — matching the iOS SceneKit paradigm.
- **Programmatic models**: All 3D models are built from Babylon.js primitives (no imported mesh files) for zero external asset dependencies.
- **Integer division porting**: Swift integer division is ported as `Math.trunc(a / b)` applied per operand, not to the whole expression.
- **Audio placeholders**: Torpedo fire and engine hum use OscillatorNode tone generation. The AudioManager supports loading real audio files (.ogg/.mp3) when available.

## Gameplay

- **5 difficulty levels**: Cadet, Pilot, Warrior, Commander, Zylon Lord
- **128-sector galaxy**: 4 quadrants (Alpha, Beta, Gamma, Delta), each with 32 sectors
- **Enemy types**: Scouts, fighters, and destroyers with zig-zag AI and homing torpedoes
- **Starbases**: Dock to repair shields and refuel energy
- **13 ranks**: From "Zylon Hero" (best) to "Galactic Cook" (worst), based on enemies defeated and difficulty
- **Energy management**: Shields, speed, and torpedoes all drain energy — balance aggression with survival

## Credits

Based on *Star Raiders* by Doug Neubauer. iOS version (*Zylon Defenders*) by Jeff Glasse / Nine Industries. Music by Neon Insect. Special thanks to Lorenz Wiest for the [Star Raiders 6502 disassembly](https://github.com/lwiest/StarRaiders).

## License

MIT

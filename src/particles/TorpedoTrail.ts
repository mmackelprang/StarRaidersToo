/**
 * Torpedo trail particle effects.
 * Ported from Torpedo.scnp and HumonTorpedo.scnp.
 *
 * Continuous sparkle trail attached to torpedoes as they fly.
 * Zylon: cyan/white trail. Humon: orange/red trail.
 */

import { Scene } from '@babylonjs/core/scene';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import { Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

export function createZylonTorpedoTrail(
  scene: Scene,
  emitter: TransformNode,
): ParticleSystem {
  const ps = new ParticleSystem('zylonTrail', 30, scene);
  ps.emitter = emitter.position;
  ps.minLifeTime = 0.1;
  ps.maxLifeTime = 0.3;
  ps.emitRate = 40;
  ps.minSize = 0.1;
  ps.maxSize = 0.3;
  ps.color1 = new Color4(0.2, 0.8, 1.0, 1.0);   // cyan
  ps.color2 = new Color4(0.8, 0.9, 1.0, 0.8);    // white
  ps.colorDead = new Color4(0.0, 0.3, 0.5, 0.0);
  ps.minEmitPower = 0.5;
  ps.maxEmitPower = 1.5;
  ps.direction1 = new Vector3(-0.2, -0.2, 0.5);
  ps.direction2 = new Vector3(0.2, 0.2, 1.0);
  ps.gravity = Vector3.Zero();
  ps.start();
  return ps;
}

export function createHumonTorpedoTrail(
  scene: Scene,
  emitter: TransformNode,
): ParticleSystem {
  const ps = new ParticleSystem('humonTrail', 30, scene);
  ps.emitter = emitter.position;
  ps.minLifeTime = 0.1;
  ps.maxLifeTime = 0.3;
  ps.emitRate = 40;
  ps.minSize = 0.1;
  ps.maxSize = 0.3;
  ps.color1 = new Color4(1.0, 0.4, 0.1, 1.0);   // orange
  ps.color2 = new Color4(1.0, 0.1, 0.0, 0.8);    // red
  ps.colorDead = new Color4(0.3, 0.0, 0.0, 0.0);
  ps.minEmitPower = 0.5;
  ps.maxEmitPower = 1.5;
  ps.direction1 = new Vector3(-0.2, -0.2, -0.5);
  ps.direction2 = new Vector3(0.2, 0.2, -1.0);
  ps.gravity = Vector3.Zero();
  ps.start();
  return ps;
}

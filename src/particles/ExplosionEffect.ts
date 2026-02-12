/**
 * Ship explosion particle effect.
 * Ported from Explosion.scnp — emission duration 0.3s, orange/yellow.
 *
 * Uses Babylon.js ParticleSystem to create a burst of bright particles.
 */

import { Scene } from '@babylonjs/core/scene';
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

/** Duration constants matching iOS .scnp files */
export const EXPLOSION_DURATION = 0.3;
export const STATION_EXPLOSION_DURATION = 0.75;
export const EXPLOSION_CLEANUP_FRAMES = 300;

export function createExplosion(scene: Scene, position: Vector3): TransformNode {
  const emitter = new TransformNode('explosionEmitter', scene);
  emitter.position = position.clone();

  const ps = new ParticleSystem('explosion', 100, scene);
  ps.emitter = emitter.position.clone();
  ps.minLifeTime = 0.1;
  ps.maxLifeTime = 0.5;
  ps.emitRate = 300;
  ps.minSize = 0.3;
  ps.maxSize = 1.5;
  ps.color1 = new Color4(1.0, 0.8, 0.2, 1.0);   // bright yellow
  ps.color2 = new Color4(1.0, 0.3, 0.0, 1.0);    // orange
  ps.colorDead = new Color4(0.3, 0.0, 0.0, 0.0);  // fade to dark red
  ps.minEmitPower = 5;
  ps.maxEmitPower = 15;
  ps.direction1 = new Vector3(-1, -1, -1);
  ps.direction2 = new Vector3(1, 1, 1);
  ps.gravity = Vector3.Zero();

  ps.targetStopDuration = EXPLOSION_DURATION;
  ps.disposeOnStop = true;
  ps.start();

  // Clean up emitter node after particles die
  setTimeout(() => {
    emitter.dispose();
  }, 2000);

  return emitter;
}

export function createShieldExplosion(scene: Scene, position: Vector3): TransformNode {
  const emitter = new TransformNode('shieldExplosion', scene);
  emitter.position = position.clone();

  const ps = new ParticleSystem('shieldExplosion', 80, scene);
  ps.emitter = emitter.position.clone();
  ps.minLifeTime = 0.1;
  ps.maxLifeTime = 0.4;
  ps.emitRate = 250;
  ps.minSize = 0.2;
  ps.maxSize = 1.0;
  ps.color1 = new Color4(0.3, 0.5, 1.0, 1.0);    // blue
  ps.color2 = new Color4(0.8, 0.9, 1.0, 1.0);     // white-blue
  ps.colorDead = new Color4(0.1, 0.2, 0.5, 0.0);
  ps.minEmitPower = 4;
  ps.maxEmitPower = 12;
  ps.direction1 = new Vector3(-1, -1, -1);
  ps.direction2 = new Vector3(1, 1, 1);
  ps.gravity = Vector3.Zero();

  ps.targetStopDuration = EXPLOSION_DURATION;
  ps.disposeOnStop = true;
  ps.start();

  setTimeout(() => emitter.dispose(), 2000);
  return emitter;
}

export function createStationExplosion(scene: Scene, position: Vector3): TransformNode {
  const emitter = new TransformNode('stationExplosion', scene);
  emitter.position = position.clone();

  // Create 8 explosion instances at random offsets (matches iOS stationBoom)
  for (let i = 0; i < 8; i++) {
    const offset = new Vector3(
      (Math.random() - 0.4) * 25,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
    );

    const subEmitter = new TransformNode(`stationSub_${i}`, scene);
    subEmitter.position = position.add(offset);
    subEmitter.parent = emitter;

    const ps = new ParticleSystem(`stationBurst_${i}`, 60, scene);
    ps.emitter = subEmitter.position.clone();
    ps.minLifeTime = 0.2;
    ps.maxLifeTime = 0.8;
    ps.emitRate = 200;
    ps.minSize = 0.5;
    ps.maxSize = 2.5;
    ps.color1 = new Color4(1.0, 0.7, 0.1, 1.0);
    ps.color2 = new Color4(1.0, 0.2, 0.0, 1.0);
    ps.colorDead = new Color4(0.2, 0.0, 0.0, 0.0);
    ps.minEmitPower = 3;
    ps.maxEmitPower = 10;
    ps.direction1 = new Vector3(-1, -1, -1);
    ps.direction2 = new Vector3(1, 1, 1);
    ps.gravity = Vector3.Zero();
    ps.targetStopDuration = STATION_EXPLOSION_DURATION;
    ps.disposeOnStop = true;

    // Stagger starts slightly
    setTimeout(() => ps.start(), i * 50);
  }

  setTimeout(() => emitter.dispose(), 3000);
  return emitter;
}

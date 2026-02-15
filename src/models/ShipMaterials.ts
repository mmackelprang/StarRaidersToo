/**
 * PBR material definitions for ship and station models.
 * Provides metallic/roughness materials for realistic space-ship rendering.
 */

import { Scene } from '@babylonjs/core/scene';
import { PBRMetallicRoughnessMaterial } from '@babylonjs/core/Materials/PBR/pbrMetallicRoughnessMaterial';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';

/** Dark metallic hull for Humon Scout ships */
export function createScoutHullMaterial(scene: Scene): PBRMetallicRoughnessMaterial {
  const mat = new PBRMetallicRoughnessMaterial('scoutHull', scene);
  mat.baseColor = new Color3(0.35, 0.08, 0.08);
  mat.metallic = 0.7;
  mat.roughness = 0.4;
  mat.emissiveColor = new Color3(0.15, 0.02, 0.02);
  return mat;
}

/** Cockpit canopy — darker, glossy */
export function createCockpitMaterial(scene: Scene): PBRMetallicRoughnessMaterial {
  const mat = new PBRMetallicRoughnessMaterial('cockpit', scene);
  mat.baseColor = new Color3(0.05, 0.05, 0.1);
  mat.metallic = 0.9;
  mat.roughness = 0.1;
  mat.emissiveColor = new Color3(0.1, 0.02, 0.02);
  return mat;
}

/** Heavy armored hull for Humon Destroyer */
export function createDestroyerHullMaterial(scene: Scene): PBRMetallicRoughnessMaterial {
  const mat = new PBRMetallicRoughnessMaterial('destroyerHull', scene);
  mat.baseColor = new Color3(0.4, 0.05, 0.12);
  mat.metallic = 0.8;
  mat.roughness = 0.35;
  mat.emissiveColor = new Color3(0.12, 0.01, 0.04);
  return mat;
}

/** Engine glow material — bright emissive for exhausts */
export function createEngineGlowMaterial(scene: Scene): PBRMetallicRoughnessMaterial {
  const mat = new PBRMetallicRoughnessMaterial('engineGlow', scene);
  mat.baseColor = new Color3(1.0, 0.4, 0.1);
  mat.metallic = 0.0;
  mat.roughness = 1.0;
  mat.emissiveColor = new Color3(1.0, 0.4, 0.05);
  return mat;
}

/** Station hull — dark metallic with blue-grey tone */
export function createStationHullMaterial(scene: Scene): PBRMetallicRoughnessMaterial {
  const mat = new PBRMetallicRoughnessMaterial('stationHull', scene);
  mat.baseColor = new Color3(0.2, 0.22, 0.28);
  mat.metallic = 0.85;
  mat.roughness = 0.3;
  mat.emissiveColor = new Color3(0.02, 0.04, 0.08);
  return mat;
}

/** Station structural arms — slightly lighter metallic */
export function createStationArmMaterial(scene: Scene): PBRMetallicRoughnessMaterial {
  const mat = new PBRMetallicRoughnessMaterial('stationArm', scene);
  mat.baseColor = new Color3(0.18, 0.2, 0.25);
  mat.metallic = 0.75;
  mat.roughness = 0.45;
  mat.emissiveColor = new Color3(0.01, 0.03, 0.06);
  return mat;
}

/** Amber accent lights — for station warning/running lights */
export function createStationLightMaterial(scene: Scene): PBRMetallicRoughnessMaterial {
  const mat = new PBRMetallicRoughnessMaterial('stationLight', scene);
  mat.baseColor = new Color3(1.0, 0.6, 0.1);
  mat.metallic = 0.0;
  mat.roughness = 1.0;
  mat.emissiveColor = new Color3(1.0, 0.5, 0.05);
  return mat;
}

/** Torpedo material — self-illuminating projectile */
export function createTorpedoMaterial(scene: Scene, isHumon: boolean): StandardMaterial {
  const mat = new StandardMaterial(isHumon ? 'humonTorpMat' : 'zylonTorpMat', scene);
  mat.disableLighting = true;
  if (isHumon) {
    mat.emissiveColor = new Color3(1.0, 0.3, 0.1);
  } else {
    mat.emissiveColor = new Color3(0.2, 0.8, 1.0);
  }
  return mat;
}

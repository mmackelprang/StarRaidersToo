/**
 * Shared material definitions for ship models.
 * Simplified PBR-like materials using Babylon.js StandardMaterial.
 */

import { Scene } from '@babylonjs/core/scene';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';

export function createScoutMaterial(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('scoutMat', scene);
  mat.emissiveColor = new Color3(0.5, 0.08, 0.08);
  mat.diffuseColor = new Color3(0.3, 0.05, 0.05);
  mat.specularColor = new Color3(0.2, 0.05, 0.05);
  return mat;
}

export function createDestroyerMaterial(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('destroyerMat', scene);
  mat.emissiveColor = new Color3(0.6, 0.0, 0.15);
  mat.diffuseColor = new Color3(0.4, 0.0, 0.1);
  mat.specularColor = new Color3(0.3, 0.05, 0.05);
  return mat;
}

export function createStationMaterial(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('stationMat', scene);
  mat.emissiveColor = new Color3(0.1, 0.3, 0.7);
  mat.diffuseColor = new Color3(0.05, 0.15, 0.5);
  mat.specularColor = new Color3(0.1, 0.2, 0.5);
  return mat;
}

export function createTorpedoMaterial(scene: Scene, isHumon: boolean): StandardMaterial {
  const mat = new StandardMaterial(isHumon ? 'humonTorpMat' : 'zylonTorpMat', scene);
  if (isHumon) {
    mat.emissiveColor = new Color3(1.0, 0.3, 0.1);
  } else {
    mat.emissiveColor = new Color3(0.2, 0.8, 1.0);
  }
  return mat;
}

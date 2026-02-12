/**
 * Base class for all in-scene game objects.
 * Ported from SectorObject.swift — a simple SCNNode subclass with an ObjectType.
 *
 * In Babylon.js we use TransformNode as the base since game entities
 * are logical containers that may hold meshes, particles, etc.
 */

import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Scene } from '@babylonjs/core/scene';
import { ObjectType } from '@/core/types';

export class SectorObject extends TransformNode {
  public sectorObjectType: ObjectType = ObjectType.Asteroid;

  constructor(name: string, scene: Scene, objectType?: ObjectType) {
    super(name, scene);
    if (objectType !== undefined) {
      this.sectorObjectType = objectType;
    }
  }
}

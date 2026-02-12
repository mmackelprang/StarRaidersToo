/**
 * Starfield background and animated star sprites.
 * Ported from ZylonGameViewController.swift lines 743-769 (createStars).
 *
 * Architecture: A large sphere with starfield texture surrounds the scene.
 * 100 individual small spheres act as near-field animated stars that drift
 * toward the camera based on ship speed, creating a parallax effect.
 */

import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Constants } from '@/core/Constants';
import { randRange } from '@/utils/MathUtils';

export class StarfieldManager {
  private stars: Mesh[] = [];
  private backgroundSphere: Mesh;

  constructor(
    private scene: Scene,
    private sectorObjectsNode: TransformNode,
  ) {
    // Background starfield sphere (radius 1200, opacity 0.6)
    this.backgroundSphere = MeshBuilder.CreateSphere(
      'BGStars',
      { diameter: 2400, segments: 32 },
      scene,
    );
    const bgMaterial = new StandardMaterial('bgStarsMat', scene);
    bgMaterial.backFaceCulling = false;
    bgMaterial.emissiveTexture = new Texture('textures/starfield-2048x1024.png', scene);
    bgMaterial.disableLighting = true;
    bgMaterial.alpha = 0.6;
    this.backgroundSphere.material = bgMaterial;
    this.backgroundSphere.parent = sectorObjectsNode;

    // Create 100 individual star sprites
    this.createStars();
  }

  private createStars(): void {
    const starMaterial = new StandardMaterial('starMat', this.scene);
    starMaterial.emissiveColor = new Color3(1, 1, 1);
    starMaterial.disableLighting = true;

    for (let i = 0; i < Constants.numberOfStars; i++) {
      const star = MeshBuilder.CreateSphere(
        `star_${i}`,
        { diameter: 0.5 },
        this.scene,
      );
      star.material = starMaterial;
      star.position = new Vector3(
        randRange(-50, 50),
        randRange(-50, 50),
        randRange(-500, 500),
      );
      star.parent = this.sectorObjectsNode;
      this.stars.push(star);
    }
  }

  /**
   * Update star positions each frame based on ship speed.
   * Stars drift toward the camera (positive Z) and reset when out of bounds.
   * Ported from ZylonGameViewController.updateStars().
   */
  updateStars(currentSpeed: number): void {
    const moveDelta = currentSpeed * Constants.starMoveDivider;

    for (const star of this.stars) {
      star.position.z += moveDelta;

      // Reset stars that move out of bounds
      if (
        star.position.z > 400 ||
        star.position.y > 250 ||
        star.position.y < -250
      ) {
        star.position.z = randRange(-600, -400);
        star.position.x = randRange(-50, 50);
        star.position.y = randRange(-50, 50);
      }
    }
  }

  dispose(): void {
    this.backgroundSphere.dispose();
    for (const star of this.stars) {
      star.dispose();
    }
    this.stars = [];
  }
}

/**
 * Warp travel visual effect.
 * Ported from ZylonGameViewController.resetWarpgrid() and performWarp().
 *
 * Creates a tube/cylinder with a grid texture that rushes toward the camera
 * to simulate a warp tunnel. Motion blur is applied via Babylon.js post-processing.
 *
 * Timeline:
 *   0s  — Start tunnel animation, set max speed
 *   6s  — Arrive at destination, stop animation
 *   7s  — Populate new sector
 */

import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Animation } from '@babylonjs/core/Animations/animation';

export class WarpEffect {
  private tunnel: Mesh;
  private material: StandardMaterial;
  private scene: Scene;
  private isActive = false;

  constructor(scene: Scene) {
    this.scene = scene;

    // Create a tube pointing along -Z (toward the forward camera direction)
    this.tunnel = MeshBuilder.CreateCylinder(
      'warpTunnel',
      {
        height: 600,
        diameter: 30,
        tessellation: 24,
        sideOrientation: Mesh.BACKSIDE, // Render inside faces
      },
      scene,
    );

    this.material = new StandardMaterial('warpMat', scene);
    this.material.emissiveColor = new Color3(0.0, 0.15, 0.3);
    this.material.wireframe = true;
    this.material.backFaceCulling = false;

    // Load grid texture if available
    try {
      const tex = new Texture('textures/smallestGrid.png', scene);
      tex.uScale = 8;
      tex.vScale = 40;
      this.material.emissiveTexture = tex;
    } catch {
      // Wireframe fallback is fine
    }

    this.tunnel.material = this.material;
    this.tunnel.position = new Vector3(0, 0, -300);
    this.tunnel.rotation.x = Math.PI / 2; // Align tube along Z-axis
    this.tunnel.isVisible = false;
  }

  /**
   * Start warp tunnel animation.
   * Returns a Promise that resolves after 6 seconds (arrival time).
   */
  start(): Promise<void> {
    if (this.isActive) return Promise.resolve();
    this.isActive = true;
    this.tunnel.isVisible = true;
    this.tunnel.position.z = -300;

    // Animate the tunnel rushing past the camera
    const moveAnim = new Animation(
      'warpMove',
      'position.z',
      30, // fps
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE,
    );
    moveAnim.setKeys([
      { frame: 0, value: -300 },
      { frame: 90, value: 300 },  // 3 seconds to pass
      { frame: 91, value: -300 }, // reset
      { frame: 180, value: 300 }, // second pass
    ]);
    this.tunnel.animations = [moveAnim];
    this.scene.beginAnimation(this.tunnel, 0, 180, false);

    // Rotate the tunnel for added effect
    const rotAnim = new Animation(
      'warpRot',
      'rotation.z',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
    );
    rotAnim.setKeys([
      { frame: 0, value: 0 },
      { frame: 180, value: Math.PI * 2 },
    ]);
    this.tunnel.animations.push(rotAnim);

    return new Promise((resolve) => {
      setTimeout(() => {
        this.stop();
        resolve();
      }, 6000);
    });
  }

  stop(): void {
    this.isActive = false;
    this.tunnel.isVisible = false;
    this.scene.stopAnimation(this.tunnel);
    this.tunnel.position.z = -300;
    this.tunnel.rotation.z = 0;
  }

  get active(): boolean {
    return this.isActive;
  }

  dispose(): void {
    this.stop();
    this.tunnel.dispose();
    this.material.dispose();
  }
}

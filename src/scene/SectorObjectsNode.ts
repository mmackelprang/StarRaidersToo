/**
 * The pivoting container node that holds all sector content (stars, enemies, station, torpedoes).
 *
 * KEY PARADIGM: The player ship sits at the origin and does NOT move.
 * Instead, this node rotates around the ship to simulate steering.
 * Joystick input is converted to rotation applied to this node.
 *
 * Ported from:
 * - ZylonGameViewController.swift: sectorObjectsNode (SCNNode)
 * - UtilityFunctions.swift lines 264-272: rotate() helper
 * - ZylonGameViewController.swift lines 1219-1239: turnShip()
 *
 * The SceneKit rotate() function works by:
 *   1. Creating a rotation matrix from axis + angle
 *   2. Multiplying it with the node's world transform
 *   3. Converting back to local space if parented
 *
 * In Babylon.js, we achieve the same by multiplying rotation quaternions
 * in world space, which is equivalent to the SCNMatrix4Mult approach.
 */

import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Scene } from '@babylonjs/core/scene';
import { Quaternion, Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';

export class SectorObjectsNode {
  readonly node: TransformNode;

  constructor(scene: Scene) {
    this.node = new TransformNode('sectorObjectsNode', scene);
    // Initialize with identity rotation quaternion (required for quaternion-based rotation)
    this.node.rotationQuaternion = Quaternion.Identity();
  }

  /**
   * Rotate around an axis by a given angle (radians).
   * This matches the SceneKit rotate() pattern:
   *   SCNMatrix4Mult(node.worldTransform, SCNMatrix4MakeRotation(angle, axis))
   *
   * We multiply the incremental rotation into the current world rotation.
   * Since sectorObjectsNode is a root-level child (no parent transform),
   * world and local are the same.
   */
  rotate(axis: Vector3, angle: number): void {
    if (Math.abs(angle) < 1e-8) return;

    const incrementalRotation = Quaternion.RotationAxis(axis, angle);
    const currentRotation = this.node.rotationQuaternion ?? Quaternion.Identity();

    // Multiply: current * incremental (world-space accumulation)
    // This matches SCNMatrix4Mult(worldTransform, rotationMatrix)
    this.node.rotationQuaternion = currentRotation.multiply(incrementalRotation);
  }

  /**
   * Apply joystick input to rotate the sector objects.
   * Ported from ZylonGameViewController.turnShip() lines 1219-1239.
   *
   * @param xThrust - rotation around X axis (pitch)
   * @param yThrust - rotation around Y axis (yaw)
   */
  applyJoystickInput(xThrust: number, yThrust: number): void {
    this.rotate(new Vector3(1, 0, 0), xThrust);
    this.rotate(new Vector3(0, 1, 0), yThrust);
  }
}

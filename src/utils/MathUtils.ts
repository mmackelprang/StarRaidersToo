/**
 * Math utility functions ported from UtilityFunctions.swift and Extensions.swift.
 */

import { Vector3 } from '@babylonjs/core/Maths/math.vector';

/** Random integer in [lower, upper] inclusive */
export function randIntRange(lower: number, upper: number): number {
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}

/** Random float in [lower, upper) */
export function randRange(lower: number, upper: number): number {
  return Math.random() * (upper - lower) + lower;
}

/** Euclidean distance between two 3D points */
export function distanceBetweenPoints(first: Vector3, second: Vector3): number {
  const dx = first.x - second.x;
  const dy = first.y - second.y;
  const dz = first.z - second.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Distance from origin (where the Zylon ship sits) */
export function distanceFromOrigin(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z);
}

/** Convert degrees to radians */
export function degreesToRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

/** Convert radians to degrees */
export function radiansToDegrees(radians: number): number {
  return radians * 180 / Math.PI;
}

/** Delayed execution helper (like DispatchQueue.main.asyncAfter) */
export function delayWithSeconds(seconds: number, fn: () => void): number {
  return window.setTimeout(fn, seconds * 1000);
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

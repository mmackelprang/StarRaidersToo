/**
 * Haptic feedback via Vibration API.
 * Ported from Vibration.swift — wraps navigator.vibrate().
 *
 * Maps iOS UIFeedbackGenerator types to vibration durations.
 * Falls back silently on unsupported platforms.
 */

/** Vibration patterns (ms) approximating iOS feedback types */
const PATTERNS = {
  light: [10],
  medium: [20],
  heavy: [40],
  error: [50, 30, 50],
  success: [15, 10, 15],
  warning: [30, 20],
  selection: [5],
  oldSchool: [100],
} as const;

function vibrate(pattern: readonly number[]): void {
  try {
    navigator.vibrate?.([...pattern]);
  } catch {
    // Vibration API not available — silently ignore
  }
}

export const HapticFeedback = {
  /** Light tap — UI selection */
  light: () => vibrate(PATTERNS.light),

  /** Medium impact — shield hit, enemy collision */
  medium: () => vibrate(PATTERNS.medium),

  /** Heavy impact — shield failure */
  heavy: () => vibrate(PATTERNS.heavy),

  /** Error pattern — enemy destroyed */
  error: () => vibrate(PATTERNS.error),

  /** Success pattern */
  success: () => vibrate(PATTERNS.success),

  /** Warning pattern */
  warning: () => vibrate(PATTERNS.warning),

  /** Selection tap */
  selection: () => vibrate(PATTERNS.selection),

  /** Classic long vibrate — game over */
  oldSchool: () => vibrate(PATTERNS.oldSchool),
} as const;

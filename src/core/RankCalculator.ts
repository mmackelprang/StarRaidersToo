/**
 * Rank calculation based on occupied sector ratio.
 * Ported from ZylonGameViewController endGame() rank logic.
 *
 * Formula: rankIndex = floor(occupiedSectorRatio * 13)
 * Penalty: +1 if difficulty < 3 (Novice or Pilot)
 */

import { rankArray } from '@/core/types';

/**
 * Calculate the player's rank based on the ratio of enemy sectors remaining.
 * Higher ratio = more enemies left = worse rank.
 *
 * @param occupiedSectorRatio - current/initial enemy sector count (0.0 to 1.0)
 * @param difficultyScalar - 1-5 numeric scalar
 * @returns The rank title string
 */
export function calculateRank(occupiedSectorRatio: number, difficultyScalar: number): string {
  const clamped = Math.max(0, Math.min(1, occupiedSectorRatio));
  let rankIndex = Math.floor(clamped * rankArray.length);

  // Clamp to valid index
  rankIndex = Math.min(rankIndex, rankArray.length - 1);

  // Easy difficulty penalty
  if (difficultyScalar < 3 && rankIndex < rankArray.length - 1) {
    rankIndex += 1;
  }

  return rankArray[rankIndex];
}

/** End-game cause messages matching iOS endGame() */
export const END_GAME_CAUSES = {
  victory: 'Victory is ours. The Humons have been vanquished',
  allStationsDestroyed: 'All is lost. Zylon outposts destroyed by Humon invaders',
  playerDestroyed: 'Prototype defense ship destroyed by Humon Fire',
  energyDepleted: 'Prototype defense ship destroyed due to GridWarp core containment failure',
} as const;

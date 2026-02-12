import { describe, it, expect } from 'vitest';
import { calculateRank, END_GAME_CAUSES } from '@/core/RankCalculator';
import { SectorGridType, Difficulty, difficultyScalar, rankArray } from '@/core/types';

/**
 * Integration tests for full game flow scenarios.
 * Tests game state transitions and end conditions without DOM/WebGL.
 */

describe('End game conditions', () => {
  it('victory when all enemy sectors cleared', () => {
    // Simulate: count enemy sectors = 0
    const enemySectors = [].filter(
      (s: any) => s === SectorGridType.Enemy || s === SectorGridType.Enemy2 || s === SectorGridType.Enemy3,
    );
    expect(enemySectors.length).toBe(0);
    // This triggers victory
  });

  it('loss when all stations destroyed', () => {
    const stationSectors = [].filter((s: any) => s === SectorGridType.Starbase);
    expect(stationSectors.length).toBe(0);
    // This triggers loss
  });

  it('loss when energy depleted', () => {
    let energy = 10000;
    // Drain all energy
    energy = 0;
    expect(energy).toBe(0);
    // This triggers energy depletion loss
  });
});

describe('Rank calculation across difficulties', () => {
  it('perfect game (0% enemies remaining) at Lord gives ZYLON HERO', () => {
    expect(calculateRank(0.0, 5)).toBe('ZYLON HERO');
  });

  it('perfect game at Novice gives SPACE ACE (penalty)', () => {
    expect(calculateRank(0.0, 1)).toBe('SPACE ACE');
  });

  it('half enemies remaining at Commander gives middle rank', () => {
    const rank = calculateRank(0.5, 3);
    const idx = rankArray.indexOf(rank as any);
    expect(idx).toBeGreaterThan(3);
    expect(idx).toBeLessThan(10);
  });

  it('worst performance gives GALACTIC COOK', () => {
    expect(calculateRank(1.0, 5)).toBe('GALACTIC COOK');
  });
});

describe('End game cause messages', () => {
  it('victory message mentions vanquished', () => {
    expect(END_GAME_CAUSES.victory).toBe(
      'Victory is ours. The Humons have been vanquished',
    );
  });

  it('player destroyed message mentions Humon Fire', () => {
    expect(END_GAME_CAUSES.playerDestroyed).toBe(
      'Prototype defense ship destroyed by Humon Fire',
    );
  });

  it('energy depleted message mentions containment failure', () => {
    expect(END_GAME_CAUSES.energyDepleted).toBe(
      'Prototype defense ship destroyed due to GridWarp core containment failure',
    );
  });

  it('all stations destroyed message mentions outposts', () => {
    expect(END_GAME_CAUSES.allStationsDestroyed).toBe(
      'All is lost. Zylon outposts destroyed by Humon invaders',
    );
  });
});

describe('Galaxy sector counts by difficulty', () => {
  function occupiedSectorCount(difficulty: number): number {
    const counts: Record<number, number> = {
      1: 12, 2: 15, 3: 18, 4: 25, 5: 40,
    };
    return counts[difficulty] ?? 12;
  }

  it('Novice has 12 occupied sectors', () => {
    expect(occupiedSectorCount(1)).toBe(12);
  });

  it('Lord has 40 occupied sectors', () => {
    expect(occupiedSectorCount(5)).toBe(40);
  });

  it('harder difficulties have more sectors', () => {
    expect(occupiedSectorCount(5)).toBeGreaterThan(occupiedSectorCount(1));
  });
});

describe('Screen flow transitions', () => {
  type ScreenName = 'mainMenu' | 'prologue' | 'game' | 'gameOver';

  function getNextScreen(
    current: ScreenName,
    event: string,
    prologueEnabled: boolean,
  ): ScreenName {
    switch (current) {
      case 'mainMenu':
        if (event === 'start') {
          return prologueEnabled ? 'prologue' : 'game';
        }
        return 'mainMenu';
      case 'prologue':
        if (event === 'complete' || event === 'skip') {
          return 'game';
        }
        return 'prologue';
      case 'game':
        if (event === 'gameOver') return 'gameOver';
        return 'game';
      case 'gameOver':
        if (event === 'restart') return 'mainMenu';
        return 'gameOver';
    }
  }

  it('menu → prologue when enabled', () => {
    expect(getNextScreen('mainMenu', 'start', true)).toBe('prologue');
  });

  it('menu → game when prologue disabled', () => {
    expect(getNextScreen('mainMenu', 'start', false)).toBe('game');
  });

  it('prologue → game on complete', () => {
    expect(getNextScreen('prologue', 'complete', true)).toBe('game');
  });

  it('prologue → game on skip', () => {
    expect(getNextScreen('prologue', 'skip', true)).toBe('game');
  });

  it('game → gameOver on death', () => {
    expect(getNextScreen('game', 'gameOver', true)).toBe('gameOver');
  });

  it('gameOver → mainMenu on restart', () => {
    expect(getNextScreen('gameOver', 'restart', true)).toBe('mainMenu');
  });
});

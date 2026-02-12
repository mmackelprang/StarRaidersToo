import { describe, it, expect } from 'vitest';
import { calculateRank, END_GAME_CAUSES } from '@/core/RankCalculator';
import { rankArray } from '@/core/types';

describe('RankCalculator', () => {
  it('0% occupied ratio gives ZYLON HERO (best rank)', () => {
    expect(calculateRank(0.0, 3)).toBe('ZYLON HERO');
  });

  it('100% occupied gives GALACTIC COOK (worst rank)', () => {
    expect(calculateRank(1.0, 3)).toBe('GALACTIC COOK');
  });

  it('~50% occupied gives middle rank', () => {
    const rank = calculateRank(0.5, 3);
    expect(rankArray.indexOf(rank as any)).toBeGreaterThan(3);
    expect(rankArray.indexOf(rank as any)).toBeLessThan(10);
  });

  it('applies penalty for easy difficulty (scalar < 3)', () => {
    const hardRank = calculateRank(0.3, 3);
    const easyRank = calculateRank(0.3, 1);
    // Easy difficulty should give a worse (higher index) rank
    const hardIdx = rankArray.indexOf(hardRank as any);
    const easyIdx = rankArray.indexOf(easyRank as any);
    expect(easyIdx).toBe(hardIdx + 1);
  });

  it('no penalty for difficulty >= 3', () => {
    const rank3 = calculateRank(0.3, 3);
    const rank5 = calculateRank(0.3, 5);
    expect(rank3).toBe(rank5);
  });

  it('penalty does not exceed max rank index', () => {
    // Already worst rank, penalty should not push past
    expect(calculateRank(1.0, 1)).toBe('GALACTIC COOK');
  });

  it('clamps negative ratio to 0', () => {
    expect(calculateRank(-0.5, 3)).toBe('ZYLON HERO');
  });

  it('clamps ratio above 1.0', () => {
    expect(calculateRank(1.5, 3)).toBe('GALACTIC COOK');
  });
});

describe('Rank array', () => {
  it('has 13 ranks (matches iOS rankArray)', () => {
    expect(rankArray.length).toBe(13);
  });

  it('first rank is ZYLON HERO', () => {
    expect(rankArray[0]).toBe('ZYLON HERO');
  });

  it('last rank is GALACTIC COOK', () => {
    expect(rankArray[12]).toBe('GALACTIC COOK');
  });
});

describe('End game causes', () => {
  it('has victory cause', () => {
    expect(END_GAME_CAUSES.victory).toContain('vanquished');
  });

  it('has player destroyed cause', () => {
    expect(END_GAME_CAUSES.playerDestroyed).toContain('Humon Fire');
  });

  it('has energy depleted cause', () => {
    expect(END_GAME_CAUSES.energyDepleted).toContain('containment failure');
  });

  it('has all stations destroyed cause', () => {
    expect(END_GAME_CAUSES.allStationsDestroyed).toContain('outposts destroyed');
  });
});

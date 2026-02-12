import { describe, it, expect } from 'vitest';
import {
  PROLOGUE_MESSAGES,
  SKIP_BUTTON_DELAY,
  POST_MESSAGE_DELAY,
} from '@/screens/PrologueScreen';
import {
  PROLOGUE_CHAR_SPEED,
  GAME_OVER_CHAR_SPEED,
  DEFAULT_CHAR_SPEED,
  CURSOR_BLINK_SPEED,
} from '@/ui/TelemetryDisplay';

describe('Prologue messages', () => {
  it('has 11 messages (matches iOS PrologueViewController)', () => {
    expect(PROLOGUE_MESSAGES.length).toBe(11);
  });

  it('first message starts with "Forty centons"', () => {
    expect(PROLOGUE_MESSAGES[0].text).toContain('Forty centons');
  });

  it('last message is transmission terminated', () => {
    expect(PROLOGUE_MESSAGES[10].text).toContain('TRANSMISSION TERMINATED');
  });

  it('contains "STAR RAIDERS" reference', () => {
    const hasStarRaiders = PROLOGUE_MESSAGES.some((m) =>
      m.text.includes('STAR RAIDERS'),
    );
    expect(hasStarRaiders).toBe(true);
  });

  it('contains all three imperatives', () => {
    const allText = PROLOGUE_MESSAGES.map((m) => m.text).join('');
    expect(allText).toContain('DEFEND THE EMPIRE');
    expect(allText).toContain('DRIVE BACK THE HUMON INVADERS');
    expect(allText).toContain('SAVE THE ZYLON RACE');
  });

  it('all messages have non-negative delays', () => {
    for (const msg of PROLOGUE_MESSAGES) {
      expect(msg.delay).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('Prologue timing constants', () => {
  it('skip button appears at 2.85 seconds', () => {
    expect(SKIP_BUTTON_DELAY).toBe(2.85);
  });

  it('post-message delay is 3.5 seconds', () => {
    expect(POST_MESSAGE_DELAY).toBe(3.5);
  });
});

describe('Telemetry character speeds', () => {
  it('prologue speed is 0.037 s/char', () => {
    expect(PROLOGUE_CHAR_SPEED).toBe(0.037);
  });

  it('game over speed is 0.05 s/char', () => {
    expect(GAME_OVER_CHAR_SPEED).toBe(0.05);
  });

  it('default speed is 0.097 s/char', () => {
    expect(DEFAULT_CHAR_SPEED).toBe(0.097);
  });

  it('cursor blink speed is 0.12 seconds', () => {
    expect(CURSOR_BLINK_SPEED).toBe(0.12);
  });

  it('prologue is fastest, default is slowest', () => {
    expect(PROLOGUE_CHAR_SPEED).toBeLessThan(GAME_OVER_CHAR_SPEED);
    expect(GAME_OVER_CHAR_SPEED).toBeLessThan(DEFAULT_CHAR_SPEED);
  });
});

describe('Prologue total text length estimation', () => {
  it('total characters is reasonable for a prologue', () => {
    const totalChars = PROLOGUE_MESSAGES.reduce(
      (sum, m) => sum + m.text.length,
      0,
    );
    // Should be between 300-600 chars
    expect(totalChars).toBeGreaterThan(300);
    expect(totalChars).toBeLessThan(700);
  });

  it('estimated playback time is reasonable at prologue speed', () => {
    const totalChars = PROLOGUE_MESSAGES.reduce(
      (sum, m) => sum + m.text.length,
      0,
    );
    const totalDelays = PROLOGUE_MESSAGES.reduce(
      (sum, m) => sum + m.delay,
      0,
    );
    const estimatedTime = totalChars * PROLOGUE_CHAR_SPEED + totalDelays;
    // Should be between 20-50 seconds
    expect(estimatedTime).toBeGreaterThan(20);
    expect(estimatedTime).toBeLessThan(50);
  });
});

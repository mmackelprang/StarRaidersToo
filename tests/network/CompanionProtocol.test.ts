import { describe, it, expect } from 'vitest';
import {
  parseCommand,
  serializeCommand,
  CompanionCommand,
} from '@/network/CompanionProtocol';

describe('CompanionProtocol parseCommand', () => {
  it('parses "Speed 0" as speed command', () => {
    expect(parseCommand('Speed 0')).toEqual({ type: 'speed', value: 0 });
  });

  it('parses "Speed 9" as speed command', () => {
    expect(parseCommand('Speed 9')).toEqual({ type: 'speed', value: 9 });
  });

  it('parses "FIRE" as fire command', () => {
    expect(parseCommand('FIRE')).toEqual({ type: 'fire' });
  });

  it('parses "SHIELDS" as shields command', () => {
    expect(parseCommand('SHIELDS')).toEqual({ type: 'shields' });
  });

  it('parses "FORE" as fore command', () => {
    expect(parseCommand('FORE')).toEqual({ type: 'fore' });
  });

  it('parses "AFT" as aft command', () => {
    expect(parseCommand('AFT')).toEqual({ type: 'aft' });
  });

  it('parses "GRID 42" as grid command', () => {
    expect(parseCommand('GRID 42')).toEqual({ type: 'grid', sector: 42 });
  });

  it('rejects invalid grid sector (>= 128)', () => {
    expect(parseCommand('GRID 200')).toBeNull();
  });

  it('parses case-insensitively', () => {
    expect(parseCommand('fire')).toEqual({ type: 'fire' });
    expect(parseCommand('speed 5')).toEqual({ type: 'speed', value: 5 });
  });

  it('returns null for unknown commands', () => {
    expect(parseCommand('UNKNOWN')).toBeNull();
    expect(parseCommand('')).toBeNull();
  });

  it('trims whitespace', () => {
    expect(parseCommand('  FIRE  ')).toEqual({ type: 'fire' });
  });

  it('parses not-yet-implemented commands', () => {
    expect(parseCommand('ABORT')).toEqual({ type: 'abort' });
    expect(parseCommand('ATTACK')).toEqual({ type: 'attack' });
    expect(parseCommand('TAC')).toEqual({ type: 'tac' });
  });
});

describe('CompanionProtocol serializeCommand', () => {
  it('serializes speed command', () => {
    expect(serializeCommand({ type: 'speed', value: 5 })).toBe('Speed 5');
  });

  it('serializes fire command', () => {
    expect(serializeCommand({ type: 'fire' })).toBe('FIRE');
  });

  it('serializes grid command', () => {
    expect(serializeCommand({ type: 'grid', sector: 42 })).toBe('GRID 42');
  });
});

describe('Command round-trip', () => {
  const commands: CompanionCommand[] = [
    { type: 'speed', value: 7 },
    { type: 'fire' },
    { type: 'shields' },
    { type: 'fore' },
    { type: 'aft' },
    { type: 'grid', sector: 64 },
  ];

  for (const cmd of commands) {
    it(`round-trips ${cmd.type} command`, () => {
      const serialized = serializeCommand(cmd);
      const parsed = parseCommand(serialized);
      expect(parsed).toEqual(cmd);
    });
  }
});

/**
 * Companion controller protocol — command types for external control.
 * Ported from MCController.swift CommandDelegate protocol.
 *
 * Commands match iOS Multipeer Connectivity implementation.
 * Web version will use WebSocket transport.
 */

/** All valid companion commands */
export type CompanionCommand =
  | { type: 'speed'; value: number }     // Speed 0-9
  | { type: 'fire' }                     // FIRE torpedo
  | { type: 'shields' }                  // Toggle shields
  | { type: 'fore' }                     // Switch to forward view
  | { type: 'aft' }                      // Switch to aft view
  | { type: 'grid'; sector: number }     // Warp to sector
  | { type: 'abort' }                    // Abort (not yet implemented)
  | { type: 'attack' }                   // Attack (not yet implemented)
  | { type: 'tac' };                     // Tactical (not yet implemented)

/**
 * Parse a raw command string into a CompanionCommand.
 * Command format matches iOS MCController protocol.
 */
export function parseCommand(raw: string): CompanionCommand | null {
  const trimmed = raw.trim().toUpperCase();

  // Speed commands: "Speed 0" through "Speed 9"
  const speedMatch = trimmed.match(/^SPEED\s+(\d)$/);
  if (speedMatch) {
    return { type: 'speed', value: parseInt(speedMatch[1], 10) };
  }

  // Grid/warp command: "GRID 42"
  const gridMatch = trimmed.match(/^GRID\s+(\d+)$/);
  if (gridMatch) {
    const sector = parseInt(gridMatch[1], 10);
    if (sector >= 0 && sector < 128) {
      return { type: 'grid', sector };
    }
    return null;
  }

  switch (trimmed) {
    case 'FIRE': return { type: 'fire' };
    case 'SHIELDS': return { type: 'shields' };
    case 'FORE': return { type: 'fore' };
    case 'AFT': return { type: 'aft' };
    case 'ABORT': return { type: 'abort' };
    case 'ATTACK': return { type: 'attack' };
    case 'TAC': return { type: 'tac' };
    default: return null;
  }
}

/** Serialize a command to string for transmission */
export function serializeCommand(cmd: CompanionCommand): string {
  switch (cmd.type) {
    case 'speed': return `Speed ${cmd.value}`;
    case 'grid': return `GRID ${cmd.sector}`;
    default: return cmd.type.toUpperCase();
  }
}

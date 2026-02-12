/**
 * Routes companion commands to game actions.
 * Ported from UtilityFunctions.swift execute(command:) lines 296-339.
 *
 * Bridges the CompanionProtocol to Game methods.
 */

import { CompanionCommand } from '@/network/CompanionProtocol';

export interface CommandTarget {
  setSpeed(speed: number): void;
  fire(): void;
  toggleShields(): void;
  setViewFore(): void;
  setViewAft(): void;
  warpToSector(sector: number): void;
}

export class CommandRouter {
  private target: CommandTarget;

  constructor(target: CommandTarget) {
    this.target = target;
  }

  /** Execute a companion command */
  execute(cmd: CompanionCommand): void {
    switch (cmd.type) {
      case 'speed':
        this.target.setSpeed(cmd.value);
        break;
      case 'fire':
        this.target.fire();
        break;
      case 'shields':
        this.target.toggleShields();
        break;
      case 'fore':
        this.target.setViewFore();
        break;
      case 'aft':
        this.target.setViewAft();
        break;
      case 'grid':
        this.target.warpToSector(cmd.sector);
        break;
      case 'abort':
      case 'attack':
      case 'tac':
        // Not yet implemented — matching iOS behavior
        break;
    }
  }
}

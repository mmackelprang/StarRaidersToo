/**
 * WebSocket server stub for companion controller communication.
 * Replacement for iOS Multipeer Connectivity (MCController.swift).
 *
 * Architecture: Game hosts a WebSocket server. Companion app connects
 * and sends command strings. This stub provides the interface without
 * requiring a real server — actual implementation deferred to deployment.
 */

import { parseCommand, CompanionCommand } from '@/network/CompanionProtocol';

export interface WebSocketServerCallbacks {
  onCommand(cmd: CompanionCommand): void;
  onConnect(): void;
  onDisconnect(): void;
}

export class WebSocketServer {
  private callbacks: WebSocketServerCallbacks;
  private socket: WebSocket | null = null;
  private _connected = false;

  constructor(callbacks: WebSocketServerCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Connect to a WebSocket server URL.
   * In production, the game server would run alongside and provide this URL.
   */
  connect(url: string): void {
    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this._connected = true;
        this.callbacks.onConnect();
      };

      this.socket.onmessage = (event) => {
        const cmd = parseCommand(String(event.data));
        if (cmd) {
          this.callbacks.onCommand(cmd);
        }
      };

      this.socket.onclose = () => {
        this._connected = false;
        this.callbacks.onDisconnect();
      };

      this.socket.onerror = () => {
        this._connected = false;
      };
    } catch {
      // WebSocket not available or invalid URL — silently fail
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this._connected = false;
  }

  get connected(): boolean {
    return this._connected;
  }

  /** Simulate receiving a command (for testing without real WebSocket) */
  simulateCommand(raw: string): void {
    const cmd = parseCommand(raw);
    if (cmd) {
      this.callbacks.onCommand(cmd);
    }
  }

  dispose(): void {
    this.disconnect();
  }
}

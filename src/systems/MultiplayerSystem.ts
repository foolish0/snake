import { Vector2 } from '../types/interfaces';
import { GameConfig } from '../config/GameConfig';

interface PlayerState {
  id: string;
  name: string;
  segments: Vector2[];
  score: number;
  isAlive: boolean;
}

export class MultiplayerSystem {
  private socket: WebSocket;
  private players: Map<string, PlayerState> = new Map();
  private localPlayerId: string;
  private onStateUpdate?: (players: PlayerState[]) => void;
  private onPlayerJoin?: (player: PlayerState) => void;
  private onPlayerLeave?: (playerId: string) => void;

  constructor(serverUrl: string) {
    this.socket = new WebSocket(serverUrl);
    this.localPlayerId = Math.random().toString(36).substr(2, 9);
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'state_update':
          this.handleStateUpdate(data.players);
          break;
        case 'player_join':
          this.handlePlayerJoin(data.player);
          break;
        case 'player_leave':
          this.handlePlayerLeave(data.playerId);
          break;
      }
    };

    this.socket.onclose = () => {
      console.log('Connection closed');
      // 可以在这里添加重连逻辑
    };
  }

  public sendState(segments: Vector2[], score: number): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'state_update',
        playerId: this.localPlayerId,
        segments,
        score
      }));
    }
  }

  private handleStateUpdate(players: PlayerState[]): void {
    players.forEach(player => {
      this.players.set(player.id, player);
    });
    this.onStateUpdate?.(Array.from(this.players.values()));
  }

  private handlePlayerJoin(player: PlayerState): void {
    this.players.set(player.id, player);
    this.onPlayerJoin?.(player);
  }

  private handlePlayerLeave(playerId: string): void {
    this.players.delete(playerId);
    this.onPlayerLeave?.(playerId);
  }

  public setStateUpdateListener(callback: (players: PlayerState[]) => void): void {
    this.onStateUpdate = callback;
  }

  public setPlayerJoinListener(callback: (player: PlayerState) => void): void {
    this.onPlayerJoin = callback;
  }

  public setPlayerLeaveListener(callback: (playerId: string) => void): void {
    this.onPlayerLeave = callback;
  }

  public cleanup(): void {
    this.socket.close();
  }
} 
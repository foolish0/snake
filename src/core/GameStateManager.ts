export enum GameState {
  MENU,
  PLAYING,
  PAUSED,
  GAME_OVER,
  SETTINGS
}

export class GameStateManager {
  private currentState: GameState = GameState.MENU;
  private previousState: GameState = GameState.MENU;
  private onStateChange?: (state: GameState) => void;

  public setState(state: GameState): void {
    this.previousState = this.currentState;
    this.currentState = state;
    this.onStateChange?.(state);
  }

  public getCurrentState(): GameState {
    return this.currentState;
  }

  public getPreviousState(): GameState {
    return this.previousState;
  }

  public togglePause(): void {
    if (this.currentState === GameState.PLAYING) {
      this.setState(GameState.PAUSED);
    } else if (this.currentState === GameState.PAUSED) {
      this.setState(GameState.PLAYING);
    }
  }

  public setStateChangeListener(callback: (state: GameState) => void): void {
    this.onStateChange = callback;
  }

  public isPlaying(): boolean {
    return this.currentState === GameState.PLAYING;
  }

  public isPaused(): boolean {
    return this.currentState === GameState.PAUSED;
  }
} 
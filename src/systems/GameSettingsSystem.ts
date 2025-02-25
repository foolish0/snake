import { GameDifficulty, GameConfig } from '../config/GameConfig';

export class GameSettingsSystem {
  private difficulty: GameDifficulty = GameDifficulty.NORMAL;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private onSettingsChange?: () => void;

  constructor() {
    this.loadSettings();
  }

  public setDifficulty(difficulty: GameDifficulty): void {
    this.difficulty = difficulty;
    this.saveSettings();
    this.onSettingsChange?.();
  }

  public getDifficulty(): GameDifficulty {
    return this.difficulty;
  }

  public getDifficultySettings() {
    return GameConfig.DIFFICULTY_SETTINGS[this.difficulty];
  }

  public toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    this.saveSettings();
    this.onSettingsChange?.();
  }

  public toggleMusic(): void {
    this.musicEnabled = !this.musicEnabled;
    this.saveSettings();
    this.onSettingsChange?.();
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public setSettingsChangeListener(callback: () => void): void {
    this.onSettingsChange = callback;
  }

  private loadSettings(): void {
    const settings = localStorage.getItem('gameSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.difficulty = parsed.difficulty ?? GameDifficulty.NORMAL;
      this.soundEnabled = parsed.soundEnabled ?? true;
      this.musicEnabled = parsed.musicEnabled ?? true;
    }
  }

  private saveSettings(): void {
    const settings = {
      difficulty: this.difficulty,
      soundEnabled: this.soundEnabled,
      musicEnabled: this.musicEnabled
    };
    localStorage.setItem('gameSettings', JSON.stringify(settings));
  }
} 
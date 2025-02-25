import { GameConfig } from '../config/GameConfig';

export class BackgroundMusicSystem {
  private bgm: HTMLAudioElement;
  private isPlaying: boolean = false;
  private volume: number = 0.5;

  constructor() {
    this.bgm = new Audio(GameConfig.AUDIO.BGM_PATH);
    this.bgm.loop = true;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // 处理音频加载错误
    this.bgm.onerror = () => {
      console.error('Background music failed to load');
    };

    // 处理音频结束
    this.bgm.onended = () => {
      if (this.isPlaying) {
        this.bgm.play().catch(console.error);
      }
    };
  }

  public play(): void {
    if (!this.isPlaying) {
      this.bgm.play().catch(console.error);
      this.isPlaying = true;
    }
  }

  public pause(): void {
    if (this.isPlaying) {
      this.bgm.pause();
      this.isPlaying = false;
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.bgm.volume = this.volume;
  }

  public getVolume(): number {
    return this.volume;
  }

  public cleanup(): void {
    this.pause();
    this.bgm.remove();
  }
} 
export class AudioSystem {
  private sounds: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    this.loadSounds();
  }

  private loadSounds(): void {
    this.addSound('eat', 'assets/sounds/eat.mp3');
    this.addSound('die', 'assets/sounds/die.mp3');
    this.addSound('move', 'assets/sounds/move.mp3');
  }

  private addSound(name: string, url: string): void {
    const audio = new Audio(url);
    this.sounds.set(name, audio);
  }

  public playSound(name: string): void {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(err => console.log('Audio playback failed:', err));
    }
  }

  public setVolume(volume: number): void {
    this.sounds.forEach(sound => {
      sound.volume = Math.max(0, Math.min(1, volume));
    });
  }
} 
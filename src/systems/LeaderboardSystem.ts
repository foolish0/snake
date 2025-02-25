interface LeaderboardEntry {
  playerName: string;
  score: number;
  date: number;
  snakeLength: number;
  playTime: number;
}

export class LeaderboardSystem {
  private readonly MAX_ENTRIES = 10;
  private entries: LeaderboardEntry[] = [];
  private onLeaderboardUpdate?: () => void;

  constructor() {
    this.loadLeaderboard();
  }

  public addScore(entry: Omit<LeaderboardEntry, 'date'>): void {
    const newEntry: LeaderboardEntry = {
      ...entry,
      date: Date.now()
    };

    this.entries.push(newEntry);
    this.entries.sort((a, b) => b.score - a.score);
    
    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries = this.entries.slice(0, this.MAX_ENTRIES);
    }

    this.saveLeaderboard();
    this.onLeaderboardUpdate?.();
  }

  public getLeaderboard(): LeaderboardEntry[] {
    return [...this.entries];
  }

  public isHighScore(score: number): boolean {
    return this.entries.length < this.MAX_ENTRIES || score > this.entries[this.entries.length - 1].score;
  }

  public setUpdateListener(callback: () => void): void {
    this.onLeaderboardUpdate = callback;
  }

  private loadLeaderboard(): void {
    const saved = localStorage.getItem('leaderboard');
    if (saved) {
      this.entries = JSON.parse(saved);
    }
  }

  private saveLeaderboard(): void {
    localStorage.setItem('leaderboard', JSON.stringify(this.entries));
  }
} 
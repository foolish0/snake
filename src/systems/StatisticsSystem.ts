interface GameStats {
  totalGames: number;
  totalScore: number;
  highestScore: number;
  totalPlayTime: number;
  longestSnake: number;
  foodEaten: number;
  averageScore: number;
}

export class StatisticsSystem {
  private stats: GameStats = {
    totalGames: 0,
    totalScore: 0,
    highestScore: 0,
    totalPlayTime: 0,
    longestSnake: 0,
    foodEaten: 0,
    averageScore: 0
  };

  private gameStartTime: number = 0;
  private isGameActive: boolean = false;

  constructor() {
    this.loadStats();
  }

  public startGame(): void {
    this.gameStartTime = Date.now();
    this.isGameActive = true;
    this.stats.totalGames++;
    this.saveStats();
  }

  public endGame(finalScore: number, snakeLength: number): void {
    if (!this.isGameActive) return;

    this.isGameActive = false;
    const playTime = (Date.now() - this.gameStartTime) / 1000; // 转换为秒

    // 更新统计数据
    this.stats.totalScore += finalScore;
    this.stats.highestScore = Math.max(this.stats.highestScore, finalScore);
    this.stats.totalPlayTime += playTime;
    this.stats.longestSnake = Math.max(this.stats.longestSnake, snakeLength);
    this.stats.averageScore = this.stats.totalScore / this.stats.totalGames;

    this.saveStats();
  }

  public addFoodEaten(): void {
    this.stats.foodEaten++;
    this.saveStats();
  }

  public getStats(): GameStats {
    return { ...this.stats };
  }

  private loadStats(): void {
    const saved = localStorage.getItem('gameStats');
    if (saved) {
      this.stats = JSON.parse(saved);
    }
  }

  private saveStats(): void {
    localStorage.setItem('gameStats', JSON.stringify(this.stats));
  }
} 
export class ScoreSystem {
  private score: number = 0;
  private highScore: number = 0;
  private combo: number = 0;
  private lastScoreTime: number = 0;
  private readonly COMBO_TIMEOUT = 2000; // 连击超时时间(ms)
  private onScoreChange?: (score: number, combo: number) => void;

  constructor() {
    this.loadHighScore();
  }

  public addScore(points: number): void {
    const currentTime = performance.now();
    
    // 检查连击
    if (currentTime - this.lastScoreTime < this.COMBO_TIMEOUT) {
      this.combo++;
    } else {
      this.combo = 1;
    }
    
    // 计算实际得分（包含连击加成）
    const actualPoints = points * (1 + (this.combo - 1) * 0.1);
    this.score += Math.floor(actualPoints);
    
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    
    this.lastScoreTime = currentTime;
    this.onScoreChange?.(this.score, this.combo);
  }

  public getScore(): number {
    return this.score;
  }

  public getHighScore(): number {
    return this.highScore;
  }

  public getCombo(): number {
    return this.combo;
  }

  public reset(): void {
    this.score = 0;
    this.combo = 0;
    this.lastScoreTime = 0;
    this.onScoreChange?.(this.score, this.combo);
  }

  public setScoreChangeListener(callback: (score: number, combo: number) => void): void {
    this.onScoreChange = callback;
  }

  private loadHighScore(): void {
    const saved = localStorage.getItem('highScore');
    if (saved) {
      this.highScore = parseInt(saved, 10);
    }
  }

  private saveHighScore(): void {
    localStorage.setItem('highScore', this.highScore.toString());
  }
} 
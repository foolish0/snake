import { IGameLogic, IRenderer } from '../types/interfaces';

// 游戏主循环类
export class GameLoop {
  private lastTime: number = 0;
  private accumulatedTime: number = 0;
  private readonly TIME_STEP: number = 1000 / 60; // 60 FPS
  private isRunning: boolean = false;
  
  constructor(
    private readonly update: (deltaTime: number) => void,
    private readonly render: () => void
  ) {}

  // 启动游戏循环
  public start(): void {
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  public stop(): void {
    this.isRunning = false;
  }

  private gameLoop(currentTime: number): void {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.accumulatedTime += deltaTime;

    while (this.accumulatedTime >= this.TIME_STEP) {
      this.update(this.TIME_STEP);
      this.accumulatedTime -= this.TIME_STEP;
    }

    this.render();
    requestAnimationFrame(this.gameLoop.bind(this));
  }
} 
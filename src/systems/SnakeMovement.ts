import { Vector2, GameObject, Bounds } from '../types/interfaces';
import { GameConfig } from '../config/GameConfig';

// 蛇体运动系统
export class SnakeMovement implements GameObject {
  public id: number;
  private segments: Vector2[] = [];
  private direction: Vector2;
  private moveTimer: number = 0;
  private readonly moveInterval: number = 150;

  constructor() {
    this.id = Math.random();
    this.direction = new Vector2(1, 0);
    // 初始化蛇的位置在中心
    const startX = Math.floor(GameConfig.GRID_SIZE / 2);
    const startY = Math.floor(GameConfig.GRID_SIZE / 2);
    this.segments.push(new Vector2(startX, startY));
  }

  get position(): Vector2 {
    return this.segments[0];
  }

  getHeadPosition(): Vector2 {
    return this.segments[0].clone();
  }

  getBounds(): Bounds {
    const head = this.segments[0];
    return {
      min: new Vector2(head.x - 0.5, head.y - 0.5),
      max: new Vector2(head.x + 0.5, head.y + 0.5)
    };
  }

  public update(deltaTime: number): void {
    this.moveTimer += deltaTime;
    if (this.moveTimer >= this.moveInterval) {
      this.move();
      this.moveTimer = 0;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // 绘制蛇身
    ctx.fillStyle = GameConfig.COLORS.SNAKE_BODY;
    this.segments.forEach(segment => {
      ctx.fillRect(
        segment.x * GameConfig.CELL_SIZE,
        segment.y * GameConfig.CELL_SIZE,
        GameConfig.CELL_SIZE,
        GameConfig.CELL_SIZE
      );
    });
  }

  public setDirection(newDir: Vector2): void {
    // 防止180度转向
    if (this.segments.length <= 1 || 
        !this.segments[1].equals(new Vector2(
          this.segments[0].x + newDir.x,
          this.segments[0].y + newDir.y
        ))) {
      this.direction = newDir;
    }
  }

  public getSegments(): Vector2[] {
    return [...this.segments];
  }

  public grow(): void {
    const tail = this.segments[this.segments.length - 1];
    this.segments.push(new Vector2(tail.x, tail.y));
  }

  private move(): void {
    const head = this.segments[0];
    const newHead = new Vector2(
      Math.round(head.x + this.direction.x),
      Math.round(head.y + this.direction.y)
    );

    // 检查是否与当前方向相反
    if (this.segments.length > 1) {
      const neck = this.segments[1];
      if (newHead.equals(neck)) {
        return; // 防止倒退
      }
    }

    this.segments.unshift(newHead);
    this.segments.pop();
  }
} 
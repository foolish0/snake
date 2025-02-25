import { Vector2 } from '../types/interfaces';
import { GameConfig } from '../config/GameConfig';

interface Effect {
  id: string;
  position: Vector2;
  duration: number;
  elapsed: number;
  onUpdate: (progress: number) => void;
  onComplete?: () => void;
}

export class EffectSystem {
  private effects: Effect[] = [];
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
  }

  public update(deltaTime: number): void {
    this.effects = this.effects.filter(effect => {
      effect.elapsed += deltaTime;
      const progress = Math.min(1, effect.elapsed / effect.duration);
      
      effect.onUpdate(this.easeInOut(progress));
      
      if (progress >= 1) {
        effect.onComplete?.();
        return false;
      }
      return true;
    });
  }

  public addFoodSpawnEffect(position: Vector2): void {
    const config = GameConfig.ANIMATION.FOOD_SPAWN;
    this.effects.push({
      id: 'food_spawn',
      position,
      duration: config.DURATION,
      elapsed: 0,
      onUpdate: (progress) => {
        const scale = config.SCALE.START + (config.SCALE.END - config.SCALE.START) * progress;
        this.drawFoodSpawnEffect(position, scale);
      }
    });
  }

  public addSnakeDeathEffect(segments: Vector2[]): void {
    const config = GameConfig.ANIMATION.SNAKE_DIE;
    segments.forEach((segment, index) => {
      this.effects.push({
        id: 'snake_death',
        position: segment,
        duration: config.DURATION,
        elapsed: index * 50, // 延迟效果
        onUpdate: (progress) => {
          this.drawSnakeDeathEffect(segment, 1 - progress);
        }
      });
    });
  }

  private drawFoodSpawnEffect(position: Vector2, scale: number): void {
    const x = position.x * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    const y = position.y * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    const radius = GameConfig.CELL_SIZE / 2 * scale;

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.strokeStyle = GameConfig.COLORS.FOOD;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private drawSnakeDeathEffect(position: Vector2, alpha: number): void {
    const x = position.x * GameConfig.CELL_SIZE;
    const y = position.y * GameConfig.CELL_SIZE;

    this.ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
    this.ctx.fillRect(x, y, GameConfig.CELL_SIZE, GameConfig.CELL_SIZE);
  }

  private easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  public clear(): void {
    this.effects = [];
  }
} 
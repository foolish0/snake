import { Vector2, GameObject, Bounds } from './interfaces';

export class Food implements GameObject {
  public id: number;
  public position: Vector2;
  
  constructor(position: Vector2) {
    this.id = Math.random();
    this.position = position;
  }

  getBounds(): Bounds {
    return {
      min: new Vector2(this.position.x - 0.5, this.position.y - 0.5),
      max: new Vector2(this.position.x + 0.5, this.position.y + 0.5)
    };
  }

  update(deltaTime: number): void {
    // 食物是静态的,不需要更新
  }
} 
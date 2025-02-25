// 基础向量类
export class Vector2 {
  constructor(public x: number, public y: number) {}

  public clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  public add(other: Vector2): Vector2 {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  public equals(other: Vector2): boolean {
    return this.x === other.x && this.y === other.y;
  }

  multiplyScalar(s: number): Vector2 {
    this.x *= s;
    this.y *= s;
    return this;
  }

  normalize(): Vector2 {
    const len = Math.sqrt(this.x * this.x + this.y * this.y);
    if (len > 0) {
      this.x /= len;
      this.y /= len;
    }
    return this;
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }
}

// 游戏对象接口
export interface GameObject {
  id: number;
  position: Vector2;
  getBounds(): Bounds;
  update(deltaTime: number): void;
}

// 边界框接口
export interface Bounds {
  min: Vector2;
  max: Vector2;
}

// 游戏逻辑接口
export interface IGameLogic {
  update(deltaTime: number): void;
}

// 渲染器接口
export interface IRenderer {
  render(deltaTime: number): void;
}

// 碰撞结果接口
export interface CollisionResult {
  hasCollision: boolean;
  collidedWith?: GameObject;
} 
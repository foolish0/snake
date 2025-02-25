import { GameObject, CollisionResult, Vector2 } from '../types/interfaces';
import { GameConfig } from '../config/GameConfig';
import { SnakeMovement } from './SnakeMovement';

// 碰撞检测系统
export class CollisionSystem {
  public checkCollision(snake: SnakeMovement, gameObjects: GameObject[]): CollisionResult {
    const head = snake.getHeadPosition();
    const segments = snake.getSegments();
    
    // 检查是否撞到自己
    for (let i = 1; i < segments.length; i++) {
      if (head.equals(segments[i])) {
        return { hasCollision: true };
      }
    }
    
    // 检查是否撞到墙
    if (
      head.x < 0 || 
      head.x >= GameConfig.GRID_SIZE || 
      head.y < 0 || 
      head.y >= GameConfig.GRID_SIZE
    ) {
      return { hasCollision: true };
    }
    
    // 检查是否撞到其他游戏对象
    for (const obj of gameObjects) {
      if (this.checkObjectCollision(head, obj)) {
        return { hasCollision: true, collidedWith: obj };
      }
    }
    
    return { hasCollision: false };
  }
  
  private checkObjectCollision(position: Vector2, obj: GameObject): boolean {
    const bounds = obj.getBounds();
    return (
      position.x >= bounds.min.x && 
      position.x <= bounds.max.x && 
      position.y >= bounds.min.y && 
      position.y <= bounds.max.y
    );
  }
} 
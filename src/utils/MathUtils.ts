import { Vector2 } from '../types/interfaces';
import { GameConfig } from '../config/GameConfig';

export class MathUtils {
  public static randomGridPosition(): Vector2 {
    return new Vector2(
      Math.floor(Math.random() * GameConfig.GRID_SIZE),
      Math.floor(Math.random() * GameConfig.GRID_SIZE)
    );
  }

  public static isPositionEqual(pos1: Vector2, pos2: Vector2): boolean {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  }

  public static isPositionInBounds(pos: Vector2): boolean {
    return pos.x >= 0 && 
           pos.x < GameConfig.GRID_SIZE && 
           pos.y >= 0 && 
           pos.y < GameConfig.GRID_SIZE;
  }
} 
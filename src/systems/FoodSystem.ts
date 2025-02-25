import { Vector2 } from '../types/interfaces';
import { Food } from '../types/Food';
import { MathUtils } from '../utils/MathUtils';
import { GameConfig } from '../config/GameConfig';

export class FoodSystem {
  private readonly GRID_SIZE = GameConfig.GRID_SIZE;

  public generateFood(): Food {
    return new Food(MathUtils.randomGridPosition());
  }

  public generateValidFood(snakeSegments: Vector2[]): Food {
    let food = this.generateFood();
    while (!this.isFoodPositionValid(food, snakeSegments)) {
      food = this.generateFood();
    }
    return food;
  }

  public isFoodPositionValid(food: Food, snakeSegments: Vector2[]): boolean {
    return !snakeSegments.some(segment => 
      MathUtils.isPositionEqual(segment, food.position)
    );
  }
}

export { Food } from '../types/Food'; 
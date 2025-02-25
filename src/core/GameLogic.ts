import { IGameLogic, GameObject, Vector2, CollisionResult } from '../types/interfaces';
import { SnakeMovement } from '../systems/SnakeMovement';
import { CollisionSystem } from '../systems/CollisionSystem';
import { FoodSystem } from '../systems/FoodSystem';
import { InputSystem } from '../systems/InputSystem';
import { ScoreSystem } from '../systems/ScoreSystem';
import { GameStateManager, GameState } from '../core/GameStateManager';
import { UISystem } from '../systems/UISystem';
import { AudioSystem } from '../systems/AudioSystem';
import { Food } from '../types/Food';
import { RenderSystem } from '../systems/RenderSystem';
import { GameConfig } from '../config/GameConfig';

export class GameLogic implements IGameLogic {
  private snake: SnakeMovement;
  private collisionSystem: CollisionSystem;
  private foodSystem: FoodSystem;
  private inputSystem: InputSystem;
  private scoreSystem: ScoreSystem;
  private stateManager: GameStateManager;
  private uiSystem: UISystem;
  private audioSystem: AudioSystem;
  private gameObjects: GameObject[] = [];
  private renderSystem?: RenderSystem;
  private food: Food;

  constructor(canvas: HTMLCanvasElement) {
    this.snake = new SnakeMovement();
    this.collisionSystem = new CollisionSystem();
    this.foodSystem = new FoodSystem();
    this.inputSystem = new InputSystem();
    this.scoreSystem = new ScoreSystem();
    this.stateManager = new GameStateManager();
    this.uiSystem = new UISystem();
    this.audioSystem = new AudioSystem();

    this.food = this.foodSystem.generateFood();
    
    this.inputSystem.initialize();

    this.initializeGameObjects();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // 设置输入处理
    this.inputSystem.initialize();

    // 设置UI事件处理
    this.uiSystem.setStartGameHandler(() => this.startGame());
    this.uiSystem.setRestartHandler(() => this.restartGame());

    // 设置状态变化监听
    this.stateManager.setStateChangeListener((state) => {
      this.uiSystem.updateGameState(state);
      if (state === GameState.GAME_OVER) {
        this.audioSystem.playSound('die');
      }
    });

    // 设置分数变化监听
    this.scoreSystem.setScoreChangeListener((score) => {
      this.uiSystem.updateScore(score, this.scoreSystem.getHighScore());
    });
  }

  private startGame(): void {
    this.resetGame();
    this.stateManager.setState(GameState.PLAYING);
  }

  private restartGame(): void {
    this.resetGame();
    this.stateManager.setState(GameState.PLAYING);
  }

  private resetGame(): void {
    this.snake = new SnakeMovement();
    this.gameObjects = [];
    this.scoreSystem.reset();
    this.food = this.foodSystem.generateFood();
    this.initializeGameObjects();
  }

  public update(deltaTime: number): void {
    if (!this.stateManager.isPlaying()) return;

    const direction = this.inputSystem.getCurrentDirection();
    if (direction) {
      console.log("Direction changed:", direction);
      this.snake.setDirection(direction);
    }

    this.snake.update(deltaTime);
    
    // 添加调试信息
    if (this.snake.getSegments().length > 0) {
      console.log("Snake head:", this.snake.getSegments()[0]);
    }

    // 检查碰撞
    const collision = this.collisionSystem.checkCollision(this.snake, [this.food]);
    if (collision.hasCollision) {
      if (collision.collidedWith === this.food) {
        this.handleFoodCollision();
      } else {
        this.stateManager.setState(GameState.GAME_OVER);
      }
    }

    // 更新其他游戏对象
    this.gameObjects.forEach(obj => obj.update(deltaTime));

    // 更新渲染系统的游戏对象
    this.renderSystem?.setGameObjects(this.gameObjects);
  }

  private initializeGameObjects(): void {
    this.gameObjects.push(this.food);
  }

  private handleFoodCollision(): void {
    this.snake.grow();
    this.scoreSystem.addScore(10);
    this.food = this.foodSystem.generateValidFood(this.snake.getSegments());
    this.gameObjects = this.gameObjects.filter(obj => obj !== this.food);
    this.gameObjects.push(this.food);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.snake.render(ctx);
    // 渲染食物
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(
      this.food.position.x * 20,
      this.food.position.y * 20,
      20,
      20
    );
  }

  public setRenderSystem(renderer: RenderSystem): void {
    this.renderSystem = renderer;
    this.renderSystem.setSnake(this.snake);
    this.renderSystem.setGameObjects(this.gameObjects);
  }
} 
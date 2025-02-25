import { IRenderer, GameObject } from '../types/interfaces';
import { SnakeMovement } from './SnakeMovement';
import { Food } from '../types/Food';

export class RenderSystem implements IRenderer {
  private ctx: CanvasRenderingContext2D;
  private readonly CELL_SIZE = 20;
  private gameObjects: GameObject[] = [];
  private snake: SnakeMovement;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    // 设置画布大小为网格的整数倍
    canvas.width = this.CELL_SIZE * 20;  // 20x20的网格
    canvas.height = this.CELL_SIZE * 20;
  }

  public setGameObjects(objects: GameObject[]): void {
    this.gameObjects = objects;
  }

  public setSnake(snake: SnakeMovement): void {
    this.snake = snake;
  }

  public render(deltaTime: number): void {
    this.clear();
    this.renderGrid();
    this.renderGameObjects();
    this.renderSnake();
  }

  private clear(): void {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  private renderGrid(): void {
    this.ctx.strokeStyle = '#333333';
    this.ctx.beginPath();
    
    // 绘制网格线
    for(let i = 0; i <= this.ctx.canvas.width; i += this.CELL_SIZE) {
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.ctx.canvas.height);
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.ctx.canvas.width, i);
    }
    
    this.ctx.stroke();
  }

  private renderGameObjects(): void {
    for (const obj of this.gameObjects) {
      if (obj instanceof Food) {
        this.renderFood(obj);
      }
    }
  }

  private renderFood(food: Food): void {
    const x = food.position.x * this.CELL_SIZE;
    const y = food.position.y * this.CELL_SIZE;
    
    this.ctx.fillStyle = '#ff0000';
    this.ctx.beginPath();
    this.ctx.arc(
      x + this.CELL_SIZE / 2,
      y + this.CELL_SIZE / 2,
      this.CELL_SIZE / 3,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  private renderSnake(): void {
    if (!this.snake) return;

    // 渲染蛇身
    this.ctx.fillStyle = '#00ff00';
    for (const segment of this.snake.getSegments()) {
      const x = segment.x * this.CELL_SIZE;
      const y = segment.y * this.CELL_SIZE;
      this.ctx.fillRect(x, y, this.CELL_SIZE - 1, this.CELL_SIZE - 1);
    }

    // 渲染蛇头
    const head = this.snake.getHeadPosition();
    this.ctx.fillStyle = '#00aa00';
    this.ctx.fillRect(
      head.x * this.CELL_SIZE,
      head.y * this.CELL_SIZE,
      this.CELL_SIZE - 1,
      this.CELL_SIZE - 1
    );
  }
} 
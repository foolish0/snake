import { Vector2 } from '../types/interfaces';

export class InputSystem {
  private currentDirection: Vector2 | null = null;
  private keyState: { [key: string]: boolean } = {};
  private touchStartPos?: Vector2;
  private readonly SWIPE_THRESHOLD = 30; // 触摸滑动的最小距离

  public initialize(): void {
    // 键盘事件
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));

    // 触摸事件
    window.addEventListener('touchstart', this.handleTouchStart.bind(this));
    window.addEventListener('touchmove', this.handleTouchMove.bind(this));
    window.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  public cleanup(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    window.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    window.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    window.removeEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  public getCurrentDirection(): Vector2 | null {
    return this.currentDirection;
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.keyState[event.key] = true;
    this.updateDirection();

    // 阻止方向键滚动页面
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keyState[event.key] = false;
  }

  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStartPos = new Vector2(touch.clientX, touch.clientY);
    event.preventDefault();
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.touchStartPos) return;
    event.preventDefault();
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (!this.touchStartPos) return;
    
    const touch = event.changedTouches[0];
    const endPos = new Vector2(touch.clientX, touch.clientY);
    const delta = new Vector2(
      endPos.x - this.touchStartPos.x,
      endPos.y - this.touchStartPos.y
    );

    if (Math.abs(delta.x) > this.SWIPE_THRESHOLD || Math.abs(delta.y) > this.SWIPE_THRESHOLD) {
      if (Math.abs(delta.x) > Math.abs(delta.y)) {
        // 水平滑动
        this.currentDirection = new Vector2(Math.sign(delta.x), 0);
      } else {
        // 垂直滑动
        this.currentDirection = new Vector2(0, Math.sign(delta.y));
      }
    }

    this.touchStartPos = undefined;
    event.preventDefault();
  }

  private updateDirection(): void {
    // 防止同时按下相反方向键
    if (this.keyState['ArrowUp'] || this.keyState['w']) {
      this.currentDirection = new Vector2(0, -1);
    } else if (this.keyState['ArrowDown'] || this.keyState['s']) {
      this.currentDirection = new Vector2(0, 1);
    } else if (this.keyState['ArrowLeft'] || this.keyState['a']) {
      this.currentDirection = new Vector2(-1, 0);
    } else if (this.keyState['ArrowRight'] || this.keyState['d']) {
      this.currentDirection = new Vector2(1, 0);
    }
  }
} 
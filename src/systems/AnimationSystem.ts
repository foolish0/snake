interface Animation {
  duration: number;
  elapsed: number;
  onUpdate: (progress: number) => void;
  onComplete?: () => void;
}

export class AnimationSystem {
  private animations: Animation[] = [];

  public update(deltaTime: number): void {
    this.animations = this.animations.filter(animation => {
      animation.elapsed += deltaTime;
      const progress = Math.min(1, animation.elapsed / animation.duration);
      
      animation.onUpdate(this.easeInOut(progress));
      
      if (progress >= 1) {
        animation.onComplete?.();
        return false;
      }
      return true;
    });
  }

  public addAnimation(
    duration: number,
    onUpdate: (progress: number) => void,
    onComplete?: () => void
  ): void {
    this.animations.push({
      duration,
      elapsed: 0,
      onUpdate,
      onComplete
    });
  }

  private easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  public clear(): void {
    this.animations = [];
  }
} 
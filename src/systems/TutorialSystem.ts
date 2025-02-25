interface TutorialStep {
  id: string;
  message: string;
  condition: () => boolean;
  position: { x: number; y: number };
}

export class TutorialSystem {
  private steps: TutorialStep[] = [];
  private currentStepIndex: number = 0;
  private isActive: boolean = false;
  private onStepChange?: (step: TutorialStep) => void;

  constructor() {
    this.initializeSteps();
  }

  private initializeSteps(): void {
    this.steps = [
      {
        id: 'movement',
        message: '使用方向键或WASD控制蛇的移动',
        condition: () => true,
        position: { x: 50, y: 50 }
      },
      {
        id: 'food',
        message: '吃掉红色食物来增长和得分',
        condition: () => true,
        position: { x: 50, y: 150 }
      },
      {
        id: 'collision',
        message: '注意不要撞到墙壁或自己的身体',
        condition: () => true,
        position: { x: 50, y: 250 }
      }
    ];
  }

  public start(): void {
    this.isActive = true;
    this.currentStepIndex = 0;
    this.showCurrentStep();
  }

  public update(): void {
    if (!this.isActive) return;

    const currentStep = this.steps[this.currentStepIndex];
    if (currentStep && currentStep.condition()) {
      this.nextStep();
    }
  }

  private showCurrentStep(): void {
    if (this.currentStepIndex < this.steps.length) {
      this.onStepChange?.(this.steps[this.currentStepIndex]);
    }
  }

  private nextStep(): void {
    this.currentStepIndex++;
    if (this.currentStepIndex >= this.steps.length) {
      this.complete();
    } else {
      this.showCurrentStep();
    }
  }

  private complete(): void {
    this.isActive = false;
    localStorage.setItem('tutorialCompleted', 'true');
  }

  public setStepChangeListener(callback: (step: TutorialStep) => void): void {
    this.onStepChange = callback;
  }

  public isTutorialCompleted(): boolean {
    return localStorage.getItem('tutorialCompleted') === 'true';
  }
} 
export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: () => boolean;
  unlocked: boolean;
  icon: string;
}

export class AchievementSystem {
  private achievements: Achievement[] = [];
  private onAchievementUnlock?: (achievement: Achievement) => void;

  constructor() {
    this.initializeAchievements();
    this.loadProgress();
  }

  private initializeAchievements(): void {
    this.achievements = [
      {
        id: 'first_food',
        name: '开胃菜',
        description: '第一次吃到食物',
        condition: () => true,
        unlocked: false,
        icon: '🍎'
      },
      {
        id: 'snake_10',
        name: '小蛇成长',
        description: '蛇身长度达到10',
        condition: () => true,
        unlocked: false,
        icon: '🐍'
      },
      {
        id: 'score_100',
        name: '百分选手',
        description: '单局得分超过100',
        condition: () => true,
        unlocked: false,
        icon: '💯'
      },
      {
        id: 'combo_5',
        name: '连击大师',
        description: '达成5连击',
        condition: () => true,
        unlocked: false,
        icon: '⚡'
      }
    ];
  }

  public checkAchievements(stats: any): void {
    this.achievements.forEach(achievement => {
      if (!achievement.unlocked && achievement.condition()) {
        this.unlockAchievement(achievement.id);
      }
    });
  }

  public unlockAchievement(id: string): void {
    const achievement = this.achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      this.onAchievementUnlock?.(achievement);
      this.saveProgress();
    }
  }

  public getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  public setUnlockListener(callback: (achievement: Achievement) => void): void {
    this.onAchievementUnlock = callback;
  }

  private loadProgress(): void {
    const saved = localStorage.getItem('achievements');
    if (saved) {
      const unlockedIds = JSON.parse(saved) as string[];
      unlockedIds.forEach(id => {
        const achievement = this.achievements.find(a => a.id === id);
        if (achievement) {
          achievement.unlocked = true;
        }
      });
    }
  }

  private saveProgress(): void {
    const unlockedIds = this.achievements
      .filter(a => a.unlocked)
      .map(a => a.id);
    localStorage.setItem('achievements', JSON.stringify(unlockedIds));
  }
} 
import { GameConfig } from '../config/GameConfig';

export interface Skin {
  id: string;
  name: string;
  description: string;
  price: number;
  colors: {
    head: string;
    body: string;
  };
  unlocked: boolean;
  texture?: string;
}

export class SkinSystem {
  private skins: Skin[] = [];
  private currentSkinId: string = 'default';
  private onSkinChange?: (skin: Skin) => void;

  constructor() {
    this.initializeSkins();
    this.loadProgress();
  }

  private initializeSkins(): void {
    this.skins = [
      {
        id: 'default',
        name: '经典绿色',
        description: '最经典的贪吃蛇造型',
        price: 0,
        colors: {
          head: GameConfig.COLORS.SNAKE_HEAD,
          body: GameConfig.COLORS.SNAKE_BODY
        },
        unlocked: true
      },
      {
        id: 'rainbow',
        name: '彩虹蛇',
        description: '绚丽多彩的七彩蛇身',
        price: 100,
        colors: {
          head: '#FF0000',
          body: '#FF9900'
        },
        unlocked: false
      },
      {
        id: 'golden',
        name: '黄金蛇',
        description: '尊贵的金色外观',
        price: 500,
        colors: {
          head: '#FFD700',
          body: '#FFA500'
        },
        unlocked: false
      }
    ];
  }

  public getCurrentSkin(): Skin {
    return this.skins.find(skin => skin.id === this.currentSkinId)!;
  }

  public setSkin(skinId: string): void {
    const skin = this.skins.find(s => s.id === skinId);
    if (skin && skin.unlocked) {
      this.currentSkinId = skinId;
      this.onSkinChange?.(skin);
      this.saveProgress();
    }
  }

  public unlockSkin(skinId: string): boolean {
    const skin = this.skins.find(s => s.id === skinId);
    if (skin && !skin.unlocked) {
      skin.unlocked = true;
      this.saveProgress();
      return true;
    }
    return false;
  }

  public getAvailableSkins(): Skin[] {
    return [...this.skins];
  }

  public setChangeListener(callback: (skin: Skin) => void): void {
    this.onSkinChange = callback;
  }

  private loadProgress(): void {
    const saved = localStorage.getItem('skins');
    if (saved) {
      const data = JSON.parse(saved);
      this.currentSkinId = data.currentSkinId;
      data.unlockedSkins.forEach((skinId: string) => {
        const skin = this.skins.find(s => s.id === skinId);
        if (skin) {
          skin.unlocked = true;
        }
      });
    }
  }

  private saveProgress(): void {
    const data = {
      currentSkinId: this.currentSkinId,
      unlockedSkins: this.skins
        .filter(skin => skin.unlocked)
        .map(skin => skin.id)
    };
    localStorage.setItem('skins', JSON.stringify(data));
  }
} 
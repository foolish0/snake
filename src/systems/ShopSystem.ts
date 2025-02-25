import { Skin } from './SkinSystem';
import { GameConfig } from '../config/GameConfig';

interface ShopItem {
  type: 'skin' | 'powerup';
  itemId: string;
  price: number;
}

export class ShopSystem {
  private currency: number = 0;
  private lastRewardTime: number = 0;
  private onCurrencyChange?: (amount: number) => void;
  private onPurchase?: (item: ShopItem) => void;

  constructor() {
    this.loadProgress();
  }

  public getCurrency(): number {
    return this.currency;
  }

  public addCurrency(amount: number): void {
    this.currency += amount;
    this.onCurrencyChange?.(this.currency);
    this.saveProgress();
  }

  public canPurchase(item: ShopItem): boolean {
    return this.currency >= item.price;
  }

  public purchase(item: ShopItem): boolean {
    if (this.canPurchase(item)) {
      this.currency -= item.price;
      this.onCurrencyChange?.(this.currency);
      this.onPurchase?.(item);
      this.saveProgress();
      return true;
    }
    return false;
  }

  public claimDailyReward(): boolean {
    const now = Date.now();
    if (now - this.lastRewardTime >= GameConfig.SHOP.REWARD_COOLDOWN) {
      this.addCurrency(GameConfig.SHOP.DAILY_REWARD);
      this.lastRewardTime = now;
      this.saveProgress();
      return true;
    }
    return false;
  }

  public getTimeUntilNextReward(): number {
    const now = Date.now();
    const timeSinceLastReward = now - this.lastRewardTime;
    return Math.max(0, GameConfig.SHOP.REWARD_COOLDOWN - timeSinceLastReward);
  }

  private loadProgress(): void {
    const saved = localStorage.getItem('shop');
    if (saved) {
      const data = JSON.parse(saved);
      this.currency = data.currency;
      this.lastRewardTime = data.lastRewardTime;
    }
  }

  private saveProgress(): void {
    const data = {
      currency: this.currency,
      lastRewardTime: this.lastRewardTime
    };
    localStorage.setItem('shop', JSON.stringify(data));
  }

  public setCurrencyChangeListener(callback: (amount: number) => void): void {
    this.onCurrencyChange = callback;
  }

  public setPurchaseListener(callback: (item: ShopItem) => void): void {
    this.onPurchase = callback;
  }
} 
export class NetworkStatusSystem {
  private isOnline: boolean = navigator.onLine;
  private onStatusChange?: (isOnline: boolean) => void;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onStatusChange?.(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.onStatusChange?.(false);
    });
  }

  public getStatus(): boolean {
    return this.isOnline;
  }

  public setStatusChangeListener(callback: (isOnline: boolean) => void): void {
    this.onStatusChange = callback;
  }

  public cleanup(): void {
    window.removeEventListener('online', this.setupEventListeners);
    window.removeEventListener('offline', this.setupEventListeners);
  }
} 
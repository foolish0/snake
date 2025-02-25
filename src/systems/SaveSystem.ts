interface GameSave {
  score: number;
  snakeSegments: { x: number; y: number }[];
  foodPosition: { x: number; y: number };
  difficulty: number;
  timestamp: number;
}

export class SaveSystem {
  private readonly MAX_SAVES = 3;
  private readonly SAVE_PREFIX = 'snake_save_';

  public saveGame(gameState: Omit<GameSave, 'timestamp'>): void {
    const saves = this.getAllSaves();
    const newSave: GameSave = {
      ...gameState,
      timestamp: Date.now()
    };

    // 如果存档已满，删除最旧的
    if (saves.length >= this.MAX_SAVES) {
      const oldestSave = saves.reduce((oldest, current) => 
        current.timestamp < oldest.timestamp ? current : oldest
      );
      this.deleteSave(oldestSave.timestamp);
    }

    localStorage.setItem(
      `${this.SAVE_PREFIX}${newSave.timestamp}`,
      JSON.stringify(newSave)
    );
  }

  public loadGame(timestamp: number): GameSave | null {
    const saved = localStorage.getItem(`${this.SAVE_PREFIX}${timestamp}`);
    return saved ? JSON.parse(saved) : null;
  }

  public getAllSaves(): GameSave[] {
    const saves: GameSave[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.SAVE_PREFIX)) {
        const save = localStorage.getItem(key);
        if (save) {
          saves.push(JSON.parse(save));
        }
      }
    }
    return saves.sort((a, b) => b.timestamp - a.timestamp);
  }

  public deleteSave(timestamp: number): void {
    localStorage.removeItem(`${this.SAVE_PREFIX}${timestamp}`);
  }

  public hasSaves(): boolean {
    return this.getAllSaves().length > 0;
  }
} 
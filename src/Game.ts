import { GameConfig, GameDifficulty } from './config/GameConfig';

interface Vector2 {
  x: number;
  y: number;
}

interface Effect {
  position: Vector2;
  duration: number;
  elapsed: number;
  onUpdate: (progress: number) => void;
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private snakeSegments: Vector2[] = [];
  private direction: Vector2 = { x: 1, y: 0 };
  private lastTime: number = 0;
  private moveTimer: number = 0;
  private moveInterval: number = 150;
  private gameOver: boolean = false;
  private food: Vector2 = { x: 0, y: 0 };
  private score: number = 0;
  private highScore: number = 0;
  private difficulty: GameDifficulty = GameDifficulty.NORMAL;
  private effects: Effect[] = [];
  private audioContext: AudioContext;
  private sounds: { [key: string]: AudioBuffer } = {};
  private bgmElement: HTMLAudioElement | null = null;
  private isPaused: boolean = false;
  private gameState: 'menu' | 'playing' | 'paused' | 'gameover' | 'shop' | 'settings' = 'menu';
  private currentSkin: string = GameConfig.SKINS.DEFAULT_SKIN;
  private currency: number = 0;
  private ownedSkins: string[] = [GameConfig.SKINS.DEFAULT_SKIN];
  private lastRewardTime: number = 0;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private skinTextures: { [key: string]: HTMLImageElement } = {};

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // 设置画布大小
    this.canvas.width = GameConfig.GRID_SIZE * GameConfig.CELL_SIZE;
    this.canvas.height = GameConfig.GRID_SIZE * GameConfig.CELL_SIZE;
    
    // 添加键盘事件监听
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // 初始化音频
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.loadSounds();
    this.loadHighScore();
    this.loadSkins();
    this.loadCurrency();
    this.loadOwnedSkins();
    this.loadLastRewardTime();
    
    console.log("Game initialized");
  }

  private async loadSounds(): Promise<void> {
    try {
      // 加载音效
      const soundFiles = GameConfig.AUDIO.SOUNDS;
      for (const [name, path] of Object.entries(soundFiles)) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sounds[name] = audioBuffer;
          } else {
            console.warn(`Sound file not found: ${path}`);
          }
        } catch (e) {
          console.warn(`Failed to load sound: ${name}`, e);
        }
      }
      
      // 加载背景音乐
      this.bgmElement = document.createElement('audio');
      this.bgmElement.src = GameConfig.AUDIO.BGM_PATH;
      this.bgmElement.loop = true;
      this.bgmElement.volume = GameConfig.AUDIO.DEFAULT_VOLUME;
      
      console.log("Sounds loaded");
    } catch (error) {
      console.error("Error loading sounds:", error);
    }
  }

  private playSound(name: string): void {
    if (!this.soundEnabled || !this.sounds[name]) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[name];
    source.connect(this.audioContext.destination);
    source.start(0);
  }

  private playBGM(): void {
    if (!this.musicEnabled || !this.bgmElement) return;
    
    this.bgmElement.play().catch(err => console.error("BGM play error:", err));
  }

  private stopBGM(): void {
    if (this.bgmElement) {
      this.bgmElement.pause();
      this.bgmElement.currentTime = 0;
    }
  }

  private loadHighScore(): void {
    const saved = localStorage.getItem('snakeHighScore');
    if (saved) {
      this.highScore = parseInt(saved, 10);
    }
  }

  private saveHighScore(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('snakeHighScore', this.highScore.toString());
    }
  }

  private loadSkins(): void {
    const skins = ['default', 'blue', 'gold', 'rainbow'];
    
    skins.forEach(skin => {
      const img = new Image();
      img.src = `${GameConfig.SKINS.TEXTURE_PATH}${skin}.png`;
      img.onload = () => console.log(`Loaded skin: ${skin}`);
      img.onerror = () => console.warn(`Failed to load skin: ${skin}`);
      this.skinTextures[skin] = img;
    });
  }

  private loadCurrency(): void {
    const saved = localStorage.getItem('snakeCurrency');
    if (saved) {
      this.currency = parseInt(saved, 10);
    }
  }

  private saveCurrency(): void {
    localStorage.setItem('snakeCurrency', this.currency.toString());
  }

  private loadOwnedSkins(): void {
    const saved = localStorage.getItem('snakeOwnedSkins');
    if (saved) {
      this.ownedSkins = JSON.parse(saved);
    }
  }

  private saveOwnedSkins(): void {
    localStorage.setItem('snakeOwnedSkins', JSON.stringify(this.ownedSkins));
  }

  private loadLastRewardTime(): void {
    const saved = localStorage.getItem('snakeLastRewardTime');
    if (saved) {
      this.lastRewardTime = parseInt(saved, 10);
    }
  }

  private saveLastRewardTime(): void {
    this.lastRewardTime = Date.now();
    localStorage.setItem('snakeLastRewardTime', this.lastRewardTime.toString());
  }

  private changeSkin(skinName: string): void {
    if (this.ownedSkins.includes(skinName)) {
      this.currentSkin = skinName;
      localStorage.setItem('snakeCurrentSkin', skinName);
    }
  }

  private buySkin(skinName: string, price: number): void {
    if (this.currency >= price && !this.ownedSkins.includes(skinName)) {
      this.currency -= price;
      this.ownedSkins.push(skinName);
      this.saveCurrency();
      this.saveOwnedSkins();
      this.playSound('buy');
    }
  }

  private collectDailyReward(): void {
    const now = Date.now();
    if (now - this.lastRewardTime >= GameConfig.SHOP.REWARD_COOLDOWN) {
      this.currency += GameConfig.SHOP.DAILY_REWARD;
      this.saveCurrency();
      this.saveLastRewardTime();
      this.playSound('reward');
      this.addRewardEffect();
    }
  }

  private canCollectDailyReward(): boolean {
    return Date.now() - this.lastRewardTime >= GameConfig.SHOP.REWARD_COOLDOWN;
  }

  private toggleSound(enabled: boolean): void {
    this.soundEnabled = enabled;
    localStorage.setItem('snakeSoundEnabled', enabled.toString());
  }

  private toggleMusic(enabled: boolean): void {
    this.musicEnabled = enabled;
    localStorage.setItem('snakeMusicEnabled', enabled.toString());
    
    if (enabled) {
      this.playBGM();
    } else {
      this.stopBGM();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // 在菜单状态下的按键处理
    if (this.gameState === 'menu') {
      switch (event.key.toLowerCase()) {
        case '1':
          this.setDifficulty(GameDifficulty.EASY);
          this.startGame();
          break;
        case '2':
          this.setDifficulty(GameDifficulty.NORMAL);
          this.startGame();
          break;
        case '3':
          this.setDifficulty(GameDifficulty.HARD);
          this.startGame();
          break;
        case 's':
          this.gameState = 'shop';
          break;
        case 'o':
        case 'O':
          this.gameState = 'settings';
          break;
      }
      return;
    }
    
    // 商店状态下的按键处理
    if (this.gameState === 'shop') {
      if (event.key === 'Escape' || event.key === 'b' || event.key === 'B') {
        this.gameState = 'menu';
      }
      // 数字键选择购买皮肤
      if (event.key >= '1' && event.key <= '3') {
        const skinIndex = parseInt(event.key) - 1;
        const skins = ['blue', 'gold', 'rainbow'];
        const prices = [100, 300, 500];
        
        if (skinIndex >= 0 && skinIndex < skins.length) {
          this.buySkin(skins[skinIndex], prices[skinIndex]);
        }
      }
      // 使用皮肤
      if (event.key === 'u' || event.key === 'U') {
        // 切换到下一个拥有的皮肤
        const currentIndex = this.ownedSkins.indexOf(this.currentSkin);
        const nextIndex = (currentIndex + 1) % this.ownedSkins.length;
        this.changeSkin(this.ownedSkins[nextIndex]);
      }
      // 领取每日奖励
      if (event.key === 'r' || event.key === 'R') {
        this.collectDailyReward();
      }
      return;
    }
    
    // 设置状态下的按键处理
    if (this.gameState === 'settings') {
      if (event.key === 'Escape' || event.key === 'b' || event.key === 'B') {
        this.gameState = 'menu';
      }
      if (event.key === 'v' || event.key === 'V') {
        this.toggleSound(!this.soundEnabled);
      }
      if (event.key === 'm' || event.key === 'M') {
        this.toggleMusic(!this.musicEnabled);
      }
      if (event.key === 's' || event.key === 'S') {
        // 切换到下一个拥有的皮肤
        const currentIndex = this.ownedSkins.indexOf(this.currentSkin);
        const nextIndex = (currentIndex + 1) % this.ownedSkins.length;
        this.changeSkin(this.ownedSkins[nextIndex]);
      }
      return;
    }
    
    // 游戏结束状态下的按键处理
    if (this.gameState === 'gameover') {
      if (event.key === 'r' || event.key === 'R') {
        this.gameState = 'menu';
      }
      return;
    }
    
    // 暂停/继续
    if (event.key === 'p' || event.key === 'P') {
      this.togglePause();
      return;
    }
    
    // 游戏进行中的按键处理
    if (this.gameState !== 'playing') return;
    
    const newDirection = { ...this.direction };
    
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (this.direction.y === 0) newDirection.x = 0, newDirection.y = -1;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (this.direction.y === 0) newDirection.x = 0, newDirection.y = 1;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (this.direction.x === 0) newDirection.x = -1, newDirection.y = 0;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (this.direction.x === 0) newDirection.x = 1, newDirection.y = 0;
        break;
    }
    
    if (newDirection.x !== this.direction.x || newDirection.y !== this.direction.y) {
      this.direction = newDirection;
      this.playSound('move');
    }
  }

  private togglePause(): void {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      this.stopBGM();
    } else if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.playBGM();
    }
  }

  private setDifficulty(difficulty: GameDifficulty): void {
    this.difficulty = difficulty;
    const settings = GameConfig.DIFFICULTY_SETTINGS[difficulty];
    this.moveInterval = 1000 / (settings.SNAKE_SPEED * 10);
    
    // 如果游戏正在进行，重置游戏
    if (!this.gameOver) {
      this.resetGame();
    }
  }

  private resetGame(): void {
    // 初始化蛇
    this.snakeSegments = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    this.direction = { x: 1, y: 0 };
    this.gameOver = false;
    this.isPaused = false;
    this.score = 0;
    this.effects = [];
    this.generateFood();
    
    // 设置难度
    const settings = GameConfig.DIFFICULTY_SETTINGS[this.difficulty];
    this.moveInterval = 1000 / (settings.SNAKE_SPEED * 10);
    
    // 播放背景音乐
    this.playBGM();
    
    console.log("Game reset with difficulty:", this.difficulty);
  }

  private generateFood(): void {
    let newFood: Vector2;
    let validPosition: boolean;
    
    do {
      newFood = {
        x: Math.floor(Math.random() * GameConfig.GRID_SIZE),
        y: Math.floor(Math.random() * GameConfig.GRID_SIZE)
      };
      
      validPosition = !this.snakeSegments.some(
        segment => segment.x === newFood.x && segment.y === newFood.y
      );
    } while (!validPosition);
    
    this.food = newFood;
    
    // 添加食物生成特效
    this.addFoodSpawnEffect(newFood);
  }

  private addFoodSpawnEffect(position: Vector2): void {
    const config = GameConfig.ANIMATION.FOOD_SPAWN;
    this.effects.push({
      position: { ...position },
      duration: config.DURATION,
      elapsed: 0,
      onUpdate: (progress) => {
        const scale = config.SCALE.START + (config.SCALE.END - config.SCALE.START) * progress;
        this.drawFoodSpawnEffect(position, scale);
      }
    });
  }

  private addSnakeDeathEffect(): void {
    const config = GameConfig.ANIMATION.SNAKE_DIE;
    this.snakeSegments.forEach((segment, index) => {
      this.effects.push({
        position: { ...segment },
        duration: config.DURATION,
        elapsed: index * 50, // 延迟效果
        onUpdate: (progress) => {
          this.drawSnakeDeathEffect(segment, 1 - progress);
        }
      });
    });
  }

  private drawFoodSpawnEffect(position: Vector2, scale: number): void {
    const x = position.x * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    const y = position.y * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2;
    const radius = GameConfig.CELL_SIZE / 2 * scale;

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.strokeStyle = GameConfig.COLORS.FOOD;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private drawSnakeDeathEffect(position: Vector2, alpha: number): void {
    const x = position.x * GameConfig.CELL_SIZE;
    const y = position.y * GameConfig.CELL_SIZE;

    this.ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
    this.ctx.fillRect(x, y, GameConfig.CELL_SIZE, GameConfig.CELL_SIZE);
  }

  private startGame(): void {
    this.resetGame();
    this.gameState = 'playing';
    this.playBGM();
    this.addGameStartEffect();
  }

  private gameLoop(currentTime: number): void {
    if (!this.lastTime) {
      this.lastTime = currentTime;
    }
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // 更新特效
    this.updateEffects(deltaTime);
    
    if (this.gameState === 'playing') {
      this.moveTimer += deltaTime;
      if (this.moveTimer >= this.moveInterval) {
        this.moveSnake();
        this.moveTimer = 0;
      }
    }
    
    this.render();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private updateEffects(deltaTime: number): void {
    this.effects = this.effects.filter(effect => {
      effect.elapsed += deltaTime;
      const progress = effect.elapsed / effect.duration;
      
      if (progress <= 1) {
        effect.onUpdate(progress);
        return true;
      }
      return false;
    });
  }

  private moveSnake(): void {
    const head = this.snakeSegments[0];
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y
    };
    
    // 检查边界碰撞
    if (newHead.x < 0 || newHead.x >= GameConfig.GRID_SIZE || 
        newHead.y < 0 || newHead.y >= GameConfig.GRID_SIZE) {
      this.handleGameOver();
      return;
    }
    
    // 检查自身碰撞
    if (this.snakeSegments.some(segment => 
        segment.x === newHead.x && segment.y === newHead.y)) {
      this.handleGameOver();
      return;
    }
    
    // 添加新头部
    this.snakeSegments.unshift(newHead);
    
    // 检查是否吃到食物
    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      // 吃到食物，增加分数，生成新食物
      const settings = GameConfig.DIFFICULTY_SETTINGS[this.difficulty];
      const scoreGained = GameConfig.SCORE_PER_FOOD * settings.SCORE_MULTIPLIER;
      this.score += scoreGained;
      
      // 增加金币
      const coinsGained = Math.ceil(scoreGained / 10);
      this.currency += coinsGained;
      this.saveCurrency();
      
      this.playSound('eat');
      this.generateFood();
      
      // 添加特效
      this.addScoreEffect(this.food, scoreGained);
      this.addCoinEffect(this.food, coinsGained);
      
      // 蛇身体增长，不需要删除尾部
    } else {
      // 没吃到食物，删除尾部
      this.snakeSegments.pop();
      if (Math.random() < 0.3) { // 30%几率播放移动音效
        this.playSound('move');
      }
    }
  }

  private handleGameOver(): void {
    this.gameState = 'gameover';
    this.playSound('die');
    this.stopBGM();
    this.saveHighScore();
    this.addSnakeDeathEffect();
  }

  private render(): void {
    // 清空画布
    this.ctx.fillStyle = GameConfig.COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 根据游戏状态渲染不同内容
    switch (this.gameState) {
      case 'menu':
        this.drawMenu();
        break;
      case 'shop':
        this.drawShop();
        break;
      case 'settings':
        this.drawSettings();
        break;
      case 'playing':
      case 'paused':
      case 'gameover':
        this.drawGame();
        break;
    }
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = GameConfig.COLORS.GRID;
    this.ctx.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let x = 0; x <= GameConfig.GRID_SIZE; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * GameConfig.CELL_SIZE, 0);
      this.ctx.lineTo(x * GameConfig.CELL_SIZE, this.canvas.height);
      this.ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= GameConfig.GRID_SIZE; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * GameConfig.CELL_SIZE);
      this.ctx.lineTo(this.canvas.width, y * GameConfig.CELL_SIZE);
      this.ctx.stroke();
    }
  }

  private drawUI(): void {
    // 绘制分数
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`分数: ${this.score}`, 10, 30);
    
    // 绘制最高分
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`最高分: ${this.highScore}`, this.canvas.width - 10, 30);
    
    // 绘制难度
    this.ctx.textAlign = 'center';
    const difficultyText = this.getDifficultyText();
    this.ctx.fillText(`难度: ${difficultyText}`, this.canvas.width / 2, 30);
  }

  private getDifficultyText(): string {
    switch (this.difficulty) {
      case GameDifficulty.EASY:
        return '简单';
      case GameDifficulty.NORMAL:
        return '普通';
      case GameDifficulty.HARD:
        return '困难';
      default:
        return '未知';
    }
  }

  private drawGameOver(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('游戏结束 - 按R重新开始', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.fillText(`最终分数: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
    
    if (this.score === this.highScore && this.score > 0) {
      this.ctx.fillStyle = '#FFD700'; // 金色
      this.ctx.fillText('新纪录！', this.canvas.width / 2, this.canvas.height / 2 + 80);
    }
  }

  private drawPauseScreen(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('游戏暂停 - 按P继续', this.canvas.width / 2, this.canvas.height / 2);
  }

  private drawMenu(): void {
    this.ctx.fillStyle = 'white';
    this.ctx.font = '36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('贪吃蛇游戏', this.canvas.width / 2, this.canvas.height / 4);
    
    this.ctx.font = '24px Arial';
    this.ctx.fillText('选择难度:', this.canvas.width / 2, this.canvas.height / 2 - 40);
    
    this.ctx.font = '20px Arial';
    this.ctx.fillText('1 - 简单', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.fillText('2 - 普通', this.canvas.width / 2, this.canvas.height / 2 + 30);
    this.ctx.fillText('3 - 困难', this.canvas.width / 2, this.canvas.height / 2 + 60);
    
    this.ctx.fillText('S - 商店', this.canvas.width / 2, this.canvas.height / 2 + 110);
    this.ctx.fillText('O - 设置', this.canvas.width / 2, this.canvas.height / 2 + 140);
    
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`最高分: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 190);
    this.ctx.fillText(`${GameConfig.SHOP.CURRENCY_NAME}: ${this.currency}`, this.canvas.width / 2, this.canvas.height / 2 + 220);
  }

  private drawShop(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('商店', this.canvas.width / 2, 60);
    
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`${GameConfig.SHOP.CURRENCY_NAME}: ${this.currency}`, this.canvas.width / 2, 100);
    
    // 绘制皮肤选项
    const skins = [
      { name: '蓝色蛇', id: 'blue', price: 100 },
      { name: '金色蛇', id: 'gold', price: 300 },
      { name: '彩虹蛇', id: 'rainbow', price: 500 }
    ];
    
    skins.forEach((skin, index) => {
      const y = 150 + index * 70;
      const owned = this.ownedSkins.includes(skin.id);
      const isSelected = this.currentSkin === skin.id;
      
      // 绘制背景
      this.ctx.fillStyle = isSelected ? 'rgba(0, 255, 0, 0.3)' : 'rgba(50, 50, 50, 0.5)';
      this.ctx.fillRect(this.canvas.width / 2 - 150, y - 25, 300, 50);
      
      // 绘制文本
      this.ctx.fillStyle = 'white';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`${index + 1}. ${skin.name}`, this.canvas.width / 2 - 140, y + 5);
      
      // 绘制价格或状态
      this.ctx.textAlign = 'right';
      if (owned) {
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillText('已拥有', this.canvas.width / 2 + 140, y + 5);
      } else {
        this.ctx.fillStyle = this.currency >= skin.price ? '#FFFF00' : '#FF0000';
        this.ctx.fillText(`${skin.price} ${GameConfig.SHOP.CURRENCY_NAME}`, this.canvas.width / 2 + 140, y + 5);
      }
    });
    
    // 绘制每日奖励
    const canCollect = this.canCollectDailyReward();
    this.ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
    this.ctx.fillRect(this.canvas.width / 2 - 150, 360, 300, 50);
    
    this.ctx.fillStyle = canCollect ? '#FFFF00' : 'white';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      canCollect ? `R. 领取每日奖励: ${GameConfig.SHOP.DAILY_REWARD} ${GameConfig.SHOP.CURRENCY_NAME}` : '每日奖励已领取',
      this.canvas.width / 2,
      385
    );
    
    // 绘制使用皮肤按钮
    this.ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
    this.ctx.fillRect(this.canvas.width / 2 - 150, 420, 300, 50);
    
    this.ctx.fillStyle = 'white';
    this.ctx.fillText('U. 切换皮肤', this.canvas.width / 2, 445);
    
    // 绘制返回按钮
    this.ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
    this.ctx.fillRect(this.canvas.width / 2 - 150, 480, 300, 50);
    
    this.ctx.fillStyle = 'white';
    this.ctx.fillText('B. 返回菜单', this.canvas.width / 2, 505);
  }

  private drawSettings(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('设置', this.canvas.width / 2, 60);
    
    // 绘制声音设置
    this.ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
    this.ctx.fillRect(this.canvas.width / 2 - 150, 120, 300, 50);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('V. 音效', this.canvas.width / 2 - 140, 150);
    
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = this.soundEnabled ? '#00FF00' : '#FF0000';
    this.ctx.fillText(this.soundEnabled ? '开启' : '关闭', this.canvas.width / 2 + 140, 150);
    
    // 绘制音乐设置
    this.ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
    this.ctx.fillRect(this.canvas.width / 2 - 150, 180, 300, 50);
    
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('M. 音乐', this.canvas.width / 2 - 140, 210);
    
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = this.musicEnabled ? '#00FF00' : '#FF0000';
    this.ctx.fillText(this.musicEnabled ? '开启' : '关闭', this.canvas.width / 2 + 140, 210);
    
    // 添加皮肤选择
    this.ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
    this.ctx.fillRect(this.canvas.width / 2 - 150, 240, 300, 50);

    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('S. 切换皮肤', this.canvas.width / 2 - 140, 270);

    this.ctx.textAlign = 'right';
    this.ctx.fillText(this.currentSkin, this.canvas.width / 2 + 140, 270);
    
    // 绘制返回按钮
    this.ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
    this.ctx.fillRect(this.canvas.width / 2 - 150, 300, 300, 50);
    
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('B. 返回菜单', this.canvas.width / 2, 325);
  }

  private drawGame(): void {
    // 绘制网格
    this.drawGrid();
    
    // 绘制食物
    this.drawFood();
    
    // 绘制蛇
    this.drawSnake();
    
    // 绘制UI
    this.drawUI();
    
    // 根据状态绘制额外内容
    if (this.gameState === 'gameover') {
      this.drawGameOver();
    } else if (this.gameState === 'paused') {
      this.drawPauseScreen();
    }
  }

  private drawFood(): void {
    this.ctx.fillStyle = GameConfig.COLORS.FOOD;
    this.ctx.fillRect(
      this.food.x * GameConfig.CELL_SIZE,
      this.food.y * GameConfig.CELL_SIZE,
      GameConfig.CELL_SIZE,
      GameConfig.CELL_SIZE
    );
  }

  private drawSnake(): void {
    this.snakeSegments.forEach((segment, index) => {
      const texture = this.skinTextures[this.currentSkin];
      if (texture && texture.complete) {
        // 使用皮肤纹理
        const frameSize = texture.width / 3; // 每个方向的帧数
        const direction = this.getSegmentDirection(index);
        const frame = Math.floor(Date.now() / GameConfig.SKINS.ANIMATION_SPEED) % 3;
        
        this.ctx.drawImage(
          texture,
          frame * frameSize,
          direction * frameSize,
          frameSize,
          frameSize,
          segment.x * GameConfig.CELL_SIZE,
          segment.y * GameConfig.CELL_SIZE,
          GameConfig.CELL_SIZE,
          GameConfig.CELL_SIZE
        );
      } else {
        // 降级为普通渲染
        this.ctx.fillStyle = index === 0 ? 
          GameConfig.COLORS.SNAKE_HEAD : 
          GameConfig.COLORS.SNAKE_BODY;
        this.ctx.fillRect(
          segment.x * GameConfig.CELL_SIZE,
          segment.y * GameConfig.CELL_SIZE,
          GameConfig.CELL_SIZE,
          GameConfig.CELL_SIZE
        );
      }
    });
  }

  private getSegmentDirection(index: number): number {
    if (index >= this.snakeSegments.length) return 0;
    
    const current = this.snakeSegments[index];
    const next = index === 0 ? 
      { x: current.x + this.direction.x, y: current.y + this.direction.y } :
      this.snakeSegments[index - 1];
    
    // 计算方向（0:上, 1:右, 2:下, 3:左）
    if (next.y < current.y) return 0;
    if (next.x > current.x) return 1;
    if (next.y > current.y) return 2;
    if (next.x < current.x) return 3;
    return 1; // 默认朝右
  }

  private addScoreEffect(position: Vector2, score: number): void {
    const effect: Effect = {
      position: { ...position },
      duration: 1000,
      elapsed: 0,
      onUpdate: (progress: number) => {
        // 显示上升的分数
        this.ctx.fillStyle = `rgba(255, 255, 0, ${1 - progress})`;
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
          `+${score}`, 
          position.x * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2, 
          (position.y - progress * 2) * GameConfig.CELL_SIZE
        );
      }
    };
    
    this.effects.push(effect);
  }

  private addRewardEffect(): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    const effect: Effect = {
      position: { x: centerX / GameConfig.CELL_SIZE, y: centerY / GameConfig.CELL_SIZE },
      duration: 2000,
      elapsed: 0,
      onUpdate: (progress: number) => {
        // 显示奖励动画
        this.ctx.fillStyle = `rgba(255, 215, 0, ${1 - progress})`;
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
          `+${GameConfig.SHOP.DAILY_REWARD} ${GameConfig.SHOP.CURRENCY_NAME}!`, 
          centerX, 
          centerY - progress * 50
        );
      }
    };
    
    this.effects.push(effect);
  }

  private addCoinEffect(position: Vector2, coins: number): void {
    const effect: Effect = {
      position: { ...position },
      duration: 1500,
      elapsed: 0,
      onUpdate: (progress: number) => {
        this.ctx.fillStyle = `rgba(255, 215, 0, ${1 - progress})`;
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
          `+${coins} ${GameConfig.SHOP.CURRENCY_NAME}`, 
          position.x * GameConfig.CELL_SIZE + GameConfig.CELL_SIZE / 2, 
          (position.y - progress * 2 - 0.5) * GameConfig.CELL_SIZE
        );
      }
    };
    
    this.effects.push(effect);
  }

  private addGameStartEffect(): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    const effect: Effect = {
      position: { x: centerX / GameConfig.CELL_SIZE, y: centerY / GameConfig.CELL_SIZE },
      duration: 1000,
      elapsed: 0,
      onUpdate: (progress: number) => {
        const size = (1 - progress) * 100;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${1 - progress})`;
        this.ctx.font = `${size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('开始!', centerX, centerY);
      }
    };
    
    this.effects.push(effect);
  }

  public start(): void {
    console.log("Game started");
    requestAnimationFrame(this.gameLoop.bind(this));
  }
} 
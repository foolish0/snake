import { GameState } from '../core/GameStateManager';
import { GameDifficulty } from '../config/GameConfig';
import { Achievement } from '../systems/AchievementSystem';

export class UISystem {
  private container: HTMLDivElement;
  private scoreElement: HTMLDivElement;
  private menuElement: HTMLDivElement;
  private gameOverElement: HTMLDivElement;
  private settingsElement: HTMLDivElement;
  private pauseElement: HTMLDivElement;
  private achievementsElement: HTMLDivElement;

  constructor() {
    this.createUIElements();
  }

  private createUIElements(): void {
    // 创建容器
    this.container = document.createElement('div');
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    document.body.appendChild(this.container);

    // 创建分数显示
    this.scoreElement = document.createElement('div');
    this.scoreElement.style.position = 'absolute';
    this.scoreElement.style.top = '20px';
    this.scoreElement.style.left = '20px';
    this.scoreElement.style.color = 'white';
    this.scoreElement.style.fontSize = '24px';
    this.container.appendChild(this.scoreElement);

    // 创建菜单
    this.menuElement = this.createMenuElement();
    this.container.appendChild(this.menuElement);

    // 创建游戏结束界面
    this.gameOverElement = this.createGameOverElement();
    this.container.appendChild(this.gameOverElement);

    // 创建设置界面
    this.settingsElement = this.createSettingsElement();
    this.container.appendChild(this.settingsElement);

    // 创建暂停界面
    this.pauseElement = this.createPauseElement();
    this.container.appendChild(this.pauseElement);

    // 创建成就显示
    this.achievementsElement = this.createAchievementsElement();
    this.container.appendChild(this.achievementsElement);
  }

  private createMenuElement(): HTMLDivElement {
    const menu = document.createElement('div');
    menu.style.position = 'absolute';
    menu.style.top = '50%';
    menu.style.left = '50%';
    menu.style.transform = 'translate(-50%, -50%)';
    menu.style.textAlign = 'center';
    menu.style.color = 'white';
    menu.style.display = 'none';

    const title = document.createElement('h1');
    title.textContent = '贪吃蛇';
    menu.appendChild(title);

    const startButton = document.createElement('button');
    startButton.textContent = '开始游戏';
    startButton.onclick = () => this.onStartGame?.();
    menu.appendChild(startButton);

    return menu;
  }

  private createGameOverElement(): HTMLDivElement {
    const gameOver = document.createElement('div');
    gameOver.style.position = 'absolute';
    gameOver.style.top = '50%';
    gameOver.style.left = '50%';
    gameOver.style.transform = 'translate(-50%, -50%)';
    gameOver.style.textAlign = 'center';
    gameOver.style.color = 'white';
    gameOver.style.display = 'none';

    const title = document.createElement('h1');
    title.textContent = '游戏结束';
    gameOver.appendChild(title);

    const scoreText = document.createElement('p');
    scoreText.id = 'finalScore';
    gameOver.appendChild(scoreText);

    const restartButton = document.createElement('button');
    restartButton.textContent = '重新开始';
    restartButton.onclick = () => this.onRestart?.();
    gameOver.appendChild(restartButton);

    return gameOver;
  }

  private createSettingsElement(): HTMLDivElement {
    const settings = document.createElement('div');
    settings.style.position = 'absolute';
    settings.style.top = '50%';
    settings.style.left = '50%';
    settings.style.transform = 'translate(-50%, -50%)';
    settings.style.textAlign = 'center';
    settings.style.color = 'white';
    settings.style.display = 'none';

    const title = document.createElement('h2');
    title.textContent = '游戏设置';
    settings.appendChild(title);

    // 难度选择
    const difficultySelect = document.createElement('select');
    Object.values(GameDifficulty).filter(v => typeof v === 'string').forEach(diff => {
      const option = document.createElement('option');
      option.value = diff as string;
      option.textContent = diff as string;
      difficultySelect.appendChild(option);
    });
    difficultySelect.onchange = () => this.onDifficultyChange?.(difficultySelect.value as unknown as GameDifficulty);
    settings.appendChild(difficultySelect);

    // 音效开关
    const soundToggle = document.createElement('button');
    soundToggle.textContent = '音效: 开';
    soundToggle.onclick = () => this.onSoundToggle?.();
    settings.appendChild(soundToggle);

    // 音乐开关
    const musicToggle = document.createElement('button');
    musicToggle.textContent = '音乐: 开';
    musicToggle.onclick = () => this.onMusicToggle?.();
    settings.appendChild(musicToggle);

    return settings;
  }

  private createPauseElement(): HTMLDivElement {
    const pause = document.createElement('div');
    pause.style.position = 'absolute';
    pause.style.top = '50%';
    pause.style.left = '50%';
    pause.style.transform = 'translate(-50%, -50%)';
    pause.style.textAlign = 'center';
    pause.style.color = 'white';
    pause.style.display = 'none';

    const title = document.createElement('h2');
    title.textContent = '游戏暂停';
    pause.appendChild(title);

    const resumeButton = document.createElement('button');
    resumeButton.textContent = '继续游戏';
    resumeButton.onclick = () => this.onResume?.();
    pause.appendChild(resumeButton);

    const settingsButton = document.createElement('button');
    settingsButton.textContent = '设置';
    settingsButton.onclick = () => this.onSettings?.();
    pause.appendChild(settingsButton);

    const quitButton = document.createElement('button');
    quitButton.textContent = '退出游戏';
    quitButton.onclick = () => this.onQuit?.();
    pause.appendChild(quitButton);

    return pause;
  }

  private createAchievementsElement(): HTMLDivElement {
    const achievements = document.createElement('div');
    achievements.style.position = 'absolute';
    achievements.style.top = '50%';
    achievements.style.left = '50%';
    achievements.style.transform = 'translate(-50%, -50%)';
    achievements.style.textAlign = 'center';
    achievements.style.color = 'white';
    achievements.style.display = 'none';

    const title = document.createElement('h2');
    title.textContent = '成就';
    achievements.appendChild(title);

    return achievements;
  }

  public updateScore(score: number, highScore: number): void {
    this.scoreElement.textContent = `分数: ${score} 最高分: ${highScore}`;
  }

  public updateGameState(state: GameState): void {
    this.menuElement.style.display = state === GameState.MENU ? 'block' : 'none';
    this.gameOverElement.style.display = state === GameState.GAME_OVER ? 'block' : 'none';
    this.scoreElement.style.display = state === GameState.PLAYING ? 'block' : 'none';
  }

  private onStartGame?: () => void;
  private onRestart?: () => void;
  private onDifficultyChange?: (difficulty: GameDifficulty) => void;
  private onSoundToggle?: () => void;
  private onMusicToggle?: () => void;
  private onResume?: () => void;
  private onSettings?: () => void;
  private onQuit?: () => void;

  public setStartGameHandler(handler: () => void): void {
    this.onStartGame = handler;
  }

  public setRestartHandler(handler: () => void): void {
    this.onRestart = handler;
  }

  public setSettingsHandlers(
    difficultyHandler: (difficulty: GameDifficulty) => void,
    soundHandler: () => void,
    musicHandler: () => void
  ): void {
    this.onDifficultyChange = difficultyHandler;
    this.onSoundToggle = soundHandler;
    this.onMusicToggle = musicHandler;
  }

  public showAchievementNotification(achievement: Achievement): void {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <span class="icon">${achievement.icon}</span>
      <div class="content">
        <h3>${achievement.name}</h3>
        <p>${achievement.description}</p>
      </div>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
} 
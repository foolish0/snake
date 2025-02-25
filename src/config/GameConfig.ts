export enum GameDifficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard'
}

export const GameConfig = {
  GRID_SIZE: 20,
  CELL_SIZE: 20,
  INITIAL_SNAKE_LENGTH: 3,
  INITIAL_SNAKE_SPEED: 0.1,
  SCORE_PER_FOOD: 10,
  MOVE_SOUND_INTERVAL: 200, // 移动音效的最小间隔(ms)
  
  COLORS: {
    BACKGROUND: '#222222',
    GRID: '#333333',
    SNAKE_BODY: '#388E3C',
    SNAKE_HEAD: '#4CAF50',
    FOOD: '#F44336'
  },
  
  DIFFICULTY_SETTINGS: {
    [GameDifficulty.EASY]: {
      SNAKE_SPEED: 0.8,
      SCORE_MULTIPLIER: 1
    },
    [GameDifficulty.NORMAL]: {
      SNAKE_SPEED: 1.2,
      SCORE_MULTIPLIER: 2
    },
    [GameDifficulty.HARD]: {
      SNAKE_SPEED: 2,
      SCORE_MULTIPLIER: 3
    }
  },

  AUDIO: {
    BGM_PATH: '/audio/bgm.mp3',
    SOUNDS: {
      eat: '/audio/eat.mp3',
      move: '/audio/move.mp3',
      die: '/audio/die.mp3'
    },
    DEFAULT_VOLUME: 0.5
  },

  ANIMATION: {
    FOOD_SPAWN: {
      DURATION: 500,
      SCALE: {
        START: 2,
        END: 1
      }
    },
    SNAKE_DIE: {
      DURATION: 1000
    }
  },

  SKINS: {
    DEFAULT_SKIN: 'default',
    TEXTURE_PATH: 'assets/textures/skins/',
    ANIMATION_SPEED: 200
  },

  SHOP: {
    CURRENCY_NAME: '金币',
    DAILY_REWARD: 50,
    REWARD_COOLDOWN: 24 * 60 * 60 * 1000 // 24小时
  }
}; 
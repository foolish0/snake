import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

// 定义皮肤配置
interface SkinConfig {
  name: string;
  mainColor: string;
  secondaryColor: string;
  outlineColor: string;
}

const skins: SkinConfig[] = [
  {
    name: 'default',
    mainColor: '#4CAF50',
    secondaryColor: '#388E3C',
    outlineColor: '#1B5E20'
  },
  {
    name: 'blue',
    mainColor: '#2196F3',
    secondaryColor: '#1976D2',
    outlineColor: '#0D47A1'
  },
  {
    name: 'gold',
    mainColor: '#FFD700',
    secondaryColor: '#FFC107',
    outlineColor: '#FFA000'
  },
  {
    name: 'rainbow',
    mainColor: '#FF0000',
    secondaryColor: '#00FF00',
    outlineColor: '#0000FF'
  }
];

// 创建目录
const dirs = [
  'public/audio',
  'public/assets/textures/skins'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 生成皮肤纹理
function generateSkinTexture(skin: SkinConfig): void {
  const canvas = createCanvas(60, 80); // 3帧 x 4方向
  const ctx = canvas.getContext('2d');

  // 为每个方向生成3帧动画
  for (let dir = 0; dir < 4; dir++) {
    for (let frame = 0; frame < 3; frame++) {
      const x = frame * 20;
      const y = dir * 20;

      // 绘制基本形状
      ctx.fillStyle = skin.mainColor;
      ctx.fillRect(x, y, 20, 20);

      // 绘制渐变效果
      const gradient = ctx.createLinearGradient(x, y, x + 20, y + 20);
      gradient.addColorStop(0, skin.mainColor);
      gradient.addColorStop(1, skin.secondaryColor);
      ctx.fillStyle = gradient;
      ctx.fillRect(x + 2, y + 2, 16, 16);

      // 绘制边框
      ctx.strokeStyle = skin.outlineColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, 19, 19);

      // 绘制眼睛
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x + 6, y + 6, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(x + 6, y + 6, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 添加动画帧特效
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = 'white';
      ctx.fillRect(x + frame * 2, y + frame * 2, 20 - frame * 4, 20 - frame * 4);
      ctx.globalAlpha = 1;
    }
  }

  // 保存文件
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join('public/assets/textures/skins', `${skin.name}.png`), buffer);
  console.log(`Generated skin: ${skin.name}.png`);
}

// 生成音效
function generateSound(name: string, options: {
  frequency: number,
  duration: number,
  type: OscillatorType,
  volume: number
}): void {
  const sampleRate = 44100;
  const samples = Math.floor(options.duration * sampleRate);
  const buffer = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const amplitude = options.volume * Math.exp(-5 * t);
    buffer[i] = amplitude * Math.sin(2 * Math.PI * options.frequency * t);
  }

  // 将音频数据写入 WAV 文件
  const wavData = createWavFile(buffer, {
    sampleRate,
    channels: 1
  });

  fs.writeFileSync(path.join('public/audio', `${name}.wav`), wavData);
  console.log(`Generated sound: ${name}.wav`);
}

// 创建 WAV 文件
function createWavFile(samples: Float32Array, options: { sampleRate: number, channels: number }): Buffer {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  
  // WAV Header
  buffer.write('RIFF', 0);
  buffer.writeInt32LE(36 + samples.length * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeInt32LE(16, 16);
  buffer.writeInt16LE(1, 20);
  buffer.writeInt16LE(options.channels, 22);
  buffer.writeInt32LE(options.sampleRate, 24);
  buffer.writeInt32LE(options.sampleRate * options.channels * 2, 28);
  buffer.writeInt16LE(options.channels * 2, 32);
  buffer.writeInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeInt32LE(samples.length * 2, 40);

  // 写入音频数据
  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.floor(samples[i] * 32767))), 44 + i * 2);
  }

  return buffer;
}

// 生成所有资源
async function generateAllAssets(): Promise<void> {
  // 生成皮肤
  skins.forEach(generateSkinTexture);

  // 生成音效
  const sounds = [
    { name: 'eat', frequency: 440, duration: 0.1, type: 'sine' as OscillatorType, volume: 0.5 },
    { name: 'move', frequency: 220, duration: 0.05, type: 'sine' as OscillatorType, volume: 0.3 },
    { name: 'die', frequency: 110, duration: 0.5, type: 'sine' as OscillatorType, volume: 0.8 },
    { name: 'buy', frequency: 660, duration: 0.15, type: 'sine' as OscillatorType, volume: 0.4 },
    { name: 'reward', frequency: 880, duration: 0.2, type: 'sine' as OscillatorType, volume: 0.6 }
  ];

  sounds.forEach(sound => generateSound(sound.name, sound));

  console.log('All assets generated successfully!');
}

// 运行生成脚本
generateAllAssets().catch(console.error); 
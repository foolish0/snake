const { AudioContext } = require('web-audio-api');
const fs = require('fs');

function generateSound(type) {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  switch (type) {
    case 'eat':
      oscillator.frequency.value = 440;
      gainNode.gain.setValueAtTime(1, 0);
      gainNode.gain.exponentialRampToValueAtTime(0.01, 0.1);
      oscillator.start(0);
      oscillator.stop(0.1);
      break;
      
    case 'move':
      oscillator.frequency.value = 220;
      gainNode.gain.setValueAtTime(0.3, 0);
      gainNode.gain.exponentialRampToValueAtTime(0.01, 0.05);
      oscillator.start(0);
      oscillator.stop(0.05);
      break;
      
    case 'die':
      oscillator.frequency.value = 110;
      gainNode.gain.setValueAtTime(1, 0);
      gainNode.gain.linearRampToValueAtTime(0, 0.5);
      oscillator.start(0);
      oscillator.stop(0.5);
      break;
  }
  
  // 导出音频文件
  const buffer = audioContext.exportAsBuffer();
  fs.writeFileSync(`public/audio/${type}.mp3`, buffer);
}

['eat', 'move', 'die', 'buy', 'reward'].forEach(generateSound); 
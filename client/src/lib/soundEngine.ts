/**
 * SoundEngine — Web Audio API синтезатор звуков
 * Нет зависимостей, нет файлов — всё генерируется программно.
 *
 * Звуки:
 *   - feed: сочный "чавк"
 *   - play: весёлый "пип-пип"
 *   - sleep: мягкий "вздох"
 *   - heal: магический "шимер"
 *   - evolve: торжественный аккорд
 *   - die: грустный нисходящий тон
 *   - think: тихий "бип" при каждом решении ИИ
 *   - mutation: странный "глитч"
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Master volume (0..1)
let masterVolume = 0.4;

export function setMasterVolume(v: number) {
  masterVolume = Math.max(0, Math.min(1, v));
}

export function getMasterVolume() {
  return masterVolume;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function createGain(ctx: AudioContext, volume: number): GainNode {
  const g = ctx.createGain();
  g.gain.value = volume * masterVolume;
  g.connect(ctx.destination);
  return g;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.3,
  attack = 0.01,
  decay = 0.1,
  startOffset = 0
) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, ctx.currentTime + startOffset);
    gain.gain.linearRampToValueAtTime(volume * masterVolume, ctx.currentTime + startOffset + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startOffset);
    osc.stop(ctx.currentTime + startOffset + duration + 0.05);
  } catch (e) {
    // Silently ignore — audio not critical
  }
}

// ─── Sound effects ────────────────────────────────────────────────────────────

export function playFeed() {
  // Сочный "чавк" — нисходящий тон
  playTone(300, 0.15, "triangle", 0.4, 0.005, 0.1);
  playTone(200, 0.2, "triangle", 0.3, 0.02, 0.15, 0.05);
}

export function playPlay() {
  // Весёлый "пип-пип"
  playTone(880, 0.1, "square", 0.2, 0.005, 0.08);
  playTone(1100, 0.1, "square", 0.2, 0.005, 0.08, 0.12);
  playTone(1320, 0.15, "square", 0.2, 0.005, 0.1, 0.24);
}

export function playSleep() {
  // Мягкий "вздох" — нисходящий шум
  try {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;

    const gain = ctx.createGain();
    gain.gain.value = 0.15 * masterVolume;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  } catch (e) {}
}

export function playHeal() {
  // Магический "шимер" — восходящие гармоники
  [523, 659, 784, 1047].forEach((freq, i) => {
    playTone(freq, 0.3, "sine", 0.25, 0.02, 0.25, i * 0.07);
  });
}

export function playEvolve() {
  // Торжественный аккорд — мажорный трезвучие + октава
  const notes = [261, 329, 392, 523, 659];
  notes.forEach((freq, i) => {
    playTone(freq, 1.2, "sine", 0.3, 0.05, 1.0, i * 0.06);
  });
  // Добавить "блеск" сверху
  playTone(1046, 0.8, "triangle", 0.15, 0.01, 0.7, 0.3);
}

export function playDie() {
  // Грустный нисходящий тон
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 1.5);

    gain.gain.setValueAtTime(0.3 * masterVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.6);
  } catch (e) {}
}

export function playThink() {
  // Тихий "бип" при решении ИИ
  playTone(660, 0.08, "sine", 0.1, 0.005, 0.07);
}

export function playMutation() {
  // Странный "глитч" — случайные частоты
  try {
    const ctx = getCtx();
    for (let i = 0; i < 6; i++) {
      const freq = 200 + Math.random() * 800;
      playTone(freq, 0.06, "sawtooth", 0.15, 0.002, 0.05, i * 0.04);
    }
  } catch (e) {}
}

export function playStreak() {
  // Стрик-бонус — восходящая трель
  [523, 659, 784, 1047, 1319].forEach((freq, i) => {
    playTone(freq, 0.12, "triangle", 0.2, 0.01, 0.1, i * 0.06);
  });
}

// Map action string to sound
export function playActionSound(action: string) {
  switch (action) {
    case "feed":  playFeed();  break;
    case "play":  playPlay();  break;
    case "sleep": playSleep(); break;
    case "heal":  playHeal();  break;
  }
}

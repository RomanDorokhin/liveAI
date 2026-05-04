/**
 * AI Tamagotchi — Q-Learning Brain Engine v3
 * Design: Biopunk / Organic Circuitry
 *
 * v3 — Long-term pet design (months/years):
 * - XP system: AI gets 1 XP/decision, player gets 6 XP/action + streak bonus
 * - Evolution thresholds: 100 / 500 / 2000 / 6000 / 15000 XP
 * - World tick: every 10s (was 2s), AI acts every 2 min
 * - Slow decay: creature can survive alone but CANNOT evolve without player
 * - Daily streak system: player must visit daily to unlock higher stages
 * - Weekly events: crises, storms, enlightenments
 * - Mutations every 50 decisions (was 30)
 * - Offline pause: max 4 hours of accumulated penalties
 */

export type Action = "feed" | "play" | "sleep" | "clean";
export const ACTIONS: Action[] = ["feed", "play", "sleep", "clean"];

export type EvolutionStage =
  | "egg"        // 0–100 XP        (~3 days active / ~2 weeks passive)
  | "hatchling"  // 101–500 XP      (~2 weeks active / ~2 months passive)
  | "child"      // 501–2000 XP     (~1 month active / ~6 months passive)
  | "teen"       // 2001–6000 XP    (~3 months active / unreachable passive)
  | "adult"      // 6001–15000 XP   (~6 months active / unreachable passive)
  | "sage";      // 15001+ XP       (~1 year active / unreachable passive)

export interface Mutation {
  id: string;
  name: string;
  description: string;
  effect: Record<Action, number>;
  timestamp: number;
}

export interface WeeklyEvent {
  id: string;
  type: "hunger_crisis" | "energy_storm" | "mutation_burst" | "enlightenment" | "illness" | "festival";
  name: string;
  description: string;
  startedAt: number;
  durationMs: number;
  active: boolean;
}

export interface DailyTask {
  id: string;
  description: string;
  type: "feed_times" | "sleep_low" | "view_brain" | "hands_off" | "save_critical";
  target: number;
  progress: number;
  completed: boolean;
  xpReward: number;
  date: string; // YYYY-MM-DD
}

export interface BrainState {
  qTable: Record<string, Record<Action, number>>;
  totalDecisions: number;
  totalXP: number;
  explorationRate: number;
  learningRate: number;
  lastAction: Action | null;
  lastState: string | null;
  lastReward: number;
  decisionHistory: Array<{
    state: string;
    action: Action;
    reward: number;
    timestamp: number;
    byUser: boolean;
    xpGained: number;
  }>;
  neuralActivity: NeuralNode[];
  mutations: Mutation[];
  mutationCount: number;
}

export interface NeuralNode {
  id: string;
  x: number;
  y: number;
  activation: number;
  connections: Array<{ targetId: string; weight: number }>;
  label: string;
}

export interface TamagotchiState {
  name: string;
  hunger: number;      // 0=full, 100=starving
  happiness: number;   // 0=sad, 100=happy
  health: number;      // 0=dead, 100=perfect
  energy: number;      // 0=exhausted, 100=full
  age: number;         // ticks lived
  stage: EvolutionStage;
  brain: BrainState;
  isThinking: boolean;
  currentThought: string;
  lastActionTime: number;
  autoActTimer: number;
  alive: boolean;
  lastSavedAt: number;
  lastVisitDate: string;   // YYYY-MM-DD
  streakDays: number;
  longestStreak: number;
  totalUserActions: number;
  totalDaysActive: number;
  weeklyEvent: WeeklyEvent | null;
  dailyTask: DailyTask | null;
  lastWeeklyEventDate: string; // YYYY-MM-DD
  criticalSaves: number; // times player saved from critical state
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const XP_THRESHOLDS: Record<EvolutionStage, number> = {
  egg:      0,
  hatchling: 100,
  child:    500,
  teen:     2000,
  adult:    6000,
  sage:     15000,
};

export const NEXT_STAGE: Partial<Record<EvolutionStage, EvolutionStage>> = {
  egg:      "hatchling",
  hatchling:"child",
  child:    "teen",
  teen:     "adult",
  adult:    "sage",
};

// Stages that require streak to unlock
export const STREAK_REQUIREMENTS: Partial<Record<EvolutionStage, number>> = {
  teen:  30,   // need 30-day streak
  adult: 30,   // maintained
  sage:  100,  // need 100-day streak
};

// ─── Mutation pool ────────────────────────────────────────────────────────────

const MUTATION_POOL: Omit<Mutation, "id" | "timestamp">[] = [
  { name: "Обжора",    description: "Сильнее реагирует на еду",          effect: { feed: 1.8, play: 0.9, sleep: 1.0, clean: 0.9 } },
  { name: "Игрун",     description: "Игра приносит больше радости",       effect: { feed: 0.9, play: 1.8, sleep: 0.9, clean: 1.0 } },
  { name: "Соня",      description: "Сон восстанавливает гораздо больше", effect: { feed: 1.0, play: 0.8, sleep: 2.0, clean: 0.9 } },
  { name: "Чистюля",   description: "Чистота важнее всего",               effect: { feed: 0.9, play: 1.0, sleep: 0.9, clean: 1.8 } },
  { name: "Аскет",     description: "Меньше нуждается в еде",             effect: { feed: 0.6, play: 1.2, sleep: 1.2, clean: 1.2 } },
  { name: "Экстраверт",description: "Обожает игры, не любит спать",       effect: { feed: 1.0, play: 2.0, sleep: 0.5, clean: 1.0 } },
  { name: "Интроверт", description: "Предпочитает покой и сон",           effect: { feed: 1.0, play: 0.6, sleep: 2.0, clean: 1.0 } },
  { name: "Боец",      description: "Здоровье важнее счастья",            effect: { feed: 1.2, play: 0.7, sleep: 1.3, clean: 1.5 } },
  { name: "Философ",   description: "Всё в балансе, нет крайностей",      effect: { feed: 1.1, play: 1.1, sleep: 1.1, clean: 1.1 } },
  { name: "Хаотик",    description: "Непредсказуемые предпочтения",       effect: { feed: Math.random()*1.5+0.5, play: Math.random()*1.5+0.5, sleep: Math.random()*1.5+0.5, clean: Math.random()*1.5+0.5 } },
];

export function rollMutation(): Mutation {
  const template = MUTATION_POOL[Math.floor(Math.random() * MUTATION_POOL.length)];
  return { ...template, id: `mut_${Date.now()}`, timestamp: Date.now() };
}

// ─── Weekly events ────────────────────────────────────────────────────────────

const WEEKLY_EVENT_POOL: Omit<WeeklyEvent, "id" | "startedAt" | "active">[] = [
  { type: "hunger_crisis",  name: "Кризис голода",     description: "Аппетит вырос втрое. Корми чаще!",              durationMs: 24 * 3600_000 },
  { type: "energy_storm",   name: "Энергетический шторм", description: "Энергия тает быстро. Дай поспать.",          durationMs: 18 * 3600_000 },
  { type: "mutation_burst", name: "Мутационная буря",   description: "Нестабильность ДНК. Жди мутаций.",             durationMs: 48 * 3600_000 },
  { type: "illness",        name: "Болезнь",            description: "Здоровье падает. Нужна чистота 3 раза.",        durationMs: 36 * 3600_000 },
  { type: "festival",       name: "День радости",       description: "Все действия дают ×2 XP сегодня!",             durationMs: 24 * 3600_000 },
];

export function rollWeeklyEvent(): WeeklyEvent {
  const template = WEEKLY_EVENT_POOL[Math.floor(Math.random() * WEEKLY_EVENT_POOL.length)];
  return { ...template, id: `evt_${Date.now()}`, startedAt: Date.now(), active: true };
}

// ─── Daily tasks ──────────────────────────────────────────────────────────────

const DAILY_TASK_POOL: Omit<DailyTask, "id" | "progress" | "completed" | "date">[] = [
  { description: "Покорми 3 раза сегодня",          type: "feed_times",    target: 3,  xpReward: 50 },
  { description: "Дай поспать при энергии <20%",    type: "sleep_low",     target: 1,  xpReward: 40 },
  { description: "Открой панель мозга",             type: "view_brain",    target: 1,  xpReward: 15 },
  { description: "Не трогай — пусть ИИ справится", type: "hands_off",     target: 10, xpReward: 60 },
  { description: "Спаси от критического состояния", type: "save_critical", target: 1,  xpReward: 80 },
  { description: "Поиграй 2 раза",                  type: "feed_times",    target: 2,  xpReward: 35 },
  { description: "Почисти 2 раза",                  type: "feed_times",    target: 2,  xpReward: 35 },
];

export function rollDailyTask(date: string): DailyTask {
  const template = DAILY_TASK_POOL[Math.floor(Math.random() * DAILY_TASK_POOL.length)];
  return { ...template, id: `task_${date}`, progress: 0, completed: false, date };
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── State discretization ────────────────────────────────────────────────────

function discretize(value: number): "lo" | "md" | "hi" {
  if (value < 33) return "lo";
  if (value < 66) return "md";
  return "hi";
}

export function getStateKey(tama: TamagotchiState): string {
  return `${discretize(tama.hunger)}_${discretize(tama.happiness)}_${discretize(tama.energy)}_${discretize(tama.health)}`;
}

// ─── Evolution ────────────────────────────────────────────────────────────────

export function getEvolutionStage(xp: number): EvolutionStage {
  if (xp < 100)   return "egg";
  if (xp < 500)   return "hatchling";
  if (xp < 2000)  return "child";
  if (xp < 6000)  return "teen";
  if (xp < 15000) return "adult";
  return "sage";
}

export function getStageProgress(xp: number): number {
  const stages: EvolutionStage[] = ["egg", "hatchling", "child", "teen", "adult", "sage"];
  const thresholds = [0, 100, 500, 2000, 6000, 15000, 25000];
  const stage = getEvolutionStage(xp);
  const idx = stages.indexOf(stage);
  const start = thresholds[idx];
  const end = thresholds[idx + 1];
  return Math.min(1, (xp - start) / (end - start));
}

export function getStageColor(stage: EvolutionStage): string {
  const colors: Record<EvolutionStage, string> = {
    egg:      "#00FFD1",
    hatchling:"#00E5FF",
    child:    "#4DA6FF",
    teen:     "#8B5CF6",
    adult:    "#C800FF",
    sage:     "#FF6B9D",
  };
  return colors[stage];
}

export function getStageName(stage: EvolutionStage): string {
  const names: Record<EvolutionStage, string> = {
    egg:      "Яйцо",
    hatchling:"Птенец",
    child:    "Малыш",
    teen:     "Подросток",
    adult:    "Взрослый",
    sage:     "Мудрец",
  };
  return names[stage];
}

export function getNextStageName(stage: EvolutionStage): string {
  const next = NEXT_STAGE[stage];
  return next ? getStageName(next) : "Максимум";
}

// ─── XP calculation ───────────────────────────────────────────────────────────

export function calculateXP(params: {
  byUser: boolean;
  streakDays: number;
  isCriticalSave: boolean;
  isMutation: boolean;
  weeklyEvent: WeeklyEvent | null;
}): number {
  let xp = params.byUser ? 6 : 1;

  if (params.byUser) {
    // Streak bonus: +1 XP per streak day, max +30
    xp += Math.min(30, params.streakDays);
  }

  if (params.isCriticalSave) xp += 10;
  if (params.isMutation) xp += 15;

  // Festival event doubles XP
  if (params.weeklyEvent?.type === "festival" && params.weeklyEvent.active) {
    xp *= 2;
  }

  return Math.round(xp);
}

// ─── Q-Learning ───────────────────────────────────────────────────────────────

function initQState(brain: BrainState, stateKey: string): void {
  if (!brain.qTable[stateKey]) {
    brain.qTable[stateKey] = {
      feed:  0.3 + Math.random() * 0.4,
      play:  0.3 + Math.random() * 0.4,
      sleep: 0.3 + Math.random() * 0.4,
      clean: 0.3 + Math.random() * 0.4,
    };
  }
}

export function chooseAction(tama: TamagotchiState): Action {
  const stateKey = getStateKey(tama);
  initQState(tama.brain, stateKey);

  // Survival overrides during weekly events
  if (tama.weeklyEvent?.active) {
    if (tama.weeklyEvent.type === "hunger_crisis" && tama.hunger > 60) return "feed";
    if (tama.weeklyEvent.type === "energy_storm" && tama.energy < 40) return "sleep";
    if (tama.weeklyEvent.type === "illness" && tama.health < 60) return "clean";
  }

  // Critical survival overrides
  if (tama.hunger > 88) return "feed";
  if (tama.energy < 8)  return "sleep";
  if (tama.happiness < 8) return "play";
  if (tama.health < 15) return "clean";

  if (Math.random() < tama.brain.explorationRate) {
    return ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  }

  const qValues = tama.brain.qTable[stateKey];
  return (Object.entries(qValues) as [Action, number][]).reduce(
    (best, [action, value]) => (value > best[1] ? [action, value] : best),
    ["feed" as Action, -Infinity]
  )[0];
}

export function learnFromAction(
  tama: TamagotchiState,
  action: Action,
  reward: number,
  nextStateKey: string,
  xpGained: number,
  byUser: boolean
): void {
  const stateKey = tama.brain.lastState ?? getStateKey(tama);
  initQState(tama.brain, stateKey);
  initQState(tama.brain, nextStateKey);

  const alpha = tama.brain.learningRate;
  const gamma = 0.9;
  const currentQ = tama.brain.qTable[stateKey][action];
  const nextMaxQ = Math.max(...Object.values(tama.brain.qTable[nextStateKey]));
  tama.brain.qTable[stateKey][action] = currentQ + alpha * (reward + gamma * nextMaxQ - currentQ);

  tama.brain.totalDecisions += 1;
  tama.brain.totalXP += xpGained;
  tama.brain.lastReward = reward;

  // Slower exploration decay for longer-term learning
  tama.brain.explorationRate = Math.max(0.08, tama.brain.explorationRate * 0.9995);

  tama.brain.decisionHistory.push({
    state: stateKey, action, reward, timestamp: Date.now(), byUser, xpGained,
  });
  if (tama.brain.decisionHistory.length > 80) tama.brain.decisionHistory.shift();

  updateNeuralActivity(tama, stateKey, action, reward);

  // Mutation every 50 decisions (was 30)
  if (tama.brain.totalDecisions > 0 && tama.brain.totalDecisions % 50 === 0) {
    const mutation = rollMutation();
    tama.brain.mutations.push(mutation);
    tama.brain.mutationCount += 1;
    Object.keys(tama.brain.qTable).forEach((sk) => {
      ACTIONS.forEach((a) => {
        tama.brain.qTable[sk][a] *= mutation.effect[a];
      });
    });
  }
}

// ─── Neural visualization ─────────────────────────────────────────────────────

export function buildNeuralNodes(): NeuralNode[] {
  const nodes: NeuralNode[] = [
    { id: "i_hunger", x: 0.08, y: 0.2,  activation: 0, connections: [], label: "Голод" },
    { id: "i_happy",  x: 0.08, y: 0.4,  activation: 0, connections: [], label: "Радость" },
    { id: "i_energy", x: 0.08, y: 0.6,  activation: 0, connections: [], label: "Энергия" },
    { id: "i_health", x: 0.08, y: 0.8,  activation: 0, connections: [], label: "Здоровье" },
    { id: "h1", x: 0.38, y: 0.25, activation: 0, connections: [], label: "" },
    { id: "h2", x: 0.38, y: 0.45, activation: 0, connections: [], label: "" },
    { id: "h3", x: 0.38, y: 0.65, activation: 0, connections: [], label: "" },
    { id: "h4", x: 0.38, y: 0.85, activation: 0, connections: [], label: "" },
    { id: "o_feed",  x: 0.78, y: 0.2,  activation: 0, connections: [], label: "Еда" },
    { id: "o_play",  x: 0.78, y: 0.4,  activation: 0, connections: [], label: "Игра" },
    { id: "o_sleep", x: 0.78, y: 0.6,  activation: 0, connections: [], label: "Сон" },
    { id: "o_clean", x: 0.78, y: 0.8,  activation: 0, connections: [], label: "Чистота" },
  ];

  const inputIds = ["i_hunger", "i_happy", "i_energy", "i_health"];
  const hiddenIds = ["h1", "h2", "h3", "h4"];
  const outputIds = ["o_feed", "o_play", "o_sleep", "o_clean"];

  inputIds.forEach((iId) => {
    const node = nodes.find((n) => n.id === iId)!;
    hiddenIds.forEach((hId) => {
      node.connections.push({ targetId: hId, weight: 0.3 + Math.random() * 0.5 });
    });
  });
  hiddenIds.forEach((hId) => {
    const node = nodes.find((n) => n.id === hId)!;
    outputIds.forEach((oId) => {
      node.connections.push({ targetId: oId, weight: 0.3 + Math.random() * 0.5 });
    });
  });

  return nodes;
}

function updateNeuralActivity(
  tama: TamagotchiState,
  stateKey: string,
  chosenAction: Action,
  reward: number
): void {
  const nodes = tama.brain.neuralActivity;
  const actionIndex = ACTIONS.indexOf(chosenAction);
  const parts = stateKey.split("_");
  const lvl = (l: string) => (l === "lo" ? 0.15 : l === "md" ? 0.55 : 0.92);

  nodes[0].activation = lvl(parts[0]);
  nodes[1].activation = lvl(parts[1]);
  nodes[2].activation = lvl(parts[2]);
  nodes[3].activation = lvl(parts[3]);

  for (let h = 0; h < 4; h++) {
    const s = nodes.slice(0, 4).reduce((sum, n) => {
      const c = n.connections.find((c) => c.targetId === `h${h + 1}`);
      return sum + (c ? n.activation * c.weight : 0);
    }, 0);
    nodes[4 + h].activation = Math.min(1, s / 2);
  }

  for (let o = 0; o < 4; o++) {
    nodes[8 + o].activation =
      o === actionIndex ? Math.min(1, 0.5 + reward / 50) : Math.random() * 0.2;
  }

  nodes.forEach((node) => {
    node.connections = node.connections.map((conn) => ({
      ...conn,
      weight: Math.min(1, Math.max(0.05, conn.weight + (Math.random() - 0.5) * 0.03)),
    }));
  });
}

// ─── Thoughts ─────────────────────────────────────────────────────────────────

const THOUGHTS: Record<Action, string[]> = {
  feed:  ["Голод — не тётка!", "Q(feed) максимально...", "Нужна энергия для обучения", "Кушать!"],
  play:  ["Нейроны требуют веселья!", "Играть = учиться", "Скучно без стимулов", "Игра!"],
  sleep: ["Консолидирую память...", "Сон = обновление весов", "Zzzz... учусь во сне", "Спать!"],
  clean: ["Дефрагментация!", "Чистый код — чистый разум", "Убираю шум из данных", "Чистота!"],
};

const STREAK_THOUGHTS = [
  "Ты снова здесь! Я чувствую это.",
  "Ещё один день вместе. Я учусь быстрее.",
  "Твоё присутствие ускоряет мой рост.",
  "Я ждал тебя.",
];

export function generateThought(action: Action, isAuto: boolean, isStreak = false): string {
  if (isStreak) return STREAK_THOUGHTS[Math.floor(Math.random() * STREAK_THOUGHTS.length)];
  const pool = THOUGHTS[action];
  const thought = pool[Math.floor(Math.random() * pool.length)];
  return isAuto ? `[ИИ] ${thought}` : `[Ты] ${thought}`;
}

// ─── Reward ───────────────────────────────────────────────────────────────────

export function calculateReward(
  tama: TamagotchiState,
  action: Action,
): number {
  let reward = 0;
  switch (action) {
    case "feed":  reward = tama.hunger > 70 ? 25 : tama.hunger > 40 ? 10 : 2; break;
    case "play":  reward = tama.happiness < 30 ? 22 : tama.happiness < 60 ? 12 : 3; break;
    case "sleep": reward = tama.energy < 30 ? 20 : tama.energy < 60 ? 8 : 2; break;
    case "clean": reward = tama.health < 50 ? 18 : tama.health < 75 ? 8 : 3; break;
  }

  const latestMutation = tama.brain.mutations[tama.brain.mutations.length - 1];
  if (latestMutation) reward *= latestMutation.effect[action];

  // Weekly event modifiers
  if (tama.weeklyEvent?.active) {
    if (tama.weeklyEvent.type === "hunger_crisis" && action === "feed") reward *= 1.5;
    if (tama.weeklyEvent.type === "illness" && action === "clean") reward *= 2;
  }

  return Math.round(reward);
}

// ─── Apply action ─────────────────────────────────────────────────────────────

export function applyAction(tama: TamagotchiState, action: Action): TamagotchiState {
  const next = { ...tama };
  switch (action) {
    case "feed":
      next.hunger = Math.max(0, tama.hunger - 40);
      next.energy = Math.min(100, tama.energy + 4);
      break;
    case "play":
      next.happiness = Math.min(100, tama.happiness + 30);
      next.energy = Math.max(0, tama.energy - 8);
      break;
    case "sleep":
      next.energy = Math.min(100, tama.energy + 50);
      next.health = Math.min(100, tama.health + 6);
      break;
    case "clean":
      next.health = Math.min(100, tama.health + 20);
      next.happiness = Math.min(100, tama.happiness + 4);
      break;
  }
  return next;
}

// ─── World tick (every 10s) ───────────────────────────────────────────────────

export function tickWorld(tama: TamagotchiState): TamagotchiState {
  const next = { ...tama };
  next.age += 1;

  // Slow base decay
  let hungerInc = 0.3 + Math.random() * 0.2;
  let happyDec  = 0.15 + Math.random() * 0.15;
  let energyDec = 0.12 + Math.random() * 0.1;

  // Weekly event modifiers
  if (tama.weeklyEvent?.active) {
    const now = Date.now();
    if (now - tama.weeklyEvent.startedAt > tama.weeklyEvent.durationMs) {
      next.weeklyEvent = { ...tama.weeklyEvent, active: false };
    } else {
      if (tama.weeklyEvent.type === "hunger_crisis")  hungerInc *= 3;
      if (tama.weeklyEvent.type === "energy_storm")   energyDec *= 3;
      if (tama.weeklyEvent.type === "illness")        next.health = Math.max(0, tama.health - 0.5);
    }
  }

  next.hunger    = Math.min(100, tama.hunger + hungerInc);
  next.happiness = Math.max(0, tama.happiness - happyDec);
  next.energy    = Math.max(0, tama.energy - energyDec);

  // Health only degrades at extreme states
  if (next.hunger > 90 || next.happiness < 5 || next.energy < 3) {
    next.health = Math.max(0, tama.health - 1);
  } else if (next.hunger < 50 && next.happiness > 40 && next.energy > 30) {
    next.health = Math.min(100, tama.health + 0.3);
  }

  if (next.health <= 0) next.alive = false;

  // Update stage based on XP (not decisions)
  next.stage = getEvolutionStage(next.brain.totalXP);

  // Check weekly event expiry
  if (next.weeklyEvent && !next.weeklyEvent.active) {
    next.weeklyEvent = null;
  }

  return next;
}

// ─── Streak & daily visit ─────────────────────────────────────────────────────

export function processVisit(tama: TamagotchiState): {
  tama: TamagotchiState;
  isNewDay: boolean;
  streakBonus: number;
  isStreakBroken: boolean;
} {
  const today = getTodayDate();
  const lastVisit = tama.lastVisitDate;

  if (lastVisit === today) {
    return { tama, isNewDay: false, streakBonus: 0, isStreakBroken: false };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak = tama.streakDays;
  let isStreakBroken = false;

  if (lastVisit === yesterdayStr) {
    newStreak += 1;
  } else if (lastVisit && lastVisit < yesterdayStr) {
    newStreak = 1;
    isStreakBroken = true;
  } else {
    newStreak = 1;
  }

  const streakBonus = Math.min(30, newStreak) * 5; // up to 150 XP for streak

  // Roll new daily task
  const newTask = rollDailyTask(today);

  // Maybe roll weekly event (once per week)
  let newWeeklyEvent = tama.weeklyEvent;
  const daysSinceLastEvent = tama.lastWeeklyEventDate
    ? Math.floor((Date.now() - new Date(tama.lastWeeklyEventDate).getTime()) / 86400000)
    : 999;

  if (daysSinceLastEvent >= 7 && Math.random() < 0.7) {
    newWeeklyEvent = rollWeeklyEvent();
  }

  const updatedTama: TamagotchiState = {
    ...tama,
    streakDays: newStreak,
    longestStreak: Math.max(tama.longestStreak, newStreak),
    lastVisitDate: today,
    totalDaysActive: tama.totalDaysActive + 1,
    brain: {
      ...tama.brain,
      totalXP: tama.brain.totalXP + streakBonus,
    },
    dailyTask: newTask,
    weeklyEvent: newWeeklyEvent,
    lastWeeklyEventDate: newWeeklyEvent !== tama.weeklyEvent ? today : tama.lastWeeklyEventDate,
  };

  return { tama: updatedTama, isNewDay: true, streakBonus, isStreakBroken };
}

// ─── Offline recovery ─────────────────────────────────────────────────────────

export function applyOfflineRecovery(tama: TamagotchiState): TamagotchiState {
  const now = Date.now();
  const awayMs = now - (tama.lastSavedAt || now);
  // Cap at 4 hours of accumulated penalties
  const awayTicks = Math.min(1440, Math.floor(awayMs / 10000)); // 10s ticks, max 4h

  if (awayTicks <= 0) return tama;

  let next = { ...tama };

  // Compressed decay (1/4 of normal)
  next.hunger    = Math.min(100, tama.hunger + awayTicks * 0.08);
  next.happiness = Math.max(0, tama.happiness - awayTicks * 0.04);
  next.energy    = Math.max(0, tama.energy - awayTicks * 0.03);

  // AI made some decisions while away (simulate, every 12 ticks = 2 min)
  const autoDecisions = Math.min(50, Math.floor(awayTicks / 12));
  for (let i = 0; i < autoDecisions; i++) {
    const action = chooseAction(next);
    const reward = calculateReward(next, action);
    next = applyAction(next, action);
    const nextStateKey = getStateKey(next);
    const brain = { ...next.brain };
    learnFromAction({ ...next, brain }, action, reward, nextStateKey, 1, false);
    next.brain = { ...brain, lastAction: action, lastState: nextStateKey, lastReward: reward };
  }

  next.lastSavedAt = now;
  return next;
}

// ─── Initial state ────────────────────────────────────────────────────────────

export function createInitialTamagotchi(name: string = "Bytechi"): TamagotchiState {
  return {
    name,
    hunger: 40,
    happiness: 65,
    health: 85,
    energy: 75,
    age: 0,
    stage: "egg",
    alive: true,
    isThinking: false,
    currentThought: "Я только что родился...",
    lastActionTime: Date.now(),
    autoActTimer: 0,
    lastSavedAt: Date.now(),
    lastVisitDate: getTodayDate(),
    streakDays: 1,
    longestStreak: 1,
    totalUserActions: 0,
    totalDaysActive: 1,
    criticalSaves: 0,
    weeklyEvent: null,
    dailyTask: rollDailyTask(getTodayDate()),
    lastWeeklyEventDate: "",
    brain: {
      qTable: {},
      totalDecisions: 0,
      totalXP: 0,
      explorationRate: 0.85,
      learningRate: 0.3,
      lastAction: null,
      lastState: null,
      lastReward: 0,
      decisionHistory: [],
      neuralActivity: buildNeuralNodes(),
      mutations: [],
      mutationCount: 0,
    },
  };
}

// ─── Persistence ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "ai_tamagotchi_v3";
const ONBOARDING_KEY = "ai_tamagotchi_onboarded";

export function saveTamagotchi(tama: TamagotchiState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...tama, lastSavedAt: Date.now() }));
  } catch {}
}

export function loadTamagotchi(): TamagotchiState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TamagotchiState;
    if (!parsed.brain.neuralActivity?.length) parsed.brain.neuralActivity = buildNeuralNodes();
    if (!parsed.brain.mutations) parsed.brain.mutations = [];
    if (!parsed.brain.totalXP) parsed.brain.totalXP = parsed.brain.totalDecisions * 2;
    if (!parsed.streakDays) parsed.streakDays = 1;
    if (!parsed.longestStreak) parsed.longestStreak = 1;
    if (!parsed.totalDaysActive) parsed.totalDaysActive = 1;
    if (!parsed.criticalSaves) parsed.criticalSaves = 0;
    if (!parsed.lastVisitDate) parsed.lastVisitDate = getTodayDate();
    if (!parsed.lastWeeklyEventDate) parsed.lastWeeklyEventDate = "";
    return parsed;
  } catch {
    return null;
  }
}

export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === "1";
}

export function markOnboardingComplete(): void {
  localStorage.setItem(ONBOARDING_KEY, "1");
}

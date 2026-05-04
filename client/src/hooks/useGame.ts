/**
 * AI Tamagotchi — Game Hook v4
 *
 * v4 — TensorFlow.js DQN integration:
 * - DQNBrain replaces Q-table for AI decisions
 * - Pet state + model weights synced to server via tRPC
 * - Identified by Telegram User ID (no login required)
 * - Offline recovery still works via localStorage fallback
 * - Sound effects via Web Audio API soundEngine
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  TamagotchiState,
  applyAction,
  applyOfflineRecovery,
  calculateReward,
  calculateXP,
  createInitialTamagotchi,
  generateThought,
  loadTamagotchi,
  processVisit,
  saveTamagotchi,
  tickWorld,
} from "@/lib/brain";
import { DQNBrain, ACTION_NAMES } from "@/lib/dqnBrain";
import type { Action as DQNAction } from "@/lib/dqnBrain";
import { usePetSync, getTelegramId } from "@/hooks/usePetSync";
import {
  playActionSound,
  playThink,
  playMutation,
  playEvolve,
  playDie,
  playStreak,
} from "@/lib/soundEngine";

// Map DQN action index to brain action string
const DQN_TO_BRAIN_ACTION: Record<number, string> = {
  0: "feed",
  1: "play",
  2: "sleep",
  3: "heal",
};

const TICK_INTERVAL_MS = 10_000;   // 10 seconds per tick
const AUTO_ACT_INTERVAL = 12;      // AI acts every 12 ticks = 2 minutes
const SAVE_INTERVAL = 3;
const THINKING_DURATION_MS = 1600;

export interface GameActions {
  feed: () => void;
  play: () => void;
  sleep: () => void;
  clean: () => void;
  reset: () => void;
}

export interface MutationEvent {
  name: string;
  description: string;
  timestamp: number;
}

export interface DayStartEvent {
  isNewDay: boolean;
  streakDays: number;
  streakBonus: number;
  isStreakBroken: boolean;
}

export function useGame() {
  const [tama, setTama] = useState<TamagotchiState>(() => {
    const saved = loadTamagotchi();
    if (saved) return applyOfflineRecovery(saved);
    return createInitialTamagotchi("Bytechi");
  });

  const [latestMutation, setLatestMutation] = useState<MutationEvent | null>(null);
  const [dayStartEvent, setDayStartEvent] = useState<DayStartEvent | null>(null);
  const [dqnReady, setDqnReady] = useState(false);

  const tickCountRef = useRef(0);
  const thinkingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dqnRef = useRef<DQNBrain | null>(null);
  const tamaRef = useRef(tama);
  const prevStageRef = useRef(tama.stage);
  const telegramId = getTelegramId();

  // Keep tamaRef in sync for callbacks
  useEffect(() => { tamaRef.current = tama; }, [tama]);

  // Initialize DQN brain
  useEffect(() => {
    const brain = new DQNBrain();
    dqnRef.current = brain;
    setDqnReady(true);
    return () => { brain.dispose(); };
  }, []);

  // ─── Server sync callbacks ────────────────────────────────────────────────

  const getPetState = useCallback((): string => {
    return JSON.stringify(tamaRef.current);
  }, []);

  const getModelWeights = useCallback(async (): Promise<string> => {
    if (!dqnRef.current) return "{}";
    const weights = await dqnRef.current.serialize();
    return JSON.stringify(weights);
  }, []);

  const onLoaded = useCallback((petStateJson: string, modelWeightsJson: string) => {
    try {
      // Restore pet state
      const petState = JSON.parse(petStateJson) as TamagotchiState;
      const recovered = applyOfflineRecovery(petState);
      setTama(recovered);
      saveTamagotchi({ ...recovered, lastSavedAt: Date.now() });

      // Restore DQN weights
      if (dqnRef.current && modelWeightsJson && modelWeightsJson !== "{}") {
        const weights = JSON.parse(modelWeightsJson);
        dqnRef.current.deserialize(weights).catch(console.warn);
      }
    } catch (e) {
      console.warn("[useGame] Failed to restore from server:", e);
    }
  }, []);

  // ─── Pet sync hook ────────────────────────────────────────────────────────

  const stageIndex = ["egg","hatchling","child","teen","adult","sage"].indexOf(tama.stage);
  const { isLoading: syncLoading, save: syncSave } = usePetSync({
    telegramId,
    getPetState,
    getModelWeights,
    onLoaded,
    stage: stageIndex,
  });

  // ─── Process daily visit on mount ─────────────────────────────────────────

  useEffect(() => {
    setTama((prev) => {
      const { tama: updated, isNewDay, streakBonus, isStreakBroken } = processVisit(prev);
      if (isNewDay) {
        setTimeout(() => {
          setDayStartEvent({ isNewDay, streakDays: updated.streakDays, streakBonus, isStreakBroken });
          // Play streak sound on new day
          if (!isStreakBroken && updated.streakDays > 1) {
            playStreak();
          }
          setTimeout(() => setDayStartEvent(null), 5000);
        }, 1500);
        saveTamagotchi({ ...updated, lastSavedAt: Date.now() });
      }
      return updated;
    });
  }, []);

  // ─── User action ──────────────────────────────────────────────────────────

  const performAction = useCallback((actionStr: string, isAuto: boolean = false) => {
    const actionIdx = Object.values(DQN_TO_BRAIN_ACTION).indexOf(actionStr) as DQNAction;

    // Play sound for user actions
    if (!isAuto) {
      playActionSound(actionStr);
    } else {
      // Quiet "think" blip for AI decisions
      playThink();
    }

    setTama((prev) => {
      if (!prev.alive) return prev;

      const isCriticalSave = !isAuto && (
        prev.hunger > 80 || prev.happiness < 15 || prev.energy < 10 || prev.health < 20
      );

      const reward = calculateReward(prev, actionStr as any);
      const xpGained = calculateXP({
        byUser: !isAuto,
        streakDays: prev.streakDays,
        isCriticalSave,
        isMutation: false,
        weeklyEvent: prev.weeklyEvent,
      });

      let next = applyAction(prev, actionStr as any);

      // Check for death after action
      if (!next.alive && prev.alive) {
        setTimeout(() => playDie(), 200);
      }

      // Check for evolution after action
      if (next.stage !== prev.stage) {
        setTimeout(() => playEvolve(), 300);
      }

        // DQN learning — async, fire and forget
      if (dqnRef.current && dqnReady) {
        const state = [prev.hunger / 100, prev.happiness / 100, prev.energy / 100, prev.health / 100];
        const nextState = [next.hunger / 100, next.happiness / 100, next.energy / 100, next.health / 100];
        const dqnReward = isAuto ? reward : reward * 3; // user actions give 3x reward signal
        dqnRef.current.learn(state, actionIdx >= 0 ? actionIdx as DQNAction : 0, dqnReward, nextState, !next.alive);

        const dqnStats = dqnRef.current.getStats();
        // Update activation values on existing NeuralNodes (keep structure intact)
        const updatedNodes = next.brain.neuralActivity.map((node, i) => ({
          ...node,
          activation: i < dqnStats.neuralActivity.length ? dqnStats.neuralActivity[i] : node.activation,
        }));
        next = {
          ...next,
          brain: {
            ...next.brain,
            totalXP: next.brain.totalXP + xpGained,
            totalDecisions: next.brain.totalDecisions + 1,
            neuralActivity: updatedNodes,
            lastAction: actionStr as any,
            lastReward: reward,
          },
        };
      } else {
        next = {
          ...next,
          brain: {
            ...next.brain,
            totalXP: next.brain.totalXP + xpGained,
            totalDecisions: next.brain.totalDecisions + 1,
            lastAction: actionStr as any,
            lastReward: reward,
          },
        };
      }

      // Update daily task progress
      let updatedTask = next.dailyTask;
      if (updatedTask && !updatedTask.completed) {
        let progress = updatedTask.progress;
        if (
          (updatedTask.type === "feed_times" && actionStr === "feed") ||
          (updatedTask.type === "sleep_low" && actionStr === "sleep" && prev.energy < 20) ||
          (updatedTask.type === "save_critical" && isCriticalSave)
        ) {
          progress += 1;
        }
        if (progress >= updatedTask.target) {
          updatedTask = { ...updatedTask, progress, completed: true };
          next = { ...next, brain: { ...next.brain, totalXP: next.brain.totalXP + updatedTask.xpReward } };
        } else {
          updatedTask = { ...updatedTask, progress };
        }
      }

      next = {
        ...next,
        isThinking: true,
        currentThought: generateThought(actionStr as any, isAuto),
        lastActionTime: Date.now(),
        totalUserActions: isAuto ? prev.totalUserActions : prev.totalUserActions + 1,
        criticalSaves: isCriticalSave ? prev.criticalSaves + 1 : prev.criticalSaves,
        dailyTask: updatedTask,
      };

      return next;
    });

    if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);
    thinkingTimeoutRef.current = setTimeout(() => {
      setTama((prev) => ({ ...prev, isThinking: false }));
    }, THINKING_DURATION_MS);
  }, [dqnReady]);

  // ─── Game loop ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!dqnReady) return;

    const interval = setInterval(async () => {
      tickCountRef.current += 1;
      const tick = tickCountRef.current;

      // AI auto-action every 12 ticks (~2 min) — async DQN decision
      if (tick % AUTO_ACT_INTERVAL === 0 && dqnRef.current) {
        const current = tamaRef.current;
        if (!current.alive) return;

        const { action: dqnAction } = await dqnRef.current.chooseAction(
          current.hunger,
          current.happiness,
          current.energy,
          current.health
        );
        const actionStr = DQN_TO_BRAIN_ACTION[dqnAction] || "feed";
        performAction(actionStr, true);

        // Check for mutation (every 30 DQN decisions)
        const stats = dqnRef.current.getStats();
        if (stats.totalDecisions > 0 && stats.totalDecisions % 30 === 0) {
          await dqnRef.current.mutate(0.03);
          playMutation();
          setLatestMutation({
            name: "Нейронная мутация",
            description: `Веса нейросети изменились. Решений: ${stats.totalDecisions}`,
            timestamp: Date.now(),
          });
          setTimeout(() => setLatestMutation(null), 4500);
        }
      }

      setTama((prev) => {
        if (!prev.alive) return prev;
        let next = tickWorld(prev);

        // Detect death from world tick
        if (!next.alive && prev.alive) {
          setTimeout(() => playDie(), 200);
        }

        // Detect evolution from world tick
        if (next.stage !== prev.stage) {
          setTimeout(() => playEvolve(), 300);
        }

        // Sync DQN stats into brain for visualization
        if (dqnRef.current) {
          const dqnStats = dqnRef.current.getStats();
          const updatedNodes = next.brain.neuralActivity.map((node, i) => ({
            ...node,
            activation: i < dqnStats.neuralActivity.length ? dqnStats.neuralActivity[i] : node.activation,
          }));
          next = {
            ...next,
            brain: {
              ...next.brain,
              neuralActivity: updatedNodes,
            },
          };
        }

        if (tick % SAVE_INTERVAL === 0) {
          saveTamagotchi({ ...next, lastSavedAt: Date.now() });
        }

        return next;
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [dqnReady, performAction]);

  const actions: GameActions = {
    feed:  () => performAction("feed",  false),
    play:  () => performAction("play",  false),
    sleep: () => performAction("sleep", false),
    clean: () => performAction("heal",  false),
    reset: () => {
      const fresh = createInitialTamagotchi(tama.name);
      saveTamagotchi(fresh);
      setTama(fresh);
      if (dqnRef.current) {
        dqnRef.current.dispose();
        dqnRef.current = new DQNBrain();
      }
    },
  };

  return {
    tama,
    actions,
    latestMutation,
    dayStartEvent,
    dqnReady,
    syncLoading,
    telegramId,
  };
}

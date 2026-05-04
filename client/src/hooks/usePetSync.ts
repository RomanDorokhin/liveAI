/**
 * usePetSync — handles loading and saving pet state + DQN weights to the server.
 *
 * Telegram Web App provides window.Telegram.WebApp.initDataUnsafe.user.id
 * which we use as the unique identifier (no login required).
 *
 * Save strategy:
 *   - Auto-save every 30 seconds while app is open
 *   - Save on page unload (visibilitychange)
 *   - Save after evolution stage change
 */

import { useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";

/** Get Telegram user ID from WebApp SDK, or a fallback for browser testing */
export function getTelegramId(): string {
  try {
    const tg = (window as any).Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id;
    if (userId) return String(userId);
  } catch {
    // not in Telegram
  }
  // Fallback: use a device fingerprint stored in localStorage
  let devId = localStorage.getItem("__tama_dev_id");
  if (!devId) {
    devId = "dev_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("__tama_dev_id", devId);
  }
  return devId;
}

interface UsePetSyncOptions {
  telegramId: string;
  getPetState: () => string;
  getModelWeights: () => Promise<string>;
  onLoaded: (petState: string, modelWeights: string) => void;
  stage: number; // watch for evolution
}

export function usePetSync({
  telegramId,
  getPetState,
  getModelWeights,
  onLoaded,
  stage,
}: UsePetSyncOptions) {
  const utils = trpc.useUtils();
  const saveMutation = trpc.pet.save.useMutation();
  const loadQuery = trpc.pet.load.useQuery(
    { telegramId },
    {
      enabled: !!telegramId,
      retry: 2,
      staleTime: Infinity, // only load once per session
    }
  );

  const loadedRef = useRef(false);
  const lastStageRef = useRef(stage);

  // On first successful load, restore state
  useEffect(() => {
    if (loadedRef.current) return;
    if (loadQuery.data === undefined) return; // still loading

    if (loadQuery.data) {
      loadedRef.current = true;
      onLoaded(loadQuery.data.petState, loadQuery.data.modelWeights);
    } else {
      // No data on server yet — new user
      loadedRef.current = true;
    }
  }, [loadQuery.data, onLoaded]);

  const save = useCallback(async () => {
    if (!loadedRef.current) return; // don't save before we've loaded
    try {
      const petState = getPetState();
      const modelWeights = await getModelWeights();
      await saveMutation.mutateAsync({ telegramId, petState, modelWeights });
    } catch (e) {
      console.warn("[PetSync] Save failed:", e);
    }
  }, [telegramId, getPetState, getModelWeights, saveMutation]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(save, 30_000);
    return () => clearInterval(interval);
  }, [save]);

  // Save on visibility change (app goes to background)
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "hidden") {
        save();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [save]);

  // Save on evolution
  useEffect(() => {
    if (lastStageRef.current !== stage && loadedRef.current) {
      lastStageRef.current = stage;
      save();
    }
  }, [stage, save]);

  return {
    isLoading: loadQuery.isLoading,
    isSaving: saveMutation.isPending,
    save,
    isNewUser: loadedRef.current && loadQuery.data === null,
  };
}

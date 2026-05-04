/**
 * AI Tamagotchi — Streak Banner
 * Design: Biopunk / Organic Circuitry
 *
 * Shown when user visits on a new day.
 */

import { EvolutionStage, getStageColor } from "@/lib/brain";

interface StreakBannerProps {
  streakDays: number;
  streakBonus: number;
  isStreakBroken: boolean;
  stage: EvolutionStage;
}

export default function StreakBanner({ streakDays, streakBonus, isStreakBroken, stage }: StreakBannerProps) {
  const color = getStageColor(stage);

  return (
    <div
      style={{
        position: "fixed",
        top: 80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        background: "rgba(5,8,16,0.96)",
        border: `1px solid ${isStreakBroken ? "#FF444488" : color + "88"}`,
        borderRadius: 16,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: `0 0 30px ${isStreakBroken ? "#FF444433" : color + "33"}, 0 8px 32px rgba(0,0,0,0.6)`,
        backdropFilter: "blur(12px)",
        maxWidth: 300,
        minWidth: 240,
        animation: "slideDown 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <div
        style={{
          fontSize: 28,
          filter: `drop-shadow(0 0 10px ${isStreakBroken ? "#FF4444" : color})`,
          flexShrink: 0,
        }}
      >
        {isStreakBroken ? "💔" : streakDays >= 7 ? "🔥" : "⚡"}
      </div>
      <div>
        <div
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 13,
            fontWeight: 800,
            color: isStreakBroken ? "#FF6666" : color,
            marginBottom: 2,
          }}
        >
          {isStreakBroken
            ? "Стрик прерван"
            : streakDays === 1
            ? "Добро пожаловать!"
            : `Стрик ${streakDays} дней 🔥`}
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.4,
          }}
        >
          {isStreakBroken
            ? "Существо скучало. Начни заново."
            : streakBonus > 0
            ? `+${streakBonus} XP бонус за стрик`
            : "Существо рада тебя видеть"}
        </div>
      </div>
    </div>
  );
}

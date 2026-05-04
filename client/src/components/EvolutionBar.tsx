/**
 * AI Tamagotchi — Evolution Bar v3
 * Design: Biopunk / Organic Circuitry
 *
 * Shows XP-based progress, streak requirements, and stage info.
 */

import {
  EvolutionStage,
  NEXT_STAGE,
  STREAK_REQUIREMENTS,
  XP_THRESHOLDS,
  getStageColor,
  getStageProgress,
  getStageName,
  getNextStageName,
} from "@/lib/brain";

interface EvolutionBarProps {
  stage: EvolutionStage;
  xp: number;
  streakDays: number;
}

const STAGE_ORDER: EvolutionStage[] = ["egg", "hatchling", "child", "teen", "adult", "sage"];

export default function EvolutionBar({ stage, xp, streakDays }: EvolutionBarProps) {
  const color = getStageColor(stage);
  const progress = getStageProgress(xp);
  const nextStage = NEXT_STAGE[stage];
  const nextName = getNextStageName(stage);
  const streakReq = nextStage ? STREAK_REQUIREMENTS[nextStage] : undefined;
  const streakLocked = streakReq !== undefined && streakDays < streakReq;
  const nextXP = nextStage ? XP_THRESHOLDS[nextStage] : null;
  const xpToNext = nextXP ? Math.max(0, nextXP - xp) : 0;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Stage name + progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 8px ${color}`,
            }}
          />
          <span
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color,
              letterSpacing: "0.02em",
            }}
          >
            {getStageName(stage)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {streakLocked && (
            <span
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 9,
                color: "#FF9944",
                background: "rgba(255,153,68,0.1)",
                border: "1px solid rgba(255,153,68,0.3)",
                borderRadius: 4,
                padding: "2px 5px",
              }}
            >
              🔒 {streakDays}/{streakReq}д
            </span>
          )}
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
            }}
          >
            {nextStage ? `${Math.round(progress * 100)}% → ${nextName}` : "Максимум"}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: "100%",
          height: 4,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: streakLocked
              ? "linear-gradient(90deg, #FF994466, #FF9944)"
              : `linear-gradient(90deg, ${color}88, ${color})`,
            borderRadius: 2,
            boxShadow: streakLocked ? "none" : `0 0 6px ${color}`,
            transition: "width 0.8s ease",
          }}
        />
      </div>

      {/* XP info + stage dots */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 9,
            color: "rgba(255,255,255,0.25)",
          }}
        >
          {xp.toLocaleString()} XP{xpToNext > 0 ? ` · ещё ${xpToNext.toLocaleString()}` : ""}
        </span>
        <div style={{ display: "flex", gap: 5 }}>
          {STAGE_ORDER.map((s) => {
            const sColor = getStageColor(s);
            const isReached = STAGE_ORDER.indexOf(s) <= STAGE_ORDER.indexOf(stage);
            const isCurrent = s === stage;
            return (
              <div
                key={s}
                title={getStageName(s)}
                style={{
                  width: isCurrent ? 9 : 6,
                  height: isCurrent ? 9 : 6,
                  borderRadius: "50%",
                  background: isReached ? sColor : "rgba(255,255,255,0.1)",
                  boxShadow: isCurrent ? `0 0 8px ${sColor}` : "none",
                  transition: "all 0.4s ease",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

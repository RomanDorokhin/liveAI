/**
 * AI Tamagotchi — Daily Task Card
 * Design: Biopunk / Organic Circuitry
 */

import { DailyTask, EvolutionStage, WeeklyEvent, getStageColor } from "@/lib/brain";

interface DailyTaskCardProps {
  task: DailyTask | null;
  weeklyEvent: WeeklyEvent | null;
  stage: EvolutionStage;
}

export default function DailyTaskCard({ task, weeklyEvent, stage }: DailyTaskCardProps) {
  const color = getStageColor(stage);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      {/* Weekly event */}
      {weeklyEvent?.active && (
        <div
          style={{
            background: "rgba(255,100,0,0.08)",
            border: "1px solid rgba(255,100,0,0.3)",
            borderRadius: 12,
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 18, flexShrink: 0 }}>
            {weeklyEvent.type === "hunger_crisis" ? "🍖" :
             weeklyEvent.type === "energy_storm" ? "⚡" :
             weeklyEvent.type === "mutation_burst" ? "🔀" :
             weeklyEvent.type === "illness" ? "🤒" :
             weeklyEvent.type === "festival" ? "🎉" : "⚠️"}
          </div>
          <div>
            <div style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: 11,
              fontWeight: 800,
              color: "#FF9944",
              marginBottom: 1,
            }}>
              {weeklyEvent.name}
            </div>
            <div style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 9,
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.4,
            }}>
              {weeklyEvent.description}
            </div>
          </div>
        </div>
      )}

      {/* Daily task */}
      {task && (
        <div
          style={{
            background: task.completed ? `${color}0d` : "rgba(0,0,0,0.4)",
            border: `1px solid ${task.completed ? color + "44" : "rgba(255,255,255,0.06)"}`,
            borderRadius: 12,
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 16, flexShrink: 0 }}>
            {task.completed ? "✅" : "📋"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: task.completed ? color : "rgba(255,255,255,0.7)",
              marginBottom: 3,
              lineHeight: 1.3,
            }}>
              {task.description}
            </div>
            {/* Progress bar */}
            {task.target > 1 && (
              <div style={{
                width: "100%",
                height: 4,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 2,
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${Math.min(100, (task.progress / task.target) * 100)}%`,
                  height: "100%",
                  background: color,
                  borderRadius: 2,
                  transition: "width 0.4s ease",
                  boxShadow: `0 0 6px ${color}66`,
                }} />
              </div>
            )}
          </div>
          <div style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            color: task.completed ? color : "rgba(255,255,255,0.3)",
            fontWeight: 700,
            flexShrink: 0,
          }}>
            +{task.xpReward} XP
          </div>
        </div>
      )}
    </div>
  );
}

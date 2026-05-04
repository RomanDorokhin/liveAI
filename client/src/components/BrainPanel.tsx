/**
 * AI Tamagotchi — DQN Brain Panel
 * Shows real TensorFlow.js metrics: loss, epsilon, layer weights heatmap
 */

import { BrainState, getStageColor, EvolutionStage } from "@/lib/brain";
import { ACTION_ICONS, ACTION_NAMES } from "@/lib/dqnBrain";

interface BrainPanelProps {
  brain: BrainState;
  stage: EvolutionStage;
}

export default function BrainPanel({ brain, stage }: BrainPanelProps) {
  const color = getStageColor(stage);
  const epsilon = (brain as any).epsilon ?? 0.9;
  const loss = (brain as any).loss ?? 0;
  const layerWeights: number[][] = (brain as any).layerWeightSummary ?? [];
  const explorationPct = Math.round(epsilon * 100);

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.5)",
        border: `1px solid ${color}22`,
        borderRadius: 14,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          DQN Нейросеть
        </span>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
          {brain.totalDecisions} решений
        </span>
      </div>

      {/* Architecture badge */}
      <div style={{
        display: "flex",
        gap: 4,
        alignItems: "center",
        padding: "5px 8px",
        background: `${color}0d`,
        border: `1px solid ${color}18`,
        borderRadius: 8,
      }}>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: `${color}99` }}>
          4 → 16 → 8 → 4
        </span>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", marginLeft: 4 }}>
          TensorFlow.js · WebGL
        </span>
      </div>

      {/* Metrics row */}
      <div style={{ display: "flex", gap: 8 }}>
        <MetricChip label="Исследование" value={`${explorationPct}%`} color={color} />
        <MetricChip label="Loss" value={loss > 0 ? loss.toFixed(3) : "—"} color={color} />
        <MetricChip label="XP" value={brain.totalXP.toLocaleString()} color={color} />
      </div>

      {/* Last action */}
      {brain.lastAction && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          background: `${color}11`,
          borderRadius: 8,
          border: `1px solid ${color}22`,
        }}>
          <span style={{ fontSize: 14 }}>
            {ACTION_ICONS[["feed","play","sleep","heal"].indexOf(brain.lastAction)] ?? "🤔"}
          </span>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "rgba(255,255,255,0.6)", flex: 1 }}>
            {brain.lastAction}
          </span>
          <span style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            color: brain.lastReward > 15 ? "#00FFD1" : brain.lastReward > 8 ? "#FFB800" : "rgba(255,255,255,0.4)",
            fontWeight: 700,
          }}>
            +{brain.lastReward}
          </span>
        </div>
      )}

      {/* Layer weights heatmap */}
      {layerWeights.length > 0 && (
        <div>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Веса первого слоя (4×4)
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3, marginTop: 5 }}>
            {layerWeights.map((row, ri) =>
              row.map((w, ci) => {
                const norm = Math.min(1, Math.abs(w) / 0.5);
                const isPos = w >= 0;
                const bg = isPos
                  ? `rgba(0,255,209,${0.08 + norm * 0.5})`
                  : `rgba(255,68,68,${0.08 + norm * 0.5})`;
                return (
                  <div
                    key={`${ri}-${ci}`}
                    title={`w[${ri}][${ci}] = ${w.toFixed(3)}`}
                    style={{
                      height: 20,
                      background: bg,
                      borderRadius: 4,
                      border: `1px solid ${isPos ? color : "#FF4444"}22`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 7, color: "rgba(255,255,255,0.5)" }}>
                      {w.toFixed(2)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 4, justifyContent: "space-between" }}>
            {["голод", "радость", "энергия", "здоровье"].map(label => (
              <span key={label} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 7, color: "rgba(255,255,255,0.2)", flex: 1, textAlign: "center" }}>
                {label.slice(0, 3)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Decision history mini-chart */}
      {brain.decisionHistory.length > 0 && (
        <div>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            История наград
          </span>
          <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 24, marginTop: 4 }}>
            {brain.decisionHistory.slice(-20).map((d, i) => {
              const h = Math.max(2, (d.reward / 30) * 24);
              const c = d.reward > 18 ? "#00FFD1" : d.reward > 10 ? "#FFB800" : `${color}66`;
              return (
                <div key={i} style={{ flex: 1, height: h, background: c, borderRadius: 2, transition: "height 0.3s ease" }} />
              );
            })}
          </div>
        </div>
      )}

      {/* Replay buffer indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: "rgba(255,255,255,0.25)" }}>
          Replay buffer
        </span>
        <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            width: `${Math.min(100, (brain.totalDecisions / 200) * 100)}%`,
            height: "100%",
            background: color,
            borderRadius: 2,
            transition: "width 0.5s ease",
          }} />
        </div>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: `${color}88` }}>
          {Math.min(200, brain.totalDecisions)}/200
        </span>
      </div>
    </div>
  );
}

function MetricChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ flex: 1, background: `${color}0d`, border: `1px solid ${color}22`, borderRadius: 8, padding: "5px 6px", textAlign: "center" }}>
      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color }}>
        {value}
      </div>
      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 8, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 1 }}>
        {label}
      </div>
    </div>
  );
}

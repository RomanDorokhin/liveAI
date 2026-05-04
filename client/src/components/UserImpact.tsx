/**
 * AI Tamagotchi — User Impact Panel
 * Design: Biopunk / Organic Circuitry
 *
 * Shows how much the user contributed vs AI self-learning.
 * Motivates participation by showing the 3× bonus effect.
 */

import { BrainState, EvolutionStage, getStageColor } from "@/lib/brain";

interface UserImpactProps {
  brain: BrainState;
  totalUserActions: number;
  stage: EvolutionStage;
}

export default function UserImpact({ brain, totalUserActions, stage }: UserImpactProps) {
  const color = getStageColor(stage);
  const totalDecisions = brain.totalDecisions;
  const aiDecisions = Math.max(0, totalDecisions - totalUserActions);
  const userPct = totalDecisions > 0 ? Math.round((totalUserActions / totalDecisions) * 100) : 0;

  // User actions give 3× reward, so their "effective contribution" is higher
  const userEffective = totalUserActions * 3;
  const aiEffective = aiDecisions;
  const totalEffective = userEffective + aiEffective;
  const userEffectivePct = totalEffective > 0 ? Math.round((userEffective / totalEffective) * 100) : 0;

  const latestMutation = brain.mutations[brain.mutations.length - 1];

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
        <span
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            color,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Твой вклад
        </span>
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          {totalUserActions} действий
        </span>
      </div>

      {/* Split bar: user vs AI */}
      <div>
        <div
          style={{
            width: "100%",
            height: 8,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 4,
            overflow: "hidden",
            display: "flex",
          }}
        >
          <div
            style={{
              width: `${userEffectivePct}%`,
              height: "100%",
              background: color,
              borderRadius: "4px 0 0 4px",
              boxShadow: `0 0 8px ${color}66`,
              transition: "width 0.6s ease",
            }}
          />
          <div
            style={{
              flex: 1,
              height: "100%",
              background: "rgba(255,255,255,0.12)",
              borderRadius: "0 4px 4px 0",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 9,
              color,
            }}
          >
            Ты {userEffectivePct}% (×3 бонус)
          </span>
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 9,
              color: "rgba(255,255,255,0.3)",
            }}
          >
            ИИ {100 - userEffectivePct}%
          </span>
        </div>
      </div>

      {/* Tip */}
      <div
        style={{
          background: `${color}0a`,
          border: `1px solid ${color}1a`,
          borderRadius: 8,
          padding: "7px 10px",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 10,
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1.5,
        }}
      >
        {userPct < 20
          ? "💡 Твои действия дают ×3 опыта — помоги ИИ учиться быстрее"
          : userPct < 50
          ? "⚡ Хорошо! Ты ускоряешь эволюцию"
          : "🔥 Ты активный учитель — существо растёт быстро!"}
      </div>

      {/* Mutations */}
      {brain.mutations.length > 0 && (
        <div>
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 9,
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 4,
            }}
          >
            Мутации ({brain.mutations.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {brain.mutations.slice(-4).map((mut) => (
              <div
                key={mut.id}
                title={mut.description}
                style={{
                  background: `${color}15`,
                  border: `1px solid ${color}33`,
                  borderRadius: 6,
                  padding: "3px 8px",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: 10,
                  fontWeight: 600,
                  color: `${color}cc`,
                }}
              >
                🔀 {mut.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

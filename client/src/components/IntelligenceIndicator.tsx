/**
 * IntelligenceIndicator — показывает "умность" ИИ в реальном времени
 *
 * Вычисляет IQ-подобный балл из:
 *   - epsilon (чем ниже — тем меньше случайных решений, тем умнее)
 *   - loss (чем ниже — тем точнее предсказания)
 *   - totalDecisions (опыт)
 *   - totalXP
 */

import { useMemo } from "react";
import { getStageColor, EvolutionStage } from "@/lib/brain";

interface IntelligenceIndicatorProps {
  epsilon: number;       // 0..1 — exploration rate (ниже = умнее)
  loss: number;          // 0..∞ — training loss (ниже = умнее)
  totalDecisions: number;
  totalXP: number;
  stage: EvolutionStage;
}

// Уровни умности
const IQ_LEVELS = [
  { min: 0,   max: 15,  label: "Инстинкт",    icon: "🥚", desc: "Действует случайно" },
  { min: 15,  max: 30,  label: "Рефлекс",     icon: "🐣", desc: "Начинает замечать паттерны" },
  { min: 30,  max: 45,  label: "Обучение",    icon: "🧪", desc: "Формирует первые стратегии" },
  { min: 45,  max: 60,  label: "Понимание",   icon: "💡", desc: "Понимает причину и следствие" },
  { min: 60,  max: 75,  label: "Стратегия",   icon: "🧠", desc: "Планирует наперёд" },
  { min: 75,  max: 88,  label: "Мастерство",  icon: "⚡", desc: "Оптимизирует каждое решение" },
  { min: 88,  max: 100, label: "Сверхразум",  icon: "✨", desc: "Предсказывает с высокой точностью" },
];

function computeIQ(epsilon: number, loss: number, totalDecisions: number): number {
  // Компонент 1: epsilon (0..1) → умность от epsilon
  // epsilon=0.9 → 0%, epsilon=0.05 → 100%
  const epsilonScore = Math.max(0, (0.9 - epsilon) / 0.85) * 40; // max 40 points

  // Компонент 2: loss (чем ниже — тем лучше, обычно 0..2)
  // loss=2+ → 0%, loss=0 → 100%
  const lossScore = Math.max(0, 1 - Math.min(loss / 2, 1)) * 35; // max 35 points

  // Компонент 3: опыт (логарифмический рост)
  // 0 решений → 0%, 1000+ → 25%
  const expScore = Math.min(Math.log10(totalDecisions + 1) / 3, 1) * 25; // max 25 points

  return Math.min(Math.round(epsilonScore + lossScore + expScore), 100);
}

export default function IntelligenceIndicator({
  epsilon,
  loss,
  totalDecisions,
  totalXP,
  stage,
}: IntelligenceIndicatorProps) {
  const color = getStageColor(stage);

  const iq = useMemo(
    () => computeIQ(epsilon, loss, totalDecisions),
    [epsilon, loss, totalDecisions]
  );

  const level = IQ_LEVELS.find((l) => iq >= l.min && iq < l.max) || IQ_LEVELS[IQ_LEVELS.length - 1];

  // Сегменты прогресс-бара (7 штук)
  const segments = IQ_LEVELS.length;
  const filledSegments = IQ_LEVELS.filter((l) => iq >= l.max).length;
  const partialFill = ((iq - level.min) / (level.max - level.min)) * 100;

  return (
    <div
      style={{
        width: "100%",
        background: "rgba(0,0,0,0.35)",
        border: `1px solid ${color}22`,
        borderRadius: 12,
        padding: "10px 12px",
        fontFamily: "Space Grotesk, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>{level.icon}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: color, lineHeight: 1 }}>
              {level.label}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>
              {level.desc}
            </div>
          </div>
        </div>
        <div style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 22,
          fontWeight: 900,
          color: color,
          lineHeight: 1,
          textShadow: `0 0 12px ${color}66`,
        }}>
          {iq}
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>/100</span>
        </div>
      </div>

      {/* Segmented progress bar */}
      <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
        {IQ_LEVELS.map((lvl, i) => {
          const isFilled = iq >= lvl.max;
          const isPartial = iq >= lvl.min && iq < lvl.max;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 3,
                background: isFilled
                  ? color
                  : isPartial
                  ? `linear-gradient(to right, ${color} ${partialFill}%, rgba(255,255,255,0.08) ${partialFill}%)`
                  : "rgba(255,255,255,0.08)",
                transition: "background 0.5s ease",
                boxShadow: isFilled ? `0 0 6px ${color}66` : undefined,
              }}
            />
          );
        })}
      </div>

      {/* Stats row */}
      <div style={{
        display: "flex",
        gap: 12,
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 9,
        color: "rgba(255,255,255,0.3)",
      }}>
        <span>ε={epsilon.toFixed(3)}</span>
        <span>loss={loss > 0 ? loss.toFixed(3) : "—"}</span>
        <span>{totalDecisions} реш.</span>
        <span>{totalXP.toLocaleString()} XP</span>
      </div>
    </div>
  );
}

/**
 * DeathScreen — экран смерти с полными итогами жизни питомца
 *
 * Показывает:
 *   - Анимированный некролог
 *   - Полную статистику жизни
 *   - Список мутаций
 *   - Кнопки: Начать заново / Поделиться
 */

import { useState, useEffect } from "react";
import { EvolutionStage, getStageColor, getStageName } from "@/lib/brain";

interface DeathScreenProps {
  petName: string;
  stage: EvolutionStage;
  xp: number;
  streakDays: number;
  longestStreak: number;
  totalDecisions: number;
  mutationCount: number;
  mutationNames: string[];
  totalDaysActive: number;
  totalUserActions: number;
  intelligenceScore: number;
  onReset: () => void;
  onShare: () => void;
}

const EPITAPHS = [
  "Он жил. Он учился. Он был настоящим.",
  "Каждое его решение было шагом к пониманию.",
  "Нейроны остывают, но память остаётся.",
  "Он познал мир через данные и опыт.",
  "Маленький ИИ с большим сердцем.",
  "Его веса были уникальны. Как и он сам.",
];

export default function DeathScreen({
  petName,
  stage,
  xp,
  streakDays,
  longestStreak,
  totalDecisions,
  mutationCount,
  mutationNames,
  totalDaysActive,
  totalUserActions,
  intelligenceScore,
  onReset,
  onShare,
}: DeathScreenProps) {
  const [visible, setVisible] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const color = getStageColor(stage);
  const epitaph = EPITAPHS[Math.floor(petName.length % EPITAPHS.length)];

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    setTimeout(() => setShowStats(true), 800);
  }, []);

  const stats = [
    { icon: "⚡", label: "Всего XP", value: xp.toLocaleString() },
    { icon: "🧠", label: "Решений ИИ", value: totalDecisions.toString() },
    { icon: "👆", label: "Твоих действий", value: totalUserActions.toString() },
    { icon: "🔥", label: "Макс. стрик", value: `${longestStreak} дн.` },
    { icon: "📅", label: "Дней активности", value: totalDaysActive.toString() },
    { icon: "🧬", label: "Мутаций", value: mutationCount.toString() },
    { icon: "💡", label: "IQ к концу", value: `${intelligenceScore}/100` },
    { icon: "🏆", label: "Стадия", value: getStageName(stage) },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.95)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        zIndex: 100,
        backdropFilter: "blur(8px)",
        overflowY: "auto",
        padding: "24px 20px 40px",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}
    >
      {/* Skull + name */}
      <div style={{ textAlign: "center", marginBottom: 16, marginTop: 20 }}>
        <div style={{ fontSize: 56, marginBottom: 8, filter: `drop-shadow(0 0 20px ${color}44)` }}>
          💀
        </div>
        <div style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: 26,
          fontWeight: 900,
          color: "#fff",
          letterSpacing: "-0.02em",
        }}>
          {petName} умер
        </div>
        <div style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
          color: "rgba(255,255,255,0.35)",
          marginTop: 6,
          fontStyle: "italic",
        }}>
          "{epitaph}"
        </div>
      </div>

      {/* Divider */}
      <div style={{
        width: "80%",
        height: 1,
        background: `linear-gradient(to right, transparent, ${color}44, transparent)`,
        marginBottom: 16,
      }} />

      {/* Stats grid */}
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 14,
          opacity: showStats ? 1 : 0,
          transform: showStats ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.5s ease",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              padding: "10px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <div style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: 15,
              fontWeight: 800,
              color: color,
            }}>
              {s.icon} {s.value}
            </div>
            <div style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 9,
              color: "rgba(255,255,255,0.3)",
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Mutations list */}
      {mutationNames.length > 0 && (
        <div
          style={{
            width: "100%",
            maxWidth: 380,
            background: `${color}0a`,
            border: `1px solid ${color}22`,
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 14,
            opacity: showStats ? 1 : 0,
            transition: "opacity 0.5s ease 0.2s",
          }}
        >
          <div style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 9,
            color: "rgba(255,255,255,0.3)",
            marginBottom: 6,
          }}>
            МУТАЦИИ ЗА ЖИЗНЬ
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {mutationNames.map((name, i) => (
              <span
                key={i}
                style={{
                  background: `${color}18`,
                  border: `1px solid ${color}33`,
                  borderRadius: 6,
                  padding: "3px 8px",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: 11,
                  color: color,
                }}
              >
                🧬 {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          display: "flex",
          gap: 10,
          opacity: showStats ? 1 : 0,
          transition: "opacity 0.5s ease 0.4s",
        }}
      >
        <button
          onClick={onShare}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            padding: "13px",
            cursor: "pointer",
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          📤 Итоги
        </button>
        <button
          onClick={onReset}
          style={{
            flex: 2,
            background: `${color}22`,
            border: `1px solid ${color}66`,
            borderRadius: 12,
            padding: "13px",
            cursor: "pointer",
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 14,
            fontWeight: 800,
            color: color,
            letterSpacing: "0.03em",
            boxShadow: `0 0 20px ${color}22`,
          }}
        >
          🥚 Начать заново
        </button>
      </div>
    </div>
  );
}

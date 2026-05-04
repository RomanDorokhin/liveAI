/**
 * AI Tamagotchi — Help System
 * Contextual hints, tooltips, and a full help panel
 */

import { useState, useEffect } from "react";

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  color?: string;
}

export function Tooltip({ text, children, color = "#00FFD1" }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <div
        onPointerDown={() => setShow((v) => !v)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ cursor: "help" }}
      >
        {children}
      </div>
      {show && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0D1117",
            border: `1px solid ${color}44`,
            borderRadius: 10,
            padding: "8px 12px",
            width: 200,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            color: "rgba(255,255,255,0.75)",
            lineHeight: 1.6,
            zIndex: 200,
            boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 0 12px ${color}18`,
            pointerEvents: "none",
            textAlign: "center",
          }}
        >
          {text}
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              bottom: -5,
              left: "50%",
              transform: "translateX(-50%)",
              width: 8,
              height: 8,
              background: "#0D1117",
              border: `1px solid ${color}44`,
              borderTop: "none",
              borderLeft: "none",
              rotate: "45deg",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Contextual hint bubble ───────────────────────────────────────────────────

interface HintBubbleProps {
  message: string;
  color?: string;
  onDismiss: () => void;
}

export function HintBubble({ message, color = "#00FFD1", onDismiss }: HintBubbleProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      style={{
        width: "100%",
        background: `${color}0d`,
        border: `1px solid ${color}33`,
        borderRadius: 12,
        padding: "10px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        animation: "slideDown 0.3s ease",
        position: "relative",
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
      <span
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
          color: `${color}cc`,
          lineHeight: 1.6,
          flex: 1,
        }}
      >
        {message}
      </span>
      <button
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "rgba(255,255,255,0.25)",
          fontSize: 14,
          padding: 0,
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ─── Help Panel ───────────────────────────────────────────────────────────────

interface HelpPanelProps {
  color: string;
}

const HELP_SECTIONS = [
  {
    icon: "🍖",
    title: "Покормить",
    text: "Снижает голод. Если голод > 80% — здоровье начинает падать. Корми когда видишь красную полосу голода.",
  },
  {
    icon: "⚡",
    title: "Поиграть",
    text: "Поднимает радость. Низкая радость снижает скорость обучения ИИ. Играй хотя бы раз в день.",
  },
  {
    icon: "💤",
    title: "Спать",
    text: "Восстанавливает энергию. При энергии < 10% ИИ перестаёт принимать решения и не обучается.",
  },
  {
    icon: "✨",
    title: "Лечить",
    text: "Восстанавливает здоровье. Здоровье падает только при критических состояниях — это экстренная кнопка.",
  },
  {
    icon: "🧠",
    title: "Нейросеть",
    text: "Внутри — TensorFlow.js DQN. Нейросеть сама выбирает действия и обучается на опыте. Веса хранятся на сервере.",
  },
  {
    icon: "⚡",
    title: "Твоя роль",
    text: "Твои действия дают ×3 опыта в нейросеть. Без тебя ИИ выживает, но эволюция идёт в 3× медленнее.",
  },
  {
    icon: "🔥",
    title: "Стрик",
    text: "Заходи каждый день — стрик даёт бонус XP. Стадия Подростка требует 30-дневного стрика. Мудрец — 100 дней.",
  },
  {
    icon: "🔀",
    title: "Мутации",
    text: "Каждые ~30 решений мозг мутирует — случайно меняет инстинкты. Это делает твоё существо уникальным.",
  },
  {
    icon: "🌱",
    title: "Эволюция",
    text: "6 стадий: Яйцо → Птенец → Малыш → Подросток → Взрослый → Мудрец. Мудрец достигается за ~100 дней активной игры.",
  },
  {
    icon: "💾",
    title: "Сохранение",
    text: "Прогресс автоматически сохраняется на сервер каждые 30 секунд и при закрытии. Данные не потеряются.",
  },
];

export function HelpPanel({ color }: HelpPanelProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.5)",
        border: `1px solid ${color}22`,
        borderRadius: 14,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div
        style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 4,
        }}
      >
        Как играть
      </div>

      {HELP_SECTIONS.map((section, i) => (
        <div key={i}>
          <button
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{
              width: "100%",
              background: expanded === i ? `${color}0d` : "rgba(255,255,255,0.03)",
              border: `1px solid ${expanded === i ? color + "33" : "rgba(255,255,255,0.07)"}`,
              borderRadius: 10,
              padding: "9px 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{section.icon}</span>
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: expanded === i ? color : "rgba(255,255,255,0.7)",
                flex: 1,
                textAlign: "left",
              }}
            >
              {section.title}
            </span>
            <span
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 10,
                color: "rgba(255,255,255,0.25)",
                transition: "transform 0.2s ease",
                transform: expanded === i ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              ›
            </span>
          </button>

          {expanded === i && (
            <div
              style={{
                padding: "8px 12px 4px 40px",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.7,
                animation: "slideDown 0.2s ease",
              }}
            >
              {section.text}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Contextual hint logic ────────────────────────────────────────────────────

export interface GameHint {
  id: string;
  message: string;
  condition: (state: {
    hunger: number;
    happiness: number;
    energy: number;
    health: number;
    totalDecisions: number;
    totalUserActions: number;
    streakDays: number;
    stage: string;
  }) => boolean;
}

export const GAME_HINTS: GameHint[] = [
  {
    id: "first_action",
    message: "Нажми любую кнопку! Твои действия дают нейросети в 3× больше опыта, чем когда она действует сама.",
    condition: ({ totalUserActions, totalDecisions }) => totalUserActions === 0 && totalDecisions >= 3,
  },
  {
    id: "hungry_warning",
    message: "⚠️ Существо голодает! При голоде > 80% здоровье начинает падать. Покорми его!",
    condition: ({ hunger }) => hunger > 75,
  },
  {
    id: "low_energy",
    message: "😴 Энергия на нуле — ИИ не может обучаться! Уложи существо спать.",
    condition: ({ energy }) => energy < 15,
  },
  {
    id: "low_happiness",
    message: "😔 Радость низкая — нейросеть обучается медленнее. Поиграй с существом!",
    condition: ({ happiness }) => happiness < 20,
  },
  {
    id: "streak_tip",
    message: "🔥 Заходи каждый день — стрик даёт бонус XP и нужен для эволюции в Подростка (30 дней).",
    condition: ({ streakDays, stage }) => streakDays < 3 && stage === "child",
  },
  {
    id: "brain_tip",
    message: "🧠 Нажми кнопку «Мозг» — увидишь как нейросеть думает: веса, loss, epsilon и историю решений.",
    condition: ({ totalDecisions }) => totalDecisions === 10,
  },
  {
    id: "mutation_ready",
    message: "🔀 Мозг скоро мутирует! После ~30 решений инстинкты случайно изменятся — существо станет уникальным.",
    condition: ({ totalDecisions }) => totalDecisions > 0 && totalDecisions % 25 === 0,
  },
];

/**
 * AI Tamagotchi — Onboarding Screen
 * Design: Biopunk / Organic Circuitry
 *
 * Shown on first launch. Explains what this AI is, how it works,
 * and why the user's participation matters.
 */

import { useState, useEffect } from "react";
import { getStageColor } from "@/lib/brain";

interface OnboardingProps {
  onComplete: (name: string) => void;
}

const SLIDES = [
  {
    icon: "🧬",
    title: "Это живой ИИ",
    body: "Внутри — настоящая нейросеть TensorFlow.js (DQN). Существо не следует скрипту. Оно обучается прямо на твоём телефоне, принимает решения и меняется.",
    accent: "#00FFD1",
  },
  {
    icon: "🧠",
    title: "Оно думает само",
    body: "Каждые несколько секунд мозг анализирует своё состояние и выбирает действие. Со временем оно начинает делать это лучше — без твоей помощи.",
    accent: "#4DA6FF",
  },
  {
    icon: "⚡",
    title: "Ты — ускоритель",
    body: "Без тебя существо выживает, но медленно растёт. Каждое твоё действие даёт ему в 3× больше опыта. Ты не нянька — ты учитель.",
    accent: "#8B5CF6",
  },
  {
    icon: "🔀",
    title: "Мутации",
    body: "Иногда мозг мутирует — случайно меняет свои инстинкты. Это делает каждое существо уникальным. Твоё существо никогда не будет таким же как чужое.",
    accent: "#C800FF",
  },
  {
    icon: "🌱",
    title: "6 стадий жизни",
    body: "Яйцо → Птенец → Малыш → Подросток → Взрослый → Мудрец. Чем больше решений принял мозг — тем выше стадия. Внешность меняется вместе с разумом.",
    accent: "#FF6B9D",
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [slide, setSlide] = useState(0);
  const [name, setName] = useState("");
  const [nameStep, setNameStep] = useState(false);
  const [visible, setVisible] = useState(true);

  const current = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

  const goNext = () => {
    setVisible(false);
    setTimeout(() => {
      if (isLast) {
        setNameStep(true);
      } else {
        setSlide((s) => s + 1);
      }
      setVisible(true);
    }, 200);
  };

  const handleStart = () => {
    const finalName = name.trim() || "Bytechi";
    onComplete(finalName);
  };

  if (nameStep) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#050810",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 24px",
          gap: 24,
          fontFamily: "Space Grotesk, sans-serif",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "radial-gradient(circle, #00FFD115 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ fontSize: 52, animation: "blobPulse 2s ease-in-out infinite" }}>🥚</div>

        <div style={{ textAlign: "center", maxWidth: 300 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            Дай имя своему ИИ
          </div>
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.6,
            }}
          >
            Оно будет жить, учиться и эволюционировать. Имя останется навсегда.
          </div>
        </div>

        <input
          type="text"
          placeholder="Bytechi"
          maxLength={16}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
          autoFocus
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(0,255,209,0.3)",
            borderRadius: 14,
            padding: "14px 18px",
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            textAlign: "center",
            outline: "none",
            width: "100%",
            maxWidth: 280,
            caretColor: "#00FFD1",
          }}
        />

        <button
          onClick={handleStart}
          style={{
            background: "linear-gradient(135deg, #00FFD122, #00FFD108)",
            border: "1px solid #00FFD166",
            borderRadius: 16,
            padding: "14px 40px",
            cursor: "pointer",
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 15,
            fontWeight: 800,
            color: "#00FFD1",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            boxShadow: "0 0 24px #00FFD122",
            transition: "all 0.2s ease",
          }}
        >
          Создать существо →
        </button>

        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.2)",
            textAlign: "center",
          }}
        >
          Оставь пустым — имя будет "Bytechi"
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#050810",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "48px 24px 40px",
        fontFamily: "Space Grotesk, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          top: "25%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${current.accent}12 0%, transparent 70%)`,
          pointerEvents: "none",
          transition: "background 0.5s ease",
        }}
      />

      {/* Skip */}
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => setNameStep(true)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            color: "rgba(255,255,255,0.25)",
            padding: "4px 0",
          }}
        >
          пропустить →
        </button>
      </div>

      {/* Slide content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          maxWidth: 320,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: 64,
            filter: `drop-shadow(0 0 20px ${current.accent}66)`,
            animation: "blobPulse 2.5s ease-in-out infinite",
          }}
        >
          {current.icon}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: current.accent,
            textAlign: "center",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            textShadow: `0 0 30px ${current.accent}44`,
            transition: "color 0.3s ease",
          }}
        >
          {current.title}
        </div>

        {/* Body */}
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 13,
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            lineHeight: 1.7,
          }}
        >
          {current.body}
        </div>
      </div>

      {/* Bottom: dots + button */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          width: "100%",
          maxWidth: 320,
        }}
      >
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 8 }}>
          {SLIDES.map((s, i) => (
            <div
              key={i}
              style={{
                width: i === slide ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === slide ? current.accent : "rgba(255,255,255,0.15)",
                transition: "all 0.3s ease",
                boxShadow: i === slide ? `0 0 8px ${current.accent}` : "none",
              }}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={goNext}
          style={{
            width: "100%",
            background: `linear-gradient(135deg, ${current.accent}22, ${current.accent}08)`,
            border: `1px solid ${current.accent}55`,
            borderRadius: 16,
            padding: "15px",
            cursor: "pointer",
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 15,
            fontWeight: 800,
            color: current.accent,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            boxShadow: `0 0 20px ${current.accent}18`,
            transition: "all 0.3s ease",
          }}
        >
          {isLast ? "Создать существо →" : "Далее →"}
        </button>
      </div>
    </div>
  );
}

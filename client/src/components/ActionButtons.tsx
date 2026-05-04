/**
 * AI Tamagotchi — Action Buttons
 * Design: Biopunk / Organic Circuitry
 * Glowing border buttons that react to creature state
 */

import { useState } from "react";
import { GameActions } from "@/hooks/useGame";
import { EvolutionStage, getStageColor } from "@/lib/brain";

interface ActionButtonsProps {
  actions: GameActions;
  stage: EvolutionStage;
  disabled?: boolean;
  hunger: number;
  happiness: number;
  energy: number;
  health: number;
}

const BUTTON_CONFIG = [
  { key: "feed" as const,  label: "Покорми",  icon: "🍖", hint: "hunger" },
  { key: "play" as const,  label: "Поиграй",  icon: "⚡", hint: "happiness" },
  { key: "sleep" as const, label: "Поспи",    icon: "💤", hint: "energy" },
  { key: "clean" as const, label: "Почисти",  icon: "✨", hint: "health" },
];

export default function ActionButtons({
  actions,
  stage,
  disabled = false,
  hunger,
  happiness,
  energy,
  health,
}: ActionButtonsProps) {
  const [pressed, setPressed] = useState<string | null>(null);
  const color = getStageColor(stage);

  const urgency: Record<string, number> = {
    feed:  hunger > 70 ? 1 : hunger > 50 ? 0.5 : 0,
    play:  happiness < 30 ? 1 : happiness < 50 ? 0.5 : 0,
    sleep: energy < 30 ? 1 : energy < 50 ? 0.5 : 0,
    clean: health < 40 ? 1 : health < 60 ? 0.5 : 0,
  };

  const handlePress = (key: keyof GameActions) => {
    if (disabled || key === "reset") return;
    setPressed(key);
    actions[key]();
    setTimeout(() => setPressed(null), 300);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        width: "100%",
      }}
    >
      {BUTTON_CONFIG.map(({ key, label, icon }) => {
        const isPressed = pressed === key;
        const urg = urgency[key];
        const borderColor = urg > 0.7
          ? "#FF4444"
          : urg > 0.3
          ? "#FFB800"
          : color;

        return (
          <button
            key={key}
            onClick={() => handlePress(key)}
            disabled={disabled}
            style={{
              background: isPressed
                ? `${borderColor}22`
                : `rgba(0,0,0,0.4)`,
              border: `1px solid ${borderColor}${urg > 0.5 ? "cc" : "55"}`,
              borderRadius: 12,
              padding: "10px 8px",
              cursor: disabled ? "not-allowed" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              transform: isPressed ? "scale(0.94)" : "scale(1)",
              transition: "transform 0.12s cubic-bezier(0.34,1.56,0.64,1), background 0.2s, border-color 0.3s",
              boxShadow: urg > 0.5
                ? `0 0 12px ${borderColor}44, inset 0 0 8px ${borderColor}11`
                : `0 0 4px ${borderColor}22`,
              opacity: disabled ? 0.4 : 1,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Urgency pulse ring */}
            {urg > 0.7 && (
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 12,
                  border: `2px solid ${borderColor}`,
                  animation: "urgencyPulse 1.2s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />
            )}

            <span style={{ fontSize: 22 }}>{icon}</span>
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 11,
                fontWeight: 600,
                color: borderColor,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

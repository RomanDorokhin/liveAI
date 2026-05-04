/**
 * AI Tamagotchi — Mutation Notification Popup
 * Design: Biopunk / Organic Circuitry
 */

import { EvolutionStage, getStageColor } from "@/lib/brain";

interface MutationPopupProps {
  name: string;
  description: string;
  stage: EvolutionStage;
}

export default function MutationPopup({ name, description, stage }: MutationPopupProps) {
  const color = getStageColor(stage);

  return (
    <div
      style={{
        position: "fixed",
        top: 80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        background: "rgba(5,8,16,0.95)",
        border: `1px solid ${color}88`,
        borderRadius: 16,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: `0 0 30px ${color}33, 0 8px 32px rgba(0,0,0,0.6)`,
        backdropFilter: "blur(12px)",
        maxWidth: 300,
        animation: "slideDown 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        minWidth: 240,
      }}
    >
      <div
        style={{
          fontSize: 28,
          filter: `drop-shadow(0 0 10px ${color})`,
          animation: "blobPulse 1s ease-in-out infinite",
          flexShrink: 0,
        }}
      >
        🔀
      </div>
      <div>
        <div
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 13,
            fontWeight: 800,
            color,
            marginBottom: 2,
          }}
        >
          Мутация: {name}
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}

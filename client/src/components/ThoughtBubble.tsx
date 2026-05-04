/**
 * AI Tamagotchi — Thought Bubble
 * Design: Biopunk / Organic Circuitry
 * Fades in/out with creature thoughts
 */

import { useEffect, useState } from "react";
import { EvolutionStage, getStageColor } from "@/lib/brain";

interface ThoughtBubbleProps {
  thought: string;
  isVisible: boolean;
  stage: EvolutionStage;
}

export default function ThoughtBubble({ thought, isVisible, stage }: ThoughtBubbleProps) {
  const [displayed, setDisplayed] = useState(thought);
  const color = getStageColor(stage);

  useEffect(() => {
    if (isVisible) setDisplayed(thought);
  }, [thought, isVisible]);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0) scale(1)" : "translateY(4px) scale(0.97)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        background: `rgba(0,0,0,0.7)`,
        border: `1px solid ${color}44`,
        borderRadius: 12,
        padding: "7px 12px",
        backdropFilter: "blur(8px)",
        maxWidth: "100%",
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: 12,
          fontStyle: "italic",
          color: `${color}dd`,
          letterSpacing: "0.01em",
        }}
      >
        {displayed}
      </span>
    </div>
  );
}

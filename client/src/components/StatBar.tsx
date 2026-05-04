/**
 * AI Tamagotchi — Stat Bar Component
 * Design: Biopunk / Organic Circuitry
 * Dark background, glowing bar fill, monospace labels
 */

interface StatBarProps {
  label: string;
  value: number;
  color: string;
  icon: string;
  inverted?: boolean; // if true, low value = danger (hunger)
}

export default function StatBar({ label, value, color, icon, inverted = false }: StatBarProps) {
  const danger = inverted ? value > 75 : value < 25;
  const warning = inverted ? value > 55 : value < 40;

  const barColor = danger
    ? "#FF4444"
    : warning
    ? "#FFB800"
    : color;

  const displayValue = inverted ? 100 - value : value; // show "fullness" not "hunger"

  return (
    <div className="flex items-center gap-2 w-full">
      <span style={{ fontSize: 14, minWidth: 18, textAlign: "center" }}>{icon}</span>
      <span
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 10,
          color: "rgba(255,255,255,0.5)",
          minWidth: 52,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 6,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${displayValue}%`,
            height: "100%",
            background: barColor,
            borderRadius: 3,
            boxShadow: `0 0 8px ${barColor}88`,
            transition: "width 0.5s ease, background 0.3s ease",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 10,
          color: barColor,
          minWidth: 28,
          textAlign: "right",
          transition: "color 0.3s ease",
        }}
      >
        {Math.round(displayValue)}
      </span>
    </div>
  );
}

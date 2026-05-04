/**
 * ShareCard — генерирует карточку питомца для шеринга в Telegram
 *
 * Рисует Canvas с:
 *   - Именем и стадией питомца
 *   - Стриком и XP
 *   - Мутациями
 *   - Индикатором умности
 *   - Ссылкой на smolgame
 *
 * Кнопка "Поделиться" использует Telegram.WebApp.shareMessage или
 * копирует текст в буфер обмена как fallback.
 */

import { useRef, useEffect, useState } from "react";
import { EvolutionStage, getStageColor, getStageName } from "@/lib/brain";

interface ShareCardProps {
  petName: string;
  stage: EvolutionStage;
  xp: number;
  streakDays: number;
  mutationCount: number;
  mutationNames: string[];
  intelligenceScore: number;
  totalDecisions: number;
  onClose: () => void;
}

export default function ShareCard({
  petName,
  stage,
  xp,
  streakDays,
  mutationCount,
  mutationNames,
  intelligenceScore,
  totalDecisions,
  onClose,
}: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const color = getStageColor(stage);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 360;
    const H = 200;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = "#050810";
    ctx.fillRect(0, 0, W, H);

    // Glow circle
    const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 120);
    grd.addColorStop(0, color + "18");
    grd.addColorStop(1, "transparent");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = color + "44";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(4, 4, W - 8, H - 8, 14);
    ctx.stroke();

    // Stage icon (emoji as text)
    const stageEmojis: Record<EvolutionStage, string> = {
      egg: "🥚", hatchling: "🐣", child: "🌱", teen: "⚡", adult: "🔥", sage: "✨",
    };
    ctx.font = "36px serif";
    ctx.textAlign = "left";
    ctx.fillText(stageEmojis[stage], 20, 58);

    // Pet name
    ctx.font = "bold 22px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(petName, 70, 46);

    // Stage name
    ctx.font = "12px 'JetBrains Mono', monospace";
    ctx.fillStyle = color;
    ctx.fillText(getStageName(stage).toUpperCase(), 70, 64);

    // Divider
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 78);
    ctx.lineTo(W - 20, 78);
    ctx.stroke();

    // Stats row
    const stats = [
      { label: "XP", value: xp.toLocaleString() },
      { label: "Стрик", value: `${streakDays}д` },
      { label: "IQ", value: `${intelligenceScore}/100` },
      { label: "Решений", value: totalDecisions.toString() },
    ];
    ctx.font = "bold 14px 'Space Grotesk', sans-serif";
    stats.forEach((s, i) => {
      const x = 20 + i * 84;
      ctx.fillStyle = color;
      ctx.textAlign = "left";
      ctx.fillText(s.value, x, 104);
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillText(s.label, x, 118);
      ctx.font = "bold 14px 'Space Grotesk', sans-serif";
    });

    // Mutations
    if (mutationNames.length > 0) {
      ctx.font = "10px 'Space Grotesk', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.textAlign = "left";
      const mutText = "Мутации: " + mutationNames.slice(0, 3).join(", ") + (mutationNames.length > 3 ? "..." : "");
      ctx.fillText(mutText, 20, 142);
    }

    // Bottom label
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = color + "88";
    ctx.textAlign = "center";
    ctx.fillText("AI Tamagotchi • smolgame", W / 2, H - 14);

  }, [petName, stage, xp, streakDays, mutationCount, mutationNames, intelligenceScore, totalDecisions, color]);

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const text = `🤖 Мой ИИ-питомец ${petName} (${getStageName(stage)})\n⚡ ${xp.toLocaleString()} XP • 🔥 ${streakDays} дней стрика • 🧠 IQ ${intelligenceScore}/100\nИграй в AI Tamagotchi на smolgame!`;

    // Try Telegram share
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.shareMessage) {
        tg.shareMessage(text);
        return;
      }
      if (tg?.openTelegramLink) {
        const encoded = encodeURIComponent(text);
        tg.openTelegramLink(`https://t.me/share/url?url=smolgame&text=${encoded}`);
        return;
      }
    } catch {}

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        backdropFilter: "blur(6px)",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          maxWidth: 380,
          width: "100%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 16, fontWeight: 700, color: "#fff" }}>
          Карточка питомца
        </div>

        {/* Canvas preview */}
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            borderRadius: 14,
            border: `1px solid ${color}33`,
            boxShadow: `0 0 30px ${color}22`,
          }}
        />

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "11px",
              cursor: "pointer",
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Закрыть
          </button>
          <button
            onClick={handleShare}
            style={{
              flex: 2,
              background: `${color}22`,
              border: `1px solid ${color}66`,
              borderRadius: 12,
              padding: "11px",
              cursor: "pointer",
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: color,
              boxShadow: `0 0 16px ${color}22`,
            }}
          >
            {copied ? "✓ Скопировано!" : "📤 Поделиться"}
          </button>
        </div>
      </div>
    </div>
  );
}

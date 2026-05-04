/**
 * AI Tamagotchi — Neural Network Visualization
 * Design: Biopunk / Organic Circuitry
 *
 * Canvas-based visualization of the Q-learning neural network.
 * Nodes pulse and connections glow when decisions fire.
 */

import { useEffect, useRef } from "react";
import { NeuralNode } from "@/lib/brain";

interface NeuralNetProps {
  nodes: NeuralNode[];
  color: string;
  isThinking: boolean;
  width?: number;
  height?: number;
}

export default function NeuralNet({
  nodes,
  color,
  isThinking,
  width = 300,
  height = 160,
}: NeuralNetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Parse hex color to rgb
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    const rgb = hexToRgb(color.startsWith("#") ? color : "#00FFD1");

    const draw = () => {
      timeRef.current += 0.02;
      const t = timeRef.current;

      ctx.clearRect(0, 0, width, height);

      // Draw connections
      nodes.forEach((node) => {
        node.connections.forEach((conn) => {
          const target = nodes.find((n) => n.id === conn.targetId);
          if (!target) return;

          const x1 = node.x * width;
          const y1 = node.y * height;
          const x2 = target.x * width;
          const y2 = target.y * height;

          const activation = (node.activation + target.activation) / 2;
          const pulse = isThinking
            ? 0.5 + 0.5 * Math.sin(t * 8 + node.x * 10)
            : 0.2 + activation * 0.4;

          ctx.beginPath();
          ctx.moveTo(x1, y1);

          // Slightly curved connections
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2 + (Math.sin(node.x * 5) * 8);
          ctx.quadraticCurveTo(mx, my, x2, y2);

          ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${pulse * conn.weight * 0.8})`;
          ctx.lineWidth = conn.weight * 1.5;
          ctx.stroke();
        });
      });

      // Draw nodes
      nodes.forEach((node) => {
        const x = node.x * width;
        const y = node.y * height;
        const activation = node.activation;
        const pulse = isThinking
          ? 0.6 + 0.4 * Math.sin(t * 6 + node.y * 8)
          : 0.3 + activation * 0.7;

        const radius = 4 + activation * 5;

        // Outer glow
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.5);
        grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${pulse * 0.8})`);
        grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);

        ctx.beginPath();
        ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core node
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${pulse})`;
        ctx.fill();

        // Label for output nodes
        if (node.label && node.x > 0.6) {
          ctx.font = "8px JetBrains Mono, monospace";
          ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${0.6 + activation * 0.4})`;
          ctx.textAlign = "left";
          ctx.fillText(node.label, x + radius + 3, y + 3);
        }

        // Label for input nodes
        if (node.label && node.x < 0.2) {
          ctx.font = "8px JetBrains Mono, monospace";
          ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${0.6 + activation * 0.4})`;
          ctx.textAlign = "right";
          ctx.fillText(node.label, x - radius - 3, y + 3);
        }
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [nodes, color, isThinking, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: "100%",
        height: "auto",
        borderRadius: "12px",
        background: "rgba(0,0,0,0.3)",
      }}
    />
  );
}

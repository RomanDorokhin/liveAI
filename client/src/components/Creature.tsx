/**
 * AI Tamagotchi — Creature Visual Component
 * Design: Biopunk / Organic Circuitry
 *
 * Animated SVG blob creature with:
 * - Blob morphing per evolution stage
 * - Random blinking
 * - Thinking jolt
 * - Idle animations: yawn, stretch, low-health trembling
 */

import { useEffect, useRef, useState } from "react";
import { EvolutionStage, getStageColor } from "@/lib/brain";

interface CreatureProps {
  stage: EvolutionStage;
  hunger: number;
  happiness: number;
  health: number;
  energy: number;
  isThinking: boolean;
  isAlive: boolean;
}

// Blob path morphing keyframes per stage
const BLOB_PATHS: Record<EvolutionStage, string[]> = {
  egg: [
    "M50,20 C70,20 80,35 80,50 C80,65 70,80 50,80 C30,80 20,65 20,50 C20,35 30,20 50,20",
    "M50,18 C72,18 82,34 82,50 C82,66 72,82 50,82 C28,82 18,66 18,50 C18,34 28,18 50,18",
    "M50,20 C68,20 80,35 80,50 C80,65 68,80 50,80 C32,80 20,65 20,50 C20,35 32,20 50,20",
  ],
  hatchling: [
    "M50,15 C72,12 85,30 88,50 C91,70 75,88 50,88 C25,88 12,70 14,50 C16,30 28,18 50,15",
    "M50,13 C74,10 87,28 90,50 C93,72 77,90 50,90 C23,90 10,72 12,50 C14,28 26,16 50,13",
    "M50,15 C70,12 83,30 86,50 C89,70 73,88 50,88 C27,88 14,70 16,50 C18,30 30,18 50,15",
  ],
  child: [
    "M50,10 C75,8 92,28 94,52 C96,76 78,94 50,92 C22,90 6,72 8,48 C10,24 25,12 50,10",
    "M50,8 C77,6 94,26 96,52 C98,78 80,96 50,94 C20,92 4,74 6,48 C8,22 23,10 50,8",
    "M50,10 C73,8 90,28 92,52 C94,76 76,94 50,92 C24,90 8,72 10,48 C12,24 27,12 50,10",
  ],
  teen: [
    "M50,8 C78,5 96,26 97,53 C98,80 80,97 50,95 C20,93 3,76 4,49 C5,22 22,11 50,8",
    "M52,6 C80,3 98,24 99,51 C100,78 82,97 52,95 C22,93 2,76 3,49 C4,22 24,9 52,6",
    "M48,8 C76,5 94,26 95,53 C96,80 78,97 48,95 C18,93 1,76 2,49 C3,22 20,11 48,8",
  ],
  adult: [
    "M50,5 C80,2 98,22 99,52 C100,82 82,98 50,96 C18,94 1,78 2,48 C3,18 20,8 50,5",
    "M53,3 C83,0 101,20 102,52 C103,84 85,100 53,98 C21,96 0,80 1,50 C2,20 23,6 53,3",
    "M47,5 C77,2 95,22 96,52 C97,82 79,98 47,96 C15,94 -2,78 -1,48 C0,18 17,8 47,5",
  ],
  sage: [
    "M50,3 C82,0 100,20 101,52 C102,84 84,101 50,99 C16,97 -1,80 0,48 C1,16 18,6 50,3",
    "M50,1 C84,-2 102,18 103,52 C104,86 86,103 50,101 C14,99 -3,82 -2,48 C-1,14 16,4 50,1",
    "M50,3 C80,0 98,20 99,52 C100,84 82,101 50,99 C18,97 1,80 2,48 C3,16 20,6 50,3",
  ],
};

// Eye positions per stage
const EYE_CONFIG: Record<EvolutionStage, { left: [number, number]; right: [number, number]; size: number }> = {
  egg:      { left: [42, 44], right: [58, 44], size: 3 },
  hatchling:{ left: [40, 42], right: [60, 42], size: 4 },
  child:    { left: [38, 40], right: [62, 40], size: 5 },
  teen:     { left: [36, 38], right: [64, 38], size: 6 },
  adult:    { left: [34, 36], right: [66, 36], size: 7 },
  sage:     { left: [33, 34], right: [67, 34], size: 8 },
};

// Mouth expressions
function getMouthPath(happiness: number, isThinking: boolean, isYawning: boolean): string {
  if (isYawning) return "M 38 58 Q 50 72 62 58"; // wide open yawn
  if (isThinking) return "M 42 58 Q 50 54 58 58"; // neutral thinking
  if (happiness > 70) return "M 40 56 Q 50 66 60 56"; // big smile
  if (happiness > 40) return "M 42 58 Q 50 63 58 58"; // small smile
  if (happiness > 20) return "M 42 58 Q 50 58 58 58"; // flat
  return "M 42 60 Q 50 54 58 60"; // sad
}

// Idle animation state type
type IdleState = "normal" | "yawn" | "stretch";

export default function Creature({
  stage,
  hunger,
  happiness,
  health,
  energy,
  isThinking,
  isAlive,
}: CreatureProps) {
  const [pathIndex, setPathIndex] = useState(0);
  const [blinkState, setBlinkState] = useState(false);
  const [jolt, setJolt] = useState(false);
  const [idleState, setIdleState] = useState<IdleState>("normal");
  const [trembleOffset, setTrembleOffset] = useState(0);
  const prevThinking = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trembleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const color = getStageColor(stage);
  const paths = BLOB_PATHS[stage];
  const eyes = EYE_CONFIG[stage];

  // Blob morphing animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPathIndex((i) => (i + 1) % paths.length);
    }, 2000 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, [paths.length]);

  // Random blinking (improved: double-blink occasionally)
  useEffect(() => {
    let cancelled = false;
    const scheduleBlink = () => {
      if (cancelled) return;
      const delay = 2000 + Math.random() * 4000;
      setTimeout(() => {
        if (cancelled) return;
        // Occasionally double-blink
        const doubleBlink = Math.random() < 0.25;
        setBlinkState(true);
        setTimeout(() => {
          setBlinkState(false);
          if (doubleBlink) {
            setTimeout(() => {
              setBlinkState(true);
              setTimeout(() => {
                setBlinkState(false);
                scheduleBlink();
              }, 100);
            }, 180);
          } else {
            scheduleBlink();
          }
        }, 120);
      }, delay);
    };
    const t = setTimeout(scheduleBlink, 800);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  // Jolt on new thinking
  useEffect(() => {
    if (isThinking && !prevThinking.current) {
      setJolt(true);
      setTimeout(() => setJolt(false), 400);
    }
    prevThinking.current = isThinking;
  }, [isThinking]);

  // Idle animations: yawn and stretch
  useEffect(() => {
    if (!isAlive) return;

    const scheduleIdle = () => {
      // Random delay 20-60 seconds
      const delay = 20_000 + Math.random() * 40_000;
      idleTimerRef.current = setTimeout(() => {
        if (!isAlive) { scheduleIdle(); return; }

        // Pick random idle: yawn (60%) or stretch (40%)
        const type: IdleState = Math.random() < 0.6 ? "yawn" : "stretch";
        setIdleState(type);

        // Duration: yawn 2s, stretch 1.5s
        const duration = type === "yawn" ? 2000 : 1500;
        setTimeout(() => {
          setIdleState("normal");
          scheduleIdle();
        }, duration);
      }, delay);
    };

    scheduleIdle();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isAlive]);

  // Low-health trembling
  useEffect(() => {
    if (health < 25 && isAlive) {
      trembleIntervalRef.current = setInterval(() => {
        setTrembleOffset((Math.random() - 0.5) * 3);
      }, 80);
    } else {
      if (trembleIntervalRef.current) clearInterval(trembleIntervalRef.current);
      setTrembleOffset(0);
    }
    return () => {
      if (trembleIntervalRef.current) clearInterval(trembleIntervalRef.current);
    };
  }, [health, isAlive]);

  // Compute vitality for glow intensity
  const vitality = (health + energy) / 200;
  const glowRadius = 8 + vitality * 12;
  const glowOpacity = 0.4 + vitality * 0.5;

  // Hunger makes creature slightly red-tinted
  const hungerTint = hunger > 70 ? `rgba(255,80,80,${(hunger - 70) / 100})` : "transparent";

  const currentPath = paths[pathIndex];
  const isYawning = idleState === "yawn";
  const isStretching = idleState === "stretch";
  const mouthPath = getMouthPath(happiness, isThinking, isYawning);

  // Stretch transform: body scales up vertically
  const stretchScale = isStretching ? "scaleY(1.12)" : "scaleY(1)";

  // Yawn: eyes squint (reduced ry)
  const eyeRy = isYawning
    ? eyes.size * 0.3
    : blinkState
    ? 0.5
    : eyes.size;

  // Combine transforms
  const containerTransform = [
    jolt ? "scale(1.08) rotate(-2deg)" : "scale(1) rotate(0deg)",
  ].join(" ");

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{
        width: "100%",
        aspectRatio: "1",
        maxWidth: 260,
        transform: `${containerTransform} translateX(${trembleOffset}px)`,
        transition: jolt
          ? "transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)"
          : "transform 0.08s ease",
        filter: !isAlive ? "grayscale(1) opacity(0.5)" : undefined,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          height: "100%",
          overflow: "visible",
          transform: stretchScale,
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <defs>
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={glowRadius * 0.4} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Outer aura filter */}
          <filter id="aura" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation={glowRadius} result="blur" />
          </filter>

          {/* Organic turbulence for texture */}
          <filter id="organic">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.04"
              numOctaves="3"
              seed={Math.floor(Date.now() / 3000) % 100}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Gradient fill */}
          <radialGradient id="bodyGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="60%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </radialGradient>

          {/* Hunger tint overlay */}
          <radialGradient id="hungerGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor={hungerTint} />
          </radialGradient>
        </defs>

        {/* Outer aura glow */}
        <path
          d={currentPath}
          fill={color}
          opacity={glowOpacity * 0.3}
          filter="url(#aura)"
          style={{ transition: "d 1.8s ease-in-out" }}
        />

        {/* Main body */}
        <path
          d={currentPath}
          fill="url(#bodyGrad)"
          filter="url(#glow)"
          style={{
            transition: "d 1.8s ease-in-out",
          }}
        />

        {/* Hunger tint */}
        {hunger > 70 && (
          <path
            d={currentPath}
            fill={`rgba(255,60,60,${(hunger - 70) / 150})`}
            style={{ transition: "d 1.8s ease-in-out" }}
          />
        )}

        {/* Circuit trace lines (appear at higher stages) */}
        {(stage === "teen" || stage === "adult" || stage === "sage") && (
          <g opacity={0.25} stroke={color} strokeWidth="0.5" fill="none">
            <path d="M 35 45 L 45 40 L 55 45 L 65 40" />
            <path d="M 40 55 L 50 50 L 60 55" />
            <circle cx="45" cy="40" r="1.5" fill={color} />
            <circle cx="55" cy="45" r="1.5" fill={color} />
          </g>
        )}

        {/* Eyes */}
        {isAlive && (
          <g>
            {/* Left eye */}
            <ellipse
              cx={eyes.left[0]}
              cy={eyes.left[1]}
              rx={eyes.size}
              ry={eyeRy}
              fill={color}
              style={{ transition: "ry 0.1s ease" }}
            />
            <ellipse
              cx={eyes.left[0] + 1}
              cy={eyes.left[1] - 1}
              rx={eyes.size * 0.4}
              ry={blinkState || isYawning ? 0 : eyes.size * 0.4}
              fill="rgba(255,255,255,0.8)"
              style={{ transition: "ry 0.1s ease" }}
            />

            {/* Right eye */}
            <ellipse
              cx={eyes.right[0]}
              cy={eyes.right[1]}
              rx={eyes.size}
              ry={eyeRy}
              fill={color}
              style={{ transition: "ry 0.1s ease" }}
            />
            <ellipse
              cx={eyes.right[0] + 1}
              cy={eyes.right[1] - 1}
              rx={eyes.size * 0.4}
              ry={blinkState || isYawning ? 0 : eyes.size * 0.4}
              fill="rgba(255,255,255,0.8)"
              style={{ transition: "ry 0.1s ease" }}
            />

            {/* Yawn: small "z" particles */}
            {isYawning && (
              <g fill={color} opacity="0.7" fontFamily="monospace" fontSize="6">
                <text x="68" y="30">
                  z
                  <animate attributeName="opacity" values="0;0.8;0" dur="1s" repeatCount="indefinite" />
                  <animate attributeName="y" values="30;22;14" dur="1s" repeatCount="indefinite" />
                </text>
                <text x="73" y="24" fontSize="4">
                  z
                  <animate attributeName="opacity" values="0;0.6;0" dur="1s" begin="0.3s" repeatCount="indefinite" />
                  <animate attributeName="y" values="24;18;12" dur="1s" begin="0.3s" repeatCount="indefinite" />
                </text>
              </g>
            )}
          </g>
        )}

        {/* Dead eyes */}
        {!isAlive && (
          <g stroke={color} strokeWidth="1.5" opacity="0.6">
            <line x1={eyes.left[0] - eyes.size} y1={eyes.left[1] - eyes.size} x2={eyes.left[0] + eyes.size} y2={eyes.left[1] + eyes.size} />
            <line x1={eyes.left[0] + eyes.size} y1={eyes.left[1] - eyes.size} x2={eyes.left[0] - eyes.size} y2={eyes.left[1] + eyes.size} />
            <line x1={eyes.right[0] - eyes.size} y1={eyes.right[1] - eyes.size} x2={eyes.right[0] + eyes.size} y2={eyes.right[1] + eyes.size} />
            <line x1={eyes.right[0] + eyes.size} y1={eyes.right[1] - eyes.size} x2={eyes.right[0] - eyes.size} y2={eyes.right[1] + eyes.size} />
          </g>
        )}

        {/* Mouth */}
        {isAlive && (
          <path
            d={mouthPath}
            stroke={color}
            strokeWidth={isYawning ? 2 : 1.5}
            fill={isYawning ? `${color}22` : "none"}
            strokeLinecap="round"
            style={{ transition: "d 0.4s ease" }}
          />
        )}

        {/* Thinking indicator */}
        {isThinking && (
          <g>
            <circle cx="72" cy="20" r="3" fill={color} opacity="0.9">
              <animate attributeName="r" values="3;5;3" dur="0.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.4;0.9" dur="0.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="80" cy="14" r="2" fill={color} opacity="0.7">
              <animate attributeName="r" values="2;3.5;2" dur="0.6s" begin="0.1s" repeatCount="indefinite" />
            </circle>
            <circle cx="86" cy="10" r="1.5" fill={color} opacity="0.5">
              <animate attributeName="r" values="1.5;2.5;1.5" dur="0.6s" begin="0.2s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {/* Low health warning pulse */}
        {health < 25 && isAlive && (
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,60,60,0.3)" strokeWidth="2">
            <animate attributeName="r" values="45;52;45" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Sage sparkles */}
        {stage === "sage" && (
          <g fill={color} opacity="0.6">
            {[
              [15, 20], [85, 25], [10, 70], [88, 72], [50, 8],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1.5">
                <animate
                  attributeName="opacity"
                  values="0.6;0;0.6"
                  dur={`${1.5 + i * 0.4}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="r"
                  values="1.5;3;1.5"
                  dur={`${1.5 + i * 0.4}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}

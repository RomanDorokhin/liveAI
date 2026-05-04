/**
 * AI Tamagotchi — Main Game Page v4
 * Design: Biopunk / Organic Circuitry
 *
 * v4 — Integrated:
 * - IntelligenceIndicator (IQ score from DQN metrics)
 * - DeathScreen (full life stats + epitaph)
 * - ShareCard (Canvas card for Telegram sharing)
 * - Sound effects via soundEngine
 * - 📤 Share button in header
 */

import { useState, useEffect, useRef } from "react";
import { useGame } from "@/hooks/useGame";
import {
  getStageColor,
  getStageName,
  hasCompletedOnboarding,
  markOnboardingComplete,
  createInitialTamagotchi,
  saveTamagotchi,
} from "@/lib/brain";
import Creature from "@/components/Creature";
import NeuralNet from "@/components/NeuralNet";
import StatBar from "@/components/StatBar";
import ActionButtons from "@/components/ActionButtons";
import BrainPanel from "@/components/BrainPanel";
import EvolutionBar from "@/components/EvolutionBar";
import ThoughtBubble from "@/components/ThoughtBubble";
import MutationPopup from "@/components/MutationPopup";
import UserImpact from "@/components/UserImpact";
import StreakBanner from "@/components/StreakBanner";
import DailyTaskCard from "@/components/DailyTaskCard";
import Achievements from "@/components/Achievements";
import Onboarding from "@/pages/Onboarding";
import { HintBubble, HelpPanel, GAME_HINTS } from "@/components/HelpSystem";
import IntelligenceIndicator from "@/components/IntelligenceIndicator";
import ShareCard from "@/components/ShareCard";
import DeathScreen from "@/components/DeathScreen";

export default function Home() {
  const [onboarded, setOnboarded] = useState(() => hasCompletedOnboarding());

  const { tama, actions, latestMutation, dayStartEvent } = useGame();
  const [showBrain, setShowBrain] = useState(false);
  const [brainTab, setBrainTab] = useState<"brain" | "impact" | "achievements" | "help">("brain");
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const shownHints = useRef<Set<string>>(new Set());
  const [showReset, setShowReset] = useState(false);
  const [showNotifStub, setShowNotifStub] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [evolutionFlash, setEvolutionFlash] = useState(false);
  const prevStageRef = useRef(tama.stage);

  const color = getStageColor(tama.stage);

  // Contextual hints
  useEffect(() => {
    const hintState = {
      hunger: tama.hunger,
      happiness: tama.happiness,
      energy: tama.energy,
      health: tama.health,
      totalDecisions: tama.brain.totalDecisions,
      totalUserActions: tama.totalUserActions,
      streakDays: tama.streakDays,
      stage: tama.stage,
    };
    for (const hint of GAME_HINTS) {
      if (!shownHints.current.has(hint.id) && hint.condition(hintState)) {
        shownHints.current.add(hint.id);
        setActiveHint(hint.message);
        break;
      }
    }
  }, [tama.hunger, tama.happiness, tama.energy, tama.brain.totalDecisions, tama.totalUserActions]);

  // Evolution flash
  useEffect(() => {
    if (prevStageRef.current !== tama.stage) {
      setEvolutionFlash(true);
      setTimeout(() => setEvolutionFlash(false), 900);
      prevStageRef.current = tama.stage;
    }
  }, [tama.stage]);

  const handleOnboardingComplete = (name: string) => {
    markOnboardingComplete();
    const fresh = createInitialTamagotchi(name);
    saveTamagotchi(fresh);
    setOnboarded(true);
    window.location.reload();
  };

  // Compute IQ from DQN stats
  const epsilon = (tama.brain as any).epsilon ?? 0.9;
  const loss = (tama.brain as any).loss ?? 0;
  const intelligenceScore = Math.min(
    Math.round(
      Math.max(0, (0.9 - epsilon) / 0.85) * 40 +
      Math.max(0, 1 - Math.min(loss / 2, 1)) * 35 +
      Math.min(Math.log10(tama.brain.totalDecisions + 1) / 3, 1) * 25
    ),
    100
  );

  if (!onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#050810",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingBottom: "env(safe-area-inset-bottom, 20px)",
        overflowX: "hidden",
        position: "relative",
        fontFamily: "Space Grotesk, sans-serif",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          top: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
          pointerEvents: "none",
          transition: "background 2.5s ease",
          zIndex: 0,
        }}
      />

      {/* Evolution flash */}
      {evolutionFlash && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: `radial-gradient(circle, ${color}50 0%, transparent 65%)`,
            pointerEvents: "none",
            zIndex: 50,
            animation: "fadeIn 0.15s ease forwards, fadeOut 0.75s ease 0.15s forwards",
          }}
        />
      )}

      {/* Mutation popup */}
      {latestMutation && (
        <MutationPopup
          name={latestMutation.name}
          description={latestMutation.description}
          stage={tama.stage}
        />
      )}

      {/* Streak banner */}
      {dayStartEvent?.isNewDay && (
        <StreakBanner
          streakDays={dayStartEvent.streakDays}
          streakBonus={dayStartEvent.streakBonus}
          isStreakBroken={dayStartEvent.isStreakBroken}
          stage={tama.stage}
        />
      )}

      {/* ── Death screen (replaces old dead overlay) ── */}
      {!tama.alive && (
        <DeathScreen
          petName={tama.name}
          stage={tama.stage}
          xp={tama.brain.totalXP}
          streakDays={tama.streakDays}
          longestStreak={tama.longestStreak}
          totalDecisions={tama.brain.totalDecisions}
          mutationCount={tama.brain.mutationCount}
          mutationNames={tama.brain.mutations.map((m) => m.name)}
          totalDaysActive={tama.totalDaysActive}
          totalUserActions={tama.totalUserActions}
          intelligenceScore={intelligenceScore}
          onReset={actions.reset}
          onShare={() => setShowShare(true)}
        />
      )}

      {/* ── Share card overlay ── */}
      {showShare && (
        <ShareCard
          petName={tama.name}
          stage={tama.stage}
          xp={tama.brain.totalXP}
          streakDays={tama.streakDays}
          mutationCount={tama.brain.mutationCount}
          mutationNames={tama.brain.mutations.map((m) => m.name)}
          intelligenceScore={intelligenceScore}
          totalDecisions={tama.brain.totalDecisions}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Content */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "12px 14px 28px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>
              {tama.name}
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 10,
                color: "rgba(255,255,255,0.35)",
                marginTop: 2,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span>{getStageName(tama.stage)}</span>
              {tama.streakDays > 1 && (
                <span style={{ color: "#FF9944" }}>🔥 {tama.streakDays}д</span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              onClick={() => setShowBrain((v) => !v)}
              style={{
                background: showBrain ? `${color}22` : "rgba(255,255,255,0.05)",
                border: `1px solid ${showBrain ? color + "66" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 10,
                padding: "6px 10px",
                cursor: "pointer",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 10,
                color: showBrain ? color : "rgba(255,255,255,0.4)",
                transition: "all 0.2s ease",
              }}
            >
              🧠 Мозг
            </button>
            <button
              onClick={() => setShowShare(true)}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "6px 8px",
                cursor: "pointer",
                fontSize: 14,
                color: "rgba(255,255,255,0.3)",
              }}
              title="Поделиться"
            >
              📤
            </button>
            <button
              onClick={() => setShowNotifStub(true)}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "6px 8px",
                cursor: "pointer",
                fontSize: 14,
                color: "rgba(255,255,255,0.3)",
              }}
              title="Уведомления"
            >
              🔔
            </button>
            <button
              onClick={() => setShowReset(true)}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "6px 8px",
                cursor: "pointer",
                fontSize: 14,
                color: "rgba(255,255,255,0.3)",
              }}
            >
              ↺
            </button>
          </div>
        </div>

        {/* ── Evolution bar ── */}
        <div style={{ width: "100%", marginBottom: 14 }}>
          <EvolutionBar
            stage={tama.stage}
            xp={tama.brain.totalXP}
            streakDays={tama.streakDays}
          />
        </div>

        {/* ── Daily task + weekly event ── */}
        <div style={{ width: "100%", marginBottom: 12 }}>
          <DailyTaskCard
            task={tama.dailyTask}
            weeklyEvent={tama.weeklyEvent}
            stage={tama.stage}
          />
        </div>

        {/* ── Creature zone ── */}
        <div
          style={{
            width: "100%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          {/* Neural net */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.55,
              pointerEvents: "none",
            }}
          >
            <NeuralNet
              nodes={tama.brain.neuralActivity}
              color={color}
              isThinking={tama.isThinking}
              width={340}
              height={220}
            />
          </div>

          {/* Creature */}
          <div
            style={{
              width: "65%",
              maxWidth: 240,
              position: "relative",
              zIndex: 2,
              paddingTop: 14,
              paddingBottom: 14,
            }}
          >
            <Creature
              stage={tama.stage}
              hunger={tama.hunger}
              happiness={tama.happiness}
              health={tama.health}
              energy={tama.energy}
              isThinking={tama.isThinking}
              isAlive={tama.alive}
            />
          </div>
        </div>

        {/* ── Thought bubble ── */}
        <div
          style={{
            width: "100%",
            marginBottom: 14,
            minHeight: 38,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <ThoughtBubble
            thought={tama.currentThought}
            isVisible={tama.isThinking}
            stage={tama.stage}
          />
        </div>

        {/* ── Stats ── */}
        <div
          style={{
            width: "100%",
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14,
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <StatBar label="Сытость" value={tama.hunger} color={color} icon="🍖" inverted />
          <StatBar label="Радость" value={tama.happiness} color={color} icon="⚡" />
          <StatBar label="Энергия" value={tama.energy} color={color} icon="💤" />
          <StatBar label="Здоровье" value={tama.health} color={color} icon="❤️" />
        </div>

        {/* ── Action buttons ── */}
        <div style={{ width: "100%", marginBottom: 12 }}>
          <ActionButtons
            actions={actions}
            stage={tama.stage}
            disabled={!tama.alive}
            hunger={tama.hunger}
            happiness={tama.happiness}
            energy={tama.energy}
            health={tama.health}
          />
        </div>

        {/* ── Contextual hint bubble ── */}
        {activeHint && (
          <div style={{ width: "100%", marginBottom: 8 }}>
            <HintBubble
              message={activeHint}
              color={color}
              onDismiss={() => setActiveHint(null)}
            />
          </div>
        )}

        {/* ── Brain panel ── */}
        {showBrain && (
          <div style={{ width: "100%", animation: "slideDown 0.25s ease" }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {(["brain", "impact", "achievements", "help"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBrainTab(tab)}
                  style={{
                    flex: 1,
                    background: brainTab === tab ? `${color}22` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${brainTab === tab ? color + "55" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 10,
                    padding: "7px",
                    cursor: "pointer",
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    color: brainTab === tab ? color : "rgba(255,255,255,0.35)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {tab === "brain" ? "🧠" : tab === "impact" ? "⚡" : tab === "achievements" ? "🏆" : "❓ Помощь"}
                </button>
              ))}
            </div>

            {brainTab === "brain" ? (
              <>
                <BrainPanel brain={tama.brain} stage={tama.stage} />
                {/* Intelligence indicator below brain panel */}
                <div style={{ marginTop: 8 }}>
                  <IntelligenceIndicator
                    epsilon={epsilon}
                    loss={loss}
                    totalDecisions={tama.brain.totalDecisions}
                    totalXP={tama.brain.totalXP}
                    stage={tama.stage}
                  />
                </div>
              </>
            ) : brainTab === "impact" ? (
              <UserImpact
                brain={tama.brain}
                totalUserActions={tama.totalUserActions}
                stage={tama.stage}
              />
            ) : brainTab === "achievements" ? (
              <Achievements tama={tama} />
            ) : (
              <HelpPanel color={color} />
            )}
          </div>
        )}

        {/* ── Notification stub modal ── */}
        {showNotifStub && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.82)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setShowNotifStub(false)}
          >
            <div
              style={{
                background: "#0D1117",
                border: `1px solid ${color}33`,
                borderRadius: 20,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                alignItems: "center",
                maxWidth: 300,
                width: "90%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 40 }}>🔔</div>
              <div style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 18,
                fontWeight: 800,
                color: "#fff",
                textAlign: "center",
              }}>
                Уведомления
              </div>
              <div style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
                color: "rgba(255,255,255,0.45)",
                textAlign: "center",
                lineHeight: 1.8,
              }}>
                Скоро здесь появится возможность получать напоминания когда существо голодает или готово к эволюции.
                <br /><br />
                <span style={{ color: `${color}99` }}>Функция будет доступна в следующем обновлении.</span>
              </div>
              <button
                onClick={() => setShowNotifStub(false)}
                style={{
                  background: `${color}18`,
                  border: `1px solid ${color}44`,
                  borderRadius: 12,
                  padding: "11px 28px",
                  cursor: "pointer",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  color,
                  marginTop: 4,
                }}
              >
                Понятно
              </button>
            </div>
          </div>
        )}

        {/* ── Reset confirm ── */}
        {showReset && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.82)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setShowReset(false)}
          >
            <div
              style={{
                background: "#0D1117",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                alignItems: "center",
                maxWidth: 290,
                width: "90%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 36 }}>⚠️</div>
              <div style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 17,
                fontWeight: 800,
                color: "#fff",
                textAlign: "center",
              }}>
                Сбросить прогресс?
              </div>
              <div style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                textAlign: "center",
                lineHeight: 1.6,
              }}>
                Мозг ИИ, все мутации, XP и стрик будут удалены. Существо начнёт с нуля.
              </div>
              <div style={{ display: "flex", gap: 10, width: "100%" }}>
                <button
                  onClick={() => setShowReset(false)}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: "11px",
                    cursor: "pointer",
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={() => { actions.reset(); setShowReset(false); }}
                  style={{
                    flex: 1,
                    background: "#FF444422",
                    border: "1px solid #FF444466",
                    borderRadius: 12,
                    padding: "11px",
                    cursor: "pointer",
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#FF6666",
                  }}
                >
                  Сбросить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

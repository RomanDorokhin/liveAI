/**
 * AI Tamagotchi — Achievements Panel
 * Design: Biopunk / Organic Circuitry
 *
 * Shows unlockable badges based on player actions, streaks, and milestones.
 * Achievements are the main long-term motivation for player engagement.
 */

import { EvolutionStage, TamagotchiState, getStageColor } from "@/lib/brain";

interface Achievement {
  id: string;
  icon: string;
  name: string;
  description: string;
  check: (tama: TamagotchiState) => boolean;
  category: "streak" | "evolution" | "brain" | "care" | "special";
}

const ALL_ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  { id: "streak_3",   icon: "⚡", name: "Первые шаги",     description: "3 дня подряд",          check: (t) => t.streakDays >= 3,   category: "streak" },
  { id: "streak_7",   icon: "🔥", name: "Неделя вместе",   description: "7 дней подряд",          check: (t) => t.streakDays >= 7,   category: "streak" },
  { id: "streak_14",  icon: "🌟", name: "Две недели",       description: "14 дней подряд",         check: (t) => t.streakDays >= 14,  category: "streak" },
  { id: "streak_30",  icon: "💎", name: "Месяц преданности",description: "30 дней подряд",         check: (t) => t.streakDays >= 30,  category: "streak" },
  { id: "streak_100", icon: "👑", name: "Легенда",          description: "100 дней подряд",        check: (t) => t.streakDays >= 100, category: "streak" },

  // Evolution achievements
  { id: "evo_hatch",  icon: "🐣", name: "Вылупился",        description: "Стадия: Птенец",         check: (t) => ["hatchling","child","teen","adult","sage"].includes(t.stage), category: "evolution" },
  { id: "evo_child",  icon: "🌱", name: "Малыш",            description: "Стадия: Малыш",          check: (t) => ["child","teen","adult","sage"].includes(t.stage),            category: "evolution" },
  { id: "evo_teen",   icon: "⚡", name: "Подросток",        description: "Стадия: Подросток",      check: (t) => ["teen","adult","sage"].includes(t.stage),                   category: "evolution" },
  { id: "evo_adult",  icon: "🔮", name: "Взрослый",         description: "Стадия: Взрослый",       check: (t) => ["adult","sage"].includes(t.stage),                          category: "evolution" },
  { id: "evo_sage",   icon: "🌌", name: "Мудрец",           description: "Достиг максимума!",      check: (t) => t.stage === "sage",                                          category: "evolution" },

  // Brain achievements
  { id: "brain_10",   icon: "🧠", name: "Первые мысли",     description: "10 решений ИИ",          check: (t) => t.brain.totalDecisions >= 10,   category: "brain" },
  { id: "brain_100",  icon: "💡", name: "Думает",           description: "100 решений ИИ",         check: (t) => t.brain.totalDecisions >= 100,  category: "brain" },
  { id: "brain_1000", icon: "🔬", name: "Исследователь",    description: "1000 решений ИИ",        check: (t) => t.brain.totalDecisions >= 1000, category: "brain" },
  { id: "mut_1",      icon: "🔀", name: "Первая мутация",   description: "Получил мутацию",        check: (t) => t.brain.mutationCount >= 1,     category: "brain" },
  { id: "mut_5",      icon: "🧬", name: "Эволюция ДНК",     description: "5 мутаций",              check: (t) => t.brain.mutationCount >= 5,     category: "brain" },
  { id: "xp_500",     icon: "⭐", name: "Опытный",          description: "500 XP",                 check: (t) => t.brain.totalXP >= 500,         category: "brain" },
  { id: "xp_2000",    icon: "🌠", name: "Продвинутый",      description: "2000 XP",                check: (t) => t.brain.totalXP >= 2000,        category: "brain" },

  // Care achievements
  { id: "care_10",    icon: "🤝", name: "Первый контакт",   description: "10 твоих действий",      check: (t) => t.totalUserActions >= 10,   category: "care" },
  { id: "care_100",   icon: "💪", name: "Наставник",        description: "100 твоих действий",     check: (t) => t.totalUserActions >= 100,  category: "care" },
  { id: "save_1",     icon: "🚑", name: "Спаситель",        description: "Спас от критического",   check: (t) => t.criticalSaves >= 1,       category: "care" },
  { id: "save_10",    icon: "🛡️", name: "Хранитель",        description: "10 критических спасений",check: (t) => t.criticalSaves >= 10,      category: "care" },
  { id: "days_7",     icon: "📅", name: "Неделя жизни",     description: "7 дней активности",      check: (t) => t.totalDaysActive >= 7,     category: "care" },
  { id: "days_30",    icon: "🗓️", name: "Месяц жизни",      description: "30 дней активности",     check: (t) => t.totalDaysActive >= 30,    category: "care" },
];

interface AchievementsProps {
  tama: TamagotchiState;
}

export default function Achievements({ tama }: AchievementsProps) {
  const color = getStageColor(tama.stage);

  const unlocked = ALL_ACHIEVEMENTS.filter((a) => a.check(tama));
  const locked = ALL_ACHIEVEMENTS.filter((a) => !a.check(tama));

  const categories = [
    { id: "streak",    label: "Стрики",     icon: "🔥" },
    { id: "evolution", label: "Эволюция",   icon: "🌱" },
    { id: "brain",     label: "Мозг",       icon: "🧠" },
    { id: "care",      label: "Забота",     icon: "🤝" },
  ] as const;

  return (
    <div
      style={{
        width: "100%",
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: 13,
          fontWeight: 800,
          color: "rgba(255,255,255,0.7)",
        }}>
          Достижения
        </div>
        <div style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 10,
          color,
          background: `${color}15`,
          border: `1px solid ${color}33`,
          borderRadius: 6,
          padding: "2px 8px",
        }}>
          {unlocked.length}/{ALL_ACHIEVEMENTS.length}
        </div>
      </div>

      {/* Category sections */}
      {categories.map((cat) => {
        const catUnlocked = unlocked.filter((a) => a.category === cat.id);
        const catLocked = locked.filter((a) => a.category === cat.id);
        const all = [...catUnlocked, ...catLocked];

        return (
          <div key={cat.id}>
            <div style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 9,
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}>
              {cat.icon} {cat.label} ({catUnlocked.length}/{all.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {all.map((ach) => {
                const isUnlocked = ach.check(tama);
                return (
                  <div
                    key={ach.id}
                    title={`${ach.name}: ${ach.description}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: isUnlocked ? `${color}12` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isUnlocked ? color + "33" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: 10,
                      padding: "6px 10px",
                      opacity: isUnlocked ? 1 : 0.4,
                      filter: isUnlocked ? "none" : "grayscale(1)",
                      transition: "all 0.3s ease",
                      flex: "0 0 auto",
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{ach.icon}</span>
                    <div>
                      <div style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontSize: 10,
                        fontWeight: 700,
                        color: isUnlocked ? color : "rgba(255,255,255,0.3)",
                        lineHeight: 1.2,
                      }}>
                        {ach.name}
                      </div>
                      <div style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 8,
                        color: "rgba(255,255,255,0.2)",
                        lineHeight: 1.2,
                      }}>
                        {ach.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

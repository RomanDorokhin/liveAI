# AI Tamagotchi — Project TODO

## Core Architecture
- [x] React + TypeScript + TailwindCSS + tRPC + MySQL (Drizzle ORM)
- [x] TensorFlow.js DQN brain (4→16→8→4) — `client/src/lib/dqnBrain.ts`
- [x] Game hook with offline pause, streaks, XP, mutations — `client/src/hooks/useGame.ts`
- [x] Pet server sync by Telegram User ID — `client/src/hooks/usePetSync.ts`
- [x] Database: `pets` table in Drizzle schema, tRPC router `pet.load/save`

## UI Components
- [x] `Creature.tsx` — animated SVG character, 6 evolution stages
- [x] `NeuralNet.tsx` — Canvas neural network visualization
- [x] `StatBar.tsx`, `ActionButtons.tsx`, `BrainPanel.tsx`, `EvolutionBar.tsx`
- [x] `ThoughtBubble.tsx`, `MutationPopup.tsx`, `UserImpact.tsx`
- [x] `StreakBanner.tsx`, `DailyTaskCard.tsx`, `Achievements.tsx`
- [x] `HelpSystem.tsx` — contextual hints + help panel (10 sections)
- [x] `Onboarding.tsx` — 5 slides + pet name input screen

## New Components (v5)
- [x] `IntelligenceIndicator.tsx` — visual IQ indicator (0-100) from DQN metrics
- [x] `soundEngine.ts` — Web Audio API synthesizer (feed, play, sleep, heal, evolve, die, think, mutation, streak)
- [x] `ShareCard.tsx` — Canvas card for Telegram sharing
- [x] `DeathScreen.tsx` — death screen with full life statistics

## Integration
- [x] IntelligenceIndicator integrated in Home.tsx (brain tab)
- [x] DeathScreen replaces old dead overlay in Home.tsx
- [x] ShareCard integrated in Home.tsx (📤 button in header)
- [x] Sound effects wired in useGame.ts (user actions, AI think, mutation, evolve, die, streak)
- [x] Idle animations in Creature.tsx (yawn, stretch, low-health trembling, improved blink)
- [x] Notification stub modal (🔔 button)

## smolgame Integration
- [x] SQL migration for smolgame D1 — `/home/ubuntu/smolgame-integration/backend/migrations/0013_tamagotchi.sql`
- [x] Routes for Cloudflare Workers — `/home/ubuntu/smolgame-integration/backend/src/tamagotchi.js`
- [x] API adapter — `/home/ubuntu/smolgame-integration/frontend/src/lib/smolgameApi.ts`
- [x] Updated usePetSync — `/home/ubuntu/smolgame-integration/frontend/src/hooks/usePetSync.ts`
- [x] Full integration guide — `/home/ubuntu/smolgame-integration/INTEGRATION_GUIDE.md`

## Pending / Future (out of scope for this session)
- [ ] Real Telegram bot notifications (requires smolgame bot integration)
- [ ] Weekly event system improvements
- [ ] More mutation types with visual effects
- [ ] Leaderboard / social features

# AI Tamagotchi — Design Concepts

## Context
Self-learning tamagotchi for Telegram Web App. The creature evolves visually as its Q-learning brain grows. Mobile-first, portrait orientation, dark environment.

---

<response>
<probability>0.07</probability>
<idea>

**Design Movement:** Biopunk / Organic Circuitry — living organism meets exposed neural hardware

**Core Principles:**
1. Everything breathes — no static element, every node pulses, every bar flows
2. Biological meets digital — organic blob shapes overlaid with circuit-trace lines
3. Information is alive — the Q-table is a glowing neural map, not a table
4. Darkness as canvas — deep void background makes bioluminescent elements pop

**Color Philosophy:**
Deep void black `#050810` as base. Creature glows in cyan-teal `#00FFD1` at low evolution, shifts to violet-magenta `#C800FF` at high evolution. Accent sparks in amber `#FFB800` when learning fires. The color temperature of the creature literally changes as it matures — cold blue infant → warm purple elder.

**Layout Paradigm:**
Vertical stack with creature occupying 45% of viewport height in the center. Neural network floats as a semi-transparent overlay behind the creature. Stats panels are minimal horizontal strips at bottom. No cards — raw data strips with glow borders.

**Signature Elements:**
- Creature body: CSS blob animation using `border-radius` morphing, SVG filter `feTurbulence` for organic texture
- Neural map: Canvas-drawn nodes with bezier connections, pulsing when decision fires
- Evolution aura: radial gradient halo that expands and shifts color with evolution stage

**Interaction Philosophy:**
Haptic-style micro-feedback — buttons depress with spring physics, creature reacts with a full-body jolt animation when fed/played with. The creature "notices" the user.

**Animation:**
- Idle: slow sinusoidal body morph (3s cycle), eyes blink randomly
- Learning event: neural flash — white pulse radiates from active node outward
- Evolution: full-screen particle burst, creature dissolves and reforms larger
- Action buttons: press → creature lurches toward that button direction

**Typography System:**
- Display: `Space Grotesk` 700 — techy but organic curves
- Body/stats: `JetBrains Mono` — monospace for data readability
- Creature speech: `Space Grotesk` italic, small, fades in/out

</idea>
</response>

<response>
<probability>0.06</probability>
<idea>

**Design Movement:** Retro LCD / Game Boy Aesthetic — pixel art soul in a modern shell

**Core Principles:**
1. Pixel grid is sacred — all creature art on 32x32 or 64x64 pixel canvas
2. Scanlines and phosphor glow — CRT filter over everything
3. Dithering as texture — no smooth gradients, only ordered dithering patterns
4. Beep culture — every interaction references 8-bit sound culture visually

**Color Philosophy:**
4-color palette per evolution stage, inspired by original Game Boy green `#9BBC0F` palette for egg stage, shifting to Game Boy Color palettes as it evolves. Background always dark gray `#1A1A2E`. UI chrome in muted olive.

**Layout Paradigm:**
Fake LCD screen bezel as the entire UI container. Creature lives in a 160×144px virtual screen (scaled up). Stats shown as pixel-font readouts below the screen. Buttons styled as physical D-pad and A/B buttons.

**Signature Elements:**
- Pixelated creature sprites with frame-by-frame animation
- Scanline overlay CSS filter across the whole screen
- Pixel font for all text (`Press Start 2P`)

**Interaction Philosophy:**
Every action plays a visual "beep" — a brief white flash on the screen. Creature has distinct pixel-art expressions per state.

**Animation:**
- All animation at 12fps to feel authentic
- Evolution: screen wipe transition, new sprite revealed
- Learning: small "!!" pixel bubble above creature head

**Typography System:**
- Everything: `Press Start 2P` — uncompromising pixel font
- Stats: same font at 8px

</idea>
</response>

<response>
<probability>0.08</probability>
<idea>

**Design Movement:** Void Hologram / Sci-Fi HUD — the creature lives inside a holographic display

**Core Principles:**
1. Translucency everywhere — layered glass panels, no solid backgrounds
2. Scan-line data aesthetic — information rendered as if on a holographic projector
3. The creature IS the data — its body shape reflects its internal state values
4. Asymmetric information density — creature area sparse, data area dense

**Color Philosophy:**
Background: near-black `#080C14`. Primary hologram color: electric blue `#00A8FF`. Secondary: hot coral `#FF4D6D` for danger/hunger states. Tertiary: mint `#00FFB3` for happiness. All elements have 60-80% opacity with additive blending to create depth stacking.

**Layout Paradigm:**
Split: left 60% is creature + aura zone, right 40% is scrolling data feed. At bottom: action bar with holographic button panels. Neural network rendered as a floating 3D-ish node graph in the creature zone.

**Signature Elements:**
- Creature: SVG with animated `stroke-dashoffset` — appears to be drawn by light in real time
- HUD corners: classic sci-fi bracket corners on all panels
- Data stream: scrolling log of AI decisions in monospace

**Interaction Philosophy:**
Interactions feel like issuing commands to a system. Buttons have "CONFIRM" style activation with a brief loading bar.

**Animation:**
- Idle: creature outline slowly redraws itself
- Learning: data stream speeds up, node graph flickers
- Evolution: hologram glitches, reforms at higher resolution

**Typography System:**
- Headers: `Orbitron` — quintessential sci-fi
- Data: `Share Tech Mono` — clean monospace
- Labels: `Rajdhani` — condensed, readable

</idea>
</response>

---

## Selected Approach: **Biopunk / Organic Circuitry** (Response 1)

Chosen for maximum visual impact on mobile — the glowing blob creature with visible neural network creates the strongest "living AI" feeling. The color evolution from cold cyan to warm violet gives instant visual feedback of growth. Perfectly fits the self-learning concept.

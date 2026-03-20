# Game Design Document — Elemental Quest (EQ)
**Version:** 3.0 | **Document type:** Reference GDD for AI coder

---

## 1. Overview

**Elemental Quest (EQ)** is a 2-player (expandable to 4-player) competitive digital board game. Players move tokens around a shared board, land on elemental tiles, collect elements to build combos, earn mana, and use abilities to reduce the opponent's HP to zero — or outlast them when the round limit expires.

The game is inspired by traditional horse-racing board games (Co Ca Ngua / Ludo) but adds deep strategic layers: elemental collection queues, combo chains, ultimate abilities, and artifact interactions.

**Tech stack:** React + TypeScript, Vite, Tailwind CSS, Framer Motion.

---

## 2. Board Layout

### 2.1 Grid
- **Size:** 11 x 11 grid. Only 61 tiles are active; the rest are null (invisible).
- **Shape:** A cross (+) pattern, symmetric around the center (5,5).
- **Tile IDs:** 0-60. Each tile has a fixed `(x, y)` position on the grid (defined in `boardLayout.ts`).

### 2.2 Tile Types

| TileType | Description |
|----------|-------------|
| `Normal` | Generic path tile, no element |
| `Fire` | Elemental tile — Fire element |
| `Ice` | Elemental tile — Water/Ice element |
| `Grass` | Elemental tile — Grass/Wood element |
| `Rock` | Elemental tile — Earth element |
| `SafeZone` | Player start tile. Tokens here cannot be kicked. |
| `Center` | Final scoring tile at the end of each goal path |
| `Ladder` | Goal path tile (inward only, toward Center) |

### 2.3 Tile Roles

| TileRole | Description |
|----------|-------------|
| `START` | Safe zone / spawn point for a player |
| `PATH` | Main loop tile |
| `GOAL` | Goal path tile (private to one player) |
| `DISABLED` | Not part of the board (null cell) |

### 2.4 Empty Tiles
12 special tiles are designated as "Empty Tiles" (no element, not elemental):
```
IDs: [12, 21, 3, 17, 24, 53, 40, 35, 56, 42, 20, 2]
```
Landing on an Empty Tile triggers the **Empty Tile Popup** interaction.

### 2.5 Diamond Values
Some tiles have a `diamondValue` property defined in `boardSpec.ts`:
- **30:** tiles [50, 41, 48, 14, 6, 15, 11, 34]
- **20:** tiles [32, 47, 36, 8, 18, 9, 23, 46]
- **10:** tiles [59, 55, 58, 1, 57, 4, 60, 52]

> **Status:** Diamond values are defined in the data layer but are **not currently applied** to any gameplay mechanic. They are reserved for a future scoring or reward system.

### 2.6 Element Tile Depletion & Regeneration
Elemental tiles have a **current element state** (`currentElement`) that can be null or active:
- When a token **lands** on an elemental tile and collects the element, `tile.currentElement` is set to `null` (tile is depleted).
- When a token **leaves** a depleted elemental tile (moves away from its source tile), the tile **regenerates**: `currentElement` is restored to its base type.
- This means a tile is available again as soon as any token exits it, not after a turn delay.

---

## 3. Board Topology & Movement

### 3.1 Arms (Main Loop)
Each player has an arm — an ordered 10-tile path that forms part of the main circular loop:

| Player | Arm Path (tile IDs in order) |
|--------|------------------------------|
| Player1 | 51 -> 50 -> 40 -> 32 -> 59 -> 35 -> 41 -> 47 -> 56 -> 55 |
| Player2 | 0 -> 6 -> 12 -> 18 -> 57 -> 21 -> 15 -> 9 -> 3 -> 4 |
| Player3 | 54 -> 48 -> 42 -> 36 -> 58 -> 20 -> 14 -> 8 -> 2 -> 1 |
| Player4 | 5 -> 11 -> 17 -> 23 -> 60 -> 24 -> 34 -> 46 -> 53 -> 52 |

Arms connect clockwise: `Player2 -> Player4 -> Player1 -> Player3 -> Player2 ...`

### 3.2 Goal Paths (Private)
At the end of each arm, a player can branch into their own **Goal Path** (4 tiles leading to the final scoring tile):

| Player | Goal Path | Final Tile |
|--------|-----------|------------|
| Player1 | 33 -> 28 -> 26 -> 31 | 31 |
| Player2 | 7 -> 13 -> 19 -> 25 | 25 |
| Player3 | 49 -> 43 -> 37 -> 30 | 30 |
| Player4 | 10 -> 16 -> 22 -> 27 | 27 |

### 3.3 Branch Rules
At the junction after each arm's final tile, **branch rules** check if the token's owner matches:
- If **yes (owner matches)**: redirect into the player's own Goal Path.
- If **no**: continue around the main loop.

Branch trigger tiles:
| Player | Trigger Tile | If Owner -> Goal | If Not Owner -> Loop |
|--------|-------------|-----------------|---------------------|
| Player1 | 52 | 33 | 51 |
| Player2 | 1 | 7 | 0 |
| Player3 | 55 | 49 | 54 |
| Player4 | 4 | 10 | 5 |

### 3.4 Start Tiles (Safe Zones)
| Player | Start Tile ID |
|--------|--------------|
| Player1 | 51 |
| Player2 | 0 |
| Player3 | 54 |
| Player4 | 5 |

---

## 4. Players & Tokens

### 4.1 Player Setup
- **Active players:** Player1 (Red) and Player2 (Green) in the base 2-player configuration.
- Player3 (Blue) and Player4 (Yellow) are defined but start with no tokens (reserved for future 4-player mode).
- Each active player starts with **3 tokens** (horses) placed at or near their Safe Zone.
- Each player is randomly assigned one of the 4 elemental affinities at game start.

### 4.2 Token (Horse) Properties
| Property | Type | Description |
|----------|------|-------------|
| `id` | number | Unique integer across all tokens |
| `playerId` | PlayerID | Owner of this token |
| `tileId` | number | Current tile the token occupies |
| `atk` | number | Attack power (starts 0, grows via affinity/combos) |
| `frozenRounds` | number | Turns remaining where this token cannot move |
| `justFrozen` | boolean | Prevents unfreezing on the same turn frozen |

### 4.3 Player State Properties
| Property | Description |
|----------|-------------|
| `hp` | Current HP (starts per level config) |
| `mana` | Current mana (0 to manaCap) |
| `manaCap` | Mana required to charge ultimate (default 50) |
| `elementAffinity` | Randomly assigned at start: Fire / Ice / Grass / Rock |
| `elementQueue` | List of recently collected elements (max 8 by default) |
| `comboCount` | Total number of combos triggered this match |
| `comboTier` | Current combo tier (0-3, capped by level config) |
| `tileGainMultiplier` | Multiplier on ATK/Mana from tiles (1 default, 2 at Tier 2) |
| `emptyTileVisits` | Count of empty tile landings (unlocks artifacts) |
| `kickCount` | Total enemy tokens kicked this match |
| `finishedHorseCount` | Total own tokens that reached final goal |

---

## 5. Turn Structure

Each player's turn:

```
1. SELECT_DICE
   |- Optionally activate Ultimate (if mana is full)
   +- Roll dice (2 dice, regular or Power Roll)

2. MOVE
   +- Select which token to move (must be unfrozen, must have a legal path)

3. ANIMATING
   +- Token moves tile-by-tile (visual animation, no input)

4. Landing Resolution (automatic)
   |- Elemental tile  -> collect element, check mana streaks, check combos
   |- Empty tile      -> open EMPTY_TILE_INTERACTION popup
   |- Opponent token  -> kick: send to safe zone, deal ATK damage to opponent HP
   |- Opponent stable -> deal ATK damage, return own token to safe zone
   +- Goal tile       -> continue into goal path (no special effect unless final tile)

5. End Turn
   |- Decrement frozenRounds on all tokens (skip justFrozen)
   |- Check win conditions (HP <= 0, or round limit reached)
   +- Pass turn to next player
```

---

## 6. Dice System

### 6.1 Regular Roll
- Always **2 dice** (default `diceCount: 2`, not player-selectable in current implementation).
- Each die shows 1-6.
- Token moves exactly `sum of dice` steps.
- **Doubles bonus** (both dice show the same value): player earns **+30 mana** and gets an **extra turn** after the current one ends.

### 6.2 Power Roll
- Optional mode. Player holds a button; release accuracy determines if the roll lands in a target range.
- **Accuracy rate:** configurable, default **30%**.
- If accurate: dice land in the desired range.
- If inaccurate: dice are rolled randomly as normal.

### 6.3 Extra Rolls from Ultimate
- When the Extra Roll ultimate is used, `ultimateExtraRolls` increments by 1.
- After the normal turn ends (including all bonus turns from doubles), if `ultimateExtraRolls > 0`, the active player gets another full SELECT_DICE phase.

---

## 7. Element Collection System

### 7.1 Elements
Four types match the four tile types: **Fire**, **Ice** (Water/Ice), **Grass** (Grass/Wood), **Rock** (Earth).

### 7.2 Element Queue
- When a token lands on an elemental tile, the tile's element is appended to the player's `elementQueue`.
- Max queue size: **8 elements** (default, configurable per player via `config.maxElementQueue`).
- When the queue is full, the oldest element is removed (FIFO shift) before adding the new one.
- The queue is shown in the PlayerInfo panel as element icons, with a `current/max` counter (e.g., `5/8`).

### 7.3 Mana from Elements (Non-Affinity)
When the collected element does **NOT** match the player's `elementAffinity`, mana is awarded as a flat amount:

**Mana per non-affinity element:** `10 × tileGainMultiplier`

All mana rewards are scaled by `tileGainMultiplier` (default 1, becomes 2 after Tier 2 combo unlock).

> **Note:** A streak-based mana calculation system exists in `utils/goldLogic.ts` (`calculateElementGold`) but is **not currently integrated** into the landing resolution. It is documented there as a planned mechanic.

### 7.4 ATK from Affinity Match
When the collected element **matches** the player's `elementAffinity`:
- No mana is awarded.
- Instead, the token that landed receives **+10 ATK × tileGainMultiplier**.
- This ATK is stored on the token and used when that token kicks or stables.

---

## 8. Combo System

### 8.1 Combo Detection
After each element is added to the queue, the game scans for combo patterns:

| Combo Name | Pattern | Trigger |
|------------|---------|---------|
| **Triple Threat (C3)** | Any 3 consecutive identical elements anywhere in the queue | comboTier +1, comboCount +1 |
| **Elemental Master (C4)** | Any 4 consecutive unique elements (all 4 different) anywhere in the queue | comboTier +1, comboCount +1 |

The queue is scanned from index 0. C3 has priority over C4 at the same position. When a combo is found, the matching elements are **removed** from the queue and the scan restarts from the beginning (cascading). This repeats until no more combos exist.

> In practice, because elements are appended to the end, combos most often form at the tail — but can technically appear anywhere if the queue was manipulated by artifacts.

### 8.2 Combo Tier Cap
`comboTier` is capped at `levelConfig.maxComboTiers`:
- Lv1: max tier 1
- Lv2: max tier 2
- Lv3: max tier 3

When a combo is triggered at max tier, the combo is counted (`comboCount++`) but no additional tier reward fires.

### 8.3 Tier Rewards — Character 1 (current only character)
Rewards are structured as: a **base reward** that fires every combo, plus **milestone rewards** that unlock progressively.

| When | Reward Name | Effect |
|------|-------------|--------|
| **Every combo** | **Power Surge** (Tier 1 base) | +150 ATK to all owned tokens |
| **2nd combo** (if maxTier >= 2) | **Double Harvest** (Tier 2 unlock) | Sets `tileGainMultiplier = 2` permanently for the rest of the match |
| **3rd combo** (if maxTier >= 3) | **Absolute Might** (Tier 3 unlock) | All owned tokens: `atk = floor(atk * 1.5)` (one-time) |

**Key clarifications:**
- Power Surge (+150 ATK) fires on combo 1, 2, 3, 4... every single combo — not just the first.
- Double Harvest is a **permanent passive**: once unlocked at combo 2, all future tile landings give double ATK/Mana.
- Absolute Might fires once at combo 3, boosting current ATK of all tokens by ×1.5.
- After combo 3, only Power Surge continues to fire each combo.
- Tier milestone rewards are gated by `levelConfig.maxComboTiers` (Lv1: no Tier 2/3, Lv2: up to Tier 2, Lv3: all).

---

## 9. HP & Combat

### 9.1 Kick
When a token lands on a tile occupied by an **enemy token** that is NOT on a SafeZone:
- The enemy token is **kicked** to its owner's `safeZoneTileId`.
- Damage dealt to the enemy player's HP = attacking token's `atk`.
- Attacker's `kickCount` increments by 1.
- If the attacking token's `atk` is 0, no HP damage is dealt (still kicks).

### 9.2 Safe Zone Immunity
- Tokens on their own start tile (`safeZoneTileId`) are immune to kicks.
- If multiple tokens are at the safe zone, none can be kicked.

### 9.3 Stable (Final Goal) Resolution
When a token lands on **its owner's own Final Goal tile** (the Center tile at the end of that player's goal path):
- `finishedHorseCount` for the token's owner increments.
- Damage and teleport are resolved in `App.tsx` (via `handleGoalRewardResolve`) — this ensures any combo bonuses are applied **before** damage is calculated.
- Damage = the arriving token's `atk` is dealt to the **opponent's** HP.
- The arriving token is returned to its owner's Safe Zone.

### 9.4 HP Limits
| Level | Starting HP |
|-------|------------|
| Lv1 | 1000 |
| Lv2 | 1500 |
| Lv3 | 1000 |

HP cannot exceed starting HP (no healing mechanic).

---

## 10. Win Conditions

### 10.1 KO Win
If any player's HP drops to <= 0, the game ends immediately.
- **Winner:** The opponent (player who did NOT lose all HP).

### 10.2 Round Limit Win
After `maxRounds` complete rounds (default 15), the game ends.
- **Winner:** The player with the **highest remaining HP**.

### 10.3 Tie-breaking
If both players have equal HP at the round limit, the win is assigned to **Player2** with the reason `"Tie-break: Last Mover Advantage"` (Player2 always takes the last turn of a round).

---

## 11. Mana & Ultimate System

### 11.1 Mana Accumulation
Mana is earned by:
- Collecting elements (mana streaks, see Section 7.3)
- Rolling doubles with 2 dice (+30 mana)

Mana is capped at `manaCap` (= ultimate cost, default 50).
The UI shows mana as a fill bar beneath the ultimate icon; when full, the icon glows and the "Use" button appears.

### 11.2 Ultimate Activation Rules
- Can only be activated at the start of the player's own turn (SELECT_DICE phase).
- Requires `mana >= manaCap`.
- On activation, mana resets to 0.
- The "Use" button is only shown to the **active player**. Other players see the glow but not the button.

### 11.3 Available Ultimates

**Extra Roll** (`extraRoll`):
- Grants +1 additional turn (a new SELECT_DICE phase) after the current turn ends.
- Stackable: multiple activations give multiple extra turns.
- Cost: 50 mana.

**Quantum Leap** (`teleport`):
- Teleport any owned token to any empty tile on the board.
- Game enters `SELECT_TELEPORT_TOKEN` phase (pick which token) then `SELECT_TELEPORT_DEST` phase (pick destination tile).
- Cost: 50 mana.

---

## 12. Empty Tile Interaction

### 12.1 Triggering
Landing on one of the 12 designated Empty Tile IDs triggers the **Empty Tile Popup**.
- `emptyTileVisits` for the player increments each time.
- The popup can be **minimized** (floating button appears to re-open it).

### 12.2 Artifacts (Items)
Up to 3 artifacts, gated by two conditions: (1) `emptyTileVisits` threshold, (2) `levelConfig.artifactSlots`.

| Item | Artifact Slot | Visits Required | Effect |
|------|--------------|----------------|--------|
| **Swap** | 1 | 1 | Swap two adjacent elements in the queue |
| **Change** | 2 | 2 | Replace one element in the queue with any other type |
| **Charge** | 3 | 3 | Insert one copy of the player's affinity element at any queue position |

Items not available at the current level are **hidden** (not shown, not just disabled).
Items available but not yet unlocked (visits threshold not met) are shown but **greyed out/disabled**.

### 12.3 Interaction Flow
1. Popup opens, shows current element queue.
2. Player selects an unlocked artifact button.
3. An interaction panel appears (swap buttons, element pickers, or position pickers).
4. Player applies the change — queue updates immediately and preview refreshes.
5. Player clicks "Do not use item" to skip artifact and close popup.
6. Changes to queue (via artifacts) persist regardless of how the popup is closed.

---

## 13. Frozen Token Mechanic

- Tokens can be frozen by game events (currently unused in base game, but the system is implemented).
- While `frozenRounds > 0`, the token cannot be selected for movement.
- Each turn, the **current player's own tokens** have their `frozenRounds` decremented by 1 (minimum 0). Opponent tokens are NOT decremented on the current player's turn.
- `justFrozen` prevents the first decrement from happening on the same turn the token was frozen.

---

## 14. Game Levels

| Level | Name | HP | Max Rounds | Max Combo Tiers | Artifact Slots |
|-------|------|----|-----------|----------------|----------------|
| Lv1 | Beginner | 1000 | 15 | 1 | 1 |
| Lv2 | Intermediate | 1500 | 15 | 2 | 2 |
| Lv3 | Master | 1000 | 15 | 3 | 3 |

- Level is chosen before the first turn via the Level Select screen.
- Level can be changed mid-game; changes take effect on the next round.
- Default level: **Lv3**.

---

## 15. Game Phases (State Machine)

| Phase | Who Acts | Description |
|-------|----------|-------------|
| `LEVEL_SELECT` | — | Initial screen; player picks game level |
| `SELECT_DICE` | Active player | Choose dice count, optionally use ultimate, roll |
| `MOVE` | Active player | Select a token to move |
| `ANIMATING` | — | Token movement animation; no input accepted |
| `EMPTY_TILE_INTERACTION` | Active player | Artifact popup is open |
| `GOAL_REWARD_SELECTION` | Active player | Player selects a reward after reaching a goal tile |
| `SELECT_TELEPORT_TOKEN` | Active player | Teleport ultimate: pick which token to move |
| `SELECT_TELEPORT_DEST` | Active player | Teleport ultimate: pick destination tile |
| `END` | — | Match over; winner and summary displayed |

---

## 16. UI Architecture

### 16.1 Main Layout
- Left panel: Player1 info (`PlayerInfo` component)
- Center: Game board (`Board` component) + game log (`GameLog`)
- Right panel: Player2 info (`PlayerInfo` component)
- Overlapping: Popups, modals, dice roller

### 16.2 PlayerInfo Panel
Shows per player:
- Name and HP bar (with green fill, 1000 max reference)
- Mana diamond icon
- Ultimate icon (64x64, glows indigo when charged, slams on turn start if ready, shows "Use" button to active player, "READY" text to inactive player)
- Element Queue (icons + `current/max` counter in readable colors)
- Combo Mastery tiers (only tiers available at current level are shown)
- Roll button / power roll bar / End Turn button (active player only)
- Dice display

### 16.3 Board
- 11x11 grid rendered as CSS grid
- Tiles show element color, diamond value if applicable, tile ID (in debug mode)
- Tokens render as colored circles at their tile position
- Hover tooltips on tiles showing element info, empty tile artifact preview, move preview on reachable tiles
- Move preview highlights reachable tiles before the player confirms

---

## 17. Animations & Visual Feedback

| Effect | Trigger | Implementation |
|--------|---------|----------------|
| **Panel zoom** | Active player's turn | CSS `panel-zoom` keyframe (infinite pulse) |
| **Panel shake** | Player receives HP damage | CSS `panel-shake` keyframe (0.5s, overrides panel-zoom) |
| **Ultimate slam** | Player's turn starts with ultimate fully charged | CSS `animate-ultimate-slam` (0.7s one-shot, then reverts to ready) |
| **Ultimate ready** | Ultimate charged, not currently slamming | CSS `animate-ultimate-ready` (continuous glow pulse) + `scale-110` |
| **Ultimate ping** | Ultimate charged | `animate-ping` div overlay behind the icon |
| **Floating damage** | HP decrease | `damageFeedbacks` state, fade-up overlay near panel |
| **Mana feedback** | Mana gained | `activeFeedbacks` state, color-coded floats near mana bar |
| **Combo announcement** | Combo triggered | `comboAnnouncement` in GameState, Framer Motion overlay |
| **Round animation** | Round number increases | Framer Motion scale pop |

### 17.1 CSS Keyframes (defined in `index.html`)
```css
@keyframes panel-zoom     { /* subtle scale breathing */ }
@keyframes panel-shake    { /* translateX + rotate, 7 steps, 0.5s */ }
@keyframes ultimate-slam  { /* scale 1.1 -> 1.45 -> 0.95 -> 1.2 -> 1.05 -> 1.1, 0.7s */ }
@keyframes ultimate-ready { /* defined in Tailwind config or index.html */ }
```

---

## 18. Match Summary

At game end (`phase === 'END'`), the summary screen shows:
- Winner announcement
- Final HP of both players
- Total turns taken
- Action time per player (seconds spent on turns)
- Horses finished (tokens that reached the final goal tile)
- Kicks performed per player

---

## 19. Key Design Principles

1. **Element queue is the strategic core.** Players constantly weigh: build a same-streak (faster 3rd-element bonus) vs. diverse-streak (slower but bigger 4th-element multiplier).

2. **Affinity creates identity.** Each player's randomly assigned element determines whether they gain ATK or mana when they land on matching tiles. This shapes their token-building strategy.

3. **ATK is earned, not given.** Tokens start at 0 ATK. Only affinity-matching tile landings and combo rewards increase ATK. Kicks and stables deal 0 damage early game and become threatening mid-to-late game.

4. **Kick vs. goal progress trade-off.** Moving a token into an opponent's cluster deals damage but wastes movement steps you could use to advance toward scoring.

5. **Artifacts extend strategic depth.** Empty Tile visits are a resource. Charge (Item 3) can set up a guaranteed combo; Change (Item 2) can break a bad streak. Timing matters.

6. **Ultimate timing is a skill expression.** Extra Roll is best to extend a scoring run. Teleport is best to set up a dangerous kick or escape an exposed position.

7. **Level scales complexity linearly.** Lv1 is a tutorial (1 combo tier, 1 artifact, simple decisions). Lv3 is the full game with cascading combos, 3 artifacts, and deeper optimization.

---

## 20. Codebase Reference

| File | Purpose |
|------|---------|
| `types.ts` | All TypeScript interfaces and enums |
| `constants.ts` | Game constants, `generateDefaultGameState()`, `createConnections()` |
| `boardSpec.ts` | Board topology: ARM_PATHS, GOAL_PATHS, BRANCH_RULES, TILE_ELEMENTS, diamond values |
| `boardLayout.ts` | Tile `(x,y)` positions on the 11x11 grid |
| `config/characters.ts` | Character definitions, combo reward effects, ultimate definitions |
| `config/levels.ts` | Level configs (HP, rounds, max tiers, artifact slots) |
| `utils/gameLogic.ts` | Core game engine: movement, landing resolution, combat, turn management, combo processing |
| `utils/goldLogic.ts` | Mana calculation from element streaks |
| `utils/pathfinding.ts` | BFS for movement validation and legal move checking |
| `utils/roleResolver.ts` | Applies tile role classification across the board |
| `App.tsx` | Main React component: phase management, event handlers, rendering orchestration |
| `components/PlayerInfo.tsx` | Player panel UI |
| `components/Board.tsx` | Board rendering, tile hover logic, token display |
| `components/EmptyTilePopup.tsx` | Artifact selection popup |
| `components/LevelSelect.tsx` | Level picker screen |
| `index.html` | Global CSS keyframe animations |

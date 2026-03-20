# Tutorial System — Game Design Document

## Overview

| Field         | Value              |
|---------------|--------------------|
| Game Name     | Elemental Hunter   |
| Feature Name  | Tutorial System    |
| Author        | tramdm             |
| Date          | 11-03-2026         |
| Last Modified | 11-03-2026         |
| Version       | v1                 |
| Status        | Drafted            |

## Change Log

| Version | Date       | Changed By | Summary of Changes |
|---------|------------|------------|--------------------|
| v1      | 11-03-2026 | tramdm     | Initial draft — 2-ván tutorial structure với Practice Mode, Adaptive Highlight + AFK Safety, scripted-then-random Bot |

## Related Documents

- [INDEX_ElementalHunter_v1.md](./INDEX_ElementalHunter_v1.md)
- [GDD_Overview_v2_ElementalHunter.md](./GDD_Overview_v2_ElementalHunter.md)
- [game-design-workflow.md](./game-design-workflow.md)

---

## Dependencies

This feature depends on the following systems or GDDs:
- **GDD_Overview_v2_ElementalHunter.md** — Tutorial re-uses all core mechanics (Board, Turn Structure, Element Collection, Combo, Combat, Mana, Artifact)
- **balance.ts** — Tutorial overrides certain config values (HP, Max Rounds) nhưng follows same parameter structure

---

## Mechanics

### 1. Tutorial System Overview

**Player Experience Goal:** Dạy first-time players cách chơi Elemental Hunter qua 2 ván ngắn (8-10 phút tổng), mỗi ván focus vào 1 nhóm mechanics, với guidance tự động giảm dần khi player thành thạo.

Tutorial System gồm **2 ván Practice Mode** liên tiếp:

**Ván 1: Basic Tutorial**
- **Duration:** 4-5 phút
- **Coverage:** Movement + Element Collection + Combat (full)
- **Goal:** Player hiểu core gameplay loop và có thể hoàn thành 1 ván

**Ván 2: Advanced Tutorial**
- **Duration:** 4-5 phút
- **Coverage:** Combo System + Artifact + Ultimate
- **Goal:** Player hiểu advanced mechanics và có thể optimize strategy

**Key Principles:**
- Mỗi ván là **real match** với Bot AI (không phải simulation)
- Ván kết thúc **tự nhiên** (HP=0 hoặc hết rounds) — không đột ngột
- **Linear progression:** Ván 1 → fade transition → Ván 2 (không skip)
- **Adaptive Highlight:** Guidance giảm dần khi player làm đúng, nhưng bật lại nếu AFK

---

### 2. Ván 1: Basic Tutorial

**Player Experience Goal:** Làm quen với core gameplay loop — di chuyển ngựa, thu thập nguyên tố, và chiến đấu — qua 1 ván thật với Bot dễ.

#### 2.1. Mechanics Coverage (Ván 1)

Ván 1 dạy 3 nhóm mechanics cơ bản:

**A. Movement (Di Chuyển Ngựa)**

Mechanics được demo:
- Đổ 2 xúc xắc (dice rolling)
- Chọn 1 ngựa hợp lệ (token selection)
- Ngựa di chuyển theo số xúc xắc (movement animation)

**Narrative flow (suggested):**
- **Round 1, Turn 1 (Player):** Highlight dice button → player rolls → chọn ngựa → di chuyển
- **Round 1, Turn 2 (Bot):** Bot auto-plays, player observes
- **Round 2:** Player làm lại, highlight vẫn active (chưa đủ 3 lần)

**B. Element Collection (Thu Thập Nguyên Tố)**

Mechanics được demo:
- Elemental Tile (ô có nguyên tố)
- Element Affinity (nguyên tố chủ đạo của player)
- ATK gain (khi đáp ô cùng Affinity)
- Mana gain (khi đáp ô khác Affinity)
- Element Queue visualization

**Narrative flow (suggested):**
- **Round 3:** Player đáp xuống ô Fire (cùng Affinity) → popup: "Nhận Fire! Cùng Affinity → +30 ATK"
- **Round 4:** Player đáp ô Ice (khác Affinity) → popup: "Nhận Ice! Khác Affinity → +10 Mana"
- Sau mỗi lần thu thập → highlight Element Queue để player thấy nguyên tố được add

**C. Combat (Full) (Chiến Đấu)**

Mechanics được demo:
- **Kick:** Bot đáp ô có ngựa player → player HP giảm
- **Safe Zone:** Ngựa đứng trên Safe Zone không bị Kick
- **HP system:** Player thấy HP bar giảm khi bị attack

**Narrative flow (suggested):**
- **Round 5:** Bot Kick player lần đầu → modal: "Bị Bắt Ngựa! Bot tấn công bạn [X] HP."
- **Round 6:** Player có cơ hội Kick bot (nếu di chuyển đúng ô)
- **Round 6-8:** Ván tiếp tục cho đến khi HP=0 hoặc hết rounds

**Edge cases:**
- Nếu player HP về 0 trước Round 6 → Ván 1 kết thúc sớm (player lose, OK)
- Nếu Bot HP về 0 trước Round 8 → Ván 1 kết thúc sớm (player win, OK)

#### 2.2. Practice Mode Config (Ván 1)

Ván 1 override các giá trị sau từ normal mode:

| Config Parameter | Normal Value | Ván 1 Value | Rationale |
|------------------|--------------|-------------|-----------|
| Player HP | 600/800/1000 | **300** | Ván kết thúc trong 6-8 rounds (~4-5 phút) |
| Max Rounds | 12/15/15 | **8** | Timeout sớm để đảm bảo không kéo dài |
| Combo Tiers Unlocked | 1/2/3 (theo Level) | **3** (unlock hết) | Để Ván 2 có thể demo Tier 2, 3 |
| Artifact Slots | 1/2/3 (theo Level) | **3** (unlock hết) | Để Ván 2 có thể demo Swap/Change/Charge |
| emptyTileVisits | Dần mở (≥1, ≥2, ≥3) | **Pre-unlocked** | Không cần farm, Ván 2 dùng ngay |

**Mechanics KHÔNG demo ở Ván 1:**
- Combo System (để Ván 2)
- Artifact (để Ván 2)
- Ultimate (để Ván 2)
- Power Roll (optional mechanic, hint ở Ván 2)
- Goal Path / Về đích (có thể xảy ra tự nhiên, nhưng không force)

#### 2.3. Bot Strategy (Ván 1)

Bot ở Ván 1 có 2 phases:

**Phase 1: Scripted (Rounds 1-5)**

Mục tiêu: Demo mechanics theo thứ tự logic.

Bot behavior:
- **Round 1-2:** Bot di chuyển random, thu thập nguyên tố, **KHÔNG Kick player**
- **Round 3-4:** Bot tiếp tục thu thập, **vẫn tránh Kick** (để player an toàn học Element)
- **Round 5:** Bot **Kick player 1 lần** (scripted move đến ô có ngựa player) → player thấy Kick mechanic

Power Roll handling:
- Ván 1 **KHÔNG demo Power Roll** (để Ván 2)
- Nếu player tự bật Power Roll → kết quả random bình thường (không fix)

**Phase 2: Random (Rounds 6-8)**

Sau khi đã demo đủ mechanics (Movement, Element, Kick), Bot chuyển sang **random moves**:
- Đổ xúc xắc random
- Chọn ngựa hợp lệ đầu tiên
- Di chuyển bình thường

Bot Win Rate Target: **30-40%** (majority players nên thắng Ván 1)

**Implementation note (cho dev):**
```typescript
// Pseudo-code for Ván 1 Bot
const van1BotScript = {
  round1: { dice: [2, 3], tokenIndex: 0, avoidKick: true },
  round2: { dice: [4, 1], tokenIndex: 1, avoidKick: true },
  round3: { dice: [3, 2], tokenIndex: 0, avoidKick: true },
  round4: { dice: [2, 4], tokenIndex: 2, avoidKick: true },
  round5: { 
    dice: [3, 3], 
    tokenIndex: 1, 
    targetTile: [ô có ngựa player],  // Force Kick
    expectKick: true 
  },
  round6_onward: { mode: 'RANDOM' }  // Switch to random bot
};
```

**Edge cases:**
- Nếu script yêu cầu move không hợp lệ (ngựa bị Frozen, ô bị block) → skip step, chuyển sang random
- Nếu player HP ≤ 50 ở Round 5 → Bot skip Kick script, tránh KO quá sớm

---

### 3. Ván 2: Advanced Tutorial

**Player Experience Goal:** Học cách optimize strategy qua Combo, Artifact, và Ultimate — biến resource (Element, Mana) thành power.

#### 3.1. Mechanics Coverage (Ván 2)

Ván 2 dạy 3 nhóm mechanics advanced:

**A. Combo System**

Mechanics được demo:
- **C3 (Triple Threat):** 3 nguyên tố giống nhau liên tiếp
- **C4 (Elemental Master):** 4 nguyên tố khác nhau hoàn toàn
- **Combo Rewards:** Tier 1 (Power Surge), Tier 2 (Double Harvest), Tier 3 (Absolute Might)
- **Cascading Combo:** Sau khi 1 combo xóa, queue tạo combo mới

**Narrative flow (suggested):**
- **Round 2:** Bot trigger **Combo C3** (scripted) → modal: "Combo C3! Tất cả ngựa Bot +150 ATK"
- **Round 3:** Player có Element Queue gần đủ → hint: "Bạn sắp có Combo! Thu thập thêm [X]"
- **Round 4:** Nếu player trigger combo → celebrate animation
- **Round 5:** Bot trigger **Combo Tier 2** (milestone thứ 2) → modal: "Tier 2 Unlocked! Tile Gain ×2"

**B. Artifact**

Mechanics được demo:
- **Empty Tile:** Ô không có nguyên tố, kích hoạt Artifact menu
- **Swap:** Đổi chỗ 2 nguyên tố liền kề
- **Change:** Đổi 1 nguyên tố thành loại khác
- **Charge:** Thêm nguyên tố cùng Affinity

**Narrative flow (suggested):**
- **Round 3:** Player đáp Empty Tile lần đầu → modal: "Artifact Menu! Chọn 1 item để tương tác Element Queue"
- Player chọn Artifact (ví dụ: Swap) → Element Queue updates → player thấy effect
- **Round 4:** Bot dùng Artifact (ví dụ: Charge) để setup Combo

**C. Ultimate**

Mechanics được demo:
- **Extra Roll:** Nhận thêm 1 lượt đổ xúc xắc
- **Mana cost:** 50 Mana
- **Activation:** Bấm Ultimate button khi đủ Mana

**Narrative flow (suggested):**
- **Round 5:** Player có Mana ≥ 50 → tooltip: "Bạn có đủ Mana! Bấm Ultimate để nhận thêm 1 lượt"
- Player tự quyết định activate hay không (không force)
- **Round 6:** Bot activate Ultimate (nếu đủ mana) → player thấy Extra Roll animation

**D. Power Roll (Optional)**

Mechanics được demo:
- **Power Roll mode:** Chọn khoảng giá trị target
- **Accuracy:** 20% xác suất rơi vào khoảng target

**Narrative flow (suggested):**
- **Round 6:** Hint xuất hiện 1 lần: "Mẹo: Bật Power Roll để chọn khoảng mong muốn (20% xác suất)"
- Player tự quyết định dùng hay không

**Power Roll special handling:**
- User roll tự do (chọn khoảng target, bấm dừng)
- Kết quả được **fix trước** để guarantee demo (ví dụ: force success lần đầu)
- Chỉ fix **lần đầu tiên** player dùng Power Roll; lần sau thì random bình thường

#### 3.2. Practice Mode Config (Ván 2)

Ván 2 sử dụng **same config** như Ván 1:

| Config Parameter | Ván 2 Value |
|------------------|-------------|
| HP | 300 |
| Max Rounds | 8 |
| Combo Tiers | 3 (unlocked) |
| Artifact Slots | 3 (unlocked) |

**Lý do:** Consistency — player không phải adapt với config mới.

#### 3.3. Bot Strategy (Ván 2)

Bot ở Ván 2 có 2 phases tương tự Ván 1, nhưng script khác:

**Phase 1: Scripted (Rounds 1-5)**

Mục tiêu: Setup để trigger Combo, demo Artifact/Ultimate.

Bot behavior:
- **Round 2:** Bot trigger **Combo C3** (setup Element Queue trước: [Fire, Fire, Fire])
- **Round 3:** Bot đáp **Empty Tile** → dùng Artifact (ví dụ: Swap hoặc Charge)
- **Round 4:** Bot cố gắng trigger **Combo Tier 2** (milestone thứ 2)
- **Round 5:** Bot activate **Ultimate** (nếu đủ mana)

**Power Roll handling:**
- **Lần đầu** player dùng Power Roll → kết quả **fix thành công** (rơi vào khoảng target)
- Lần sau → kết quả random bình thường (20% xác suất)

**Phase 2: Random (Rounds 6-8)**

Sau khi demo đủ Combo/Artifact/Ultimate, Bot chuyển sang random.

Bot Win Rate Target: **30-40%** (same as Ván 1)

**Implementation note (cho dev):**
```typescript
// Pseudo-code for Ván 2 Bot
const van2BotScript = {
  round2: { 
    dice: [1, 4], 
    tokenIndex: 2, 
    targetTile: 15,  // Land on Fire (3rd Fire → trigger C3)
    expectCombo: 'C3' 
  },
  round3: { 
    dice: [2, 2], 
    tokenIndex: 1, 
    targetTile: 8,   // Land on Empty Tile
    artifact: 'Swap'  // Use Swap: swap element[0] ↔ element[1]
  },
  round4: { 
    dice: [3, 3], 
    // Setup để trigger Combo lần 2 (Tier 2 milestone)
  },
  round5: { 
    dice: [4, 2], 
    ultimate: 'ExtraRoll'  // If mana >= 50, activate
  },
  round6_onward: { mode: 'RANDOM' }
};

// Power Roll fix
if (playerFirstPowerRoll && van2) {
  result = playerTargetRange;  // Force success
  playerFirstPowerRoll = false;
}
```

**Edge cases:**
- Nếu player không dùng Power Roll trong Ván 2 → OK, optional mechanic
- Nếu Bot không đủ mana ở Round 5 → skip Ultimate demo, không ảnh hưởng ván

---

### 4. Adaptive Highlight System + AFK Safety

**Player Experience Goal:** Hướng dẫn player khi cần thiết, nhưng tự động giảm guidance khi player thành thạo — tránh annoyance cho fast learners.

#### 4.1. Adaptive Mechanics

Highlight system track **consecutiveCorrect** cho từng **action type**:

```typescript
interface ActionProgress {
  rollDice: { consecutiveCorrect: number };
  selectToken: { consecutiveCorrect: number };
  useArtifact: { consecutiveCorrect: number };
  activateUltimate: { consecutiveCorrect: number };
  // ... các action khác
}
```

**Adaptive Rule:**
- Action chưa làm đúng **3 lần liên tiếp** → Highlight active
- Action đã làm đúng **3 lần liên tiếp** → Highlight **tắt** cho action đó
- Nếu sau khi tắt, player **làm sai** → reset về 0, bật lại highlight

**"Correct" Definition:**
- Player thực hiện action hợp lệ và hoàn thành thành công
- Ví dụ: Click dice → rolls → movement happens = 1 correct
- Ví dụ: Click frozen token → error → **KHÔNG tính** correct, reset về 0

**"Consecutive" (Liên tiếp) Definition:**
- Phải là 3 lần đúng **liên tục**, không xen kẽ sai
- Ví dụ: Đúng → Đúng → Sai → Đúng → reset về 1 (không phải 3)

#### 4.2. AFK Safety Net

Nếu highlight đã tắt (player đã thành thạo), nhưng player **AFK >5s** → highlight **bật lại**:

**Trigger Condition:**
- Player không có input nào trong 5 giây
- Action hiện tại cần player thực hiện (ví dụ: đến lượt roll dice)

**Behavior khi trigger:**
- Highlight bật lại cho action đó (Tier 1)
- Timer tiếp tục → 3s → Tier 2 (tooltip)
- Timer tiếp tục → 10s → Tier 3 (modal)

**Reset condition:**
- Player thực hiện action bất kỳ → reset timer về 0
- Highlight tắt lại nếu `consecutiveCorrect` vẫn ≥ 3

**Edge cases:**
- Nếu player đang ở giữa animation (ví dụ: ngựa đang di chuyển) → **KHÔNG** count AFK
- Chỉ count AFK khi đang chờ player input

#### 4.3. Three-Tier Hint System

Mỗi action có 3 mức độ gợi ý, kích hoạt theo thời gian idle:

**Tier 1: UI Highlight (0s)**
- **Visual:** Element cần interact được highlight (vàng pulse border, z-index cao)
- **Text:** KHÔNG có text
- **Trigger:** Ngay khi đến lượt action đó (hoặc AFK >5s bật lại)

**Tier 2: Gentle Hint (3s)**
- **Visual:** Highlight tiếp tục
- **Text:** Tooltip nhỏ xuất hiện bên cạnh element: "Bấm vào [element name]"
- **Trigger:** Player không có action trong 3 giây

**Tier 3: Explicit Help (10s)**
- **Visual:** Modal popup toàn màn hình
- **Text:** Chi tiết instruction + screenshot/icon
- **Action:** Button "Làm hộ tôi" — nếu click, game auto-perform action đó
- **Trigger:** Player không có action trong 10 giây

**Edge cases:**
- Nếu player thực hiện action **sai** → reset timer về 0, bắt đầu lại từ Tier 1
- Nếu player click "Làm hộ tôi" → action auto-perform NHƯNG **KHÔNG tính** vào `consecutiveCorrect` (highlight vẫn active lần sau)
- Nếu player đang ở Tier 3 (modal open) nhưng tự thực hiện action đúng → đóng modal, tính `consecutiveCorrect++`

#### 4.4. Highlight Targets per Action

| Action | Highlight Target (CSS selector / ID) | Tier 2 Hint Text | Tier 3 Modal Title |
|--------|--------------------------------------|------------------|--------------------|
| Roll Dice | `#dice-button` | "Bấm vào NÚT XÚC XẮC để bắt đầu lượt" | "Đổ Xúc Xắc" |
| Select Token | `.token-selectable` (all valid tokens) | "Chọn 1 NGỰA để di chuyển" | "Chọn Ngựa" |
| Choose Element (Goal Reward) | `.element-option` (4 buttons) | "Chọn 1 nguyên tố để thêm vào hàng đợi" | "Phần Thưởng Về Đích" |
| Use Artifact (Empty Tile) | `.artifact-button` (available artifacts) | "Chọn 1 Artifact để sử dụng" | "Sử dụng Artifact" |
| Activate Ultimate | `#ultimate-button` | "Bấm để dùng Ultimate (cost 50 Mana)" | "Kích Hoạt Ultimate" |
| Power Roll Toggle | `#power-roll-toggle` | "Bật Power Roll để chọn khoảng giá trị mong muốn" | "Power Roll (Optional)" |

**Note:** Power Roll highlight chỉ xuất hiện **1 lần duy nhất** ở Ván 2, Round 6. Sau đó không highlight nữa — player tự quyết định dùng hay không.

#### 4.5. Highlight Disable Progression Example

**Example Timeline (cho action "Roll Dice"):**

| Turn # | Player Action | Consecutive Correct | Highlight Active? | Note |
|--------|---------------|---------------------|-------------------|------|
| 1 | Click dice (success) | 1 | YES (Tier 1) | First correct |
| 2 | Click dice (success) | 2 | YES (Tier 1) | Second correct |
| 3 | Click frozen token (error) | **0** (reset) | YES (Tier 1) | Error → reset |
| 4 | Click dice (success) | 1 | YES (Tier 1) | Count từ đầu |
| 5 | Click dice (success) | 2 | YES (Tier 1) | |
| 6 | Click dice (success) | 3 | YES (Tier 1) | **3rd consecutive** |
| 7 | Click dice (success) | 4 | **NO** | Highlight disabled |
| 8 | AFK 5s | 4 | **YES** (AFK Safety) | Bật lại vì AFK |
| 9 | Click dice (success) | 5 | **NO** | Tắt lại sau action |

---

### 5. Tutorial Flow & Progression

**Player Experience Goal:** Smooth, uninterrupted journey từ lúc bắt đầu tutorial đến lúc sẵn sàng chơi normal match.

#### 5.1. Tutorial Entry Point

Player vào tutorial qua:
- **Main Menu:** Button "Hướng Dẫn" (first-time players)
- **Settings Menu:** Button "Xem Lại Tutorial" (returning players)

Khi bấm "Hướng Dẫn":
- **Welcome Modal** hiển thị:
  ```
  Chào mừng đến Elemental Hunter!
  
  Bạn sẽ trải nghiệm 2 ván tutorial:
  - Ván 1: Học cách di chuyển và chiến đấu
  - Ván 2: Học combo và công cụ nâng cao
  
  Mỗi ván ~4-5 phút.
  
  [Bắt đầu] [Bỏ qua Tutorial]
  ```
- Nếu click "Bắt đầu" → Enter Ván 1
- Nếu click "Bỏ qua Tutorial" → Quay về Main Menu

#### 5.2. Ván 1 → Ván 2 Transition

Khi Ván 1 kết thúc (HP=0 hoặc hết rounds):

**NO Modal, NO summary screen** — chỉ có **smooth fade transition**:

1. **Fade out animation** (0.5s)
   - Màn hình fade to black
   - Text nhỏ xuất hiện: "Ván 1 hoàn thành. Chuẩn bị Ván 2..."

2. **Reset game state:**
   - HP về 300 (cả 2 players)
   - Element Queue clear
   - Combo count reset
   - Mana reset
   - Ngựa về vị trí khởi đầu
   - Board reset (tất cả Elemental Tiles có nguyên tố)

3. **Fade in animation** (0.5s)
   - Màn hình fade in
   - Text: "Ván 2: Advanced Tutorial"
   - Ván 2 bắt đầu (Player 1 đi trước)

**Tổng thời gian transition:** ~2-3 giây

**Edge cases:**
- Player **KHÔNG thể** skip transition (đảm bảo state reset hoàn tất)
- Player **KHÔNG thể** exit giữa transition
- Nếu có lỗi khi reset state → fallback: modal "Đang tải..." + retry

#### 5.3. Exit Conditions

Tutorial chỉ kết thúc khi **Ván 2 kết thúc tự nhiên**:

**Exit triggers:**
- **KO:** HP của Player hoặc Bot về ≤ 0
- **Round Limit:** Hoàn thành Round 8 (max rounds)

**KHÔNG có:**
- ❌ Manual exit button (player không thể thoát giữa chừng)
- ❌ Skip tutorial button (sau khi đã bắt đầu)
- ❌ Objective-based exit (không có checklist)

**Lý do:** Đảm bảo player trải nghiệm đủ mechanics. Tutorial chỉ 8-10 phút, không đủ dài để cần exit button.

**Exception:** Nếu player close app/browser giữa chừng → khi quay lại, **restart từ đầu** (không save progress).

#### 5.4. Post-Tutorial (Sau Ván 2)

Khi Ván 2 kết thúc:

**Completion Modal** hiển thị:

```
Tutorial Hoàn Thành!

Bạn đã sẵn sàng cho ván đấu thật.

Đã học:
✓ Movement & Combat
✓ Element & Combo
✓ Artifact & Ultimate

[Chơi Ván Mới] [Xem Lại Tutorial] [Quay Về Menu]
```

**Buttons:**
- **Chơi Ván Mới:** Start normal match (Level selection screen)
- **Xem Lại Tutorial:** Restart từ Ván 1
- **Quay Về Menu:** Back to Main Menu

**No rewards, no unlocks** — tutorial chỉ là learning experience.

#### 5.5. Replay Tutorial

Player có thể replay tutorial bất kỳ lúc nào từ:
- Main Menu → "Hướng Dẫn"
- Settings → "Xem Lại Tutorial"

Khi replay:
- Tất cả progress (`consecutiveCorrect`, Bot script position) **reset về 0**
- Highlight system hoạt động như lần đầu
- KHÔNG có fast-forward hoặc skip option

**Use case:** Player quên mechanics, hoặc muốn practice thêm trước ranked match.

---

## Balance & Config

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Tutorial Structure** | | |
| Số ván | 2 | Ván 1: Basic, Ván 2: Advanced |
| Duration mỗi ván | 4-5 phút | Total tutorial: 8-10 phút |
| Progression | Linear (Ván 1 → Ván 2 bắt buộc) | Không skip |
| **Practice Mode Config** | | |
| HP mỗi ván | 300 | 50% of Lv1 normal (600) |
| Max Rounds | 8 | 67% of Lv1 normal (12) |
| Combo Tiers Unlocked | 3 | Unlock hết (Tier 1, 2, 3) |
| Artifact Slots | 3 | Unlock hết (Swap, Change, Charge) |
| emptyTileVisits | Pre-unlocked | Không cần farm |
| **Adaptive Highlight** | | |
| Disable Threshold | 3 lần đúng liên tiếp | Tắt highlight cho action đó |
| AFK Timeout | 5 giây | Bật lại highlight nếu AFK >5s |
| **3-Tier Hint System** | | |
| Tier 1 Delay | 0s | UI Highlight ngay lập tức |
| Tier 2 Delay | 3s | Tooltip sau 3s idle |
| Tier 3 Delay | 10s | Modal + "Làm hộ tôi" sau 10s |
| **Bot Strategy** | | |
| Bot Win Rate Target | 30-40% | Majority players nên thắng |
| Scripted Phase (Ván 1) | Rounds 1-5 | Demo Movement, Element, Kick |
| Random Phase (Ván 1) | Rounds 6-8 | Sau khi học xong |
| Scripted Phase (Ván 2) | Rounds 1-5 | Demo Combo, Artifact, Ultimate |
| Random Phase (Ván 2) | Rounds 6-8 | Sau khi học xong |
| Power Roll Fix | Lần đầu only | Force success lần đầu dùng |
| **Transition** | | |
| Fade duration | 0.5s out + 0.5s in | Total ~2-3s với text |
| State reset | Full reset | HP, Queue, Mana, Board |

---

## Metrics

*Dựa trên goals: teach mechanics trong 8-10 phút, tăng retention, positive first impression.*

### User Behavior

*Purpose: Đo lường tutorial effectiveness và player engagement.*

| Metric | Description | Target | How to Measure |
|--------|-------------|--------|----------------|
| Tutorial Completion Rate | % players hoàn thành cả 2 ván tutorial (đến Post-Tutorial modal) | ≥ 85% | Count players reaching Completion Modal / total entering tutorial |
| Ván 1 Completion Rate | % players hoàn thành Ván 1 (đến transition) | ≥ 90% | Count players reaching transition / total starting Ván 1 |
| Ván 2 Completion Rate | % players hoàn thành Ván 2 sau khi vào | ≥ 90% | Count players completing Ván 2 / total entering Ván 2 |
| Average Tutorial Duration | Thời gian trung bình từ Welcome Modal đến Completion Modal | 8-10 phút | `completionTime - entryTime` |
| Average Ván 1 Duration | Thời gian trung bình cho Ván 1 | 4-5 phút | `transitionTime - van1StartTime` |
| Average Ván 2 Duration | Thời gian trung bình cho Ván 2 | 4-5 phút | `completionTime - van2StartTime` |
| Tutorial Win Rate (Ván 1) | % players thắng Ván 1 | 60-70% | Count player wins / total Ván 1 completions |
| Tutorial Win Rate (Ván 2) | % players thắng Ván 2 | 60-70% | Count player wins / total Ván 2 completions |
| Highlight "Làm hộ tôi" Usage | % lần player bấm "Làm hộ tôi" thay vì tự thực hiện | ≤ 20% | Count "auto-perform" clicks / total Tier 3 modals shown |
| Tier 3 Modal Trigger Rate | % turns player AFK >10s (trigger Tier 3) | ≤ 10% | Count Tier 3 appearances / total player turns |
| Average Highlight Disable Per Action | Số turns trung bình để disable highlight cho mỗi action type | ~3-5 | Average turns until `consecutiveCorrect >= 3` per action |
| Replay Tutorial Rate | % players chọn "Xem Lại Tutorial" từ menu sau lần đầu | ≥ 5% | Count replay clicks / total unique players |
| Post-Tutorial Action | % chọn "Chơi Ván Mới" vs "Quay Menu" sau Completion Modal | 70% "Chơi Ván Mới" | Track button clicks |

### Balance

*Purpose: Đảm bảo tutorial không quá dễ/khó, mechanics được demo đầy đủ.*

| Metric | Description | Target | How to Measure |
|--------|-------------|--------|----------------|
| Average HP Remaining (Player Win) | HP trung bình còn lại của player khi thắng | 100-150 / 300 | Average `player.hp` when player wins |
| Average HP Remaining (Bot Win) | HP trung bình còn lại của bot khi thắng | 50-100 / 300 | Average `bot.hp` when bot wins |
| KO Rate vs Round Limit Rate | % ván kết thúc bằng KO so với hết rounds | KO: 50-60%, Round Limit: 40-50% | Track win condition type |
| Player Combo Count (Ván 2) | Số combo trung bình player kích hoạt ở Ván 2 | ≥ 1 | Average `player.comboCount` in Ván 2 |
| Player Artifact Usage (Ván 2) | Số lần trung bình player dùng Artifact ở Ván 2 | ≥ 1 | Count artifact uses in Ván 2 |
| Player Ultimate Usage (Ván 2) | % ván mà player activate Ultimate ít nhất 1 lần | 40-60% | Count Ván 2 with `ultimateExtraRolls > 0` |
| Player Power Roll Usage (Ván 2) | % ván mà player dùng Power Roll ít nhất 1 lần | 30-50% | Count Ván 2 with Power Roll activated |
| Bot Kick Success Rate (Ván 1) | % lần Bot Kick script thành công ở Round 5 | ≥ 90% | Count successful Kicks / total Ván 1 Round 5 |
| Bot Combo Trigger Rate (Ván 2) | % lần Bot trigger Combo ở Round 2 | ≥ 95% | Count successful Combo triggers / total Ván 2 Round 2 |

---

## Open Questions / TBD

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Có cần "Pause Tutorial" button không? (nếu player cần AFK giữa chừng) | Designer | Open |
| 2 | Post-Tutorial Completion Modal có cần show stats không? (ví dụ: "Bạn thắng 2/2 ván, thời gian: 9 phút") | Designer | Open |
| 3 | Nếu player close app giữa Ván 1 và quay lại → restart từ đầu hay resume từ Ván 1? | Designer | Open |
| 4 | Power Roll fix lần đầu: force success hay force vào mid-range (để realistic hơn)? | Designer | Open |

---

## Glossary

| Term | Definition |
|------|------------|
| **Tutorial System** | Feature dạy first-time players qua 2 ván Practice Mode (8-10 phút tổng). Code: `tutorialMode = true` |
| **Ván 1 / Basic Tutorial** | Ván đầu (4-5 phút) dạy Movement + Element + Combat. Code: `tutorialStage = 'VAN_1'` |
| **Ván 2 / Advanced Tutorial** | Ván thứ 2 (4-5 phút) dạy Combo + Artifact + Ultimate. Code: `tutorialStage = 'VAN_2'` |
| **Practice Mode** | Game mode với config rút ngắn (HP=300, 8 rounds) và Bot AI. Code: `gameMode = 'PRACTICE'` |
| **Adaptive Highlight** | Hệ thống highlight tự động tắt sau 3 lần đúng liên tiếp. Code: `ActionProgress.consecutiveCorrect` |
| **AFK Safety Net** | Bật lại highlight nếu player AFK >5s (dù đã tắt). Code: `afkTimer > 5000` |
| **Consecutive Correct** | Số lần player làm đúng **liên tiếp** (không xen kẽ sai). Reset về 0 nếu làm sai. Code: `consecutiveCorrect` |
| **Three-Tier Hint** | 3 mức độ gợi ý: Tier 1 (0s, highlight), Tier 2 (3s, tooltip), Tier 3 (10s, modal). Code: `hintTier` |
| **Scripted Phase** | Giai đoạn bot di chuyển theo kịch bản cố định để demo mechanics. Code: `botMode = 'SCRIPTED'` |
| **Random Phase** | Giai đoạn bot di chuyển random sau khi đã demo đủ. Code: `botMode = 'RANDOM'` |
| **Power Roll Fix** | Lần đầu player dùng Power Roll → kết quả force success để demo mechanic. Code: `powerRollFirstUse` |
| **Smooth Fade Transition** | Chuyển cảnh giữa Ván 1 → Ván 2 bằng fade animation (không modal). Code: `fadeTransition()` |
| **Completion Modal** | Modal hiển thị sau khi hoàn thành Ván 2. Code: `showCompletionModal()` |
| **Linear Progression** | Player phải chơi Ván 1 → Ván 2 theo thứ tự (không skip). Code: `progressionType = 'LINEAR'` |
| **Bot Win Rate Target** | Tỷ lệ mục tiêu bot thắng (30-40%) để đảm bảo majority players win. |

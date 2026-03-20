# Balance Explain — Elemental Quest

> Tài liệu này giải thích phương pháp tính ra từng chỉ số trong `config/balance.ts`.
> Để chỉnh sửa giá trị, mở `config/balance.ts` — không cần sửa file này.

---

## 1. TILE_REWARD_BASE (ATK/Mana per tile) — `10 → 30`

**Framework áp dụng:** TTK (Time to Kill)

Mục tiêu: Ít nhất 1 trong 2 scenario sau phải xảy ra trong 15 rounds:
- KO đối thủ (combat win), hoặc
- Tạo đủ damage để HP gap có ý nghĩa (HP win với cách biệt rõ ràng)

**Tính với giá trị cũ (10):**
```
Số elemental tiles trung bình/15 rounds = 15 rounds × 0.60 landing rate = 9 tiles
ATK tích lũy (không combo) = 9 × 10 = 90 ATK
Kicks kỳ vọng = 2–3 × 90 ATK = 180–270 damage / 1000 HP → 18–27% HP
→ Không đủ tension. Hầu hết game kết thúc bằng HP win với cách biệt nhỏ.
```

**Tính với giá trị mới (30):**
```
ATK tích lũy (không combo) = 9 × 30 = 270 ATK
Kicks kỳ vọng = 2–3 × 270 ATK = 540–810 damage / 600 HP (Lv1) → 90–135%
→ KO khả thi với chiến lược tốt, ngay cả không có combo.
Với combo (×1 lần, ~50% games): ATK = 270 + 150 = 420 ATK → damage cao hơn đáng kể.
```

---

## 2. COMBO_T1_ATK_BONUS (+150 ATK) — Giữ nguyên

**Lý do giữ nguyên:**
Với `TILE_REWARD_BASE = 30`, một combo T1 tương đương 5 tile ATK — là một milestone có ý nghĩa nhưng không overpowered. Nếu tăng bonus lên (ví dụ +200), kết hợp với base 30 sẽ tạo ra ATK spike quá lớn ở Lv1.

---

## 3. COMBO_T3_ATK_MULTIPLIER (×1.5) — Giữ nguyên

**Lý do giữ nguyên:**
Tier 3 chỉ unlock ở combo thứ 3 (Lv3 only). Tại điểm đó ATK tích lũy có thể đạt 760+:
```
Base ATK = 9 tiles × 30 = 270
Combo 1: +150 → 420
Combo 2: Double Harvest (×2 tile gains từ đây)
Combo 3: 420 × 1.5 = 630 ATK per token, 3 tokens → 1890 total damage potential
```
×1.5 ở mức này đã đủ để KO từ bất kỳ HP nào. Tăng thêm là overkill.

---

## 4. ULTIMATE_COST_EXTRA_ROLL & TELEPORT (50 Mana) — Giữ nguyên

**Framework áp dụng:** Opportunity Cost

Mana rate = 9 tiles × 30 (non-affinity ~50%) ≈ 135 Mana/15 rounds = ~9 Mana/round.
50 Mana ≈ ~5–6 rounds để tích lũy → Ultimate dùng được khoảng 2–3 lần/game.
Đây là tần suất phù hợp — đủ để có impact, không đủ để spam.

---

## 5. DEFAULT_ACCURACY_RATE (30% → 35%)

**Tính:**
```
Power Roll miss rate cũ: 70% → người chơi thường bỏ lỡ cơ hội chiến lược
Target: Miss rate ~65% — đủ để Power Roll là risk/reward thực sự
35% accuracy = 65% miss rate → cải thiện nhẹ mà không làm mất randomness
```

---

## 6. ARTIFACT_THRESHOLDS (1 / 2 / 3 visits) — Giữ nguyên

**Framework áp dụng:** Session Pacing

```
Expected empty tile visits per player (15 rounds, 3 empties/10 tiles):
  Visits/round = 0.30 landing rate × 1 turn/round = 0.30 visits/round
  → Visit 1: round 3.3   → Swap mở sớm ✓
  → Visit 2: round 6.7   → Change mở mid-game ✓
  → Visit 3: round 10    → Charge mở late-game ✓
```
Timing này tạo ra power curve tự nhiên trong session. Hạ threshold sẽ front-load artifacts và làm mất mid/late-game progression.

---

## 7. Level HP & maxRounds

### Lv1: HP 1000 → 600, Rounds 15 → 12

**TTK với Lv1 (1 combo tier, Swap only):**
```
P(combo trong 12 rounds) ≈ 28% — combo ít hơn nhưng vẫn xảy ra
ATK damage kỳ vọng (no combo, 12 rounds) = 7 tiles × 30 × 2–3 kicks = 420–630
HP 600 → 70–100% HP damage → tension cao dù không có combo
HP 1000 → 42–63% → game kết thúc nhạt với HP win nhỏ
```
12 rounds × 2 players × 15s/turn ≈ 6 phút — phù hợp cho beginner/tutorial.

### Lv2: HP 1500 → 800, Rounds 15

**TTK với Lv2 (2 combo tiers):**
```
Combo 1: +150 ATK
Combo 2: Double Harvest (×2 tile gains)
ATK kỳ vọng với 2 combos = 9×30 + 150 + (thêm gains×2) ≈ 600 ATK
2–3 kicks × 600 = 1200–1800 damage
HP 1500 → chỉ 80–120% → cần mọi thứ hoàn hảo để KO → game kém tension
HP 800  → 150–225% → KO khả thi với play tốt, HP win nếu không có combo
```

### Lv3: HP 1000, Rounds 15 — Giữ nguyên

Tier 3 tạo ATK đủ lớn (630+ per token × 3 tokens) để KO từ bất kỳ HP nào.
HP 1000 tạo ra buffer hợp lý — không KO ngay từ 1 combo, cần chiến lược.

---

## Tóm tắt

| Tham số | Cũ | Mới | Lý do chính |
|---------|-----|-----|-------------|
| `TILE_REWARD_BASE` | 10 | **30** | TTK: damage phải đủ để tạo KO threat |
| `COMBO_T1_ATK_BONUS` | 150 | 150 | Cân bằng với base mới |
| `COMBO_T3_ATK_MULTIPLIER` | 1.5 | 1.5 | Đủ mạnh ở Lv3, không overkill |
| `ULTIMATE_COST_*` | 50 | 50 | Opportunity cost phù hợp |
| `DEFAULT_ACCURACY_RATE` | 30% | **35%** | Giảm miss rate, tăng agency |
| `ARTIFACT_*_THRESHOLD` | 1/2/3 | 1/2/3 | Pacing tự nhiên theo session |
| Lv1 `playerHP` | 1000 | **600** | TTK tension không cần combo |
| Lv1 `maxRounds` | 15 | **12** | Session time ~6 phút cho beginner |
| Lv2 `playerHP` | 1500 | **800** | TTK khả thi với 2-combo play |
| Lv3 `playerHP` | 1000 | 1000 | T3 combo đã đủ để KO |

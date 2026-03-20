# Balance Sheet — Mucklepuff

## Overview

| Field         | Value                          |
|---------------|-------------------------------|
| Character     | Mucklepuff                    |
| Tier          | A                             |
| Feature       | Character System              |
| Game          | Elemental Hunter              |
| Author        | tramdm                        |
| Date          | 16-03-2026                    |
| Version       | v1                            |
| Status        | Draft                         |

---

## 1. Character Summary

| Thông số | Giá trị |
|----------|---------|
| Tier | A |
| Enlightenment tối đa | En. 5 |
| Char Level tối đa | Lv 90 |
| Số Combo Powers | 3 |
| Ultimate | Extra Roll |

---

## 2. Abilities (Dup0 — Chưa Nâng Cấp)

### Combo Powers

| # | Tên | Hiệu ứng | Kích hoạt khi |
|---|-----|----------|---------------|
| C.Pow 1 | Power Surge | +150 ATK cho **tất cả ngựa** | Mỗi lần có Combo (Combo Tier 1) |
| C.Pow 2 | Double Harvest | Tile Gain Multiplier ×2 (ATK và MAG nhận từ ô tăng gấp đôi) | Milestone Combo thứ 2 (Combo Tier 2) |
| C.Pow 3 | Absolute Might | ATK hiện tại của **tất cả ngựa** ×1.5 (làm tròn lên) | Milestone Combo thứ 3 (Combo Tier 3) |

### Ultimate

| Thông số | Giá trị |
|----------|---------|
| Tên | Extra Roll |
| Hiệu ứng | +1 lượt đổ xúc xắc ngay trong turn hiện tại |
| MAG Cost | **70 MAG** |

---

## 3. Stat Progression (Char Level 1 → 90)

### 3.1 Growth Rate Theo Enlightenment Bracket

Mỗi Enlightenment bracket có per-level gain **cao hơn bracket trước** — nhân vật tăng trưởng nhanh hơn ở giai đoạn đầu tư cao.

| Enlightenment | Lv Range | ATK / lv | MAG / lv | HP / lv |
|---------------|----------|----------|----------|---------|
| En. 1 | 1 – 20 | +0.25 | +0.10 | +10 |
| En. 2 | 21 – 40 | +0.40 | +0.15 | +20 |
| En. 3 | 41 – 60 | +0.60 | +0.20 | +35 |
| En. 4 | 61 – 80 | +0.90 | +0.35 | +40 |
| En. 5 | 81 – 90 | +2.20 | +0.80 | +51 |

> **Cách đọc:** ATK +0.25/lv ở En1 nghĩa là cứ 4 level-up thì ATK tăng +1. ATK +2.20/lv ở En5 nghĩa là mỗi level-up tăng +2 (làm tròn).

### 3.2 Stats Tại Các Mốc Enlightenment

| Char Level | ATK | MAG | HP | Ghi chú |
|------------|-----|-----|----|---------|
| **Lv 1** | 15 | 6 | 600 | Start |
| **Lv 20** | 20 | 8 | 790 | En. 1 cap |
| **Lv 40** | 28 | 11 | 1,190 | En. 2 cap |
| **Lv 60** | 40 | 15 | 1,890 | En. 3 cap |
| **Lv 80** | 58 | 22 | 2,690 | En. 4 cap |
| **Lv 90** | 80 | 30 | 3,200 | En. 5 cap / Max |

### 3.3 Stats Tại Các Level Trung Gian (Tham Khảo)

| Char Level | ATK | MAG | HP |
|------------|-----|-----|----|
| Lv 10 | 17 | 7 | 690 |
| Lv 30 | 24 | 10 | 990 |
| Lv 50 | 34 | 13 | 1,540 |
| Lv 70 | 49 | 19 | 2,490 |
| Lv 85 | 69 | 26 | 2,945 |

---

## 4. Dup Rewards

### 4.1 Bảng Dup Mucklepuff

| Mốc | Loại thưởng | Giá trị |
|-----|-------------|---------|
| **Dup 1** | HP Bonus (flat) | **+200 HP** |
| **Dup 2** | C.Pow 1 lvUP | +150 ATK → **+175 ATK** |
| **Dup 3** | C.Pow 2 lvUP | ×2 → **×2.1** tile gain |
| **Dup 4** | C.Pow 3 lvUP | ×1.5 → **×1.6** ATK multiplier |
| **Dup 5** | Ultimate lvUP | MAG cost 70 → **50 MAG** |

### 4.2 Ultimate Sau Dup 5

| Thông số | Dup 0 | Dup 5 |
|----------|-------|-------|
| MAG Cost | 70 | 50 |
| Hiệu ứng | Extra Roll | Extra Roll (không đổi) |

---

## 5. Phương Pháp Tính — Giải Thích Chi Tiết

### 5.1 Stat Curve (ATK / MAG / HP)

**Mục tiêu thiết kế:** 2 Mucklepuff cùng Char Level đấu nhau → ván kết thúc trong khoảng 15 round.

**Điểm tham chiếu cân bằng:** Lv 60 (En. 3 cap) — đại diện cho player đầu tư trung bình, không cần maxed.

**Ước lượng damage flow tại Lv 60 (ATK=40, HP=1,890):**

| Nguồn damage | Tính toán | Damage |
|-------------|-----------|--------|
| Kick (~2 lần × avg 300 ATK) | 2 × 300 | 600 |
| Goal attack (~1.5 goals × avg 400 ATK) | 1.5 × 400 | 600 |
| **Tổng damage nhận** | | **~1,200** |

Damage/HP = 1,200 / 1,890 ≈ 63% → Player thường xuống còn 37% HP khi kết thúc. KO xảy ra trong các game combo tốt, round limit trong game combo ít. **Cân bằng ở Lv60 ✓**

**Kiểm tra Lv 30 và Lv 90:**

| Level | Damage ước tính | HP | Damage/HP | Kết cục phổ biến |
|-------|----------------|-----|-----------|------------------|
| Lv 30 | ~1,025 | 990 | ~1.03x | KO, round 11–14 |
| Lv 60 | ~1,200 | 1,890 | ~0.63x | Tùy combo, round 12–15 |
| Lv 90 | ~3,210 | 3,200 | ~1.00x | KO, round 13–15 |

> **Ghi chú Lv 90:** Damage cao hơn vì Lv 90 tạo được nhiều MAG hơn (~30 MAG/tile vs 10), dùng được Ultimate 4–5 lần/game (+4–5 extra turns), dẫn đến nhiều lần đổ xúc xắc hơn và nhiều cơ hội damage hơn.

**Tại sao slope tăng ở En 5 là đặc biệt dốc cho ATK (+2.2/lv)?**
En 5 chỉ có 10 levels (vs 20 levels ở En 1–4). Để ATK tăng đủ mạnh trong giai đoạn cuối hành trình, per-level gain cần bù cho số lượng level ít hơn. ATK +2.20/lv × 10 levels = +22 ATK, tương đương mức tăng có ý nghĩa.

**HP En 4–5 đã được điều chỉnh từ bản đầu (En4: 60→40/lv, En5: 91→51/lv):**
Bản đầu có HP Lv90 = 4,000, khiến Damage/HP ≈ 0.8 — game thường không KO được, luôn đi hết round limit. Điều chỉnh xuống 3,200 để KO có ý nghĩa ở mọi level.

---

### 5.2 Dup 1 — HP Bonus: +200 HP

**Tham chiếu:** Lv 60 (HP = 1,890) là mốc "player đang đầu tư tốt nhưng chưa maxed".

```
Mục tiêu: ~10% power tăng về mặt độ bền (durability)
10% × 1,890 = 189 → làm tròn lên → +200 HP
```

**Tính chất:** Flat bonus, không scale theo Char Level.
- Tại Lv 60 (HP=1,890): +200 = **+10.6% HP** ✓
- Tại Lv 90 (HP=3,200): +200 = +6.3% (ít impactful hơn ở max level — bình thường với flat bonus)

---

### 5.3 Dup 2 — C.Pow 1 Upgrade: +150 → +175 ATK

**Mục tiêu:** ~15% power tăng từ C.Pow 1.

```
C.Pow 1 kích hoạt ~3 lần/game (mỗi lần có combo)
Contribution base: 3 × 150 = 450 ATK tổng mỗi combo round per horse

15% của 450 = 67.5 → ÷ 3 combo = +22.5 ATK/combo
Làm tròn → +25 ATK/combo

150 + 25 = +175 ATK
```

Upgrade: **+150 → +175 ATK** per combo trigger.

---

### 5.4 Dup 3 — C.Pow 2 Upgrade: ×2 → ×2.1

**Mục tiêu:** ~10% power tăng từ C.Pow 2.

```
C.Pow 2 nhân đôi tile rewards. "Bonus portion" của ×2 là ×1.0 (phần tăng thêm so với ×1 base).

10% của ×1.0 = +×0.1

×2 + ×0.1 = ×2.1
```

Upgrade: **×2 → ×2.1** tile gain multiplier.

---

### 5.5 Dup 4 — C.Pow 3 Upgrade: ×1.5 → ×1.6

**Mục tiêu:** ~15% power tăng từ C.Pow 3.

```
C.Pow 3 nhân ATK tất cả ngựa. "Bonus portion" của ×1.5 là ×0.5.

15% của ×0.5 = +×0.075 → làm tròn lên → +×0.1

×1.5 + ×0.1 = ×1.6
```

Upgrade: **×1.5 → ×1.6** ATK multiplier.

> Lưu ý: Về mặt thuần toán, ×1.5 → ×1.6 là +20% của bonus portion — nhưng trong game thực, impact thực tế gần với ~15% vì C.Pow 3 chỉ kích hoạt 1 lần duy nhất (combo milestone thứ 3), và trigger timing ảnh hưởng đến tổng hiệu quả.

---

### 5.6 Dup 5 — Ultimate Upgrade: 70 → 50 MAG Cost

**Mục tiêu:** Tăng tần suất sử dụng Ultimate.

```
Tại Lv 90: MAG thu được ~350/game (sau C.Pow 2 active)

Dup 0 (70 MAG): 350 / 70 = 5 lần cast/game → 5 extra turns
Dup 5 (50 MAG): 350 / 50 = 7 lần cast/game → 7 extra turns

Tăng extra turns: +2 lần (bị giới hạn bởi MAX_CONSECUTIVE_ROLLS = 3)
```

Hiệu ứng thực tế: Player có thêm 2 lượt đổ xúc xắc extra trong cả game — ý nghĩa trong giai đoạn late game khi mỗi lượt đều có tác động lớn.

---

## 6. Balance Validation Summary

### Scenario A: Lv 30 vs Lv 30 (Early Progression)

| Metric | Giá trị | Đánh giá |
|--------|---------|---------|
| HP | 990 | — |
| Damage ước tính / game | ~1,000–1,400 | Tùy số combo |
| Kết cục | KO round 11–14 (2 combos) hoặc KO round 9–12 (3 combos) | ✅ Trong 15 round |
| Thời gian ước tính | ~7–9 phút | ✅ ≤ 10 phút |

### Scenario B: Lv 90 vs Lv 90 (Max Level)

| Metric | Giá trị | Đánh giá |
|--------|---------|---------|
| HP | 3,200 | — |
| Turns/player ước tính | ~22 (nhiều Ultimate casts hơn) | — |
| Damage ước tính / game | ~3,200–4,500 | Tùy combo và goal runs |
| Kết cục | KO round 13–15 (phổ biến) hoặc round limit với HP thấp | ✅ Trong 15 round |
| Thời gian ước tính | ~9–10 phút | ✅ ≤ 10 phút |

---

## 7. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Element Affinity của Mucklepuff là gì (Fire / Ice / Grass / Rock)? | Designer | Open |
| 2 | Lore / visual design của Mucklepuff? | Designer | Open |
| 3 | C.Pow 1 / C.Pow 3 áp dụng cho "tất cả ngựa" của player đang dùng Mucklepuff, hay bao gồm cả ngựa đối thủ? (Giả định: chỉ ngựa của player đó) | Designer | Open |
| 4 | Với ×2.1 Tile Gain Multiplier (Dup 3): làm tròn lên hay xuống khi có số lẻ? | Developer | Open |

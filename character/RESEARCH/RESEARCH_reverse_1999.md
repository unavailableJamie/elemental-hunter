# Research: Reverse: 1999 (Bluepoch) — Tier Framework, Upgrade Materials & Gating
**Project:** Elemental Hunter — Character System
**Date:** 16-03-2026
**Mục đích:** Phân tích hệ thống tier, upgrade material, overflow mechanic, và resource gating của Reverse: 1999 để bổ sung insight cho thiết kế Character System của Elemental Hunter.

---

## 1. Tier Framework (Rarity Tiers)

### 1.1 Số tier và tên gọi

Reverse: 1999 dùng hệ thống **sao (★)** với 5 tier nhân vật chơi được (gọi là Arcanists):

| Tier | Ký hiệu | Pull rate (xấp xỉ) |
|------|---------|-------------------|
| 6-star | 6✦ | ~1.5% (rarest) |
| 5-star | 5✦ | ~8.5% |
| 4-star | 4✦ | ~40–45% |
| 3-star | 3✦ | ~40–45% |
| 2-star | 2✦ | ~5% |

### 1.2 Sự khác biệt định tính giữa các tier

Tier cao hơn không chỉ có số lớn hơn — có sự khác biệt **cơ chế** rõ ràng:

| Điểm khác biệt | 2✦–4✦ | 5✦–6✦ |
|---------------|--------|--------|
| **Max Insight level** | Insight II (max Lv50) | Insight III (max Lv60) |
| **Psychube Amplification** | Không có | Có (boost passive effect) |
| **Bonus skill effects** | Giới hạn | Mở thêm effects qua Insight III |

→ **Insight III** là gate quan trọng nhất — chỉ 5✦ và 6✦ mới có. Insight không chỉ tăng level cap mà còn unlock passive bonuses và skill effects mới.

→ **Amplification** (boost Psychube passive) chỉ có trên 5✦/6✦ Psychubes — tạo ra power gap định tính, không chỉ định lượng.

### 1.3 Rarity cố định hay có thể promote?

**Rarity cố định khi nhận được** — không thể promote 4✦ lên 5✦. Insight System là ascension trong cùng 1 tier, không thay đổi star rating.

---

## 2. Upgrade Materials

### 2.1 Universal Currency

**Sharpodonty** (gold equivalent) đi kèm hầu hết mọi upgrade. Nguồn: Wilderness building, stage farming, events, Pawnshop.

---

### 2.2 Character Leveling

| Material | Tiers | Nguồn |
|----------|-------|-------|
| **Dust** (EXP currency) | 1 loại | Resource stages (tốn Cellular Activity), Wilderness Dust Bell Tower (passive ~16,200/16h), events |
| **Sharpodonty** | — | Universal |

Khi char được Insight-upgrade, level **reset về 1** — phải level lại. Stat cũ vẫn được giữ làm base.

---

### 2.3 Ascension — Insight System (cap-break)

**3 giai đoạn cho 5✦/6✦, 2 giai đoạn cho 2✦–4✦:**

| Insight Level | Level cap mở ra | Materials cần |
|--------------|----------------|---------------|
| Insight I | Lv30 → Lv40 | Pages (tier 1) + Sharpodonty |
| Insight II | Lv40 → Lv50 | Scrolls (tier 2) + Sharpodonty |
| Insight III *(5✦/6✦ only)* | Lv50 → Lv60 | Tomes (tier 3) + Sharpodonty |

**Material là Afflatus-specific** theo 6 nguyên tố: Star, Mineral, Beast, Plant, Spirit, Intellect. Char nguyên tố nào cần Pages/Scrolls/Tomes của nguyên tố đó — không thể dùng lẫn.

- **Nguồn**: Insight Stages (stage đặc biệt, tốn Cellular Activity); craft tier thấp → cao tại Wishing Spring.
- **Pattern**: 3 tier material (Page < Scroll < Tome) — đúng chuẩn phổ biến nhất trong benchmark.

---

### 2.4 Skill Upgrade — Portray System (duplicate-based)

**Không có "skill book"** như CRK hay Crash Fever. Skill upgrade hoàn toàn từ duplicate:

| Số copy | Kết quả |
|---------|---------|
| Copy 1 (base) | Sở hữu char |
| Copy 2–6 | Mỗi copy → **1 Artifice** + 12 Albums of the Lost |
| Copy 7+ (sau P5 max) | Mỗi copy → **28 Albums of the Lost** (không còn Artifice) |

**Artifice** → mở Portray P1→P5 (tăng damage/heal/buff potency của skill). P5 = max.

→ **Insight**: Đây là cách đơn giản nhất — không có material skill riêng, chỉ dùng duplicate. So sánh: CRK dùng Skill Powder (class-specific), Crash Fever dùng Secret Art Fruit, Honkai HSR dùng Skill Books. Reverse 1999 gọn nhất.

---

### 2.5 Equipment — Psychube System

Mỗi char trang bị 1 **Psychube** (passive stat + unique effect). Có 2 upgrade subsystem:

| Subsystem | Material | Tiers | Nguồn |
|-----------|----------|-------|-------|
| **Engraving** (level up) | Duplicate Psychubes làm EXP fodder + Sharpodonty | — | Pneuma Analysis stages (2 lần/ngày miễn phí), event shops |
| **Amplification** (boost passive) | Specific Amplification mats | — | Gacha/events; **chỉ có ở 5✦/6✦ Psychube** |

→ Dùng **Psychube làm fodder cho Psychube** — tương tự cơ chế AFK Arena dùng gear làm fodder cho gear.

---

### 2.6 Endgame — Resonance System (Talent Grid)

Hệ thống endgame duy nhất — unlock sau story 3-2:

- **Cơ chế**: Mỗi char có grid (tối đa 7×7 tại Resonance Lv10). Player xếp "idea pieces" Tetris-shaped vào grid để phân bổ stat bonuses (HP, ATK, RES...).
- **Resonance Levels**: 1–15 (grid max tại Lv10; Lv11–15 unlock thêm pieces).
- **Material**: **Oneiric Fluid** + Sharpodonty.
- **Nguồn Oneiric Fluid**: Artificial Somnambulism (Limbo) — endgame mode. Mỗi lần full clear → **2,160 Oneiric Fluid**. Limbo reset **2 lần/tháng** (ngày 1 và 16) → max ~4,320 Oneiric Fluid/tháng.
- **Đây là resource bị time-gate nghiêm nhất** trong game — phải lên kế hoạch cẩn thận char nào invest Resonance trước.

---

### 2.7 Bảng tóm tắt Materials

| Upgrade Type | Material chính | Tiers | Nguồn |
|-------------|----------------|-------|-------|
| Level Up | Dust + Sharpodonty | 1 loại | Resource stages, Wilderness |
| Insight (Ascension) | Pages/Scrolls/Tomes (Afflatus-specific) + Sharpodonty | 3 tier | Insight stages, Wishing Spring craft |
| Portray (Skill) | Duplicate character → Artifice | 1 loại/char | Gacha pulls |
| Psychube Level | Duplicate Psychubes + Sharpodonty | — | Pneuma Analysis |
| Psychube Amplification | Amplification materials | — | Gacha/events |
| Resonance (endgame) | Oneiric Fluid + Sharpodonty | 1 loại | Limbo (bimonthly) |
| Overflow currency | Albums of the Lost (5✦/6✦), Tracks of the Lost (≤4✦) | 2 loại | Post-P5 duplicates |

---

## 3. Overflow & Duplicate Handling

### 3.1 Hệ thống "Lost" currency — 3 loại tách biệt theo rarity

| Currency | Đến từ | Dùng ở đâu |
|----------|--------|-----------|
| **Track of the Lost** | Duplicate 2✦/3✦/4✦ | Bass Counter (Pawnshop) |
| **Album of the Lost** | Duplicate 5✦/6✦ | Treble Counter (Pawnshop) |
| **Cassette of the Lost** | Event banners (1 per pull) | Event shop (200 = 1 featured char) |

**Track of the Lost là 1 loại currency duy nhất** — không phân biệt 2✦ track vs 3✦ track. Tất cả duplicate 2✦/3✦/4✦ đều cộng vào cùng 1 pool.

---

### 3.2 Duplicate per rarity — chi tiết

**5✦/6✦ (Albums of the Lost):**

| Trạng thái | Kết quả |
|-----------|---------|
| Portray chưa P5 (copy 2–6) | **1 Artifice** + **12 Albums of the Lost** |
| Portray đã P5 max (copy 7+) | **28 Albums of the Lost** |

**2✦/3✦/4✦ (Tracks of the Lost):**

| Rarity | Copy 2–6 (còn Portray) | Copy 7+ (Portray maxed) |
|--------|------------------------|------------------------|
| **2✦** | 1 Artifice + **3 Tracks** | **5 Tracks** |
| **3✦** | 1 Artifice + **4 Tracks** | **7 Tracks** |
| **4✦** | 1 Artifice + **8 Tracks** | **12 Tracks** |

→ Portray hoạt động **giống hệt nhau** ở mọi rarity — duplicate đều dùng để nâng Portray P0→P5 trước, sau đó chuyển thành Lost currency.

---

### 3.3 Conversion path — Bass Counter vs Treble Counter

**Bass Counter (Track of the Lost — ≤4✦):**
- **Unilog** (gacha pull currency) — khuyến nghị ưu tiên mua nhất
- MF/LF Polarization (Psychube cap-break material, **không farm được ở đâu khác**)
- Upgrade materials thông thường (Solidus, Dust, Enlighten II)
- Rotating char Photographs (4✦ hoặc thấp hơn, 2 char/tháng)

**Treble Counter (Album of the Lost — 5✦/6✦):**
- Unilogs
- Insight materials, Resonance materials
- **Photographs** (targeted summon): 240 Albums = 1 char 6✦ tùy chọn; 60 Albums = 1 char 5✦ tùy chọn

**Nguyên tắc quan trọng**: Track **không thể đổi sang 5✦/6✦ char** — duplicate thấp không "leo" lên char cao được. Phân tầng rõ ràng giữa low-rarity và high-rarity overflow.

→ **Conversion path đầy đủ nhất trong benchmark**: duplicate → Portray (skill boost) → khi max → Lost currency → Pawnshop → gacha currency / targeted summon.

---

## 4. Resource Gating

### 4.1 Time-Gated Resources

| Resource | Cơ chế | Cap |
|----------|--------|-----|
| **Cellular Activity** (stamina) | Regen chậm theo thời gian | ~185 CA tại account lv30 |
| **Daily Missions** | Reset lúc 05:00 UTC-5 mỗi ngày | Clear Drops, Sharpodonty, Battle Pass EXP |
| **Pneuma Analysis** | 2 lần/ngày miễn phí | Psychube farming |
| **Limbo (Artificial Somnambulism)** | Reset ngày 1 và 16 mỗi tháng | 2,160 Oneiric Fluid + 600 Clear Drops per full clear |
| **Event Windows** | Timed content, hết event = mất vĩnh viễn | Materials, cosmetics, event characters |

→ **Limbo là time-gate cứng nhất** — Oneiric Fluid (Resonance material) hầu như chỉ đến từ đây. F2P bị giới hạn tiến độ endgame theo lịch Limbo.

### 4.2 Pay-Gated Resources

| Resource | Chi tiết | Loại |
|----------|----------|------|
| **Crystal Drop** | **Chỉ mua bằng tiền thật**, không thể farm F2P. Convert 1:1 sang Clear Drop | Hard pay gate |
| **Monthly Card** (~$5/tháng) | 300 Crystal Drops ngay + 90 Clear Drops/ngày × 30 ngày = ~15 pulls thêm/tháng | Soft pay gate |
| **Battle Pass** (~$10–15) | Paid track: 5× Sharpodonty + Dust hơn F2P; cosmetic + Clear Drops | Soft pay gate |
| **Exclusive cosmetics** | Garments/skins từ paid Battle Pass — cosmetic only | Hard pay gate (QoL) |

### 4.3 F2P vs P2W

| | F2P | Spender (Monthly Card + BP) |
|--|-----|---------------------------|
| Pulls/năm | ~935 | ~1,100 |
| Sharpodonty/Dust | Bình thường | ~5× nhiều hơn (Battle Pass) |
| Crystal Drop | 0 | Có |
| Exclusive cosmetics | Không | Có |

**Kết luận**: Pay gate chủ yếu là **soft gate** — F2P vẫn có thể tiến được, chỉ chậm hơn về số pull và resource throughput. Hard gate duy nhất là cosmetics và Crystal Drop — không ảnh hưởng combat trực tiếp. **Không có P2W cứng** ảnh hưởng gameplay.

### 4.4 Hard gate vs Soft gate

| Loại | Ví dụ | Đặc điểm |
|------|-------|---------|
| **Hard time gate** | Limbo (Oneiric Fluid), Event windows | Không thể bypass dù có tiền |
| **Soft time gate** | Cellular Activity | Có thể mua thêm Picrasma Candy bằng Crystal Drop |
| **Hard pay gate** | Crystal Drop, exclusive cosmetics | F2P hoàn toàn không có — nhưng chỉ ảnh hưởng số pulls và cosmetic |
| **Soft pay gate** | Battle Pass Sharpodonty/Dust | F2P thiệt thòi về resource throughput, không block gameplay |

---

## 5. Pattern Nổi Bật

### Pattern 1: Rarity cố định, Insight là cap-break trong tier
Tương tự Capybara Go — không thể promote rarity. Sức mạnh tier cao đến từ Insight III (max Lv60 vs Lv50) và Amplification — không phải từ promote.

### Pattern 2: Skill upgrade hoàn toàn từ duplicate (Portray)
Cách đơn giản nhất trong benchmark: không có Skill Book riêng. Duplicate → Artifice → Portray. Thừa duplicate → Albums of the Lost → exchange shop. Zero waste.

### Pattern 3: Afflatus-specific material (tương tự elemental theme)
Insight material theo Afflatus (nguyên tố) của char — Star/Mineral/Beast/Plant/Spirit/Intellect. Không dùng chéo được. Tương tự CRK's class-specific Skill Powder hay HSR's Path-specific Skill Books.

### Pattern 4: Endgame resource time-gate nghiêm
Oneiric Fluid (Resonance) chỉ đến từ Limbo bimonthly — tạo ra progression cap rõ ràng. F2P phải prioritize char nào invest Resonance. Hard time gate nhưng **không phải pay gate** — tiền không bypass được.

### Pattern 5: Pay gate chỉ ảnh hưởng throughput, không block content
F2P có thể clear tất cả content. Pay chỉ giúp có nhiều pull hơn và resource nhanh hơn — không unlock gameplay mechanic mới.

---

## 6. Recommendations Bổ Sung cho Elemental Hunter

1. **Skill upgrade không nhất thiết cần material riêng** — Reverse 1999 chứng minh dùng duplicate char làm skill upgrade material là sạch và đơn giản. Phù hợp nếu EH có gacha/collection element.

2. **Afflatus-specific material insight** — EH đã có nguyên tố (Fire/Ice/Grass/Rock). Upgrade material có thể theo nguyên tố — Fire char cần Fire material. Thêm thematic coherence mà không thêm quá nhiều loại material.

3. **Endgame content là time-gate hợp lệ** — Gate Resonance/endgame upgrade bằng time (Limbo-like content mở 2 lần/tháng) thay vì pay-gate. Player cảm giác fair hơn. Limbo model của R1999 là thiết kế tốt.

4. **Không cần hard P2W** — R1999 là game successful với soft pay gate. Hard pay gate chỉ áp dụng cho cosmetics, không combat. EH có thể học cách này.

---

## Sources

- [Reverse: 1999 Beginner Guide — Prydwen Institute](https://www.prydwen.gg/re1999/guides/beginner-guide/)
- [Insight Guide — DotGG](https://dotgg.gg/reverse-1999/insight-guide/)
- [Insight Materials Cheat Sheet — Prydwen Institute](https://www.prydwen.gg/re1999/guides/insight-cheat-sheet/)
- [Resonate Guide — DotGG](https://dotgg.gg/reverse-1999/resonate-guide/)
- [Material Farming Guide — DotGG](https://dotgg.gg/reverse-1999/material-farming-guide/)
- [Psychubes Guide — GamingOnPhone](https://gamingonphone.com/guides/reverse-1999-psychubes-guide-how-to-get-upgrade-tips/)
- [Character Improvement Guide — AppGamer](https://www.appgamer.com/reverse-1999-character-improvement-guide)
- [Cellular Activity — Reverse: 1999 Fandom Wiki](https://reverse1999.fandom.com/wiki/Cellular_Activity)
- [Album of the Lost — Reverse: 1999 Fandom Wiki](https://reverse1999.fandom.com/wiki/Album_of_the_Lost)
- [Reverse 1999 Monetization F2P vs P2W — PlayOholic](https://www.playoholic.com/reverse-1999-monetization/)
- [Is Roar Jukebox Deluxe Edition Worth It? — Sportskeeda](https://www.sportskeeda.com/esports/is-reverse-1999-roar-jukebox-battle-pass-deluxe-edition-worth-it)

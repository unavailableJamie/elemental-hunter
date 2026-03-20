# Character System — Game Design Document

## Overview

| Field         | Value                          |
|---------------|-------------------------------|
| Feature       | Character System              |
| Game          | Elemental Hunter              |
| Author        | tramdm                        |
| Date          | 16-03-2026                    |
| Last Modified | 16-03-2026                    |
| Version       | v1.3                          |
| Status        | Draft                         |

## Change Log

| Version | Date       | Changed By | Summary |
|---------|------------|------------|---------|
| v1      | 16-03-2026 | tramdm     | Initial GDD draft |
| v1.1    | 16-03-2026 | tramdm     | Thêm §6.5 Duplicate per Tier — cơ chế phân phối Dup Token theo Tier (tham khảo Reverse 1999) |
| v1.2    | 16-03-2026 | tramdm     | Thêm §8 Ultimate System (Kỹ Năng Nộ); định nghĩa "Ngựa" trong Glossary + chuẩn hóa thuật ngữ; thêm sub-heading §6.4; chú thích UI/UX Flow là tài liệu riêng |
| v1.3    | 16-03-2026 | tramdm     | Xóa tham chiếu Tier S (chưa thiết kế); thêm ví dụ progression end-to-end §8.1; cải thiện notation §6.4; cải thiện footnote §2.1; chuẩn hóa heading §6.4.1–6.4.2 |

## Related Documents

- [GDD_Overview_v2_ElementalHunter.md](../GDD_Overview_v2_ElementalHunter.md)
- [CHARACTER_SYSTEM_FRAMEWORK.md](./CHARACTER_SYSTEM_FRAMEWORK.md)

---

## Disambiguation: "Level"

> Tài liệu này dùng hai loại "Level" khác nhau — cần phân biệt rõ:
>
> | Thuật ngữ | Ý nghĩa | Tài liệu tham chiếu |
> |-----------|---------|---------------------|
> | **Character Level (Char Lv)** | Cấp độ nâng cấp lâu dài của nhân vật (Lv1–90). Tăng qua hệ thống Enlightenment. | Tài liệu này |
> | **Game Level (Lv1/2/3)** | Độ khó của từng ván đấu (Beginner / Intermediate / Master). | GDD_Overview_v2 §7 |

---

## 1. Tổng Quan

Character là nhân vật mà player sở hữu và nâng cấp theo thời gian dài (progression). Mỗi character định nghĩa:

- **Stats** — ATK, MAG, MaxHP của player trong ván đấu.
- **Element Affinity** — Nguyên tố chủ đạo, quyết định tile nào cho ATK, tile nào cho MAG.
- **Combo Powers** — Hiệu ứng phần thưởng khi kích hoạt Combo (tương ứng Combo Tier 1/2/3 trong GDD Overview).
- **Ultimate** — Kỹ năng đặc biệt tiêu MAG để kích hoạt.

Character được phân thành **4 Tier** theo độ hiếm và sức mạnh tiềm năng: D < C < B < A.

### 1.1 Character Acquisition

Player nhận được character qua các kênh phân phối của game (gacha, shop, event, v.v.). Chi tiết cơ chế và tỷ lệ sẽ được mô tả trong tài liệu **Gacha/Shop System** riêng.

Vòng đời đầy đủ của một character:
**Nhận character** (Dup0) → **Nâng Char Level** qua Enlightenment → **Nhận Dup** (Dup1–Dup5) để mở khóa nâng cấp thêm → **Đạt max** (Dup5 + Char Lv tối đa theo Tier).

---

## 2. Tier System

### 2.1 Bảng Tier

| Tier | Multiplier Base Stats | Enlightenment tối đa | Combo Powers | Ultimate | Trạng thái |
|------|-----------------------|----------------------|--------------|----------|------------|
| **D** | ×1.0 ATK / MAG / MaxHP | En. 3 (Char Lv tối đa: 60) | 1 | 1 | Thiết kế |
| **C** | ×1.2 ATK / MAG / MaxHP | En. 4 (Char Lv tối đa: 80) | 2 | 1 | Thiết kế |
| **B** | ×1.3 ATK / MAG / MaxHP | En. 5 (Char Lv tối đa: 90) | 2 | 1 | Thiết kế |
| **A** | ×1.5 ATK / MAG / MaxHP | En. 5 (Char Lv tối đa: 90) | 3 | 1 | Thiết kế |

> **Ghi chú Tier Multiplier:** Hệ số nhân lên **base stat của từng character** tại mỗi Char Lv (ví dụ: nếu base ATK = 100 → Tier D ATK = 100, Tier A ATK = 150). Giá trị base stat và stats thực tế tại từng Char Lv được định nghĩa trong Balance doc riêng của từng character. Tham chiếu cơ chế stat trong ván: [GDD_Overview_v2_ElementalHunter.md](../GDD_Overview_v2_ElementalHunter.md) §1.2 (Token/Ngựa) và §2.3 (MAG).

### 2.2 Ý Nghĩa Sức Mạnh Theo Tier

Tier cao hơn đồng nghĩa với nhân vật mạnh hơn toàn diện: chỉ số cao hơn, nhiều Combo Power hơn, Char Level tối đa cao hơn, và Ultimate mạnh hơn — tổng hợp lại cho tỷ lệ chiến thắng cao hơn.

| Tier | Chỉ số | Combo Powers | Char Level tối đa | Ultimate |
|------|--------|-------------|-------------------|---------|
| **D** | Thấp nhất (×1.0) | 1 | Lv 60 | Cơ bản |
| **C** | ×1.2 | 2 | Lv 80 | Cơ bản |
| **B** | ×1.3 | 2 | Lv 90 | Mạnh hơn |
| **A** | ×1.5 | 3 | Lv 90 | Mạnh và độc đáo |

---

## 3. Stats Của Character

### 3.1 Ba Chỉ Số Cơ Bản

| Chỉ số | Ý nghĩa trong ván đấu |
|--------|----------------------|
| **ATK** | Lượng ATK mà **ngựa** (token — xem Glossary) nhận được khi đáp ô cùng Affinity. Cũng là giá trị tham chiếu trong một số Combo Power. |
| **MAG** | Lượng MAG mà player nhận được khi đáp ô khác Affinity. |
| **MaxHP** | HP khởi đầu của player khi bắt đầu ván (HP không hồi phục tự nhiên trong ván). |

### 3.2 Progression Stats Theo Char Level

Stats tăng dần theo Char Level. **Tốc độ tăng (slope) cao hơn ở mỗi bracket Enlightenment cao hơn** — tức nhân vật tăng mạnh hơn trong giai đoạn cuối của hành trình nâng cấp.

Giá trị cụ thể tại từng Char Lv được định nghĩa trong Balance doc của từng character.

---

## 4. Enlightenment System (Hệ Thống Khai Sáng)

### 4.1 Khái Niệm

**Enlightenment** là cơ chế gating giữa các khoảng Char Level. Khi nhân vật đạt Char Level tối đa của Enlightenment hiện tại, player phải thực hiện **nghi thức Khai Sáng** (tốn nguyên liệu) để mở khóa Enlightenment tiếp theo, từ đó có thể tiếp tục nâng cấp Char Level.

> **Nguyên lý:** Không thể bỏ qua Enlightenment — mỗi bracket là một cột mốc đầu tư có chủ ý, không chỉ là grind thuần túy.

### 4.2 Bảng Level Cap Theo Enlightenment

| Enlightenment | Char Level Range | Số level trong bracket |
|---------------|-----------------|------------------------|
| En. 1         | Lv 1 – 20       | 20 levels              |
| En. 2         | Lv 21 – 40      | 20 levels              |
| En. 3         | Lv 41 – 60      | 20 levels              |
| En. 4         | Lv 61 – 80      | 20 levels              |
| En. 5         | Lv 81 – 90      | 10 levels              |

### 4.3 Giới Hạn Theo Tier

Tier thấp hơn không thể tiếp cận En. cao — tức Char Level tối đa bị giới hạn vĩnh viễn:

| Tier | Enlightenment tối đa | Char Level tối đa |
|------|----------------------|-------------------|
| D    | En. 3                | Lv 60             |
| C    | En. 4                | Lv 80             |
| B    | En. 5                | Lv 90             |
| A    | En. 5                | Lv 90             |

> Đây là sự đánh đổi cốt lõi: character Tier D dù nâng cấp nhiều cũng không thể đạt stat mạnh bằng character Tier A ở mức đầu tư tương đương.

### 4.4 Cơ Chế Khai Sáng

1. Nhân vật đạt **Char Lv tối đa** của Enlightenment hiện tại → Char Level bị khóa, không thể nâng tiếp.
2. Player tiêu tốn **nguyên liệu Khai Sáng** (chi tiết TBD) để nâng Enlightenment lên cấp tiếp theo.
3. Sau khi Khai Sáng thành công → Char Level có thể nâng tiếp vào bracket mới.

> **Ghi chú thiết kế:** Nguyên liệu và chi phí Khai Sáng sẽ được thiết kế trong tài liệu Upgrade Materials riêng.

---

## 5. Combo Powers

### 5.1 Khái Niệm

Combo Powers là phần thưởng được kích hoạt khi player tạo Combo trong ván đấu (xem GDD Overview §2.4–2.5). Mỗi Combo Power tương ứng với một **Combo Tier milestone**:

| Combo Power | Kích hoạt khi | Tier tối thiểu để mở |
|-------------|--------------|----------------------|
| **C.Pow 1** | Mỗi lần có combo (Combo Tier 1) | Tất cả tier |
| **C.Pow 2** | Combo milestone thứ 2 (Combo Tier 2) | Tier C trở lên |
| **C.Pow 3** | Combo milestone thứ 3 (Combo Tier 3) | Tier A |

> **Ghi chú:** Số Combo Power khả dụng phụ thuộc Tier, nhưng Game Level (Lv1/2/3) quyết định số Combo Tier tối đa trong ván đó. Ví dụ: character Tier A có đủ 3 Combo Power, nhưng nếu chơi ở Game Level 1 (Combo Tier tối đa = 1), chỉ C.Pow 1 được kích hoạt trong ván.

### 5.2 Loại Hiệu Ứng Combo Power

Loại hiệu ứng của mỗi Combo Power **cố định theo Tier** (không thay đổi). Strength (con số) của hiệu ứng **tăng khi nâng cấp lên cấp "+"** (xem §5.3 và §6).

| Tier | C.Pow 1 | C.Pow 2 | C.Pow 3 |
|------|---------|---------|---------|
| D | Có | — (không có) | — (không có) |
| C | Có | Có | — (không có) |
| B | Có | Có | — (không có) |
| A | Có | Có | Có |

> Chi tiết hiệu ứng cụ thể thuộc thiết kế riêng từng character, không phải hệ thống chung.

### 5.3 Cấp Combo Power

Mỗi Combo Power có **2 cấp**:

| Cấp | Ký hiệu | Cách đạt |
|-----|---------|---------|
| Cấp 1 (mặc định) | C.Pow 1, C.Pow 2, C.Pow 3 | Mặc định khi mở nhân vật |
| Cấp 2 (tối đa) | C.Pow 1+, C.Pow 2+, C.Pow 3+ | Nhận `C.Pow lvUP` qua cơ chế Dup (xem §6.2–6.3) |

> Mỗi Combo Power chỉ có thể nâng cấp **1 lần**. Strength (con số) của hiệu ứng tăng lên khi ở cấp "+".

---

## 6. Duplicate System (Hệ Thống Dup)

### 6.1 Khái Niệm

Khi player nhận được **bản copy của một character đã sở hữu** (gọi là Duplicate / Dup), bản copy đó **không tạo nhân vật mới** mà tự động hợp nhất vào nhân vật đã có, mang lại **một phần thưởng nâng cấp cố định** cho nhân vật đó.

- **Dup0:** Bản gốc — nhân vật khi mới mở khóa (1 bản copy).
- **Dup1 → Dup5:** 5 lần nhận thêm bản copy → 5 mốc nâng cấp.
- **Tổng bản copy cần:** 6 (1 để mở + 5 Dup).
- **Dup tối đa:** Dup5. Sau Dup5, nhận thêm bản copy convert thành **Dup Token** (xem §6.4).

> **Edge case:** Player phải sở hữu bản gốc (Dup0) trước. Bản copy nhận được khi chưa có bản gốc sẽ **tự động mở nhân vật** (trở thành Dup0) — không tính là Dup1.

### 6.2 Loại Phần Thưởng Dup

Mỗi mốc Dup có thể mang lại một trong các loại phần thưởng:

| Loại phần thưởng | Mô tả |
|-----------------|-------|
| **Stat Bonus** | Cộng một lượng flat vào một chỉ số cố định (HP, ATK, hoặc MAG). Không tăng thêm khi nâng Char Level. |
| **C.Pow lvUP** | Nâng một Combo Power lên cấp **"+"** (cấp tối đa) — tăng con số/strength của hiệu ứng đó. Ví dụ: C.Pow 1 → **C.Pow 1+**. Mỗi Combo Power chỉ có thể nâng 1 lần. |
| **Ulti lvUP** | Nâng Ultimate lên 1 cấp — cải thiện hiệu ứng Ultimate (ví dụ: giảm MAG cost). |

### 6.3 Bảng Dup Rewards Theo Tier

Thứ tự mốc phần thưởng **phụ thuộc Tier** của character:

| Tier | Dup1 | Dup2 | Dup3 | Dup4 | Dup5 |
|------|------|------|------|------|------|
| **D** | Stat Bonus | C.Pow1 lvUP | Stat Bonus | Stat Bonus | Ulti lvUP |
| **C** | Stat Bonus | C.Pow1 lvUP | Stat Bonus | C.Pow2 lvUP | Ulti lvUP |
| **B** | Stat Bonus | C.Pow1 lvUP | Stat Bonus | C.Pow2 lvUP | Ulti lvUP |
| **A** | Stat Bonus | C.Pow1 lvUP | C.Pow2 lvUP | C.Pow3 lvUP | Ulti lvUP |

> **Ghi chú thiết kế:**
> - Tier D không có C.Pow 2/3, nên Dup3 và Dup4 bù bằng Stat Bonus.
> - Tier A nâng cấp dày hơn với C.Pow vì có đủ 3 Combo Powers.
> - Pattern trên là mặc định — từng character cụ thể có thể điều chỉnh loại Stat Bonus (HP/ATK/MAG) khác nhau.

### 6.4 Duplicate per Tier — Phần Thưởng Token Khi Nhận Dup Thừa

> Tham khảo: cơ chế Resonance / Psychube-duplicate của Reverse 1999.

Mỗi lần player nhận được bản copy của một character đã sở hữu, hệ thống tự động xử lý theo logic sau:

Mỗi bản copy nhận vào → **luôn tặng Dup Token** (bất kể trạng thái Dup hiện tại):

- **Chưa đạt Dup5** → nâng 1 cấp Dup (Dup0→Dup1→…→Dup5) + nhận Dup Token theo Tier (lượng thấp hơn)
- **Đã đạt Dup5** → không nâng Dup, convert hoàn toàn thành Dup Token theo Tier (lượng cao hơn)

Xem bảng lượng token cụ thể theo Tier bên dưới.

---

### 6.4.1 Tier A — Dup Token Premium

| Trạng thái | Kết quả |
|-----------|---------|
| Chưa đạt Dup5 (copy 2–6, tức Dup1 → Dup5) | **+1 cấp Dup** + **12 Dup Token Premium** |
| Đã đạt Dup5 max (copy 7 trở đi) | **28 Dup Token Premium** |

### 6.4.2 Tier B / C / D — Dup Token Free

| Tier | Chưa đạt Dup5 (copy 2–6, tức Dup1 → Dup5) | Đã đạt Dup5 max (copy 7 trở đi) |
|------|--------------------------|--------------------------|
| **D** | +1 cấp Dup + **3 Dup Token Free** | **5 Dup Token Free** |
| **C** | +1 cấp Dup + **4 Dup Token Free** | **7 Dup Token Free** |
| **B** | +1 cấp Dup + **8 Dup Token Free** | **12 Dup Token Free** |

> **Ghi chú thiết kế:**
> - Cơ chế Dup **hoạt động giống nhau** ở mọi Tier — luôn ưu tiên nâng Dup1→Dup5 trước, sau đó mới convert thành Token.
> - Tier A dùng **Dup Token Premium** (currency riêng, cao cấp hơn), không lẫn với Dup Token Free của Tier B/C/D.
> - Dup Token Premium và Dup Token Free là hai loại currency khác nhau, dùng để đổi lấy các phần thưởng khác nhau (chi tiết TBD trong tài liệu Shop/Exchange).
> - Lượng Token khi đã max (copy 7+) cao hơn so với lúc còn đang nâng Dup — đây là compensation cho player đã đầu tư đủ.

---

### 6.5 Tính Chất Của Stat Bonus

- Lượng Stat Bonus là **flat**, thêm trực tiếp vào chỉ số hiện tại.
- **Không scale** theo Char Level hiện tại hoặc Enlightenment — giá trị cố định từ ngày nhận Dup.
- Stat Bonus từ nhiều Dup cộng dồn.

> **Ví dụ:** Nếu Dup1 tặng +200 HP, và nhân vật hiện tại có MaxHP = 1,890 (ở Char Lv60) → MaxHP mới = 2,090. Nếu sau đó nâng lên Char Lv61 (HP tăng +60/lv), MaxHP = 2,150 — trong đó +200 từ Dup1 vẫn được giữ nguyên.

---

## 7. Ultimate System (Kỹ Năng Nộ)

### 7.1 Khái Niệm

**Ultimate** (hay **Kỹ Năng Nộ**) là kỹ năng chủ động của nhân vật, do player kích hoạt trong ván đấu. Mỗi character có đúng **1 Ultimate** với thiết kế hiệu ứng riêng.

- **Kích hoạt:** Player có thể dùng Ultimate **bất kỳ lúc nào trong lượt của mình**, miễn là MAG hiện tại đã đạt đủ **MAG Cost** yêu cầu.
- **MAG Cost:** Lượng MAG cần thiết để kích hoạt. Phụ thuộc vào thiết kế riêng của từng character — được định nghĩa trong Balance doc của character đó.
- **Sau khi kích hoạt:** MAG của player bị trừ đúng bằng MAG Cost. Hiệu ứng Ultimate được áp dụng ngay.

> MAG tích lũy qua gameplay (ngựa đáp ô khác Affinity), không hồi tự nhiên theo thời gian. Không vượt quá **magCap** (giới hạn tích lũy MAG — xem Glossary). Xem: [GDD_Overview_v2_ElementalHunter.md](../GDD_Overview_v2_ElementalHunter.md) §2.3.

### 7.2 Cấp Ultimate

Mỗi Ultimate có **2 cấp**:

| Cấp | Cách đạt | Tác động |
|-----|---------|---------|
| **Lv 1** | Mặc định khi mở nhân vật | Hiệu ứng cơ bản |
| **Lv 2** | Nhận `Ulti lvUP` qua cơ chế Dup (xem §6.2–6.3) | Cải thiện hiệu ứng (ví dụ: giảm MAG Cost, tăng strength) |

> Cải thiện cụ thể ở Lv 2 phụ thuộc thiết kế từng character và được định nghĩa trong Balance doc của character đó.

### 7.3 Ví Dụ

**Pillow** (character hiện tại) — Ultimate: **Extra Roll**

- **Hiệu ứng:** Kích hoạt thêm 1 lượt đổ xúc xắc ngay lúc này.
- **MAG Cost:** 70 MAG (Lv 1).
- **Lv 2:** Giảm MAG Cost từ 70 MAG xuống 50 MAG.

---

## 8. Character Progression — Tổng Hợp

Sức mạnh của một character được quyết định bởi **3 trục đầu tư độc lập**:

| Trục | Nguồn lực | Tác động |
|------|-----------|---------|
| **Char Level** | Nguyên liệu nâng cấp + Enlightenment | Tăng ATK, MAG, MaxHP theo curve |
| **Duplicate** | Bản copy duplicate | Stat Bonus flat + nâng cấp Combo Powers + nâng cấp Ultimate |
| **Tier** | Cố định khi recruit character | Quy định loại cơ chế, Level cap, số Combo Powers |

Một character Tier D với đầy đủ Dup5 + Char Lv60 max vẫn thua một character Tier A không có Dup nhưng ở Char Lv cao, về mặt sức mạnh chiến thuật — do Tier A có cơ chế mạnh hơn về bản chất.

### 8.1 Ví Dụ: Kira — Tier B (Hành Trình Đầy Đủ)

> **Lưu ý:** Số liệu dưới đây là ví dụ minh họa để hình dung depth và pacing. Giá trị thực tế sẽ được định nghĩa trong Balance doc của từng character.

**Kira** — Tier B, Element: Fire. Dup rewards theo §6.3: Stat Bonus | C.Pow1 lvUP | Stat Bonus | C.Pow2 lvUP | Ulti lvUP.

| Giai đoạn | Sự kiện | Trạng thái nhân vật |
|-----------|---------|---------------------|
| **Mở khóa** | Nhận copy #1 → Kira mở khóa (Dup0) | Lv1, En.1 · ATK 80 / MAG 60 / MaxHP 1,200 · C.Pow 1 (cấp 1) · Ultimate Lv1 |
| **Nâng cấp** | Grind nguyên liệu → nâng Char Level, thực hiện Khai Sáng En.1→2→3 | Lv60, En.3 · ATK 160 / MAG 120 / MaxHP 2,400 |
| **Dup1** | Nhận copy #2 → **Stat Bonus: +200 MaxHP** | MaxHP: 2,400 → **2,600** |
| **Dup2** | Nhận copy #3 → **C.Pow 1 lvUP** | C.Pow 1 → **C.Pow 1+** (hiệu ứng combo mạnh hơn) |
| **Nâng cấp** | Khai Sáng En.4→5, nâng tiếp lên Lv90 | Lv90, En.5 · ATK 240 / MAG 180 / MaxHP 3,600 |
| **Dup3** | Nhận copy #4 → **Stat Bonus: +15 ATK** | ATK: 240 → **255** |
| **Dup4** | Nhận copy #5 → **C.Pow 2 lvUP** | C.Pow 2 → **C.Pow 2+** (cả 2 Combo Power đều max) |
| **Dup5** | Nhận copy #6 → **Ulti lvUP** | Ultimate → **Lv2**. Kira đạt trạng thái **fully invested** |
| **Post-max** | Copy #7 trở đi → convert thành **8 Dup Token Free** mỗi lần | Không còn nâng cấp Kira — token dùng ở Shop |

**Tổng hợp khi fully invested (Dup5 + Lv90):**

| Trục | Kết quả cuối |
|------|-------------|
| Stats | ATK 255 / MAG 180 / MaxHP 3,800 |
| Combo Powers | C.Pow 1+ và C.Pow 2+ (cả 2 max) |
| Ultimate | Lv2 |

---

## 9. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Nguyên liệu Khai Sáng (Enlightenment material): loại nguyên liệu, số lượng, nguồn thu? | Designer | Open |
| 2 | Nguyên liệu nâng Char Level: loại nguyên liệu, số lượng cần theo bracket? | Designer | Open |
| 3 | Tên chính thức cho các Tier (D/C/B/A là ký hiệu kỹ thuật)? | Designer | Open |
| 4 | Cơ chế display ingame: UI hiển thị Char Level, Enlightenment, Dup count như thế nào? *(Chi tiết sẽ được mô tả trong tài liệu UI/UX Flow riêng — không thuộc phạm vi GDD này)* | Designer/Dev | Open |
| 5 | Pillow (character hiện tại) thuộc Tier nào khi re-tier vào hệ thống mới? | Designer | Open |

---

## Glossary

| Thuật ngữ | Định nghĩa |
|-----------|-----------|
| **Ngựa (Token / Horse Piece)** | Quân cờ di chuyển trên bàn cờ. Mỗi player có 3 ngựa. Mỗi ngựa có chỉ số ATK riêng, bắt đầu từ 0 và tăng dần qua gameplay. Xem: GDD_Overview_v2 §1.2. |
| **Tier** | Cấp độ hiếm và sức mạnh của character (D/C/B/A). Quyết định loại cơ chế, Char Level cap, số Combo Powers. Cố định, không thay đổi. |
| **Char Level** | Cấp độ nâng cấp meta-progression của character (Lv1–90 tùy Tier). Khác với Game Level (độ khó ván đấu). |
| **Enlightenment (Khai Sáng)** | Cơ chế gating giữa các khoảng Char Level. Cần nguyên liệu để nâng. Tier D tối đa En.3 (Lv60), Tier C tối đa En.4 (Lv80), Tier B/A tối đa En.5 (Lv90). |
| **Combo Power (C.Pow)** | Phần thưởng combo trong ván. C.Pow 1 = Combo Tier 1, C.Pow 2 = Combo Tier 2, C.Pow 3 = Combo Tier 3 (chỉ Tier A trở lên). |
| **Duplicate (Dup)** | Bản copy thừa của character đã sở hữu. Tự động convert thành nâng cấp cho character đó. Tối đa Dup5 (cần 6 bản copy tổng cộng). Copy thứ 7 trở đi convert thành Dup Token. |
| **Dup Token Premium** | Currency nhận được khi Dup nhân vật Tier A. Dùng để đổi phần thưởng trong shop (TBD). |
| **Dup Token Free** | Currency nhận được khi Dup nhân vật Tier B/C/D. Dùng để đổi phần thưởng trong shop (TBD). |
| **Stat Bonus** | Phần thưởng Dup dạng flat +stat (HP/ATK/MAG). Không scale theo Char Level. |
| **C.Pow lvUP** | Phần thưởng Dup dạng nâng cấp strength của một Combo Power. |
| **Ulti lvUP** | Phần thưởng Dup dạng nâng cấp Ultimate (ví dụ: giảm MAG cost). |
| **Progression** | Hành trình nâng cấp nhân vật theo thời gian dài — bao gồm nâng Char Level qua Enlightenment và nhận Dup. Phân biệt với "Game Level" là độ khó từng ván đấu. |
| **magCap** | Giới hạn tích lũy MAG tối đa của nhân vật. Bằng với MAG Cost của Ultimate nhân vật đó — player không nhận thêm MAG dù đi vào ô khác Affinity khi đã đạt ngưỡng này. |

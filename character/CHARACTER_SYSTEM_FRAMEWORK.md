# Character System — Framework Document
**Project:** Elemental Hunter
**Feature:** Character System
**Author:** tramdm
**Date:** 13-03-2026
**Version:** v0.1 (Draft — In progress)
**Status:** Brainstorm

---

## 1. Tổng Quan Hệ Thống Character

Character là nhân vật mà player chọn trước khi bắt đầu ván đấu. Character quyết định phong cách chơi thông qua các thông số và cơ chế riêng.

**5 Tier độ hiếm (Rarity Tier):**

| Tier | Ký hiệu | Tên gọi | Trạng thái |
|------|---------|---------|------------|
| 1 (thấp nhất) | D | TBD | Thiết kế trong v0.1 |
| 2 | C | TBD | Thiết kế trong v0.1 |
| 3 | B | TBD | Thiết kế trong v0.1 |
| 4 | A | TBD | Thiết kế trong v0.1 |
| 5 (cao nhất) | S | TBD | Giữ chỗ — thiết kế sau |

> Tier cao hơn = character có khả năng tiếp cận cơ chế mạnh hơn. Số cụ thể (ATK, Mana) được quyết định bởi hệ thống nâng cấp (Upgrade), không phải Tier.

---

## 2. Tất Cả Yếu Tố Sức Mạnh Của Character

### 2.1 Nhóm A — Có trong config Pillow (đã validate) ✅ Đã chốt

| # | Yếu tố | Mô tả | Thuộc về |
|---|--------|-------|----------|
| 1 | **Element Affinity** | Nguyên tố chủ đạo (Fire/Ice/Grass/Rock). Quyết định ô nào cho ATK, ô nào cho Mana | **Tier** |
| 2 | **Combo T1 — Effect type** | Loại hiệu ứng khi có bất kỳ combo nào | **Tier** |
| 3 | **Combo T1 — ATK Bonus value** | Số ATK cộng vào tất cả ngựa khi T1 kích hoạt | **Upgrade** |
| 4 | **Combo T2 — Effect type** | Loại hiệu ứng tại milestone combo thứ 2 (Lv2+) | **Tier** |
| 5 | **Combo T2 — Scale** | Hệ số / độ mạnh của hiệu ứng T2 | **Upgrade** |
| 6 | **Combo T3 — Effect type** | Loại hiệu ứng tại milestone combo thứ 3 (Lv3) | **Tier** |
| 7 | **Combo T3 — Scale** | Hệ số / độ mạnh của hiệu ứng T3 | **Upgrade** |
| 8 | **Ultimate — Effect type** | Loại kỹ năng Ultimate character có thể dùng | **Tier** |
| 9 | **Ultimate — Mana Cost** | Lượng Mana cần tiêu để kích hoạt Ultimate | **Upgrade** |
| 10 | **Game Start Queue Bonus** | Số nguyên tố Affinity thêm vào đầu Element Queue lúc bắt đầu ván | **Tier** — không upgrade |

### 2.2 Nhóm B — Đề xuất mở rộng (đã chốt hướng xử lý)

| # | Yếu tố | Mô tả | Hướng xử lý |
|---|--------|-------|-------------|
| 11 | **Combo Side Effects** | Hiệu ứng phụ đi kèm Combo T1/T2/T3 | ❌ Không dùng — game sẽ phức tạp |
| 12 | **Tile ATK Reward** | ATK nhận khi ngựa đáp ô Affinity (hiện +30) | ❌ Cố định — không phải char stat |
| 13 | **Tile Mana Reward** | Mana nhận khi ngựa đáp ô non-Affinity (hiện +10) | ❌ Cố định — không phải char stat |
| 14 | **Mana Cap** | Mana tối đa có thể tích lũy | 📌 Wishlist — có thể dùng sau |
| 15 | **Passive Ability** | Hiệu ứng luôn hoạt động, không cần kích hoạt | 📌 Wishlist — có thể dùng sau |
| 16 | **Power Roll Accuracy** | % xác suất rơi vào target range (hiện 20%) | 📌 Có thể dùng sau, nhưng không thuộc char system |
| 17 | **Element Queue Size** | Kích thước tối đa Element Queue | 📌 Wishlist — có thể dùng sau |
| 18 | **Goal Reward Bonus** | Số nguyên tố được chọn khi ngựa về đích | 📌 Wishlist — có thể dùng sau |

---

## 3. Phân Biệt Tier vs Upgrade

> **Nguyên tắc cốt lõi:**
> - **Tier** = quyết định character có thể làm GÌ (loại cơ chế, loại hiệu ứng)
> - **Upgrade** = quyết định character làm tốt đến đâu (con số, độ mạnh)

| | Tier | Upgrade |
|-|------|---------|
| Câu hỏi trả lời | "Character này có side effect không? Có Passive không?" | "ATK bonus bao nhiêu? Mana cost bao nhiêu?" |
| Thay đổi khi nào | Không đổi — cố định theo tier | Tăng dần khi nâng cấp character |
| Ví dụ | Tier D không có Side Effect; Tier B có Side Effect freeze | Freeze 1 lượt (lv1 upgrade) → 2 lượt (lv3 upgrade) |

---

## 4. Tiêu Chí Phân Tier — Power Progression

### Danh mục Side Effects (hiệu ứng phụ có thể xuất hiện ở Tier C+)

| Nhóm | Side Effects | Ví dụ |
|------|-------------|-------|
| **Crowd Control** | Freeze ngựa địch, Push lùi ngựa địch | Freeze 1 ngựa địch N lượt |
| **Resource** | Steal Mana địch, thêm nguyên tố vào Queue | Steal 10 Mana từ địch |
| **Sustain** | Hồi HP, giảm sát thương nhận | Heal +50 HP |
| **Board Control** | Dịch chuyển ngựa, thay đổi nguyên tố ô | Teleport 1 ngựa mình về trước Branch Point |
| **Combat** | Gây sát thương HP trực tiếp ngoài Kick | Deal 30 damage trực tiếp lên địch |

### Power Progression D → A → S

| Tier | Combo T1 | Combo T2 | Combo T3 | Side Effects | Ultimate Type | Game Start Bonus | Passive |
|------|----------|----------|----------|--------------|---------------|-----------------|---------|
| **D** | ATK only | Tile Gain Multiplier | ATK Multiplier | Không có | Standard | 1 Affinity element | Không |
| **C** | ATK only | Tile Gain Multiplier | ATK Multiplier | T1: Minor (1 loại CC hoặc Resource) | Standard hoặc Better | 1 Affinity element | Không |
| **B** | ATK + Side Effect | Tile Gain + Side Effect | ATK Mult + Unique mechanic | T1+T2: Minor–Medium (CC + Resource hoặc Sustain) | Unique effect | 2 Affinity elements | Không |
| **A** | ATK + Side Effect | Unique effect | Character-defining mechanic | T1+T2+T3: Medium–Strong (any category) | Strong unique effect | 3 Affinity elements | Không |
| **S** | *(TBD)* | *(TBD)* | *(TBD)* | *(TBD)* | *(TBD)* | *(TBD)* | **Có** |

### Diễn giải từng tier

**Tier D — Accessible**
Không có side effect. Toàn bộ sức mạnh đến từ con số (ATK bonus, Tile Gain). Dễ hiểu, phù hợp người mới. Tier D buộc phải đầu tư Upgrade để cạnh tranh với tier cao hơn.

**Tier C — Emerging**
Bắt đầu có 1 side effect nhỏ ở T1 (một trong: Crowd Control nhẹ hoặc Resource). T2/T3 vẫn thuần số. Người chơi bắt đầu cảm nhận sự khác biệt về playstyle.

**Tier B — Distinct**
T1 và T2 đều có side effect. T3 có mechanic độc đáo thay vì pure multiplier. Character B bắt đầu có identity rõ — không chỉ là "mạnh hơn D" mà còn "chơi khác D".

**Tier A — Powerful**
Cả 3 tiers combo đều có side effect. T3 là cơ chế định nghĩa phong cách chơi của character. Ultimate mạnh và độc đáo. Game Start Bonus 3 elements tạo ra lợi thế từ đầu ván rõ rệt.

**Tier S — Placeholder**
Duy nhất có Passive Ability (luôn hoạt động, không cần kích hoạt). Thiết kế sau.

---

## 5. Hệ Thống Nâng Cấp (Upgrade System) — Khung Sơ Bộ

> *Chi tiết mechanic upgrade (UI, vật liệu nâng cấp, progression curve) sẽ được thiết kế sau. Phần này chỉ xác định NHỮNG GÌ bị ảnh hưởng bởi upgrade.*

### Các thông số được nâng cấp ✅ Đã chốt

| Thông số | Upgrade ảnh hưởng thế nào | Áp dụng cho |
|----------|--------------------------|-------------|
| **Combo T1 — ATK Bonus value** | Tăng dần theo cấp upgrade | Tất cả tier |
| **Combo T2 — Scale** | Hệ số của hiệu ứng T2 tăng | Tất cả tier |
| **Combo T3 — Scale** | Hệ số của hiệu ứng T3 tăng | Tất cả tier |
| **Ultimate — Mana Cost** | Giảm dần theo cấp upgrade | Tất cả tier |

### Upgrade levels — Placeholder
> *Số cấp upgrade, vật liệu, và curve cần thiết kế riêng. Đang nghiên cứu benchmark (Cookie Run: Kingdom, Crash Fever).*

---

## 6. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Tile ATK/Mana Reward có thành upgrade target không, hay giữ cố định? | Designer | Open |
| 2 | Số cấp Upgrade là bao nhiêu? Progression curve tuyến tính hay exponential? | Designer | Open |
| 3 | Side effect magnitude (freeze duration, heal amount) — scale theo upgrade hay cố định theo tier? | Designer | Open |
| 4 | Pillow sẽ được re-tier vào Tier nào? (Đề xuất: Tier C — đã có 1 side effect implied qua Absolute Might mechanic) | Designer | Open |
| 5 | Tên chính thức cho các tier (D/C/B/A/S chỉ là ký hiệu kỹ thuật)? | Designer | Open |
| 6 | Passive Ability của Tier S sẽ có cơ chế giới hạn gì (để không bị overpowered)? | Designer | Open |

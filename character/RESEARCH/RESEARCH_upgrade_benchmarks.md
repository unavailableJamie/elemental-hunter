# Research: Character Upgrade System Benchmarks
**Project:** Elemental Hunter — Character System
**Date:** 13-03-2026
**Mục đích:** Nghiên cứu hệ thống nâng cấp nhân vật từ 2 game tham khảo để lấy insight cho thiết kế Upgrade System của Elemental Hunter.

---

## 1. Cookie Run: Kingdom (Devsisters)

### 1.1 Rarity Tiers
11 rarity tier (từ thấp đến cao): **Common → Rare → Epic → Super Epic → Ancient → Legendary → Dragon → Beast** (và một số tier đặc biệt khác).

**Điểm quan trọng:** Tier cao hơn không chỉ có số lớn hơn — mà còn có **cơ chế độc nhất gắn với tier đó**:

| Tier | Cơ chế đặc trưng |
|------|-----------------|
| Common / Rare / Epic | Skill hiệu ứng cơ bản |
| Super Epic | Multi-hit phức tạp hoặc crowd control immunity |
| Ancient | Cơ chế signature riêng (VD: Pure Vanilla → HP Shield; White Lily → floral entanglement) |
| Dragon | **Gauge mechanic** — biến đổi/tăng cường khi đạt điều kiện trong trận |
| Beast | **Battlefield overwrite** — kỹ năng Beast-tier có thể ghi đè môi trường chiến trường |

→ **Insight:** Rarity tier ở CRK không chỉ là stat scaling — mỗi rarity có 1 loại cơ chế mà tier thấp hơn không thể có. Đây là lý do player "phải" có char tier cao.

---

### 1.2 Upgrade Methods (7 hệ thống song song)

| # | Hệ thống | Tác động | Resource |
|---|----------|---------|---------|
| 1 | **Level Up** | Tăng HP, ATK, DEF base | EXP Star Jellies |
| 2 | **Star Promotion (★1→★5)** | Tăng stat cap. 290 Soulstones tổng cộng (190 cho Special Cookies) | Soulstones |
| 3 | **Ascension (Soulcores)** | Tăng HP, ATK, DEF sau khi đã max ★5 | Soulcores (từ gacha sau khi full promote) |
| 4 | **Skill Level** | Tăng hiệu quả skill. Max skill level = cookie level | Coins + Skill Powders (theo class) |
| 5 | **Toppings** (equipment) | Stats: ATK, DEF, HP, Crit, Cooldown. Mỗi char gắn 5 topping, full set bonus | Drop từ dungeon |
| 6 | **Beascuits** | +30% ATK + substats (DMG Bypass, Cooldown, HP, ATK) | Drop từ Beast-Yeast content |
| 7 | **Bond System** | Extra substats (ATK, DEF...) khi mở khóa bond stars giữa các char | Bond currency |

**Hệ thống phụ trợ (không phải per-char):**
- Sugar Gnome Laboratory: class-specific boost, đầu tư dài hạn
- Guild Buffs: +10% ATK, DEF, HP
- Kingdom Landmarks: passive bonus toàn bộ team

### 1.3 Key Design Patterns

1. **Stat và skill là 2 track upgrade riêng biệt** — level lên không tự làm skill mạnh hơn; phải đầu tư riêng vào Skill Level.
2. **Multiple gear layers stack lên nhau** — level + star + skill + toppings + beascuits + bond tất cả cộng dồn. Player luôn có thứ để cải thiện.
3. **Skill Powders là class-specific** — không thể dùng nhầm resource của char khác. Tạo ra trade-off khi đầu tư.
4. **Star Promotion tăng stat CEILING** (không phải stat hiện tại) — phải kết hợp với Level Up để khai thác hết.
5. **Ascension là tier nâng cấp thứ 3** sau Level + Star, giải quyết vấn đề "đã max rồi còn làm gì?"

---

## 2. Crash Fever — JP & KR Server (WonderPlanet)

### 2.1 Rarity Tiers
★1 → ★6 (Gacha bắt đầu từ ★3). Tier cao hơn = bug cap cao hơn + nhiều abilities hơn.

| Rarity | Max Bug Cap | Số Abilities | Ghi chú |
|--------|------------|-------------|---------|
| ★4 | +60 | 3–4 | |
| ★5 | +75 | 4 | |
| ★6 | +99 (→+198 với Transcendence) | 4 | |
| ★6 Super Awakening (cost 60) | +99→+198 | 4 | Variant nhỉnh hơn |
| ★6 Evolutionary Adaptation (cost 65) | +99→+198 | **6** | Mở thêm 2 abilities — tier thực sự mạnh nhất |

→ **Insight:** Tier cao nhất (Evolutionary Adaptation) mạnh hơn không chỉ vì số lớn hơn mà vì **unlock thêm slot abilities** mà tier thấp không thể có — tương tự cách CRK dùng signature mechanic.

---

### 2.2 Upgrade Methods (5 hệ thống)

| # | Hệ thống | Tác động | Resource | Cap |
|---|----------|---------|---------|-----|
| 1 | **Level Up** | Tăng base stats | EXP materials | Max Lv 120 (70+ cost units) |
| 2 | **Awakening (覚醒)** | Multi-stage evolution, unlock abilities (lên đến 4 hoặc 6 abilities), stats tăng | Awakening materials | Theo số stage của unit |
| 3 | **Stat Fruits (果実)** | Tăng ATK/HP/Recovery trực tiếp | Fruits (4 rarity: Normal→Mega→Giga→Terra) | +99 per stat (→+198 với Transcendence Fruit) |
| 4 | **Secret Art Fruit (秘術の果実)** | Giảm skill cooldown -1 turn mỗi level | Secret Art Fruit | Tuỳ unit |
| 5 | **Potential Ability (潜在能力/ログマ)** | +4% stats mỗi stage (stage 1-5), +2% (stage 6-10). Stage 10: +accessory slot. 100 Deep-Log: +2 reward drops/quest. Tổng cộng ~30% stat tăng khi full | Deep-Log (từ duplicate pulls) | 10 stages |

**Chi tiết Stat Fruits:**

| Fruit | Stat | Per level | Max (+99) | Transcendence Max (+198) |
|-------|------|-----------|-----------|--------------------------|
| Attack (Red) | ATK | +10 | +990 | +1,980 |
| Life (Green) | HP | +30 | +2,970 | +5,940 |
| Healing (Blue) | Recovery | +7 | +693 | +1,386 |
| Transcendence (Rainbow) | Stat cap | — | Nâng cap từ +99 → +198 | — |

### 2.3 Key Design Patterns

1. **Stats và Skill là 2 resource hoàn toàn khác nhau** — Stat Fruits tăng HP/ATK/Recovery; Secret Art Fruit chỉ giảm cooldown. Không thể "nhầm" resource.
2. **Cap-breaking là mechanic riêng** — Transcendence Fruit chỉ nâng trần, không tăng stat. Player phải tiếp tục dùng Stat Fruits sau đó. Tạo ra 2 giai đoạn progression rõ ràng.
3. **Potential System khuyến khích duplicate** — mỗi lần pull duplicate → nhận Deep-Log → nâng Potential. Đây là engagement loop cho gacha.
4. **Tier cao nhất unlock thêm abilities slot** — không chỉ là stat lớn hơn, mà còn được dùng thêm kỹ năng (4 → 6 abilities). Đây là power gap định tính, không chỉ định lượng.
5. **Skill cooldown là stat riêng, upgrade riêng** — trong Elemental Hunter tương đương: Mana Cost của Ultimate.

---

## 3. So Sánh & Insight Cho Elemental Hunter

| Điểm | CRK | Crash Fever | Áp dụng cho EH |
|------|-----|-------------|---------------|
| **Tier differentiator** | Signature mechanic riêng cho mỗi rarity group | Thêm ability slots ở tier cao nhất | Tier quyết định Effect Type — tier cao có Effect phức tạp hơn |
| **Số upgrade layers** | 7 layers song song | 5 layers song song | EH scope nhỏ hơn → 3-4 layers là hợp lý |
| **Stat vs Skill tách biệt** | Có (Skill Powders ≠ EXP Jelly) | Có (Stat Fruit ≠ Secret Art Fruit) | Nên tách: resource nâng ATK bonus ≠ resource giảm Mana cost |
| **Cap-breaking mechanic** | Ascension sau max star | Transcendence Fruit sau +99 | Có thể có: cấp upgrade "phá trần" sau khi đạt max thông thường |
| **Duplicate incentive** | Soulstones/Soulcores từ gacha | Deep-Log từ duplicate pulls | Có thể xét nếu EH có gacha/collection element |
| **Skill cooldown là stat** | Cooldown reduction qua Toppings | Skill turn qua Secret Art Fruit | Ultimate Mana Cost ↓ là upgrade riêng — hợp lý |

### Recommendations cho Elemental Hunter Upgrade Design

1. **Tách resource theo mục tiêu** — material nâng combo ATK bonus nên khác material giảm Mana cost. Tạo trade-off khi đầu tư.
2. **2-3 upgrade layers là đủ cho scope hiện tại** — không cần 7 layers như CRK. Quá nhiều gây overwhelming.
3. **Xem xét "cap-breaking" như mechanic giai đoạn sau** — khi char đã max upgrade thông thường, có thể có 1 tier phá trần (giống Ascension của CRK hoặc Transcendence của CF).
4. **Tier phải cho thấy sự khác biệt định tính** — không chỉ "số lớn hơn". Cả CRK và CF đều dùng cách này (signature mechanic / thêm ability slots). Trong EH: Ultimate Effect Type khác nhau theo tier là đúng hướng.

---

## Sources
- [Cookie Run: Kingdom Wiki — Cookie Upgrading](https://cookierunkingdom.fandom.com/wiki/Cookie_Upgrading)
- [Pro Game Guides — How to increase Cookies' Power](https://progameguides.com/cookie-run-kingdom/how-to-increase-cookies-power-in-cookie-run-kingdom/)
- [Roonby — Cookie Run Kingdom F2P Power Up Guide 2025](https://roonby.com/2025/01/30/cookie-run-kingdom-guide-how-to-easily-power-up-your-cookies-for-f2p-2025/)
- [Escapist Magazine — Every rarity in Cookie Run Kingdom explained](https://www.escapistmagazine.com/cookie-run-kingdom-rarities-explained/)
- [GameWith JP — Crash Fever Unit List ★6](https://gamewith.jp/crashfever/article/show/156578)
- [GameWith JP — りんご(果実)の効果と限界突破の仕組み](https://gamewith.jp/crashfever/article/show/112576)
- [GameWith JP — 潜在能力解放(ログマ)を解説](https://gamewith.jp/crashfever/article/show/273498)
- [NamuWiki — Crash Fever KR](https://en.namu.wiki/w/%ED%81%AC%EB%9E%98%EC%8B%9C%20%ED%94%BC%EB%B2%84)

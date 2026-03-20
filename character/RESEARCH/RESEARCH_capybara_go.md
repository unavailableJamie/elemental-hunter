# Research: Capybara Go! (Habby) — Tier Framework & Upgrade Materials
**Project:** Elemental Hunter — Character System
**Date:** 16-03-2026
**Mục đích:** Phân tích hệ thống tier và upgrade material của Capybara Go! để bổ sung insight cho thiết kế Character System của Elemental Hunter.

---

## 1. Tổng Quan Hệ Thống

Capybara Go! là roguelike RPG mobile của Habby (cùng studio làm Archero). Nhân vật chính là 1 capybara duy nhất — sức mạnh đến từ **hệ thống trang bị và companion (pets/heroes)** chứ không phải từ việc đổi character. Đây là điểm khác biệt lớn so với CRK và Crash Fever.

**7 upgrade track song song:**

| # | Hệ thống | Tác động | Resource chính |
|---|----------|---------|----------------|
| 1 | **Talents** | Tăng ATK/HP/DEF base của nhân vật | Gold |
| 2 | **Equipment** | Stats từ gear (ATK/HP/DEF/Crit...) | Power Stones + Equipment Designs |
| 3 | **Collectibles** | Passive bonus stats | Meteoric Iron + Shards |
| 4 | **Pets** | Active companion, thêm stats + Battle Skill | Pet Food + Pet copies |
| 5 | **Heroes & Brands (Legacy)** | Equipment Stat multiplier | Hero/Brand Fragments + Books |
| 6 | **Mounts** | Bonus stats | Gold Horseshoes |
| 7 | **Artifacts** | Bonus effects | Divine Hammers |

---

## 2. Tier Framework Theo Từng Hệ Thống

### 2.1 Collectibles — Rare → Arcana

| Rarity | Base ATK bonus (1★) | Ghi chú |
|--------|---------------------|---------|
| Rare | +20 | Phổ biến nhất |
| Epic | +30 | |
| Legendary | +40 | |
| Mythic | +120 | Bước nhảy lớn |
| Arcana | Cao hơn | Tier đặc biệt, không từ gacha thông thường |

→ Rarity **cố định khi nhận được** — không thể promote Rare lên Epic. Số sao (1★→10★) có thể upgrade trong cùng 1 rarity.

### 2.2 Pets — Common → Immortal (7 tier)

| Rarity | HP | ATK | DEF | Ghi chú |
|--------|----|-----|-----|---------|
| Common | 40 | 10 | 2 | |
| Great | 80 | 20 | 5 | |
| Rare | 160 | 40 | 10 | |
| Epic | 240 | 60 | 15 | |
| Legendary | 400 | 100 | 25 | |
| Mythic | 720 | 180 | 45 | |
| Immortal | 1200 | 300 | 75 | Khó nhận nhất |

→ Pet có 7 tier — nhiều nhất trong số các game đã research. Mỗi tier có Battle Skill riêng, mạnh hơn theo tier (damage, freeze, heal, poison...).

### 2.3 Heroes — Rare → S-tier (5 tier)

| Rarity | Equipment Stat bonus | Ghi chú |
|--------|---------------------|---------|
| Rare | ~+40% | Tier cơ bản |
| Epic | ~+80% | Gain thêm 1 skill khi đạt Epic |
| Legendary | ~+150% | |
| Mythic | ~+250% | Unlock multi-turn mechanics phức tạp |
| S-tier | ~+300%+ | Heroes đặc biệt, thường từ event/gacha cao cấp |

→ **Bước nhảy định tính tại Epic**: đây là mốc hero gain thêm ability — không chỉ số lớn hơn.

### 2.4 Equipment — Bronze → Mythic (6 tier)

| Tier | Ghi chú |
|------|---------|
| Bronze | Tier thấp nhất |
| Silver | |
| Gold | |
| Epic | **Mốc bắt đầu có Major Bonuses** (bonus đặc biệt ngoài stats cơ bản) |
| Legendary | |
| Mythic | |

---

## 3. Material Theo Từng Upgrade Type

| Upgrade Type | Material chính | Material phụ | Nguồn lấy |
|-------------|----------------|--------------|-----------|
| **Talents (ATK/HP/DEF)** | Gold | — | Travel (idle), events, Black Market |
| **Equipment Level** | Power Stones | — | Equipment Chests, Travel rewards |
| **Equipment Advancement (nâng cap)** | Equipment Designs | — | Equipment Chests, Travel |
| **Collectibles Star Up** | Meteoric Iron | Shards (từ ★3+) | Collectible Chests |
| **Pet Enhancement (level)** | Pet Food | Pet copies (cùng loại) | Pet Eggs, Travel, Celestial Tree raid |
| **Hero/Brand Upgrade** | Hero/Brand Fragments | Books | Legacy system, events |
| **Inheritance Hero Upgrade** | Elite Pact | Books | Special — Inheritance system |
| **Mount Upgrade** | Gold Horseshoes | — | Events (Mount Upgrade Growth Event) |
| **Artifact Upgrade** | Divine Hammers | — | — |

### Cơ chế Duplicate

| Hệ thống | Duplicate làm gì |
|----------|-----------------|
| Pets | Tiêu copy để level up (Common→Legendary: mỗi level cần copy; Mythic/Immortal: cần Pet Food trước, copy sau) |
| Collectibles | Duplicate → tự động convert thành **Shards** → dùng để star up |
| Heroes | Duplicate → thành **Hero Fragments** → dùng để upgrade |

→ **Pattern nhất quán**: duplicate không "chồng chất" unit mà convert thành material của chính unit đó — rất sạch và dễ hiểu.

---

## 4. Pattern Nổi Bật

### Pattern 1: Cực kỳ tách biệt material theo hệ thống
Mỗi upgrade track có **dedicated material riêng 100%**:
- Gold ≠ Power Stones ≠ Meteoric Iron ≠ Pet Food ≠ Fragments ≠ Horseshoes ≠ Divine Hammers

Không có material nào dùng được cho 2 hệ thống khác nhau. Đây là mức độ tách biệt cao nhất trong số các game đã research.

### Pattern 2: Rarity cố định — số sao upgrade được
Capybara Go phân biệt rõ **rarity** (cố định, không thể thay đổi) và **star level** (upgrade được trong cùng rarity). Không có "promote từ Rare lên Epic" — muốn Epic thì phải drop Epic.

### Pattern 3: Mốc tier có ý nghĩa định tính
- Collectibles: Mythic có bước nhảy stat lớn bất thường (+120 vs +40 của Legendary)
- Equipment: Epic là mốc "Major Bonuses" bắt đầu có
- Heroes: Epic unlock thêm 1 ability slot
- Pets: mỗi tier = Battle Skill khác nhau (không chỉ số lớn hơn)

### Pattern 4: Duplicate → Material của chính item đó
Hệ thống convert duplicate thành material tương ứng (Fragments/Shards/copies) thay vì duplicate chỉ "thêm 1 bản". Tạo ra incentive pull liên tục dù đã có item.

### Pattern 5: Gold là universal currency nhưng chỉ cho Talents
Khác với CRK/HSR dùng universal currency cho mọi upgrade — Capybara Go giới hạn Gold chỉ cho Talent system. Các track khác hoàn toàn không dùng Gold.

---

## 5. So Sánh Bổ Sung với Các Game Đã Research

| Điểm | CRK | Crash Fever | Honkai HSR | AFK Arena | **Capybara Go** |
|------|-----|-------------|------------|-----------|-----------------|
| **Số upgrade layers** | 7 | 5 | 5 | 6 | **7** |
| **Tách material theo track** | Có | Có | Có | Có | **Rất cao (7 material riêng biệt)** |
| **Universal currency scope** | Rộng (Coins cho mọi thứ) | Có | Credits cho mọi thứ | Gold rộng | **Hẹp (Gold chỉ cho Talents)** |
| **Rarity promotion** | Có (Star Promotion) | Có (Awakening) | Không (duplicate = Eidolon) | Có (Ascension) | **Không** |
| **Duplicate mechanic** | Soulstones/Soulcores | Deep-Log | Eidolons | Hero fodder | **Fragment/Shard convert** |
| **Số tier** | 8+ tier | 6 tier | 4 path | 6 tier | **7 tier (Pets), 5 tier (Heroes)** |

---

## 6. Recommendations Bổ Sung cho Elemental Hunter

Dựa trên Capybara Go, bổ sung vào các insight đã có từ CRK/CF/HSR/AFK:

1. **Có thể để rarity cố định** — không nhất thiết phải có hệ thống "promote tier". Player nhận tier cao từ gacha/achievement, không farm để promote. Đơn giản hơn và tránh grind vô tận. Phù hợp nếu EH muốn scope nhỏ.

2. **Material không cần dùng chéo nhau** — Capybara Go chứng minh rằng tách hoàn toàn (mỗi track 1 material riêng) hoàn toàn work mà không confused player, miễn là UI rõ ràng.

3. **Tier phải có ý nghĩa định tính ở mỗi mốc** — cả 5 game đều confirm pattern này. Trong EH: Tier C bắt đầu có Side Effect, Tier B có T3 mechanic độc đáo — đây là đúng hướng.

4. **Duplicate convert thành material** — thay vì duplicate "xếp chồng" nhân vật, có thể convert thành upgrade material của chính char đó. Tạo incentive thu thập mà không overwhelm inventory.

---

## Sources

- [Capybara Go! Wiki — Legacy](https://capybara-go.game-vault.net/wiki/Legacy)
- [Capybara Go! Wiki — Collectibles](https://capybara-go.game-vault.net/wiki/Collectibles)
- [Capybara Go! Wiki — Pets](https://capybara-go.game-vault.net/wiki/Pets)
- [Capybara Go! Wiki — Currency and Items](https://capybara-go.game-vault.net/wiki/Currency_and_Items)
- [Capybara Go! Wiki — Ultimate Beginners Guide](https://capybara-go.game-vault.net/wiki/Guide:Ultimate_Beginners_Guide)
- [Pocket Gamer — Capybara Go Tier List](https://www.pocketgamer.com/capybara-go/tier-list/)
- [Roonby — Best S-Grade Heroes and Brands Guide](https://roonby.com/2024/12/24/capybara-go-guide-best-s-grade-heroes-and-brands-guide-how-to-choose/)

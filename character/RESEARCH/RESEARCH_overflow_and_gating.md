# Research: Overflow Handling & Resource Gating
**Project:** Elemental Hunter — Character System
**Date:** 16-03-2026
**Mục đích:** Nghiên cứu cách các game xử lý duplicate/overflow material, và cơ chế gating (time/pay) để inform thiết kế Upgrade System cho Elemental Hunter.

---

## 1. Overflow Handling — Duplicate Gacha Character

### Cookie Run: Kingdom

| Tình huống | Xử lý |
|-----------|-------|
| Kéo gacha ra duplicate char | Nhận 20 Soulstones của char đó |
| Soulstones đã đầy (đã max star) | Soulstones → **Mileage Points** |
| Char đã max hoàn toàn (max star + max Soulcores) | Nhận nhiều Mileage Points hơn |

**Mileage Points** là universal shop currency — mua được Soulstones cụ thể, material, cosmetic. Không bao giờ bị "lãng phí" vì luôn convert được sang thứ có ích.

---

### Crash Fever (JP/KR)

| Tình huống | Xử lý |
|-----------|-------|
| Kéo gacha ra duplicate unit | +20 Deep-Logs cho unit đó |
| Farm quest ra duplicate unit | +1 Deep-Log |
| Đạt đủ 20 Deep-Logs | Mở 1 stage **Potential Ability** (+4% stats) |
| Bug count: kéo thêm sau khi đã có unit | Bug value của unit tăng +1 |

**Potential Ability** có 10 stages → tổng ~+30% stats. Duplicate → Deep-Log là conversion flow chính.
**Lưu ý**: Potential Data (từ event) có hard cap **65,565/tháng** — phải cẩn thận không bị overflow lãng phí.

---

### Honkai: Star Rail

| Tình huống | Xử lý |
|-----------|-------|
| Kéo duplicate char lần 1–6 | Unlock **Eidolon** tương ứng (E1 → E6) |
| Kéo duplicate sau E6 (đã max Eidolon) | Convert thành **shop currency** để dùng ở Starlight Exchange |

**Eidolon** là upgrade layer, không phải material riêng — duplicate = unlock mechanic mới cho char, tối đa 6 lần. Overflow sạch, không lãng phí.

---

### AFK Arena

| Tình huống | Xử lý |
|-----------|-------|
| Nhận duplicate hero tier Common/Rare | Dùng làm **Ascension fodder** (tiêu để nâng tier hero khác) |
| Nhận duplicate hero tier cao (Legendary+) | Dùng làm fodder cho chính hero đó để lên Mythic/Ascended |
| Celestial/Hypogean đã max Ascended | Có thể **exchange** lấy Celestial/Hypogean khác |
| Hero thừa quá nhiều | **Retire** để lấy Hero Coins (unlock sau khi có 60 Ascended heroes) |
| Muốn hoàn lại đầu tư | **Revert** hero (tốn 500 Diamonds) → nhận lại copies đã dùng để ascend |

AFK Arena là game duy nhất có cơ chế **Revert** (hoàn đầu tư) — giảm nỗi sợ "đầu tư nhầm".

---

### Capybara Go!

| Tình huống | Xử lý |
|-----------|-------|
| Duplicate Hero/Brand | Auto-convert thành **Hero/Brand Fragments** |
| Duplicate Collectible Mythic | Convert thành **50 Shards** |
| Duplicate Collectible tier thấp hơn | Convert thành ít Shards hơn tùy tier |
| Duplicate Pet | Dùng trực tiếp làm **enhancement fodder** (tiêu copy để level up) |
| Chest overflow (> 100 chests) | Chỉ có thể mở 50 chests mỗi lần |

Capybara Go không có overflow "lãng phí" — mọi duplicate đều có đầu ra rõ ràng (Fragments/Shards/fodder).

---

## 2. So Sánh Overflow Mechanism

| Game | Cơ chế overflow | Đầu ra của duplicate |
|------|----------------|---------------------|
| **CRK** | Soulstones → Mileage Points khi full | Universal shop currency |
| **Crash Fever** | Duplicate → Deep-Logs → Potential stages | Stat bonus cho chính unit đó |
| **Honkai HSR** | Duplicate → Eidolon (max 6) → shop currency | Mechanic unlock → currency |
| **AFK Arena** | Duplicate → Ascension fodder → Retire/Exchange | Dùng để upgrade, hoặc exchange/retire |
| **Capybara Go** | Duplicate → Fragments/Shards/fodder | Upgrade material cho chính item đó |

**Pattern chung**: Không có game nào để duplicate "mất đi" hoàn toàn. Mọi duplicate đều có conversion path — dù là material, currency, hay mechanic.

---

## 3. Resource Gating

### 3.1 Time-Gated Resources

| Game | Resource | Cơ chế | Cap |
|------|----------|--------|-----|
| **CRK** | Stamina Jellies | Regen 1 mỗi 5 phút | — |
| **CRK** | Arena Tickets | Regen 1/giờ | Mua thêm 5x/ngày bằng Crystal |
| **Crash Fever** | Energy (AP) | Regen theo rank | Cao hơn theo rank |
| **Crash Fever** | Daily Quests | 1 lần/ngày | Không thể bù nếu miss |
| **Crash Fever** | Raid/Tower Quests | Mở theo event, không thường xuyên | — |
| **Honkai HSR** | Trailblaze Power | 1 điểm/6 phút, cap 300 | Reserve cap 2,400 (regen 1/18 phút) |
| **AFK Arena** | AFK Rewards (Gold/XP) | Cap 12 giờ | Phải login để collect |
| **AFK Arena** | Bounty Board | Daily, không thể bù | — |
| **AFK Arena** | Fast Rewards | 3 lần/ngày | — |
| **Capybara Go** | Energy | Regen hàng ngày | Có thể mua thêm 2x/ngày (90 → 120 Gems) |
| **Capybara Go** | Daily Dungeons | 1 lần/ngày | Dungeon Dive Challenge Vouchers |

---

### 3.2 Pay-Gated Resources

| Game | Resource pay-gated | Chi tiết |
|------|-------------------|---------|
| **CRK** | Crystal | Mua pack → dùng mua Stamina refills (3x/ngày), Arena refills, gacha |
| **CRK** | Limited banner chars | Time + pay gate: chỉ xuất hiện trong thời gian giới hạn, cần Crystal |
| **Crash Fever** | Premium gacha rolls | Cần Polygons (premium currency) để pull gacha chất lượng cao |
| **Honkai HSR** | Stellar Jade | Mua trực tiếp → dùng để pull gacha hoặc refill Trailblaze Power |
| **Honkai HSR** | Limited 5★ characters | Hard time-gate: chỉ có trong banner giới hạn, hết banner = không thể pull |
| **AFK Arena** | Diamonds | Mua → dùng refill Fast Rewards, Revert heroes (500 Diamonds), VIP levels |
| **AFK Arena** | VIP levels | Cao hơn → nhiều Fast Rewards/ngày hơn, idle cap cao hơn. VIP = P2W advantage |
| **Capybara Go** | Gems (privilege card) | Ad-Free Card: +50 Gems/ngày; Lifetime Card: +200 Gems/ngày |
| **Capybara Go** | Gold Horseshoes | **Exclusive pay-gate**: chỉ có từ Dungeon Fund ($30) — F2P không thể có |
| **Capybara Go** | Speed Travel Mode | Chỉ từ paid card — F2P phải chờ real-time travel |
| **Capybara Go** | 4× battle speed | Chỉ từ paid card |

---

### 3.3 Pattern Gating Nổi Bật

**Cứng (hard gate) vs mềm (soft gate):**

| Loại | Ví dụ | Đặc điểm |
|------|-------|---------|
| **Hard time gate** | HSR limited banners, CF raid events | F2P không thể bypass — phải chờ đúng window |
| **Soft time gate** | Energy/stamina regen | F2P có thể bypass bằng premium currency |
| **Hard pay gate** | Capybara Go Gold Horseshoes | F2P không thể có, dù chờ bao lâu |
| **Soft pay gate** | VIP levels (AFK Arena) | F2P thiệt thòi hơn nhưng vẫn progress được |

**Thiết kế phổ biến**: Có cả time-gate lẫn soft pay-gate, nhưng ít khi dùng hard pay-gate cho resource ảnh hưởng trực tiếp đến combat power. Hard pay-gate thường dành cho QoL (speed, convenience) chứ không phải P2W cứng.

---

## 4. Recommendations cho Elemental Hunter

### Về overflow/duplicate:

1. **Duplicate char phải có đầu ra rõ ràng** — không để player cảm giác "kéo ra rác". Conversion path đề xuất: Duplicate char → **Shards** của char đó → dùng nâng upgrade level.

2. **Khi đã max upgrade** — Shards thừa nên convert sang **universal currency** (tương tự Mileage Points của CRK) để mua material khác. Không để thừa material mà không dùng được.

3. **Cân nhắc cơ chế "invest hoàn lại"** — nếu EH có gacha, có thể học AFK Arena's Revert để giảm lo sợ đầu tư sai. Đặc biệt hữu ích cho casual player.

### Về resource gating:

4. **Nếu có Energy system** — nên để F2P có thể farm đủ material nâng cấp chậm nhưng đều. Pay-gate chỉ cho speed/convenience (refill energy sớm hơn), không gate hẳn upgrade material.

5. **Phân biệt QoL pay-gate và P2W pay-gate** — Capybara Go dùng hard pay-gate cho Gold Horseshoes (upgrade mount) nhưng Mount không ảnh hưởng gameplay cốt lõi. Nếu EH muốn fair, hãy đặt hard pay-gate vào cosmetic hoặc QoL thay vì combat material.

6. **Không nên time-gate upgrade material** hoàn toàn — nếu char upgrade dùng material có thể farm qua gameplay bình thường (không chỉ daily reset), player cảm giác progress chủ động hơn.

---

## Sources

- [CRK Fandom — Gacha](https://cookierunkingdom.fandom.com/wiki/Gacha)
- [CRK Fandom — Soulstone Farming](https://cookierunkingdom.fandom.com/wiki/Soulstone_Farming)
- [CRK Fandom — Cookie Upgrading](https://cookierunkingdom.fandom.com/wiki/Cookie_Upgrading)
- [Game Rant — How to Farm Soulstones in CRK](https://gamerant.com/cookie-run-kingdom-how-farm-soulstones/)
- [NamuWiki — Crash Fever](https://en.namu.wiki/w/%ED%81%AC%EB%9E%98%EC%8B%9C%20%ED%94%BC%EB%B2%84)
- [Honkai Star Rail Fandom — Eidolon](https://honkai-star-rail.fandom.com/wiki/Eidolon)
- [Honkai Star Rail Fandom — Trailblaze Power](https://honkai-star-rail.fandom.com/wiki/Trailblaze_Power)
- [AFK Arena Fandom — Ascension Guide](https://afk-arena.fandom.com/wiki/AFK_ARENA_ascension_guide)
- [AFK Arena Fandom — Rickety Cart](https://afk-arena.fandom.com/wiki/Rickety_Cart)
- [AFK Arena Guide — Resource Allocation](https://afk-arena.fandom.com/wiki/Resource_Allocation_Guide)
- [Capybara Go! Wiki — Collectibles](https://capybara-go.game-vault.net/wiki/Collectibles)
- [Capybara Go! Wiki — Pets](https://capybara-go.game-vault.net/wiki/Pets)
- [Capybara Go! Wiki — Real Money P2W Guide](https://capybara-go.game-vault.net/wiki/Guide:Real_Money_Spending_P2W_Guide)

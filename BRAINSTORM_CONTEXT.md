# Context để tiếp tục brainstorm — Cơ chế đá ngựa (Kick Mechanic)

**Project:** CCN2 v3 — d:\Tamaki\3. Wokrs\2. Oshigoto\11. Claude-PRJ\1. CCN2\v3
**Scope:** Brainstorm ý tưởng ONLY — không sửa code cho đến khi được yêu cầu.

---

## Bối cảnh game

Board game 2 người chơi (Ludo-like), mỗi người có 3 token (ngựa) di chuyển trên board.

**Kick mechanic hiện tại** (`utils/gameLogic.ts:270-320`):
- Khi token A đáp lên tile có token B của đối thủ → kick xảy ra
- Damage gây ra = `token.atk` (ATK của token đá)
- Token bị đá → bị đẩy lùi về SafeZone gần nhất phía sau nó (không về start)
- SafeZone tile không bị kick

**ATK system:**
- Token tích lũy ATK bằng cách đáp lên tile cùng affinity element
- Mỗi lần: `token.atk += 30 * player.tileGainMultiplier` (giá trị đề xuất từ BALANCE.md)
- ATK xuất phát từ 0, tích lũy qua các lượt

**Mana system:**
- Nhận mana bằng: đáp tile KHÁC affinity (+10 mana) HOẶC tung doubles (+30 mana)
- Mana dùng để kích hoạt Ultimate ability (Teleport hoặc Extra Roll, cost 50)

**Doubles:**
- `isDoubles = newDice.length === 2 && newDice[0] === newDice[1]`
- Hiện tại: thưởng +30 mana + tung lại lượt (extra turn)

---

## Vấn đề đang brainstorm

### Vấn đề 1: Kick không có giá trị khi ATK thấp
- Nếu token.atk = 0: đá ngựa chỉ đẩy lùi đối thủ một chút, người đá không được lợi gì
- Rủi ro > lợi ích: đến gần đối thủ = bị đá lại bởi token có ATK cao hơn
- Kết quả: người chơi không muốn tương tác, game thiếu tension

### Vấn đề 2: Nếu tăng lợi ích kick thuần túy → snowball cho người có ATK cao
- Người có ATK cao đã gây damage lớn, nếu còn được thêm bonus → quá mạnh
- Cần lợi ích kick scale NGHỊCH với ATK: người yếu đá → nhận bonus nhiều hơn

---

## Framework đã đề xuất (chưa được user approve)

**Kick value = [Damage = token.atk] + [Kicker bonus, inversely scales with ATK]**

- Kicker ATK thấp (0–50): nhận bonus lớn → incentivize tương tác ngay cả khi chưa mạnh
- Kicker ATK cao: damage đã đủ lớn, bonus giảm dần
- Bonus KHÔNG phải mana (để không làm phức tạp nguồn mana + tránh snowball mana)
- Bonus thiên về positional/movement advantage (ví dụ: extra steps, re-roll, etc.)

**Victim compensation:**
- Tránh đền bù trực tiếp quá nhiều cho người bị đá (perverse incentive — muốn bị đá)
- Natural recovery thông qua SafeZone system đã đủ

---

## Câu hỏi của user (CHƯA ĐƯỢC TRẢ LỜI — đây là điểm tiếp tục)

> **"Nếu vẫn muốn dùng mana làm phần thưởng đá (bên cạnh việc trừ HP), bạn có thể đề xuất 1 lợi ích khác được cộng cho trường hợp đổ đôi? Tui muốn có phần thưởng thưởng cho khi người chơi may mắn để tạo ra sự biến thiên trong ván, đỡ bị đều đều."**

User đã chấp nhận khả năng dùng mana làm kick reward (dù trước đó phân vân), và hỏi:
1. Nếu dùng mana cho kick reward → thêm gì cho doubles để doubles vẫn đặc biệt/hào hứng hơn?
2. Muốn doubles tạo variance/biến thiên trong game, không bị đều đều

**Phân tích bổ sung của user:**
- Mana từ đá ngựa → khiến cơ chế phức tạp và rải rác
- Snowball risk: người ATK cao đá → nhận thêm mana → dùng Ultimate → càng mạnh hơn
- Hướng muốn: phần thưởng đá có giá trị nghịch với ATK (underdog gets more)
- Doubles hiện tại (+30 mana + extra turn) → cần thêm gì đó "memorable" hơn

---

## Hướng doubles đã research (từ các nguồn: BGG, Reddit r/gamedesign, GMTK)

1. **Amplified disruption khi doubles + kick:** nếu đổ đôi VÀ đá được ngựa → victim bị đẩy lui xa hơn bình thường (2 SafeZone thay vì 1)
2. **Extra movement:** doubles → được di chuyển thêm 1 token bất kỳ X bước (Parcheesi model)
3. **Moment of choice:** doubles → chọn giữa 2 bonus (mana HOẶC extra steps) tạo decision point
4. **"Lucky Streak" counter:** tích lũy doubles liên tiếp → trigger special event sau 2–3 doubles

---

## Files quan trọng

- `utils/gameLogic.ts` — kick logic (line 270-320), resolveMove (line 355-411)
- `App.tsx:308-395` — handleRollDice, doubles detection
- `boardSpec.ts` — board structure
- `BALANCE.md` — balance document đã hoàn thiện (atkPerAffinityTile: 10→30, etc.)

---

## Nhiệm vụ tiếp theo

Tiếp tục brainstorm. Cần trả lời:
1. Nếu dùng mana cho kick reward → cụ thể bao nhiêu mana, theo công thức gì để scale nghịch với ATK?
2. Doubles bonus mới (ngoài +30 mana + extra turn) là gì để tạo "memorable moments"?
3. User có thể cần research thêm từ web để hỗ trợ quyết định.

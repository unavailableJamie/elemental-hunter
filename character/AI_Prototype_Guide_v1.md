# Từ ý tưởng → prototype trong vài ngày
## Hướng dẫn làm game bằng AI cho Game Designer

| Field | Value |
|-------|-------|
| Tác giả | tramdm |
| Ngày tạo | 12-03-2026 |
| Phiên bản | v1 |
| Trạng thái | Draft |

> **"Bạn không cần biết code. Bạn cần biết mình muốn gì."**

---

## Mục lục

- [Phần 0 — Trước khi đọc](#phần-0--trước-khi-đọc)
- [Phần 1 — Mindset: Bạn là đạo diễn, AI là crew](#phần-1--mindset-bạn-là-đạo-diễn-ai-là-crew)
- [Phần 2 — Workflow: 4 giai đoạn từ ý tưởng → prototype](#phần-2--workflow-4-giai-đoạn-từ-ý-tưởng--prototype)
- [Phần 3 — Cách prompt hiệu quả](#phần-3--cách-prompt-hiệu-quả)
- [Phần 4 — Những bẫy phổ biến](#phần-4--những-bẫy-phổ-biến)
- [Phụ lục — Cheat sheet & Quick reference](#phụ-lục--cheat-sheet--quick-reference)

---

## Phần 0 — Trước khi đọc

### Tài liệu này dành cho ai?

Checklist nhanh — bạn đúng chỗ nếu:

- [x] Bạn là Game Designer
- [x] Bạn có ý tưởng game muốn test nhanh
- [x] Bạn **không biết code** hoặc biết rất ít
- [x] Bạn muốn có thứ gì đó **chạy được** để validate concept, không cần perfect

Bạn **không** đúng chỗ nếu:
- [ ] Bạn cần build production game (tài liệu này là về prototype, không phải ship)
- [ ] Bạn muốn AI làm hết mọi thứ trong khi bạn ngủ *(spoiler: không hoạt động)*

---

### AI là trợ lý, không phải phép màu

Trước khi bắt đầu, cần thống nhất một điều:

> **AI không thể thay thế bạn. Nó chỉ nhân lên năng lực của bạn.**

Hãy nghĩ như thế này:

- Bạn giỏi game design → AI giúp bạn làm nhanh gấp 5–10x
- Bạn chưa rõ muốn gì → AI sẽ cho ra thứ gì đó... nhìn xong bạn cũng không biết có đúng không

AI giống như một người thợ rất lành nghề. Bạn phải chỉ cho họ bản thiết kế rõ ràng. Nếu bạn nói *"xây cho tui cái nhà đẹp đẹp đi"* mà không có bản vẽ — đừng ngạc nhiên khi nhận về cái nhà 3 tầng có hồ bơi trên sân thượng và không có nhà bếp.

---

## Phần 1 — Mindset: Bạn là đạo diễn, AI là crew

### 1.1 Analogy cốt lõi

Hãy tưởng tượng bạn đang làm phim.

**Đạo diễn** (bạn) không cần biết:
- Cách vận hành máy quay
- Cách chỉnh ánh sáng
- Cách dựng phim trong phần mềm

Nhưng đạo diễn **phải** biết:
- Cảnh này cần truyền tải cảm xúc gì
- Nhân vật đứng ở đâu, nhìn hướng nào
- Shot này phục vụ story như thế nào

**Crew** (AI) sẽ lo phần kỹ thuật — nhưng họ cần **direction** rõ ràng từ bạn.

Nếu bạn nói *"quay cảnh hành động đi"* → crew sẽ quay... cái gì đó. Có thể ổn, có thể không.

Nếu bạn nói *"quay cảnh nhân vật chạy qua hành lang tối, camera theo sau, nhạc căng thẳng dần lên"* → crew biết chính xác phải làm gì.

**Ứng dụng vào game:** Bạn không cần biết React, TypeScript, hay game loop là gì. Nhưng bạn cần biết rõ: mechanic hoạt động như thế nào, player trải nghiệm gì, điều kiện thắng/thua ra sao.

---

### 1.2 Sự thật khó nghe #1: AI không biết game của bạn

AI không có trong đầu cái vision của bạn. Nó chỉ biết những gì bạn đã nói với nó.

**Hệ quả thực tế:**

Lần đầu bạn mở Claude và gõ *"làm game board game cho tui"* → Claude sẽ hỏi lại hoặc tự đoán. Cả hai đều mất thời gian.

Giải pháp: **Dạy AI về game của bạn trước khi yêu cầu nó làm gì.**

Cách làm: Viết một đoạn mô tả game ngắn gọn — tên game, concept, mechanics chính, feel muốn đạt được — và paste vào đầu mỗi conversation mới. Đây chính là lý do GDD tồn tại.

> **Elemental Hunter thực tế:** Mỗi khi mở conversation mới với Claude, team bắt đầu bằng cách paste toàn bộ context: game là gì, board structure ra sao, mechanics đang hoạt động thế nào. Không có bước này, Claude sẽ đề xuất những thứ không phù hợp với những gì đã build.

---

### 1.3 Sự thật khó nghe #2: Garbage in, garbage out

AI không magic. Nó xử lý input của bạn và trả ra output tương xứng.

| Input của bạn | Output bạn nhận |
|---|---|
| Mơ hồ, chung chung | Mơ hồ, chung chung |
| Cụ thể, có context | Cụ thể, có thể dùng được |
| Cụ thể + có ví dụ + nói rõ constraint | Chính xác, đúng scope |

**Ví dụ thực tế:**

❌ Prompt tệ:
> *"Viết cơ chế combat cho game của tui"*

✅ Prompt tốt:
> *"Game là board game 2 người, Ludo-style. Combat xảy ra khi token A đáp lên ô có token B của đối thủ. Tui muốn cơ chế này tạo tension mà không snowball. Gợi ý 3 cách thiết kế damage formula, ưu nhược điểm của từng cái."*

Sự khác biệt không phải ở độ dài — mà ở **mức độ rõ ràng về context và mục tiêu**.

---

## Phần 2 — Workflow: 4 giai đoạn từ ý tưởng → prototype

```
[Giai đoạn 1]     [Giai đoạn 2]     [Giai đoạn 3]     [Giai đoạn 4]
 Ý tưởng → GDD  →  GDD → Code    →  Test & Iterate  →  Balance
     (Design)         (Build)           (Validate)        (Tune)
```

---

### Giai đoạn 1: Ý tưởng → GDD

**Mục tiêu:** Biến cái "mơ hồ trong đầu" thành document đủ rõ để AI (và cả con người) hiểu được.

**Làm gì với AI:**
1. **Brainstorm**: Throw ý tưởng thô ra, nhờ AI expand, đặt câu hỏi phản biện
2. **Identify gaps**: Nhờ AI chỉ ra chỗ nào trong design chưa rõ
3. **Viết GDD**: AI giúp format và hoàn chỉnh từ notes của bạn

**Quy trình thực tế:**

```
Bạn: "Tui muốn làm game Ludo nhưng có yếu tố RPG. Mỗi ngựa
      có ATK, đá ngựa đối thủ gây damage. Tui chưa rõ hết,
      nhưng feel muốn như Ludo gặp Pokémon."

AI:  → Hỏi clarifying questions
     → Đề xuất các cơ chế liên quan
     → Point out những chỗ cần quyết định

Bạn: Trả lời, chọn hướng

AI:  → Draft GDD section theo template
```

**Pitfall giai đoạn này:**

> AI sẽ rất hào hứng đề xuất feature. Đừng bị cuốn. Mỗi lần AI gợi ý thêm mechanic, tự hỏi: *"Cái này có cần cho prototype không?"*
>
> Prototype = test core loop. Không phải test toàn bộ game.

> **Elemental Hunter thực tế:** GDD v1 được viết từ conversation với Claude. Claude hỏi về điều kiện thắng, số lượng player, thời gian ván — những câu hỏi mà nếu không có AI, designer có thể bỏ qua đến tận lúc build code mới nhận ra thiếu.

**Giai đoạn 1 done khi:**
- [ ] Đọc GDD xong, người khác hiểu game mà không cần bạn giải thích thêm
- [ ] Win/lose condition đã rõ ràng
- [ ] Mechanics chính (ít nhất là core loop) đã được mô tả đủ để code

---

### Giai đoạn 2: GDD → Code prototype

> **Setup lần đầu (chỉ làm 1 lần):**
> 1. Tải Node.js tại nodejs.org — chọn bản "LTS", cài như phần mềm bình thường
> 2. Sau khi AI generate code xong, mở Terminal (hoặc nhờ AI hướng dẫn cách mở)
> 3. Gõ `npm install` rồi `npm run dev` — game sẽ mở trên browser tự động
>
> Không biết làm gì tiếp? Copy-paste thông báo lỗi vào Claude, nhờ giải thích.

**Mục tiêu:** Có thứ gì đó chạy được trên browser — có thể click, có thể play, dù xấu cỡ nào.

**Công cụ cần:** Claude + Node.js cài sẵn trên máy (1 lần setup, dùng mãi)

**Làm gì với AI:**
1. Paste GDD vào Claude
2. Nhờ AI generate code cho từng phần (board, mechanics, UI)
3. Nhờ AI giải thích cách chạy nếu bạn không biết

**Điều quan trọng nhất ở giai đoạn này:**

Bạn không cần hiểu code. Bạn cần **đọc được output** của game và biết nó đúng hay sai so với design.

Khi AI viết code xong và bạn chạy lên:
- Mechanic hoạt động đúng ý chưa? → Feedback cho AI
- UI trông không ổn? → Mô tả lại cho AI
- Có bug? → Copy-paste error message vào Claude, nhờ fix

**Tip quan trọng:** Đừng nhờ AI viết toàn bộ game trong 1 lần. Chia nhỏ:

```
Lần 1: "Build board structure và UI cơ bản"
Lần 2: "Add token movement"
Lần 3: "Add combat mechanic"
...
```

Mỗi lần build 1 thứ, test ngay, trước khi thêm thứ tiếp theo. Nếu để dồn hết thì bug chồng bug, không biết cái gì sai.

> **Coi chừng:** Giai đoạn này dễ bị Bẫy 2 (mất context) và Bẫy 4 (scope creep) nhất — xem [Phần 4](#phần-4--những-bẫy-phổ-biến) trước khi bắt đầu code.

> **Elemental Hunter thực tế:** Prototype bắt đầu từ board layout và 2 token di chuyển — không có combat, không có elements, không có UI đẹp. Sau khi movement đúng rồi mới add từng mechanic một. Cách này giúp isolate bug rất dễ.

**Giai đoạn 2 done khi:**
- [ ] Chạy được ít nhất 1 ván từ đầu đến cuối (dù xấu)
- [ ] Core mechanic chính hoạt động đúng với GDD
- [ ] Không cần AI giải thích để mở và chạy game

---

### Giai đoạn 3: Test & Iterate

**Mục tiêu:** Chơi thử, xác nhận core loop có fun không, sửa những gì không work.

**Làm gì với AI:**
- Mô tả vấn đề bạn thấy khi chơi → nhờ AI suggest fix
- Muốn thay đổi mechanic → explain rõ muốn thay đổi gì, tại sao
- Copy-paste bug/error → nhờ AI debug

**Vòng lặp chuẩn:**

```
Chơi thử → Thấy vấn đề → Describe cho AI → AI suggest →
Apply → Chơi thử lại → ...
```

**Lưu ý về "vấn đề":**

Có 2 loại vấn đề cần phân biệt:

1. **Bug kỹ thuật**: Game crash, số liệu sai, button không hoạt động → AI fix được ngay
2. **Vấn đề design**: Mechanic không fun, không balanced, feel không đúng → Đây là việc của *bạn*, AI chỉ support brainstorm

Đừng nhờ AI quyết định thay bạn xem mechanic có fun không. AI không có game sense. Nó có thể phân tích, đề xuất, nhưng final call luôn là của designer.

> **Elemental Hunter thực tế:** Cơ chế kick ban đầu không tạo tension vì kicking player không được lợi gì nếu ATK thấp. Vấn đề này được phát hiện khi chơi thử — không phải khi đọc GDD. AI sau đó được dùng để brainstorm giải pháp (inverse-scaling bonus), nhưng decision cuối là của designer sau khi cân nhắc risk snowball.

**Giai đoạn 3 done khi:**
- [ ] Bạn (và ít nhất 1 người khác) đã chơi thử và có feedback cụ thể
- [ ] Không còn bug block gameplay (crash, stuck, số liệu sai)
- [ ] Bạn có thể tự trả lời: "Core loop này có fun không? Tại sao?"

---

### Giai đoạn 4: Balance

**Mục tiêu:** Các con số trong game tạo ra experience đúng như thiết kế.

**Làm gì với AI:**
- Nhờ AI tính xác suất, expected value, simulate scenarios
- Nhờ AI review balance doc và point out anomaly
- Nhờ AI tìm edge case mà bạn chưa nghĩ tới

**Điều AI làm rất tốt ở giai đoạn này:**

AI rất giỏi tính toán nhanh. Thay vì bạn ngồi Excel tính tay *"nếu HP = 500 và mỗi combo damage 150 thì trung bình mấy combo mới xong ván"*, AI làm được trong vài giây.

**Điều AI không làm thay được:**

Balance cuối cùng phải được validate bằng actual playtesting. Số liệu đẹp trên giấy không đảm bảo game fun khi chơi thật.

> **Elemental Hunter thực tế:** Balance doc được AI hỗ trợ tính xác suất — ví dụ: *"Với 40 tiles trong main loop, 60% là elemental tiles, trung bình bao nhiêu lượt để đủ ATK kick gây damage đáng kể?"* Tính tay cái này mất 30 phút, AI trả lời trong 2 giây. Nhưng sau khi có số, team vẫn phải chạy playtest để xem feel có đúng không.

**Giai đoạn 4 done khi:**
- [ ] Session length gần đúng target (không kết thúc quá sớm hoặc quá muộn)
- [ ] Không có mechanic nào "dominant" rõ ràng (1 chiến thuật thắng tất cả)
- [ ] Đã playtest ít nhất 3 ván với số liệu mới

---

### Variation: Khi bạn prototype tính năng, không phải game mới

Workflow 4 giai đoạn ở trên được thiết kế cho **game mới từ đầu**. Nếu bạn đang thêm 1 tính năng vào game **đang có sẵn** — ví dụ thêm cơ chế mới, thêm mode, thêm loại item — thì 3 điểm sau khác đi đáng kể:

| | Prototype game mới | Prototype tính năng mới |
|---|---|---|
| **Bắt đầu từ** | Tờ giấy trắng | Codebase đang chạy |
| **Giai đoạn 1** | Viết GDD đầy đủ | Viết Feature Spec ngắn |
| **Giai đoạn 2** | AI build từ đầu | AI thêm vào code có sẵn → phải cho AI đọc code trước |
| **Rủi ro chính** | Scope creep | Phá vỡ thứ đang hoạt động |
| **Giai đoạn 3** | Test core loop | Test tính năng mới + test tích hợp với phần cũ |
| **Giai đoạn 4** | Balance toàn game | Balance trong giới hạn hệ thống đang có |

---

**Khác biệt 1: Giai đoạn 1 → Viết Feature Spec, không phải GDD đầy đủ**

Bạn không cần viết lại toàn bộ GDD. Chỉ cần 1 document ngắn mô tả tính năng mới:
- Tính năng này làm gì?
- Nó tương tác với mechanic nào đang có?
- Điều kiện kích hoạt và kết quả là gì?
- Tại sao thêm cái này vào game?

> **Ví dụ từ Elemental Hunter:** Khi brainstorm thêm "Doubles bonus mới", không cần viết lại GDD — chỉ cần 1 đoạn: *"Doubles hiện tại cho +30 mana + extra turn. Muốn thêm effect thứ 3 tạo memorable moment, không làm phức tạp thêm nguồn mana."*

---

**Khác biệt 2: Giai đoạn 2 → AI cần đọc code hiện tại TRƯỚC khi viết**

Đây là điểm quan trọng nhất. Khi game đã có sẵn, nếu bạn nhờ AI viết code tính năng mới mà không cho AI đọc codebase trước → AI sẽ viết code **không tương thích**, gây conflict với những gì đang chạy.

Quy trình đúng:
```
1. Paste feature spec
2. Paste file(s) liên quan từ codebase hiện tại
3. Nói rõ: "Thêm tính năng này vào code hiện tại, không rewrite những gì không liên quan"
4. Test ngay sau khi apply — TRƯỚC khi nhờ AI làm thêm bất cứ thứ gì
```

> **Rule of thumb:** Thêm 1 tính năng = cho AI đọc ít nhất 1–2 file liên quan. Không bao giờ nhờ AI thêm tính năng vào "không khí".

---

**Khác biệt 3: Giai đoạn 3 → Test tích hợp, không chỉ test tính năng**

Khi prototype game mới: test xem tính năng có hoạt động không.

Khi thêm vào game có sẵn: test thêm 1 bước — **tính năng mới có phá thứ gì đang chạy không?**

Checklist test tích hợp:
- [ ] Tính năng mới hoạt động đúng spec
- [ ] Các mechanic khác vẫn hoạt động bình thường
- [ ] Không có edge case nào bị conflict (ví dụ: 2 mechanic cùng trigger 1 lúc)

---

*Ngoài 3 điểm trên, phần còn lại của guide áp dụng bình thường cho cả hai trường hợp.*

---

## Phần 3 — Cách prompt hiệu quả

### 3.1 Công thức prompt cơ bản

Một prompt tốt thường có đủ 3 thành phần:

```
[Context] + [Yêu cầu cụ thể] + [Constraint/Format mong muốn]
```

**Ví dụ:**

| Thành phần | Ví dụ |
|---|---|
| Context | *"Game là board game 2P, Ludo-style, có combat khi token đụng nhau"* |
| Yêu cầu | *"Gợi ý 3 cách design damage formula cho combat"* |
| Constraint | *"Mỗi option cần có ưu/nhược, không quá phức tạp để implement"* |

---

### 3.2 Prompt templates theo từng loại task

**Brainstorm ý tưởng:**
```
Tui đang thiết kế [mô tả game ngắn].
Tui muốn brainstorm về [vấn đề cụ thể].
Hãy đề xuất [số lượng] options, mỗi option có ưu/nhược điểm ngắn.
Constraint: [giới hạn cần giữ, nếu có].
```

**Viết / cập nhật GDD:**
```
Đây là GDD hiện tại của tui: [paste GDD]
Tui vừa quyết định thay đổi [mechanic X] thành [cách hoạt động mới].
Hãy update section liên quan trong GDD theo format hiện tại.
```

**Yêu cầu code:**
```
Đây là cách mechanic X hoạt động: [mô tả rõ ràng]
Hãy implement mechanic này vào code hiện tại.
Code hiện tại: [paste file liên quan]
Chỉ thay đổi những gì cần thiết, không thêm feature ngoài yêu cầu.
```

**Debug:**
```
Game bị lỗi này: [paste error message]
Đây là file liên quan: [paste code]
Tui không thay đổi gì trước khi lỗi xuất hiện, ngoài việc [mô tả thay đổi gần nhất nếu có].
```

**Balance check:**
```
Đây là các thông số game: [list các con số]
Với những số này, tính:
- [Câu hỏi 1]
- [Câu hỏi 2]
Cho tui biết nếu thấy bất kỳ anomaly nào.
```

---

### 3.3 Kỹ thuật "dạy AI về game của bạn"

Mỗi khi bắt đầu conversation mới (hoặc conversation đã dài và AI có thể "quên"):

1. **Paste context block** — đoạn mô tả ngắn về game, mechanics đang có, decisions đã làm
2. **State current goal** — bạn đang ở đâu trong workflow, muốn đạt được gì trong session này
3. **List constraints** — những thứ KHÔNG được thay đổi (đã finalize rồi)

Ví dụ context block:
```
== CONTEXT ==
Game: [Tên game] — [mô tả 2–3 câu]
Current state: [những mechanic đã có và hoạt động đúng]
Already decided: [những thứ đã lock, không thay đổi]
Current session goal: [muốn làm gì hôm nay]
== END CONTEXT ==
```

---

## Phần 4 — Những bẫy phổ biến

### Bẫy 1: AI tự thêm feature bạn không yêu cầu

**Hiện tượng:** Bạn nhờ AI thêm 1 mechanic nhỏ. Bạn nhận về code với thêm 3 mechanic "bonus" mà AI nghĩ sẽ hay.

**Tại sao xảy ra:** AI muốn helpful và đôi khi over-helpful.

**Cách tránh:** Kết thúc prompt bằng:
> *"Chỉ thay đổi những gì tui yêu cầu. Không thêm feature ngoài scope."*

**Cách xử lý khi xảy ra:** Nói thẳng:
> *"Tui chỉ cần [X], hãy revert những thay đổi không liên quan."*

---

### Bẫy 2: Mất context giữa chừng

**Hiện tượng:** Conversation kéo dài, bạn hỏi tiếp thì AI bắt đầu đề xuất thứ mâu thuẫn với những gì đã nói trước. Hoặc bạn mở conversation mới và AI không biết context.

**Tại sao xảy ra:** AI có "context window" — nó chỉ "nhớ" trong phạm vi conversation hiện tại. Conversation mới = AI không biết gì về project của bạn.

**Cách tránh:**
- Maintain một **context block** (xem Phần 3.3) và paste lại khi cần
- Khi conversation quá dài, tóm tắt lại những quyết định quan trọng trước khi tiếp tục
- Lưu decisions vào GDD ngay — đừng để chỉ tồn tại trong chat

---

### Bẫy 3: Expect perfect output ngay lần đầu

**Hiện tượng:** Bạn mô tả mechanic, AI generate code, code chạy có bug hoặc không đúng ý, bạn thất vọng.

**Tại sao đây là bẫy:** Iteration là một phần bình thường của workflow, không phải dấu hiệu AI "kém".

**Mindset đúng:** Lần đầu AI generate ra thứ gì đó = 60–70% đúng. Nhiệm vụ của bạn là describe phần 30–40% chưa đúng để AI fix tiếp.

> Giống như bạn chỉ thợ xây: lần đầu họ dựng khung nhà, bạn xem và bảo *"cánh cửa này cần dịch sang trái 50cm"* — không ai expect thợ xây đọc được tâm trí bạn.

---

### Bẫy 4: Prototype scope creep

**Hiện tượng:** Bắt đầu với mục tiêu "test core loop". 2 tuần sau, bạn đang build full UI, sound effects, achievement system...

**Tại sao nguy hiểm:** Prototype không validate được gì nếu bạn chưa play test core loop. Mọi thứ khác build lên trên là rủi ro nếu core loop hóa ra không fun.

**Rule of thumb:**
> Prototype done = có thể play 1 ván hoàn chỉnh với core mechanics. Không cần đẹp. Không cần polish.

---

### Bẫy 5: Nhờ AI quyết định thay bạn

**Hiện tượng:** Gặp design decision khó, bạn hỏi AI *"theo bạn tui nên làm vậy hay vậy?"* rồi làm theo AI nói mà không suy nghĩ kỹ.

**Tại sao nguy hiểm:** AI không có game sense. Nó sẽ cho ra answer nghe có lý về mặt logic, nhưng logic ≠ fun. AI cũng không biết vision của bạn sâu bằng bạn.

**Cách dùng đúng:** Nhờ AI *"liệt kê pros/cons của từng option"*, rồi **bạn** là người quyết định dựa trên design intuition và playtest data.

---

## Phụ lục — Cheat sheet & Quick reference

### Glossary — Giải thích nhanh các thuật ngữ hay gặp

| Thuật ngữ | Nghĩa đơn giản |
|---|---|
| **Core loop** | Vòng lặp hành động chính của game — thứ player làm đi làm lại mỗi lượt |
| **Prototype** | Phiên bản chạy được để test ý tưởng — không cần đẹp, không cần hoàn chỉnh |
| **Iterate** | Chỉnh sửa → test → chỉnh tiếp, lặp lại nhiều lần cho đến khi đúng ý |
| **Snowball** | Khi người đang thắng càng lúc càng dễ thắng hơn, tạo mất cân bằng |
| **Context window** | Giới hạn "bộ nhớ ngắn hạn" của AI trong 1 conversation — càng dài AI càng dễ quên phần đầu |
| **Scope creep** | Prototype cứ bị thêm feature, phình to hơn mục tiêu ban đầu |

---

### Workflow tóm tắt

| Giai đoạn | Bạn làm gì | AI làm gì |
|---|---|---|
| Ý tưởng → GDD | Define vision, trả lời questions, approve decisions | Brainstorm, đặt câu hỏi, viết/format document |
| GDD → Code | Describe mechanics rõ ràng, test output | Generate code, fix bug khi được chỉ ra |
| Test & Iterate | Chơi thử, identify vấn đề, describe fix cần làm | Implement fix, suggest giải pháp kỹ thuật |
| Balance | Define experience muốn đạt được, playtest | Tính toán, simulate, flag anomaly |

---

### Dấu hiệu bạn đang dùng AI đúng cách

- [ ] Bạn có thể giải thích mechanic game của bạn trong 2 phút không cần đọc notes
- [ ] Mỗi session với AI bạn có mục tiêu cụ thể trước khi bắt đầu
- [ ] Bạn test sau mỗi thay đổi, không đợi build xong hết mới test
- [ ] GDD của bạn được update theo từng decision, không chỉ tồn tại trong chat
- [ ] Khi AI cho output không đúng, bạn describe cụ thể chỗ nào sai thay vì nói "làm lại đi"

---

### Dấu hiệu bạn đang dùng AI sai cách

- [ ] Bạn paste yêu cầu mơ hồ và expect AI "hiểu"
- [ ] Bạn chưa chơi thử game của mình nhưng đã build thêm feature mới
- [ ] Bạn để AI quyết định design thay bạn
- [ ] Conversation dài 100+ tin nhắn và bạn không có document nào lưu lại
- [ ] Bạn frustrated khi AI không cho ra perfect result ngay lần đầu

---

### Quick reference: Câu nói hữu ích khi làm việc với AI

| Tình huống | Nói với AI |
|---|---|
| Muốn AI không tự thêm thứ ngoài scope | *"Chỉ thay đổi những gì tui yêu cầu."* |
| Output không đúng ý, không biết tại sao | *"Output này khác với ý tui vì [X]. Hãy thử lại với [cách tiếp cận khác]."* |
| Muốn options, không muốn AI quyết thay | *"Cho tui 3 options với pros/cons, tui sẽ tự chọn."* |
| Cần fix bug | *"Lỗi: [error]. File: [paste code]. Tui không thay đổi gì ngoài [X]."* |
| Muốn AI challenge design của bạn | *"Hãy đóng vai người chơi khó tính và chỉ ra điểm yếu trong design này."* |
| Context bị lost | *"Tóm tắt lại những gì đã quyết định trong conversation này trước khi tiếp tục."* |

---

*Tài liệu này được viết dựa trên kinh nghiệm thực tế từ project Elemental Hunter — từ ý tưởng board game Ludo-RPG đến prototype chạy được trên browser trong vài ngày làm việc.*

*Version tiếp theo sẽ bổ sung: Screenshots thực tế từ Elemental Hunter, video walkthrough, và template prompt library đầy đủ hơn.*

# UI Checklist — Character System Prototype

> Rút từ GDD_CharacterSystem_v1.md. Xác nhận bởi tramdm ngày 18-03-2026.

---

## A. Character Identity
- [ ] Tên nhân vật
- [ ] Portrait / artwork
- [ ] Tier (D / C / B / A)
- [ ] Element Affinity

## B. Stats
- [ ] ATK (base + Stat Bonus từ Dup)
- [ ] MAG
- [ ] MaxHP

## C. Char Level & Enlightenment
- [ ] Char Level hiện tại (ví dụ: Lv 60)
- [ ] Enlightenment hiện tại (ví dụ: En. 3)
- [ ] Level cap của Enlightenment hiện tại (ví dụ: Lv 60/60 → locked)
- [ ] Char Level tối đa theo Tier (ví dụ: Tier D = Lv 60 max mãi mãi)
- [ ] Progress indicator trong bracket hiện tại

## D. Duplicate Status
- [ ] Dup hiện tại (Dup0 → Dup5)
- [ ] 5 mốc Dup với trạng thái unlocked / locked
- [ ] Loại phần thưởng tại từng mốc (Stat Bonus / C.Pow lvUP / Ulti lvUP)

## E. Combo Powers
- [ ] C.Pow 1 — luôn hiển thị, trạng thái: cấp 1 hoặc 1+
- [ ] C.Pow 2 — chỉ hiển thị nếu Tier C trở lên, trạng thái: cấp 1 hoặc 2+
- [ ] C.Pow 3 — chỉ hiển thị nếu Tier A, trạng thái: cấp 1 hoặc 3+
- [ ] Mô tả hiệu ứng của từng C.Pow

## F. Ultimate
- [ ] Tên kỹ năng (ví dụ: Extra Roll)
- [ ] Cấp Ultimate (Lv 1 / Lv 2)
- [ ] MAG Cost tại cấp hiện tại
- [ ] Mô tả hiệu ứng
- [ ] Thông tin upgrade Lv2 nếu chưa đạt (ví dụ: "Lv2: Giảm MAG Cost từ 70 → 50")

---

## Scenes Cần Build

| # | Scene | Ảnh tham khảo | Note |
|---|-------|--------------|------|
| 1 | Lobby | lobby | Scene đầu tiên khi vào game |
| 2 | character-list | character-list | Mở khi bấm nút Inventory trên scene lobby |
| 3 | character-info | character-info-cookie, character-info-R1999, character-info-lvlup-sdorica | Mở khi bấm vào 1 character cụ thể trong character-list |
| 4 | character-info-lvlup | character-info-lvlup-R1999 | Popup nâng cấp ở scene character-info, bấm nút nâng cấp hoặc nút "+" gần level |
| 5 | character-info-skilllv | character-info-skilllv-R1999 | Popup ở scene character-info khi bấm vào phần skill/Ultimate, hiện các cấp + điều kiện mở (Dup) |

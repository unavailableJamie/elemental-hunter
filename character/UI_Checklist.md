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

### Panel KỸ NĂNG — Container chung (dùng chung cho cả Combo và Ultimate)
- [ ] Section header "KỸ NĂNG"
- [ ] Navigation arrows ◄ ► để chuyển giữa các kỹ năng (số trang = số Combo Powers + 1 Ultimate)
- [ ] Skill icon — hình vuông bo góc ~60×60px, nền tối, icon bên trong
- [ ] Skill name — text trắng ~18–20px bold
- [ ] Skill type badge — label nhỏ ~12px phía dưới tên ("Kỹ năng combo" hoặc "Kỹ năng chủ động")

### Nội dung Combo Skill
- [ ] C.Pow 1 — luôn hiển thị, trạng thái: cấp 1 hoặc 1+
- [ ] C.Pow 2 — chỉ hiển thị nếu Tier C trở lên, trạng thái: cấp 1 hoặc 2+
- [ ] C.Pow 3 — chỉ hiển thị nếu Tier A, trạng thái: cấp 1 hoặc 3+
- [ ] Row "Cơ bản" — pill label xanh lá + mô tả hiệu ứng cấp 1
- [ ] Row "Đặc biệt" — pill label vàng/cam + mô tả hiệu ứng cấp "+" (khi chưa unlock)
- [ ] Row unlock condition — icon 🔒 + text "Mở khóa tại Dup Lv X" (mờ/xám khi locked)
- [ ] Khi đã unlock cấp "+": row "Đặc biệt" đổi sang active state (nền sáng hơn, label đổi màu)

## F. Ultimate

### Nội dung Ultimate Skill
- [ ] Tên kỹ năng (ví dụ: "Singularity +")
- [ ] Row "Cơ bản" — pill label xanh lá + MAG Cost badge (ví dụ: "90 MAG", teal pill, góc phải) + mô tả hiệu ứng Lv1
- [ ] Row "Đặc biệt" — pill label + MAG Cost badge Lv2 (ví dụ: "70 MAG") + mô tả hiệu ứng Lv2
- [ ] Row điều kiện — text "Điều kiện: Dup X"
  - Locked: icon 🔒, nền tối/mờ
  - Unlocked: icon ✅ / nền xanh lá, toàn bộ row "Đặc biệt" chuyển sang active state
- [ ] MAG Cost badge — hiển thị khác nhau giữa Lv1 và Lv2 để player thấy sự cải thiện

---

## Scenes Cần Build

| # | Scene | Ảnh tham khảo | Note |
|---|-------|--------------|------|
| 1 | Lobby | lobby | Scene đầu tiên khi vào game |
| 2 | character-list | character-list | Mở khi bấm nút Inventory trên scene lobby |
| 3 | character-info | character-info-cookie, character-info-R1999, character-info-lvlup-sdorica | Mở khi bấm vào 1 character cụ thể trong character-list |
| 4 | character-info-lvlup | character-info-lvlup-R1999 | Popup nâng cấp ở scene character-info, bấm nút nâng cấp hoặc nút "+" gần level |
| 5 | character-info-skilllv | character-info-skilllv-R1999 | Popup ở scene character-info khi bấm vào phần skill/Ultimate, hiện các cấp + điều kiện mở (Dup) |

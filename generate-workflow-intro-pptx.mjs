// generate-workflow-intro-pptx.mjs
// 3-slide deck: Game Design Workflow overview for team
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pptxgen = require('./node_modules/pptxgenjs/dist/pptxgen.cjs.js')

const prs = new pptxgen()
prs.layout = 'LAYOUT_WIDE' // 13.33 x 7.5 inches

const F = 'Calibri'

const C = {
  bg:          'FFFFFF',
  bgSoft:      'F8FAFC',
  bgAlt:       'F1F5F9',
  text:        '1E293B',
  accent:      '4F46E5',
  accentLight: 'EEF2FF',
  muted:       '64748B',
  border:      'CBD5E1',
  green:       '059669',
  orange:      'EA580C',
  white:       'FFFFFF',
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function slideBg(s) {
  s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.bg } })
  s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.07, fill: { color: C.accent } })
  s.addShape(prs.ShapeType.rect, { x: 0, y: 7.43, w: '100%', h: 0.07, fill: { color: C.accent } })
}

function slideTitle(s, title, subtitle = null) {
  s.addText(title, {
    x: 0.5, y: 0.2, w: 12.3, h: 0.58,
    fontSize: 26, bold: true, color: C.text, fontFace: F,
  })
  if (subtitle) {
    s.addText(subtitle, {
      x: 0.5, y: 0.78, w: 12.3, h: 0.28,
      fontSize: 14, color: C.muted, fontFace: F, italic: true,
    })
  }
  s.addShape(prs.ShapeType.rect, {
    x: 0.5, y: subtitle ? 1.1 : 0.82, w: 1.8, h: 0.05,
    fill: { color: C.accent },
  })
}

// ─── SLIDE 1 — TẠI SAO CẦN QUY TRÌNH? ───────────────────────────────────────
{
  const s = prs.addSlide()
  slideBg(s)
  slideTitle(s, 'Tại sao cần quy trình thiết kế?')

  const pains = [
    {
      num:   '01',
      title: 'Scope Creep',
      desc:  'Thêm feature liên tục không có điểm dừng — dự án kéo dài vô hạn',
      color: C.orange,
    },
    {
      num:   '02',
      title: 'Thiếu tài liệu',
      desc:  'Mechanic nằm trong đầu designer — coder không biết build cái gì',
      color: '8B5CF6',
    },
    {
      num:   '03',
      title: 'Không biết khi nào xong',
      desc:  'Không có Verification rõ ràng — cứ làm rồi sửa, sửa rồi làm',
      color: C.accent,
    },
  ]

  pains.forEach((p, i) => {
    const x = 0.5 + i * 4.2
    const y = 1.4

    s.addShape(prs.ShapeType.roundRect, {
      x, y, w: 3.95, h: 2.85,
      rectRadius: 0.14,
      fill: { color: C.bgAlt },
      line: { color: C.border, pt: 1 },
    })
    s.addShape(prs.ShapeType.rect, {
      x, y, w: 3.95, h: 0.07,
      fill: { color: p.color },
    })

    // Number badge
    s.addShape(prs.ShapeType.roundRect, {
      x: x + 0.2, y: y + 0.28, w: 0.6, h: 0.6,
      rectRadius: 0.1,
      fill: { color: p.color },
    })
    s.addText(p.num, {
      x: x + 0.2, y: y + 0.28, w: 0.6, h: 0.6,
      fontSize: 18, bold: true, color: C.white,
      align: 'center', valign: 'middle', fontFace: F,
    })

    s.addText(p.title, {
      x: x + 0.2, y: y + 1.1, w: 3.55, h: 0.45,
      fontSize: 20, bold: true, color: C.text, fontFace: F,
    })
    s.addText(p.desc, {
      x: x + 0.2, y: y + 1.6, w: 3.55, h: 1.0,
      fontSize: 16, color: C.muted, fontFace: F, wrap: true,
    })
  })

  // Goal banner
  s.addShape(prs.ShapeType.roundRect, {
    x: 0.5, y: 4.55, w: 12.3, h: 0.9,
    rectRadius: 0.12,
    fill: { color: C.accentLight },
    line: { color: C.accent, pt: 1.5 },
  })
  s.addText('Quy trình 8 bước: từ ý tưởng → sẵn sàng production — có kiểm soát & đo được.', {
    x: 0.7, y: 4.55, w: 11.9, h: 0.9,
    fontSize: 20, bold: true, color: C.accent,
    align: 'center', valign: 'middle', fontFace: F,
  })
}

// ─── SLIDE 2 — 8 BƯỚC CHI TIẾT ───────────────────────────────────────────────
{
  const s = prs.addSlide()
  slideBg(s)
  slideTitle(s, '8 bước quy trình — Chi tiết', 'Output · Hướng xử lý · Mức độ AI hỗ trợ · Template & Skill đề xuất')

  const AI = {
    auto:  { label: 'AI tự làm',     color: '059669', bg: 'D1FAE5' },
    mixed: { label: 'AI + Human',    color: 'D97706', bg: 'FEF3C7' },
    human: { label: 'Human only',    color: 'DC2626', bg: 'FEE2E2' },
  }

  const steps = [
    {
      n: 1, name: 'Research &\nIdeation',      color: '0EA5E9',
      output:  'Concept Statement',
      succeed: '→ Step 2: GDD',
      failed:  '↩ Brainstorm lại / refine brief',
      ai: 'mixed',
      template: 'Concept Brief template',
      skill:    '/gdd-partner',
    },
    {
      n: 2, name: 'Game Design\nDocument',     color: '8B5CF6',
      output:  'GDD 10 sections',
      succeed: '→ Step 3: Mechanics',
      failed:  '↩ Revision + stakeholder sign-off',
      ai: 'auto',
      template: 'GDD_template.md',
      skill:    '/gdd-partner',
    },
    {
      n: 3, name: 'Core Mechanics\nDesign',    color: '4F46E5',
      output:  'Balance Spreadsheet',
      succeed: '→ Step 4: Prototype',
      failed:  '↩ Rebalance / redesign mechanic',
      ai: 'mixed',
      template: 'Balance Sheet template',
      skill:    '(balance calc)',
    },
    {
      n: 4, name: 'Prototype\nDevelopment',    color: '06B6D4',
      output:  'Playable Prototype',
      succeed: '→ Step 5: Tutorial',
      failed:  '↩ Fix bugs / rework logic',
      ai: 'mixed',
      template: '—',
      skill:    '/frontend-development',
    },
    {
      n: 5, name: 'Tutorial Design\n& Impl.',  color: 'F59E0B',
      output:  'First-Timer Test pass',
      succeed: '→ Step 6: Playtesting',
      failed:  '↩ Simplify onboarding flow',
      ai: 'mixed',
      template: 'Tutorial Flow template',
      skill:    '/cook',
    },
    {
      n: 6, name: 'Playtesting',               color: 'F97316',
      output:  'Playtest Report',
      succeed: '→ Step 7: Docs',
      failed:  '↩ Fix issues & retest',
      ai: 'human',
      template: 'Playtest Report template',
      skill:    '—',
    },
    {
      n: 7, name: 'Documentation\n& Assets',   color: '059669',
      output:  'TDD + Asset Brief',
      succeed: '→ Step 8: Sprint Plan',
      failed:  '↩ Complete missing sections',
      ai: 'auto',
      template: 'TDD + Asset Brief template',
      skill:    '/doc-reviewer',
    },
    {
      n: 8, name: 'Implementation\nPlan',      color: '10B981',
      output:  'Sprint Plan',
      succeed: '→ Handoff to Dev',
      failed:  '↩ Revise scope / priority',
      ai: 'auto',
      template: 'Sprint Plan template',
      skill:    '/workflow-assistant',
    },
  ]

  // ── Table geometry ──
  const TX   = 0.35   // left margin
  const TY   = 1.22   // table top
  const RH   = 0.615  // row height (header + 8 rows fits in ~6.1in)
  // Column widths (sum = 12.55, ends at 12.9, slide=13.33)
  const COLS = [0.48, 2.05, 1.88, 1.78, 1.9, 1.52, 2.94]
  const colX = i => COLS.slice(0, i).reduce((a, v) => a + v, TX)

  // ── Header ──
  const HDRS = ['#', 'Tên bước', 'Output', 'Succeed ✓', 'Failed ✗', 'AI Level', 'Template  /  Skill']
  HDRS.forEach((h, i) => {
    s.addShape(prs.ShapeType.rect, {
      x: colX(i), y: TY, w: COLS[i], h: RH,
      fill: { color: C.accent },
      line: { color: C.white, pt: 0.6 },
    })
    s.addText(h, {
      x: colX(i), y: TY, w: COLS[i], h: RH,
      fontSize: 12, bold: true, color: C.white,
      align: 'center', valign: 'middle', fontFace: F,
    })
  })

  // ── Data rows ──
  steps.forEach((st, ri) => {
    const y  = TY + RH + ri * RH
    const bg = ri % 2 === 0 ? C.bg : C.bgSoft
    const lv = AI[st.ai]

    // col 0 — number badge
    s.addShape(prs.ShapeType.rect, {
      x: colX(0), y, w: COLS[0], h: RH,
      fill: { color: bg }, line: { color: C.border, pt: 0.4 },
    })
    s.addShape(prs.ShapeType.roundRect, {
      x: colX(0) + 0.05, y: y + 0.1, w: 0.36, h: 0.42,
      rectRadius: 0.06,
      fill: { color: st.color },
    })
    s.addText(`${st.n}`, {
      x: colX(0) + 0.05, y: y + 0.1, w: 0.36, h: 0.42,
      fontSize: 13, bold: true, color: C.white,
      align: 'center', valign: 'middle', fontFace: F,
    })

    // col 1 — step name (left accent bar)
    s.addShape(prs.ShapeType.rect, {
      x: colX(1), y, w: COLS[1], h: RH,
      fill: { color: bg }, line: { color: C.border, pt: 0.4 },
    })
    s.addShape(prs.ShapeType.rect, {
      x: colX(1), y: y + 0.07, w: 0.04, h: RH - 0.14,
      fill: { color: st.color },
    })
    s.addText(st.name, {
      x: colX(1) + 0.1, y, w: COLS[1] - 0.14, h: RH,
      fontSize: 12, bold: true, color: C.text,
      valign: 'middle', fontFace: F, wrap: true,
    })

    // col 2 — output (colored by step)
    s.addShape(prs.ShapeType.rect, {
      x: colX(2), y, w: COLS[2], h: RH,
      fill: { color: bg }, line: { color: C.border, pt: 0.4 },
    })
    s.addText(st.output, {
      x: colX(2) + 0.1, y, w: COLS[2] - 0.14, h: RH,
      fontSize: 11, bold: true, color: st.color,
      valign: 'middle', fontFace: F, wrap: true,
    })

    // col 3 — succeed (green text)
    s.addShape(prs.ShapeType.rect, {
      x: colX(3), y, w: COLS[3], h: RH,
      fill: { color: bg }, line: { color: C.border, pt: 0.4 },
    })
    s.addText(st.succeed, {
      x: colX(3) + 0.08, y, w: COLS[3] - 0.12, h: RH,
      fontSize: 10.5, color: '059669',
      valign: 'middle', fontFace: F, wrap: true,
    })

    // col 4 — failed (red text)
    s.addShape(prs.ShapeType.rect, {
      x: colX(4), y, w: COLS[4], h: RH,
      fill: { color: bg }, line: { color: C.border, pt: 0.4 },
    })
    s.addText(st.failed, {
      x: colX(4) + 0.08, y, w: COLS[4] - 0.12, h: RH,
      fontSize: 10.5, color: 'DC2626',
      valign: 'middle', fontFace: F, wrap: true,
    })

    // col 5 — AI level badge
    s.addShape(prs.ShapeType.rect, {
      x: colX(5), y, w: COLS[5], h: RH,
      fill: { color: bg }, line: { color: C.border, pt: 0.4 },
    })
    s.addShape(prs.ShapeType.roundRect, {
      x: colX(5) + 0.1, y: y + 0.12, w: COLS[5] - 0.2, h: RH - 0.24,
      rectRadius: 0.1,
      fill: { color: lv.bg },
      line: { color: lv.color, pt: 1 },
    })
    s.addText(lv.label, {
      x: colX(5) + 0.1, y: y + 0.12, w: COLS[5] - 0.2, h: RH - 0.24,
      fontSize: 10, bold: true, color: lv.color,
      align: 'center', valign: 'middle', fontFace: F,
    })

    // col 6 — template + skill
    s.addShape(prs.ShapeType.rect, {
      x: colX(6), y, w: COLS[6], h: RH,
      fill: { color: bg }, line: { color: C.border, pt: 0.4 },
    })
    const tsParts = [
      { text: st.template, options: { color: C.text, fontSize: 10 } },
    ]
    if (st.skill !== '—') {
      tsParts.push({ text: '  ' + st.skill, options: { color: C.accent, bold: true, fontSize: 10 } })
    }
    s.addText(tsParts, {
      x: colX(6) + 0.1, y, w: COLS[6] - 0.14, h: RH,
      valign: 'middle', fontFace: F, wrap: true,
    })
  })

  // ── Legend ──
  const LY = TY + RH * 9 + 0.08
  s.addText('AI Level:', {
    x: TX, y: LY, w: 0.88, h: 0.3,
    fontSize: 11, bold: true, color: C.text, fontFace: F, valign: 'middle',
  })
  let lx = TX + 0.9
  Object.values(AI).forEach(lv => {
    s.addShape(prs.ShapeType.roundRect, {
      x: lx, y: LY + 0.04, w: 1.55, h: 0.24,
      rectRadius: 0.07,
      fill: { color: lv.bg },
      line: { color: lv.color, pt: 1 },
    })
    s.addText(lv.label, {
      x: lx, y: LY + 0.04, w: 1.55, h: 0.24,
      fontSize: 10, bold: true, color: lv.color,
      align: 'center', valign: 'middle', fontFace: F,
    })
    lx += 1.67
  })
}

// ─── SLIDE 3 — TIMELINE ───────────────────────────────────────────────────────
{
  const s = prs.addSlide()
  slideBg(s)
  slideTitle(s, 'Timeline tham khảo', 'Ước tính có thể thay đổi tùy scope — sẽ cập nhật lại sau khi bắt đầu dự án')

  const rows = [
    { n: 1, name: 'Research & Ideation',               est: '1–3 ngày' },
    { n: 2, name: 'Game Design Document (GDD)',         est: '2–4 ngày' },
    { n: 3, name: 'Core Mechanics Design',              est: '3–5 ngày' },
    { n: 4, name: 'Prototype Development',              est: '3–7 ngày' },
    { n: 5, name: 'Tutorial Design & Implementation',   est: '2–4 ngày' },
    { n: 6, name: 'Playtesting',                        est: '5–10 ngày' },
    { n: 7, name: 'Documentation & Assets',             est: '2–4 ngày' },
    { n: 8, name: 'Implementation Plan',                est: '1–2 ngày' },
  ]

  const TX = 1.2
  const TY = 1.3
  const RH = 0.52
  const CW = [0.75, 7.5, 3.0]

  // Header
  let hx = TX
  ;['#', 'Bước', 'Estimated Duration'].forEach((h, i) => {
    s.addShape(prs.ShapeType.rect, {
      x: hx, y: TY, w: CW[i], h: RH,
      fill: { color: C.accent },
      line: { color: C.white, pt: 0.8 },
    })
    s.addText(h, {
      x: hx, y: TY, w: CW[i], h: RH,
      fontSize: 17, bold: true, color: C.white,
      align: 'center', valign: 'middle', fontFace: F,
    })
    hx += CW[i]
  })

  // Data rows
  rows.forEach((r, ri) => {
    const y = TY + RH + ri * RH
    const bg = ri % 2 === 0 ? C.bg : C.bgSoft
    let rx = TX

    // # cell
    s.addShape(prs.ShapeType.rect, {
      x: rx, y, w: CW[0], h: RH,
      fill: { color: bg }, line: { color: C.border, pt: 0.5 },
    })
    s.addText(`${r.n}`, {
      x: rx, y, w: CW[0], h: RH,
      fontSize: 17, bold: true, color: C.accent,
      align: 'center', valign: 'middle', fontFace: F,
    })
    rx += CW[0]

    // Name cell
    s.addShape(prs.ShapeType.rect, {
      x: rx, y, w: CW[1], h: RH,
      fill: { color: bg }, line: { color: C.border, pt: 0.5 },
    })
    s.addText(r.name, {
      x: rx + 0.15, y, w: CW[1] - 0.2, h: RH,
      fontSize: 16, color: C.text, valign: 'middle', fontFace: F,
    })
    rx += CW[1]

    // Estimate cell
    s.addShape(prs.ShapeType.rect, {
      x: rx, y, w: CW[2], h: RH,
      fill: { color: bg }, line: { color: C.border, pt: 0.5 },
    })
    s.addText(r.est, {
      x: rx, y, w: CW[2], h: RH,
      fontSize: 16, bold: true, color: C.green,
      align: 'center', valign: 'middle', fontFace: F,
    })
  })

  // Total row
  const totalY = TY + RH * 9
  const totalW = CW[0] + CW[1]
  s.addShape(prs.ShapeType.rect, {
    x: TX, y: totalY, w: totalW, h: RH,
    fill: { color: C.accentLight }, line: { color: C.border, pt: 0.5 },
  })
  s.addText('Tổng', {
    x: TX + 0.15, y: totalY, w: totalW - 0.2, h: RH,
    fontSize: 16, bold: true, color: C.accent, valign: 'middle', fontFace: F,
  })
  s.addShape(prs.ShapeType.rect, {
    x: TX + totalW, y: totalY, w: CW[2], h: RH,
    fill: { color: C.accentLight }, line: { color: C.border, pt: 0.5 },
  })
  s.addText('~19–39 ngày', {
    x: TX + totalW, y: totalY, w: CW[2], h: RH,
    fontSize: 16, bold: true, color: C.accent,
    align: 'center', valign: 'middle', fontFace: F,
  })

  // Note
  s.addText('* Timeline có thể thay đổi tùy scope dự án — sẽ cập nhật lại sau khi bắt đầu', {
    x: TX, y: totalY + RH + 0.12, w: 11.5, h: 0.3,
    fontSize: 13, color: C.muted, fontFace: F, italic: true,
  })
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
const OUT = 'd:/Tamaki/3. Wokrs/2. Oshigoto/11. Claude-PRJ/1. CCN2/v3/GameDesign-Workflow-Intro.pptx'
await prs.writeFile({ fileName: OUT })
console.log('Done:', OUT)

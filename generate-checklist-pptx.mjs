// Use CJS build directly to avoid ESM resolution conflict
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pptxgen = require('./node_modules/pptxgenjs/dist/pptxgen.cjs.js')

const prs = new pptxgen()

// Theme colors
const C = {
  bg: '0F1117',
  card: '1A1D27',
  accent: '6C63FF',
  green: '22C55E',
  red: 'EF4444',
  yellow: 'F59E0B',
  text: 'F1F5F9',
  muted: '94A3B8',
  border: '2D3148',
  white: 'FFFFFF',
}

// Font mặc định — Calibri hỗ trợ tiếng Việt đầy đủ trên Windows
const F = 'Calibri'
const FMONO = 'Consolas'

prs.layout = 'LAYOUT_WIDE' // 13.33 x 7.5 inches

function addBg(slide) {
  slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.bg } })
}

function addTitle(slide, text, y = 0.3) {
  slide.addText(text, {
    x: 0.4, y, w: 12.5, h: 0.55,
    fontSize: 22, bold: true, color: C.white, fontFace: F,
  })
  slide.addShape(prs.ShapeType.rect, { x: 0.4, y: y + 0.58, w: 1.2, h: 0.04, fill: { color: C.accent } })
}

// ─── SLIDE 1 — COVER ─────────────────────────────────────────────────────────
{
  const s = prs.addSlide()
  addBg(s)
  s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.12, fill: { color: C.accent } })

  s.addText('Game Design Document', {
    x: 1, y: 1.8, w: 11.3, h: 0.9,
    fontSize: 38, bold: true, color: C.white, align: 'center', fontFace: F,
  })
  s.addText('AI-Assisted Pipeline', {
    x: 1, y: 2.75, w: 11.3, h: 0.55,
    fontSize: 22, color: C.accent, align: 'center', fontFace: F,
  })
  s.addText('Tool & Skill Checklist — Toàn bộ pipeline từ yêu cầu → design doc sẵn cho AI coder', {
    x: 1.5, y: 3.45, w: 10.3, h: 0.45,
    fontSize: 13, color: C.muted, align: 'center', fontFace: F,
  })

  const legends = [
    { label: 'Có sẵn', color: C.green },
    { label: 'Cần cài thêm', color: C.yellow },
    { label: 'Chưa có', color: C.red },
  ]
  legends.forEach((l, i) => {
    const x = 3.5 + i * 2.2
    s.addShape(prs.ShapeType.roundRect, { x, y: 4.2, w: 1.9, h: 0.38, rectRadius: 0.06, fill: { color: C.card }, line: { color: l.color } })
    s.addText(l.label, { x, y: 4.2, w: 1.9, h: 0.38, fontSize: 11, bold: true, color: l.color, align: 'center', valign: 'middle', fontFace: F })
  })

  s.addText('6 Phases  |  24 Tasks  |  ~3–5 giờ (game trung bình)', {
    x: 1, y: 5.0, w: 11.3, h: 0.35,
    fontSize: 11, color: C.muted, align: 'center', fontFace: F,
  })

  s.addShape(prs.ShapeType.rect, { x: 0, y: 7.38, w: '100%', h: 0.12, fill: { color: C.accent } })
}

// ─── SLIDE 2 — OVERVIEW ──────────────────────────────────────────────────────
{
  const s = prs.addSlide()
  addBg(s)
  addTitle(s, 'Overview — 6 Phases')

  const phases = [
    { name: 'Phase 1', label: 'Thu thập yêu cầu & Lên kế hoạch', tasks: 3, time: '20–30 phút', color: '6C63FF' },
    { name: 'Phase 2', label: 'Research', tasks: 4, time: '35–60 phút', color: '3B82F6' },
    { name: 'Phase 3', label: 'Thiết kế nội dung', tasks: 5, time: '80–145 phút', color: '8B5CF6' },
    { name: 'Phase 4', label: 'Viết Document', tasks: 4, time: '45–65 phút', color: '06B6D4' },
    { name: 'Phase 5', label: 'Prototype & Visual Reference', tasks: 5, time: '30–60 phút*', color: 'F59E0B' },
    { name: 'Phase 6', label: 'Review & Validation', tasks: 2, time: '15–80 phút', color: '22C55E' },
  ]

  phases.forEach((p, i) => {
    const col = i < 3 ? 0 : 1
    const row = i % 3
    const x = 0.4 + col * 6.5
    const y = 1.15 + row * 1.75

    s.addShape(prs.ShapeType.roundRect, { x, y, w: 6.1, h: 1.55, rectRadius: 0.12, fill: { color: C.card }, line: { color: C.border } })
    s.addShape(prs.ShapeType.rect, { x, y: y + 0.15, w: 0.07, h: 1.25, fill: { color: p.color } })

    s.addText(p.name, { x: x + 0.2, y: y + 0.18, w: 1.2, h: 0.28, fontSize: 10, bold: true, color: p.color, fontFace: F })
    s.addText(p.label, { x: x + 0.2, y: y + 0.46, w: 5.6, h: 0.35, fontSize: 13, bold: true, color: C.white, fontFace: F })
    s.addText(`${p.tasks} tasks`, { x: x + 0.2, y: y + 0.85, w: 2, h: 0.25, fontSize: 10, color: C.muted, fontFace: F })
    s.addText(`${p.time}`, { x: x + 2.5, y: y + 0.85, w: 3.4, h: 0.25, fontSize: 10, color: C.muted, fontFace: F, align: 'right' })
  })
}

// ─── TABLE SLIDE HELPER ───────────────────────────────────────────────────────
function tableSlide(phaseLabel, phaseColor, rows) {
  const s = prs.addSlide()
  addBg(s)
  addTitle(s, phaseLabel)

  const headers = ['Task', 'Tool / Skill', 'Vai trò', 'Trạng thái', 'Thời gian']
  const colW =    [2.3,    2.1,            4.2,       1.35,          1.45]
  const colX =    [0.4,    2.72,           4.84,      9.06,          10.43]
  const headerY = 1.05

  headers.forEach((h, i) => {
    s.addShape(prs.ShapeType.rect, { x: colX[i], y: headerY, w: colW[i], h: 0.32, fill: { color: phaseColor } })
    s.addText(h, { x: colX[i], y: headerY, w: colW[i], h: 0.32, fontSize: 9, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: F })
  })

  rows.forEach((row, ri) => {
    const y = headerY + 0.33 + ri * 0.72
    const rowBg = ri % 2 === 0 ? C.card : '13161F'

    colW.forEach((w, ci) => {
      s.addShape(prs.ShapeType.rect, { x: colX[ci], y, w, h: 0.68, fill: { color: rowBg }, line: { color: C.border, pt: 0.5 } })
    })

    s.addText(row.task, { x: colX[0] + 0.07, y, w: colW[0] - 0.1, h: 0.68, fontSize: 9, bold: true, color: C.white, valign: 'middle', fontFace: F, wrap: true })
    s.addText(row.tool, { x: colX[1] + 0.07, y, w: colW[1] - 0.1, h: 0.68, fontSize: 8.5, color: C.accent, valign: 'middle', fontFace: FMONO, wrap: true })
    s.addText(row.role, { x: colX[2] + 0.07, y, w: colW[2] - 0.1, h: 0.68, fontSize: 8.5, color: C.muted, valign: 'middle', fontFace: F, wrap: true })

    const stColor = row.status.startsWith('Có sẵn') ? C.green : row.status.startsWith('Cần') ? C.yellow : C.red
    s.addText(row.status, { x: colX[3] + 0.05, y, w: colW[3] - 0.08, h: 0.68, fontSize: 8, bold: true, color: stColor, valign: 'middle', align: 'center', fontFace: F })
    s.addText(row.time, { x: colX[4] + 0.05, y, w: colW[4] - 0.08, h: 0.68, fontSize: 8.5, color: C.text, valign: 'middle', align: 'center', fontFace: F })
  })
}

// ─── PHASE SLIDES ─────────────────────────────────────────────────────────────
tableSlide('Phase 1 — Thu thập yêu cầu & Lên kế hoạch', '6C63FF', [
  {
    task: 'Xác định ý tưởng game',
    tool: 'AskUserQuestion',
    role: 'Hỏi có cấu trúc: genre, platform, scope, reference game',
    status: 'Có sẵn',
    time: '15–20 phút',
  },
  {
    task: 'Outline cấu trúc GDD',
    tool: 'EnterPlanMode',
    role: 'Lên danh sách các phần cần viết trước khi bắt đầu làm',
    status: 'Có sẵn',
    time: '5–10 phút',
  },
  {
    task: 'Track tiến độ',
    tool: 'TodoWrite',
    role: 'Đánh dấu task done/pending xuyên suốt quá trình',
    status: 'Có sẵn',
    time: 'Xuyên suốt',
  },
])

tableSlide('Phase 2 — Research', '3B82F6', [
  {
    task: 'Research reference game',
    tool: 'WebSearch',
    role: 'Tìm kiếm cơ chế gameplay, game tương tự trên web',
    status: 'Có sẵn',
    time: '15–25 phút',
  },
  {
    task: 'Đọc chi tiết trang/wiki',
    tool: 'WebFetch',
    role: 'Fetch nội dung trang cụ thể: wiki, devblog, game jam page',
    status: 'Có sẵn',
    time: '10–15 phút',
  },
  {
    task: 'Research song song (UI + gameplay)',
    tool: 'Agent',
    role: 'Chạy 2 sub-agent độc lập đồng thời — tiết kiệm ~50% thời gian',
    status: 'Có sẵn',
    time: 'Tiết kiệm ~50%',
  },
  {
    task: 'Research UI trend / game UI pattern',
    tool: 'Skill: ui-ux-pro-max',
    role: '50 style, 21 palette, 50 font pairing — áp dụng cho game UI',
    status: 'Có sẵn',
    time: '10–20 phút',
  },
])

tableSlide('Phase 3 — Thiết kế nội dung', '8B5CF6', [
  {
    task: 'Thiết kế core loop & mechanics',
    tool: 'Skill: cook',
    role: 'Validate plan trước khi viết — tránh thiếu sót logic gameplay',
    status: 'Có sẵn',
    time: '20–30 phút',
  },
  {
    task: 'Thiết kế data model',
    tool: 'Write',
    role: 'Viết TypeScript interface / pseudo-code trực tiếp vào GDD',
    status: 'Có sẵn',
    time: '20–40 phút',
  },
  {
    task: 'Thiết kế screen flow',
    tool: 'Skill: ui-ux-pro-max',
    role: 'Mô tả từng màn hình, layout, state transition',
    status: 'Có sẵn',
    time: '30–45 phút',
  },
  {
    task: 'Thiết kế UI spec chi tiết',
    tool: 'Skill: ui-ux-pro-max',
    role: 'Color, spacing, component list, animation spec từng screen',
    status: 'Có sẵn',
    time: '30–60 phút',
  },
  {
    task: 'Thiết kế economy / progression',
    tool: 'Claude trực tiếp',
    role: 'Cân bằng số liệu: cost, reward, level curve, unlock condition',
    status: 'Có sẵn',
    time: '20–30 phút',
  },
])

tableSlide('Phase 4 — Viết Document', '06B6D4', [
  {
    task: 'Viết GDD.md',
    tool: 'Write',
    role: 'Ghi file GDD.md ra disk — overview, loop, mechanics, data model',
    status: 'Có sẵn',
    time: '20–30 phút',
  },
  {
    task: 'Viết UISpec.md',
    tool: 'Write',
    role: 'File riêng cho UI — AI coder đọc để code component',
    status: 'Có sẵn',
    time: '15–20 phút',
  },
  {
    task: 'Viết TechSpec.md',
    tool: 'Write',
    role: 'Stack, folder structure, coding convention cho AI coder',
    status: 'Có sẵn',
    time: '10–15 phút',
  },
  {
    task: 'Edit / refine document',
    tool: 'Edit',
    role: 'Chỉnh sửa phần cụ thể mà không rewrite toàn bộ file',
    status: 'Có sẵn',
    time: 'Linh hoạt',
  },
])

tableSlide('Phase 5 — Prototype & Visual Reference', 'F59E0B', [
  {
    task: 'Viết HTML prototype nhanh',
    tool: 'Write + ui-ux-pro-max',
    role: 'Tạo clickable mockup HTML/CSS để visualize UI trước khi code game',
    status: 'Có sẵn',
    time: '30–60 phút',
  },
  {
    task: 'Auto-screenshot web prototype',
    tool: 'Bash (Playwright)',
    role: 'Script tự navigate + chụp từng screen state của prototype',
    status: 'Cần cài Playwright',
    time: '10–20 phút setup',
  },
  {
    task: 'Screenshot → phân tích UI',
    tool: 'Claude Vision (multimodal)',
    role: 'Đưa ảnh vào prompt, Claude mô tả component, layout, màu sắc',
    status: 'Có sẵn',
    time: '5–10 phút/screen',
  },
  {
    task: 'Tạo Figma file từ spec',
    tool: 'Figma MCP',
    role: 'AI gọi Figma REST API tạo frame, component tự động từ UISpec',
    status: 'Cần cài MCP',
    time: '20–30 phút (sau setup)',
  },
  {
    task: 'Export asset / icon',
    tool: 'AI Image Gen (ngoài)',
    role: 'Tạo sprite, icon, background — Midjourney, DALL-E, Stable Diffusion',
    status: 'Chưa có',
    time: 'Tùy workflow',
  },
])

tableSlide('Phase 6 — Review & Validation', '22C55E', [
  {
    task: 'Review tính nhất quán GDD',
    tool: 'Skill: code-review',
    role: 'Đọc lại toàn bộ doc, phát hiện mâu thuẫn logic, thiếu sót spec',
    status: 'Có sẵn',
    time: '15–20 phút',
  },
  {
    task: 'Tạo skill game-design chuyên biệt',
    tool: 'Skill: skill-creator',
    role: 'Đóng gói toàn bộ pipeline này thành 1 skill — dùng lại cho game sau',
    status: 'Có sẵn',
    time: '30–60 phút (1 lần)',
  },
])

// ─── SLIDE — TIME ESTIMATE ────────────────────────────────────────────────────
{
  const s = prs.addSlide()
  addBg(s)
  addTitle(s, 'Estimate thời gian tổng')

  const scenarios = [
    { label: 'Game đơn giản', sub: 'Hypercasual, 1 mechanic, 3–5 screen', time: '1.5 – 2.5 giờ', color: C.green },
    { label: 'Game trung bình', sub: '5–10 screen, có progression, economy', time: '3 – 5 giờ', color: C.accent },
    { label: 'Game phức tạp', sub: 'RPG, nhiều system, nhiều loại enemy/item', time: '6 – 10 giờ', color: C.red },
  ]

  scenarios.forEach((sc, i) => {
    const x = 0.4 + i * 4.3
    s.addShape(prs.ShapeType.roundRect, { x, y: 1.2, w: 4.0, h: 3.2, rectRadius: 0.15, fill: { color: C.card }, line: { color: sc.color, pt: 1.5 } })
    s.addShape(prs.ShapeType.rect, { x, y: 1.2, w: 4.0, h: 0.1, fill: { color: sc.color } })
    s.addText(sc.label, { x, y: 1.45, w: 4.0, h: 0.45, fontSize: 16, bold: true, color: C.white, align: 'center', fontFace: F })
    s.addText(sc.sub, { x: x + 0.15, y: 1.95, w: 3.7, h: 0.5, fontSize: 10, color: C.muted, align: 'center', fontFace: F, wrap: true })
    s.addText(sc.time, { x, y: 2.75, w: 4.0, h: 0.65, fontSize: 26, bold: true, color: sc.color, align: 'center', fontFace: F })
  })

  s.addText('* AI làm chính, người dùng chỉ review và trả lời câu hỏi định hướng', {
    x: 0.4, y: 4.6, w: 12.5, h: 0.3, fontSize: 10, color: C.muted, align: 'center', fontFace: F,
  })

  const breakdown = [
    { ph: 'Phase 1', t: '20–30 phút' },
    { ph: 'Phase 2', t: '35–60 phút' },
    { ph: 'Phase 3', t: '80–145 phút' },
    { ph: 'Phase 4', t: '45–65 phút' },
    { ph: 'Phase 5', t: '30–60 phút' },
    { ph: 'Phase 6', t: '15–80 phút' },
  ]

  s.addText('Chi tiết theo phase:', { x: 0.4, y: 5.05, w: 3, h: 0.28, fontSize: 10, bold: true, color: C.muted, fontFace: F })
  breakdown.forEach((b, i) => {
    const x = 0.4 + i * 2.15
    s.addShape(prs.ShapeType.roundRect, { x, y: 5.35, w: 2.0, h: 0.55, rectRadius: 0.08, fill: { color: C.card }, line: { color: C.border } })
    s.addText(b.ph, { x, y: 5.35, w: 2.0, h: 0.27, fontSize: 8.5, bold: true, color: C.accent, align: 'center', valign: 'bottom', fontFace: F })
    s.addText(b.t, { x, y: 5.62, w: 2.0, h: 0.27, fontSize: 8, color: C.muted, align: 'center', valign: 'top', fontFace: F })
  })
}

// ─── SLIDE — MISSING TOOLS ────────────────────────────────────────────────────
{
  const s = prs.addSlide()
  addBg(s)
  addTitle(s, 'Những gì còn thiếu — Cách bổ sung')

  const gaps = [
    {
      title: 'Playwright (auto-screenshot)',
      status: 'Cần cài',
      how: 'npm install playwright\nnpx playwright install chromium',
      effort: 'Thấp',
      effortColor: C.green,
    },
    {
      title: 'Figma MCP',
      status: 'Chưa có',
      how: 'Cài Figma MCP extension cho Claude Code.\nCần Figma account + API token.',
      effort: 'Trung bình',
      effortColor: C.yellow,
    },
    {
      title: 'AI Image Generation',
      status: 'Tool ngoài',
      how: 'Midjourney (Discord), DALL-E API,\nhoặc Stable Diffusion local.',
      effort: 'Tùy tool',
      effortColor: C.muted,
    },
    {
      title: 'Game-Design Skill tùy chỉnh',
      status: 'Tự viết',
      how: 'Dùng Skill: skill-creator để đóng gói\ntoàn bộ pipeline này thành 1 skill.',
      effort: '30–60 phút',
      effortColor: C.accent,
    },
    {
      title: 'Screenshot desktop game',
      status: 'Cần tool riêng',
      how: 'AutoHotkey (Windows) hoặc\nbuilt-in screenshot API theo engine.',
      effort: 'Cao',
      effortColor: C.red,
    },
  ]

  gaps.forEach((g, i) => {
    const col = i < 3 ? 0 : 1
    const row = i < 3 ? i : i - 3
    const x = 0.4 + col * 6.55
    const y = 1.15 + row * 1.85

    s.addShape(prs.ShapeType.roundRect, { x, y, w: 6.1, h: 1.7, rectRadius: 0.12, fill: { color: C.card }, line: { color: C.border } })
    s.addText(g.title, { x: x + 0.18, y: y + 0.14, w: 3.5, h: 0.3, fontSize: 12, bold: true, color: C.white, fontFace: F })

    const stColor = g.status === 'Cần cài' || g.status === 'Tự viết' ? C.yellow : g.status === 'Tool ngoài' ? C.muted : C.red
    s.addText(`[${g.status}]`, { x: x + 3.8, y: y + 0.14, w: 2.1, h: 0.3, fontSize: 9, bold: true, color: stColor, align: 'right', fontFace: F })
    s.addText(g.how, { x: x + 0.18, y: y + 0.5, w: 5.7, h: 0.65, fontSize: 9, color: C.muted, fontFace: FMONO, wrap: true })
    s.addText(`Effort: ${g.effort}`, { x: x + 0.18, y: y + 1.35, w: 2.5, h: 0.22, fontSize: 9, bold: true, color: g.effortColor, fontFace: F })
  })
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────
const outPath = 'd:/Tamaki/3. Wokrs/2. Oshigoto/11. Claude-PRJ/1. CCN2/v3/GameDesign-AI-Checklist.pptx'
await prs.writeFile({ fileName: outPath })
console.log('Done:', outPath)

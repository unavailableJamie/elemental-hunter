// SkillInfoPanel — inline navigable skill display
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TIER_COLOR } from '../data/mockCharacters.ts';
import type { CharacterData, ComboPower } from '../data/mockCharacters.ts';

// ── Keyframe styles ─────────────────────────────────────────────────────────
const PANEL_CSS = `
  @keyframes active-glow-pulse {
    0%, 100% {
      box-shadow: inset 4px 0 0 #22c55e, 0 0 6px #22c55e44;
      border-color: #22c55e55;
    }
    50% {
      box-shadow: inset 4px 0 0 #22c55e, 0 0 14px #22c55e88, 0 0 28px #22c55e33;
      border-color: #22c55e99;
    }
  }
  @keyframes page-enter-right {
    from { opacity: 0; transform: translateX(28px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes page-enter-left {
    from { opacity: 0; transform: translateX(-28px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes edge-bounce-right {
    0%   { transform: translateX(0); }
    25%  { transform: translateX(14px); }
    55%  { transform: translateX(4px); }
    75%  { transform: translateX(9px); }
    100% { transform: translateX(0); }
  }
  @keyframes edge-bounce-left {
    0%   { transform: translateX(0); }
    25%  { transform: translateX(-14px); }
    55%  { transform: translateX(-4px); }
    75%  { transform: translateX(-9px); }
    100% { transform: translateX(0); }
  }
`;

// ── Sub-components ─────────────────────────────────────────────────────────────

const Pill: React.FC<{ label: string; bg: string; color?: string }> = ({
  label, bg, color = '#fff',
}) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    padding: '5px 14px', borderRadius: 999,
    background: bg, color,
    fontSize: 14, fontWeight: 700,
    flexShrink: 0, whiteSpace: 'nowrap' as const,
  }}>
    {label}
  </span>
);

const ConditionStrip: React.FC<{ unlocked: boolean; text: string }> = ({ unlocked, text }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    marginTop: 4, padding: '8px 12px', borderRadius: 7,
    background: unlocked ? '#14532d88' : '#0f172a',
    border: `1px solid ${unlocked ? '#16a34a66' : '#374151'}`,
  }}>
    <span style={{ fontSize: 14, lineHeight: 1 }}>{unlocked ? '✅' : '🔒'}</span>
    <span style={{ fontSize: 13, fontWeight: 700, color: unlocked ? '#4ade80' : '#6b7280' }}>
      {text}
    </span>
  </div>
);

// Row: active state uses CSS keyframe for breathing glow
const Row: React.FC<{
  bg: string;
  active?: boolean;
  children: React.ReactNode;
}> = ({ bg, active, children }) => (
  <div style={{
    background: bg,
    border: active ? '1.5px solid #22c55e66' : '1.5px solid transparent',
    borderRadius: 10,
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    animation: active ? 'active-glow-pulse 2.5s ease-in-out infinite' : 'none',
  }}>
    {children}
  </div>
);

// NavArrow with ref forwarded for rAF-driven sine animation
const NavArrow = React.forwardRef<HTMLButtonElement, {
  dir: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
}>(({ dir, disabled, onClick }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    disabled={disabled}
    style={{
      background: 'none', border: 'none',
      color: disabled ? 'transparent' : '#9ca3af',
      fontSize: 22, cursor: disabled ? 'default' : 'pointer',
      padding: '6px 12px', lineHeight: 1,
      transition: 'color 0.15s',
    }}
  >
    {dir === 'left' ? '◄' : '►'}
  </button>
));

// ── Page types ─────────────────────────────────────────────────────────────────

type SkillPage =
  | { kind: 'ultimate' }
  | { kind: 'cpow'; pow: ComboPower; cpowIndex: number };

// ── Ultimate content ───────────────────────────────────────────────────────────

const UltimateRows: React.FC<{ char: CharacterData }> = ({ char }) => {
  const ulti = char.ultimate;
  const milestone = char.dupMilestones.find((m) => m.rewardType === 'UltiLvUP');
  const isLv2 = ulti.level === 2;

  return (
    <>
      <Row bg="#1a2332" active={!isLv2}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pill label="Cơ bản" bg="#5D6471" />
          <span style={{ marginLeft: 'auto', fontSize: 15, color: '#60a5fa', fontWeight: 600, flexShrink: 0 }}>
            Sử dụng: {ulti.magCost} MAG
          </span>
        </div>
        <div style={{ fontSize: 15, color: '#d1d5db', lineHeight: 1.6 }}>
          {ulti.description}
        </div>
      </Row>

      <Row bg="#141c28" active={isLv2}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pill label="Đặc biệt" bg="#CA8A04" />
          <span style={{ marginLeft: 'auto', fontSize: 15, color: '#60a5fa', fontWeight: 600, flexShrink: 0 }}>
            Sử dụng: {ulti.magCostLv2} MAG
          </span>
        </div>
        <div style={{ fontSize: 15, color: isLv2 ? '#d1d5db' : '#6b7280', lineHeight: 1.6 }}>
          {ulti.descriptionLv2}
        </div>
        {milestone && (
          <ConditionStrip
            unlocked={milestone.unlocked}
            text={milestone.unlocked
              ? `Đã mở khóa · Dup ${milestone.dup}`
              : `Điều kiện: Dup ${milestone.dup}`}
          />
        )}
      </Row>
    </>
  );
};

// ── Combo Power content ────────────────────────────────────────────────────────

const ComboRows: React.FC<{ char: CharacterData; pow: ComboPower; cpowIndex: number }> = ({
  char, pow, cpowIndex,
}) => {
  const cpowMilestones = char.dupMilestones.filter((m) => m.rewardType === 'CPowLvUP');
  const milestone = cpowMilestones[cpowIndex];
  const isPlus = pow.isPlus;

  return (
    <>
      <Row bg="#1a2332" active={!isPlus}>
        <div><Pill label="Cơ bản" bg="#5D6471" /></div>
        <div style={{ fontSize: 15, color: '#d1d5db', lineHeight: 1.6 }}>
          {pow.description}
        </div>
      </Row>

      <Row bg="#141c28" active={isPlus}>
        <div><Pill label="Đặc biệt" bg="#CA8A04" /></div>
        <div style={{ fontSize: 15, color: isPlus ? '#d1d5db' : '#6b7280', lineHeight: 1.6 }}>
          {pow.descriptionPlus}
        </div>
        <ConditionStrip
          unlocked={isPlus}
          text={isPlus
            ? `Đã mở khóa${milestone ? ` · Dup ${milestone.dup}` : ''}`
            : milestone ? `Điều kiện: Dup ${milestone.dup}` : 'Mở khóa bằng Dup'}
        />
      </Row>
    </>
  );
};

// ── SkillInfoPanel ─────────────────────────────────────────────────────────────

interface SkillInfoPanelProps {
  char: CharacterData;
  initialIndex?: number;
  /** Extra element to also receive swipe listeners (e.g. the full popup panel) */
  swipeZoneRef?: React.RefObject<HTMLElement>;
}

export const SkillInfoPanel: React.FC<SkillInfoPanelProps> = ({
  char,
  initialIndex = 0,
  swipeZoneRef,
}) => {
  const pages: SkillPage[] = [
    { kind: 'ultimate' },
    ...char.comboPowers
      .filter((p) => p.isUnlocked)
      .map((pow, i) => ({ kind: 'cpow' as const, pow, cpowIndex: i })),
  ];

  const [index, setIndex]       = useState(() => Math.min(initialIndex, pages.length - 1));
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');
  const [slideKey, setSlideKey] = useState(0);

  const containerRef  = useRef<HTMLDivElement>(null);
  const leftArrowRef  = useRef<HTMLButtonElement>(null);
  const rightArrowRef = useRef<HTMLButtonElement>(null);
  const indexRef      = useRef(index);
  const pagesLenRef   = useRef(pages.length);
  indexRef.current    = index;
  pagesLenRef.current = pages.length;

  // ── Edge feedback: direct DOM bounce (no state, no re-render) ──────────────
  const triggerEdgeFeedback = useCallback((dir: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetHeight; // force reflow to restart animation
    el.style.animation = `edge-bounce-${dir} 0.4s ease-out`;
    setTimeout(() => {
      if (containerRef.current) containerRef.current.style.animation = '';
    }, 450);
  }, []);

  // ── Navigate ref — updated every render so effects never go stale ──────────
  const navigateRef = useRef<(dx: number, dy: number) => void>(() => {});
  navigateRef.current = (dx: number, dy: number) => {
    if (Math.abs(dx) <= Math.abs(dy) || Math.abs(dx) < 50) return;
    if (dx < 0) {
      // swipe left → next page
      if (indexRef.current >= pagesLenRef.current - 1) {
        triggerEdgeFeedback('right');
      } else {
        setSlideDir('right');
        setSlideKey(k => k + 1);
        setIndex(i => Math.min(i + 1, pagesLenRef.current - 1));
      }
    } else {
      // swipe right → previous page
      if (indexRef.current <= 0) {
        triggerEdgeFeedback('left');
      } else {
        setSlideDir('left');
        setSlideKey(k => k + 1);
        setIndex(i => Math.max(i - 1, 0));
      }
    }
  };

  // ── Smooth sine-wave arrow animation via rAF (no pause between movements) ──
  useEffect(() => {
    const PERIOD    = 1600; // ms per full oscillation
    const AMPLITUDE = 5;    // px
    const start     = performance.now();
    let raf: number;

    const loop = (now: number) => {
      const phase = ((now - start) % PERIOD) / PERIOD;
      const o = Math.sin(phase * 2 * Math.PI) * AMPLITUDE;
      if (leftArrowRef.current)
        leftArrowRef.current.style.transform =
          indexRef.current === 0 ? 'translateX(0)' : `translateX(${-o}px)`;
      if (rightArrowRef.current)
        rightArrowRef.current.style.transform =
          indexRef.current === pagesLenRef.current - 1 ? 'translateX(0)' : `translateX(${o}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── Touch + mouse drag-to-swipe ────────────────────────────────────────────
  useEffect(() => {
    const el = swipeZoneRef?.current ?? containerRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let mouseActive = false;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      navigateRef.current(
        e.changedTouches[0].clientX - startX,
        e.changedTouches[0].clientY - startY,
      );
    };

    const onMouseDown = (e: MouseEvent) => {
      startX = e.clientX; startY = e.clientY;
      mouseActive = true;
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!mouseActive) return;
      mouseActive = false;
      navigateRef.current(e.clientX - startX, e.clientY - startY);
    };
    const onMouseLeave = () => { mouseActive = false; };

    el.addEventListener('touchstart',  onTouchStart,  { passive: true  });
    el.addEventListener('touchmove',   onTouchMove,   { passive: false });
    el.addEventListener('touchend',    onTouchEnd,    { passive: true  });
    el.addEventListener('mousedown',   onMouseDown);
    el.addEventListener('mouseup',     onMouseUp);
    el.addEventListener('mouseleave',  onMouseLeave);

    return () => {
      el.removeEventListener('touchstart',  onTouchStart);
      el.removeEventListener('touchmove',   onTouchMove);
      el.removeEventListener('touchend',    onTouchEnd);
      el.removeEventListener('mousedown',   onMouseDown);
      el.removeEventListener('mouseup',     onMouseUp);
      el.removeEventListener('mouseleave',  onMouseLeave);
    };
  }, [swipeZoneRef]);

  const current   = pages[index];
  const tierColor = TIER_COLOR[char.tier];
  const isUlti    = current.kind === 'ultimate';

  const skillName = isUlti
    ? char.ultimate.name + (char.ultimate.level === 2 ? ' +' : '')
    : current.kind === 'cpow'
      ? current.pow.label + (current.pow.isPlus ? ' +' : '')
      : '';
  const typeLabel  = isUlti ? 'Kỹ năng chủ động' : 'Kỹ năng combo';
  const iconChar   = isUlti ? '✦' : '⚡';
  const iconColor  = isUlti ? '#fbbf24' : '#a78bfa';
  const iconBg     = isUlti
    ? `radial-gradient(circle, ${tierColor}44 0%, #1a0d00 100%)`
    : 'linear-gradient(160deg, #2d1f5e 0%, #0d0b1a 100%)';
  const iconBorder = isUlti ? (char.ultimate.level === 2 ? '#b8860b' : `${tierColor}88`) : '#818cf8';
  const iconGlow   = isUlti ? `0 0 20px ${tierColor}44` : 'none';

  // Only animate after first navigation (slideKey starts at 0)
  const slideAnim = slideKey > 0
    ? `page-enter-${slideDir} 0.22s ease-out`
    : 'none';

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex', flexDirection: 'column',
        gap: 20, textShadow: 'none',
        userSelect: 'none', cursor: 'grab',
      }}
    >
      <style>{PANEL_CSS}</style>

      {/* Section header */}
      <div style={{
        fontSize: 17, fontWeight: 700,
        letterSpacing: 3, color: '#8899aa',
        textTransform: 'uppercase' as const,
        textAlign: 'center' as const,
      }}>
        Kỹ Năng
      </div>

      {/* Navigation + Icon — icon slides with page, arrows stay fixed */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <NavArrow
          ref={leftArrowRef}
          dir="left"
          disabled={index === 0}
          onClick={() => {
            if (index === 0) return;
            setSlideDir('left');
            setSlideKey(k => k + 1);
            setIndex(i => i - 1);
          }}
        />

        <div
          key={slideKey}
          style={{
            width: 120, height: 120,
            borderRadius: isUlti ? '50%' : 16,
            background: iconBg,
            border: `2.5px solid ${iconBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: iconGlow, flexShrink: 0,
            animation: slideAnim,
          }}
        >
          <span style={{ fontSize: 56, color: iconColor, filter: `drop-shadow(0 0 10px ${iconColor})` }}>
            {iconChar}
          </span>
        </div>

        <NavArrow
          ref={rightArrowRef}
          dir="right"
          disabled={index === pages.length - 1}
          onClick={() => {
            if (index === pages.length - 1) return;
            setSlideDir('right');
            setSlideKey(k => k + 1);
            setIndex(i => i + 1);
          }}
        />
      </div>

      {/* Skill name + type + rows — all slide together as one unit */}
      <div
        key={`c${slideKey}`}
        style={{
          display: 'flex', flexDirection: 'column', gap: 20,
          animation: slideAnim,
        }}
      >
        {/* Skill name + type */}
        <div style={{ textAlign: 'center' as const }}>
          <div style={{ fontSize: 29, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
            {skillName}
          </div>
          <div style={{ fontSize: 20, color: '#6b7280' }}>{typeLabel}</div>
        </div>

        {/* Skill rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isUlti ? (
            <UltimateRows char={char} />
          ) : current.kind === 'cpow' ? (
            <ComboRows char={char} pow={current.pow} cpowIndex={current.cpowIndex} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

// Shared UI primitives for Character System prototype
import React from 'react';
import { TIER_COLOR, ELEMENT_COLOR, ELEMENT_ICON, DUP_REWARD_COLOR } from '../data/mockCharacters.ts';
import type { Tier, Element, DupMilestone, ComboPower } from '../data/mockCharacters.ts';

// ── Tier Badge ─────────────────────────────────────────────────────────────
export const TierBadge: React.FC<{ tier: Tier }> = ({ tier }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, borderRadius: 6,
    background: TIER_COLOR[tier],
    color: tier === 'A' ? '#1a1500' : '#fff',
    fontWeight: 800, fontSize: 13, letterSpacing: 1,
    boxShadow: `0 0 8px ${TIER_COLOR[tier]}88`,
  }}>
    {tier}
  </span>
);

// ── Element Chip ────────────────────────────────────────────────────────────
export const ElementChip: React.FC<{ element: Element }> = ({ element }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 99,
    background: ELEMENT_COLOR[element] + '33',
    border: `1px solid ${ELEMENT_COLOR[element]}88`,
    color: ELEMENT_COLOR[element],
    fontSize: 12, fontWeight: 600,
  }}>
    {ELEMENT_ICON[element]} {element}
  </span>
);

// ── Stat Row ────────────────────────────────────────────────────────────────
export const StatRow: React.FC<{ label: string; value: number | string; accent?: string }> = ({
  label, value, accent = '#e2e8f0',
}) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
    <span style={{ color: '#94a3b8', fontSize: 13 }}>{label}</span>
    <span style={{ color: accent, fontWeight: 700, fontSize: 15 }}>{value}</span>
  </div>
);

// ── Level Progress Bar ──────────────────────────────────────────────────────
export const LevelProgressBar: React.FC<{
  current: number; cap: number; max: number; accent?: string;
}> = ({ current, cap, max, accent = '#818cf8' }) => {
  const pct = Math.min((current / cap) * 100, 100);
  const isAtCap = current >= cap;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: isAtCap ? '#fbbf24' : '#e2e8f0', fontWeight: 700, fontSize: 15 }}>
          Lv. {current}
        </span>
        <span style={{ color: '#64748b', fontSize: 12 }}>
          {isAtCap ? `Cap • Max Lv.${max}` : `/ ${cap}`}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: '#1e293b', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 99,
          background: isAtCap
            ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
            : `linear-gradient(90deg, ${accent}, ${accent}cc)`,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
};

// ── Enlightenment Pips ──────────────────────────────────────────────────────
export const EnlightenmentPips: React.FC<{ current: number; max: number }> = ({ current, max }) => (
  <div style={{ display: 'flex', gap: 6 }}>
    {Array.from({ length: max }).map((_, i) => (
      <div key={i} style={{
        width: 15, height: 15,
        borderRadius: 3,
        background: i < current
          ? 'linear-gradient(135deg, #818cf8, #6366f1)'
          : '#1e293b',
        border: `1px solid ${i < current ? '#6366f1' : '#334155'}`,
        boxShadow: i < current ? '0 0 6px #6366f188' : 'none',
      }} />
    ))}
  </div>
);

// ── Dup Tracker ─────────────────────────────────────────────────────────────
export const DupTracker: React.FC<{
  dupLevel: number;
  milestones: DupMilestone[];
  compact?: boolean;
}> = ({ dupLevel, milestones, compact = false }) => (
  <div>
    <div style={{
      display: 'flex', gap: compact ? 4 : 6,
      alignItems: 'center', flexWrap: 'wrap',
    }}>
      {milestones.map((m) => (
        <div key={m.dup} style={{
          flex: 1, minWidth: compact ? 36 : 48,
          borderRadius: 8,
          border: `1.5px solid ${m.unlocked ? DUP_REWARD_COLOR[m.rewardType] : '#334155'}`,
          background: m.unlocked ? DUP_REWARD_COLOR[m.rewardType] + '22' : '#0f172a',
          padding: compact ? '4px 2px' : '6px 4px',
          textAlign: 'center',
          opacity: m.unlocked ? 1 : 0.5,
        }}>
          <div style={{
            fontSize: compact ? 9 : 10, color: '#64748b', marginBottom: 2,
          }}>
            Dup {m.dup}
          </div>
          <div style={{
            fontSize: compact ? 10 : 11, fontWeight: 700,
            color: m.unlocked ? DUP_REWARD_COLOR[m.rewardType] : '#475569',
            lineHeight: 1.2,
          }}>
            {m.rewardLabel}
          </div>
          {m.unlocked && (
            <div style={{ fontSize: 10, color: DUP_REWARD_COLOR[m.rewardType], marginTop: 2 }}>✓</div>
          )}
        </div>
      ))}
    </div>
    <div style={{ color: '#64748b', fontSize: 11, marginTop: 6, textAlign: 'right' }}>
      Dup {dupLevel} / 5
    </div>
  </div>
);

// ── Combo Power Row ─────────────────────────────────────────────────────────
export const ComboPowerRow: React.FC<{
  pow: ComboPower;
  onClick?: () => void;
}> = ({ pow, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '10px 12px', borderRadius: 10,
      background: '#0f172a',
      border: `1px solid ${pow.isPlus ? '#818cf888' : '#1e293b'}`,
      cursor: onClick ? 'pointer' : 'default',
    }}
  >
    <div style={{
      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
      background: pow.isPlus
        ? 'linear-gradient(135deg, #818cf8, #6366f1)'
        : 'linear-gradient(135deg, #334155, #1e293b)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 16,
    }}>
      ⚡
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
        <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14 }}>
          {pow.label}
        </span>
        {pow.isPlus && (
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '1px 5px', borderRadius: 4,
            background: '#818cf8', color: '#fff',
          }}>+</span>
        )}
      </div>
      <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.4 }}>
        {pow.isPlus ? pow.descriptionPlus : pow.description}
      </div>
    </div>
  </div>
);

// ── Ultimate Card ───────────────────────────────────────────────────────────
export const UltimateCard: React.FC<{
  ultimate: import('../data/mockCharacters.ts').UltimateData;
  onClick?: () => void;
}> = ({ ultimate, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '10px 12px', borderRadius: 10,
      background: '#0f172a',
      border: `1px solid ${ultimate.level === 2 ? '#fbbf2488' : '#334155'}`,
      cursor: onClick ? 'pointer' : 'default',
    }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
      background: ultimate.level === 2
        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
        : 'linear-gradient(135deg, #475569, #334155)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20,
    }}>
      ✦
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
        <span style={{ color: '#fde68a', fontWeight: 700, fontSize: 14 }}>
          {ultimate.name}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
          background: ultimate.level === 2 ? '#fbbf24' : '#475569',
          color: ultimate.level === 2 ? '#000' : '#94a3b8',
        }}>
          Lv. {ultimate.level}
        </span>
        <span style={{
          marginLeft: 'auto', fontSize: 12, color: '#60a5fa', fontWeight: 600,
        }}>
          {ultimate.level === 1 ? ultimate.magCost : ultimate.magCostLv2} MAG
        </span>
      </div>
      <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.4 }}>
        {ultimate.level === 1 ? ultimate.description : ultimate.descriptionLv2}
      </div>
      {ultimate.level === 1 && onClick && (
        <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
          Lv.2: {ultimate.descriptionLv2} · {ultimate.magCostLv2} MAG
        </div>
      )}
    </div>
  </div>
);

// ── Section Header ──────────────────────────────────────────────────────────
export const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
    color: '#475569', textTransform: 'uppercase', marginBottom: 8, marginTop: 4,
  }}>
    {children}
  </div>
);

// ── Primary Button ──────────────────────────────────────────────────────────
export const PrimaryBtn: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  accent?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}> = ({ children, onClick, accent = '#6366f1', disabled = false, style }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: '12px 24px', borderRadius: 12, border: 'none',
      background: disabled ? '#334155' : `linear-gradient(135deg, ${accent}, ${accent}cc)`,
      color: disabled ? '#64748b' : '#fff',
      fontWeight: 700, fontSize: 15, cursor: disabled ? 'not-allowed' : 'pointer',
      width: '100%', letterSpacing: 0.5,
      boxShadow: disabled ? 'none' : `0 4px 16px ${accent}44`,
      transition: 'all 0.15s ease',
      ...style,
    }}
  >
    {children}
  </button>
);

// ── Character Portrait Placeholder ──────────────────────────────────────────
// Maps char id to a fun emoji for prototype purposes
const CHAR_EMOJI: Record<string, string> = {
  pillow: '🐭',
  kira: '🦊',
  mucklepuff: '🌑',
  zara: '🧜',
  luxar: '⭐',
  vex: '🪨',
};

export const CharPortrait: React.FC<{
  charId: string;
  size?: number;
  tier: Tier;
}> = ({ charId, size = 80, tier }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.2,
    background: `linear-gradient(135deg, ${TIER_COLOR[tier]}33, ${TIER_COLOR[tier]}11)`,
    border: `2px solid ${TIER_COLOR[tier]}66`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.45,
    flexShrink: 0,
  }}>
    {CHAR_EMOJI[charId] ?? '❓'}
  </div>
);

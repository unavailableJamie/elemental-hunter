import React from 'react';
import { TIER_COLOR } from '../data/mockCharacters.ts';
import type { CharacterData, Element } from '../data/mockCharacters.ts';
import { FireIcon, IceIcon, GrassIcon, RockIcon } from '../../components/Icons.tsx';
import { CHAR_IMAGE } from '../scenes/CharacterInfoScene.tsx';

const CHAR_EMOJI: Record<string, string> = {
  pillow: '🐭',
  kira: '🦊',
  mucklepuff: '🌑',
  zara: '🧜',
  luxar: '⭐',
  vex: '🪨',
};

type SvgIcon = React.FC<React.SVGProps<SVGSVGElement>>;

const AFFINITY_ICON: Record<Element, SvgIcon> = {
  Fire: FireIcon,
  Ice: IceIcon,
  Grass: GrassIcon,
  Rock: RockIcon,
};

const AFFINITY_COLOR: Record<Element, string> = {
  Fire: '#ef4444',
  Ice: '#60a5fa',
  Grass: '#10b981',
  Rock: '#a16207',
};

// Deterministic particle positions/timings — varied to avoid re-sync
const PARTICLES = Array.from({ length: 25 }, (_, i) => ({
  left: `${1 + i * 3.9}%`,
  // Quadratic term breaks periodicity → delays spread 0–3.9s
  delay: `${((i * 570 + i * i * 130) % 4200) / 1000}s`,
  // Durations spread 3.3–6.5s — irrational ratios prevent sync
  dur:   `${(2.2 + ((i * 470 + i * i * 90) % 2800) / 1000) * 1.5}s`,
  size: 2 + (i % 3),
}));

// ── Character Card ────────────────────────────────────────────────────────────
export const CharCard: React.FC<{ char: CharacterData; onSelect: () => void; isActive?: boolean }> = ({ char, onSelect, isActive }) => {
  const tierColor = TIER_COLOR[char.tier];
  const AffinityIcon = AFFINITY_ICON[char.element];
  const affinityColor = AFFINITY_COLOR[char.element];
  const isA    = char.tier === 'A';
  const isAorB = char.tier === 'A' || char.tier === 'B';
  const particleColor = isA ? tierColor + '77' : tierColor;

  return (
    <>
    <style>{`
      @keyframes activeLabelGlow {
        0%, 100% { filter: brightness(1) saturate(1); }
        50%       { filter: brightness(1.7) saturate(1.5); }
      }
      @keyframes metallicSheen {
        0%   { transform: translateX(-130%) skewX(-18deg); opacity: 0; }
        6%   { opacity: 1; }
        94%  { opacity: 1; }
        100% { transform: translateX(420%) skewX(-18deg); opacity: 0; }
      }
      @keyframes particleRise {
        0%   { transform: translateY(0) scale(1); opacity: 0.9; }
        65%  { opacity: 0.45; }
        100% { transform: translateY(-126px) scale(0.2); opacity: 0; }
      }
    `}</style>
    <button
      onClick={onSelect}
      style={{
        borderRadius: 16, border: `2px solid ${tierColor}`,
        background: `linear-gradient(160deg, ${tierColor}18 0%, #0a0f1a 100%)`,
        padding: 0, cursor: 'pointer', textAlign: 'left',
        overflow: 'hidden',
        boxShadow: `0 4px 20px ${tierColor}33`,
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        width: '100%',
      }}
    >
      {/* Tier stripe */}
      <div style={{ height: 3, background: tierColor, flexShrink: 0 }} />

      {/* Metallic sheen overlay — tier A only */}
      {isA && (
        <div style={{
          position: 'absolute', inset: 0,
          pointerEvents: 'none', zIndex: 3,
        }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            width: '42%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,248,190,0.10) 25%, rgba(255,255,220,0.26) 50%, rgba(255,248,190,0.10) 75%, transparent 100%)',
            animation: 'metallicSheen 5s ease-in-out 0.8s infinite',
          }} />
        </div>
      )}

      {/* Particle overlay — full card, particles start from bottom edge */}
      {isAorB && (
        <div style={{
          position: 'absolute', inset: 0,
          pointerEvents: 'none', zIndex: 2,
          overflow: 'hidden',
        }}>
          {PARTICLES.map((p, i) => (
            <div key={i} style={{
              position: 'absolute',
              bottom: 0,
              left: p.left,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: particleColor,
              boxShadow: `0 0 ${p.size + 2}px ${particleColor}`,
              animation: `particleRise ${p.dur} ${p.delay} ease-out infinite`,
            }} />
          ))}
        </div>
      )}

      {/* Portrait */}
      <div style={{
        position: 'relative', height: 120,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `radial-gradient(ellipse at center, ${tierColor}18 0%, transparent 70%)`,
        overflow: 'hidden',
      }}>
        {CHAR_IMAGE[char.id] ? (
          <img
            src={CHAR_IMAGE[char.id]}
            alt={char.name}
            style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ fontSize: 60 }}>{CHAR_EMOJI[char.id] ?? '❓'}</span>
        )}

        {/* Tier badge — top-left */}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          width: 24, height: 24, borderRadius: 6,
          background: tierColor, color: '#fff',
          fontSize: 12, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {char.tier}
        </div>

        {/* Affinity icon — top-right */}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 28, height: 28, borderRadius: 7,
          background: affinityColor + '22',
          border: `1px solid ${affinityColor}66`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AffinityIcon style={{ width: 16, height: 16, color: affinityColor }} />
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '8px 12px 0', textAlign: 'center' }}>
        {/* Level */}
        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 3, fontWeight: 600 }}>
          Lv. {char.charLevel}
        </div>

        {/* Name */}
        <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', marginBottom: 10 }}>
          {char.name}
        </div>

        {/* Dup indicator — always shown */}
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 10 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: 9, height: 9,
                background: i <= char.dupLevel ? tierColor : 'transparent',
                border: `1.5px solid ${i <= char.dupLevel ? tierColor : '#334155'}`,
                transform: 'rotate(45deg)',
                borderRadius: 2,
                boxShadow: i <= char.dupLevel ? `0 0 4px ${tierColor}88` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Active label — fixed height bottom bar, always reserve space */}
      <div style={{
        height: 22, flexShrink: 0,
        background: isActive ? 'linear-gradient(90deg, #10b981, #059669)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: 0.8,
        animation: isActive ? 'activeLabelGlow 2s ease-in-out infinite' : undefined,
        position: 'relative', zIndex: 3,
      }}>
        {isActive ? '✦ ĐANG SỬ DỤNG' : ''}
      </div>
    </button>
    </>
  );
};

// ── Empty Slot ────────────────────────────────────────────────────────────────
export const EmptySlot: React.FC = () => (
  <div style={{
    borderRadius: 16, border: '2px dashed #1e293b',
    background: '#0a0f1a',
    height: 210,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, color: '#1e293b',
  }}>
    +
  </div>
);

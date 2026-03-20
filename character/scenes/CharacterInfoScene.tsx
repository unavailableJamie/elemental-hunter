import React, { useState, useEffect } from 'react';
import { getCharById, TIER_COLOR, ELEMENT_COLOR, MOCK_INVENTORY } from '../data/mockCharacters.ts';
import type { ComboPower } from '../data/mockCharacters.ts';
import type { Element } from '../data/mockCharacters.ts';
import { computeCharStats, effectiveStatLevel } from '../../config/characterBalance.ts';
import { FireIcon, IceIcon, GrassIcon, RockIcon } from '../../components/Icons.tsx';
import { EnlightenmentPips } from '../components/CharShared.tsx';
import { LvlUpPopup } from '../components/LvlUpPopup.tsx';
import { SkillLvPopup } from '../components/SkillLvPopup.tsx';

// ── Emoji fallback map ────────────────────────────────────────────────────────
const CHAR_EMOJI: Record<string, string> = {
  pillow: '🐭', kira: '🦊', mucklepuff: '🌑',
  zara: '🧜', luxar: '⭐', vex: '🪨',
};

// ── Character image map ───────────────────────────────────────────────────────
export const CHAR_IMAGE: Record<string, string> = {
  pillow: '/characters/pillow.png',
  kira: '/characters/kira.png',
  mucklepuff: '/characters/mucklepuff.png',
  zara: '/characters/zara.png',
  luxar: '/characters/luxar.png',
  vex: '/characters/vex.png',
};

// ── Element icon map ──────────────────────────────────────────────────────────
type SvgIcon = React.FC<React.SVGProps<SVGSVGElement>>;
const ELEMENT_ICON_MAP: Record<Element, SvgIcon> = {
  Fire: FireIcon, Ice: IceIcon, Grass: GrassIcon, Rock: RockIcon,
};

// ── Bounce hook (random 3-7s interval, single nudge) ─────────────────────────
const useBounce = () => {
  const [bouncing, setBouncing] = useState(false);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 3000 + Math.random() * 4000;
      timeout = setTimeout(() => {
        setBouncing(true);
        setTimeout(() => {
          setBouncing(false);
          schedule();
        }, 500);
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);
  return bouncing;
};

// ── Skill popup state ─────────────────────────────────────────────────────────
type SkillPopupState = { type: 'none' } | { type: 'ultimate' } | { type: 'cpow'; id: string };

// ── Action colors ─────────────────────────────────────────────────────────────
const LVLUP_COLOR     = '#3A7FF0';
const ENLIGHTEN_COLOR = '#F0B724';

// ── SkillThumb ────────────────────────────────────────────────────────────────
interface SkillThumbProps {
  type: 'ultimate' | 'cpow';
  isMax: boolean;
  tierColor: string;
  onClick: () => void;
}

const SkillThumb: React.FC<SkillThumbProps> = ({ type, isMax, tierColor, onClick }) => {
  const isUlti = type === 'ultimate';
  const size = isUlti ? 96 : 80;
  const radius = isUlti ? '50%' : 14;
  const bg = isUlti
    ? `radial-gradient(circle, ${tierColor}44 0%, #1a0d00 100%)`
    : 'linear-gradient(160deg, #2d1f5e 0%, #0d0b1a 100%)';
  const border = isUlti
    ? (isMax ? '#b8860b' : `${tierColor}88`)
    : (isMax ? '#818cf8' : '#2d2060');
  const borderWidth = isUlti ? 2.5 : 2;
  const iconColor = isUlti ? '#fbbf24' : '#a78bfa';
  const iconChar = isUlti ? '✦' : '⚡';
  const iconSize = isUlti ? 40 : 30;
  const maxBg = isUlti ? '#b8860b' : '#4338ca';

  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        cursor: 'pointer',
        background: bg,
        border: `${borderWidth}px solid ${border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
        boxShadow: isUlti ? `0 0 20px ${tierColor}44` : 'none',
      }}
    >
      <span style={{
        fontSize: iconSize,
        color: iconColor,
        filter: `drop-shadow(0 0 8px ${iconColor})`,
      }}>
        {iconChar}
      </span>
      {isMax && (
        <span style={{
          position: 'absolute',
          top: isUlti ? 6 : 4,
          right: isUlti ? 6 : 4,
          fontSize: 8,
          fontWeight: 800,
          padding: '1px 4px',
          borderRadius: 3,
          background: maxBg,
          color: '#fff',
          letterSpacing: 0.5,
        }}>
          MAX
        </span>
      )}
    </div>
  );
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface CharacterInfoSceneProps {
  charId: string;
  onBack: () => void;
  activeCharId?: string;
  onSetActiveChar?: (id: string) => void;
}

const TOP_BAR_H = 56;
const TEXT_SHADOW = '0 1px 4px rgba(0,0,0,0.95), 0 0 14px rgba(0,0,0,0.85)';

// ── CharacterInfoScene ────────────────────────────────────────────────────────
export const CharacterInfoScene: React.FC<CharacterInfoSceneProps> = ({
  charId,
  onBack,
  activeCharId,
  onSetActiveChar,
}) => {
  const char = getCharById(charId);
  const [lvlUpOpen, setLvlUpOpen] = useState(false);
  const [skillPopup, setSkillPopup] = useState<SkillPopupState>({ type: 'none' });
  const [enlightTooltip, setEnlightTooltip] = useState(false);

  const tierColor = TIER_COLOR[char.tier];
  const derivedStats = computeCharStats(char.tier, effectiveStatLevel(char.charLevel, char.expCurrent, char.expNextLevel));
  const isActive = activeCharId === char.id;
  const atMaxLevel = char.charLevel >= char.enlightenmentLevelCap;
  const atCap = atMaxLevel && char.expCurrent >= char.expNextLevel;
  const actionColor = atCap ? ENLIGHTEN_COLOR : LVLUP_COLOR;
  const bouncing = useBounce();

  const ElementIcon = ELEMENT_ICON_MAP[char.element];
  const elemColor = ELEMENT_COLOR[char.element];

  const lvlPct = char.expNextLevel > 0
    ? Math.min((char.expCurrent / char.expNextLevel) * 100, 100)
    : 100;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: `linear-gradient(135deg, #0a0f1e 0%, #0f172a 60%, #12082a 100%)`,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#fff',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes chibiBounce {
          0%   { transform: translateY(0) scale(1); }
          20%  { transform: translateY(-24px) scale(1.05); }
          45%  { transform: translateY(-18px) scale(1); }
          65%  { transform: translateY(-22px) scale(1.03); }
          85%  { transform: translateY(-4px) scale(0.97); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes chibiBreath {
          0%, 100% { transform: scale(1.00); }
          50%      { transform: scale(1.15); }
        }
        @keyframes charFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-16px); }
        }
      `}</style>

      {/* ── Layer 1: Concept art background (static, double size) ─────────── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        <div style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tierColor}28 0%, transparent 68%)`,
        }} />
        {CHAR_IMAGE[char.id] ? (
          <img
            src={CHAR_IMAGE[char.id]}
            alt={char.name}
            style={{
              height: 630,
              width: 'auto',
              objectFit: 'contain',
              userSelect: 'none',
              animation: 'charFloat 3s ease-in-out infinite',
            } as React.CSSProperties}
          />
        ) : (
          <span style={{ fontSize: 340, lineHeight: 1 }}>
            {CHAR_EMOJI[char.id] ?? '❓'}
          </span>
        )}
      </div>

      {/* ── Top navigation bar ───────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: TOP_BAR_H,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 18px',
            borderRadius: 10,
            border: 'none',
            background: 'rgba(255,255,255,0.1)',
            color: '#e2e8f0',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: 0.3,
          }}
        >
          ← Quay lại
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Gold display — only when lvlUp popup is open */}
        {lvlUpOpen && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 10,
            background: 'rgba(251,191,36,0.12)',
            border: '1px solid rgba(251,191,36,0.25)',
          }}>
            <span style={{ fontSize: 16 }}>🪙</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24' }}>
              {MOCK_INVENTORY.gold.toLocaleString()}
            </span>
            <span style={{ fontSize: 11, color: '#92772a', fontWeight: 600 }}>
              Gold
            </span>
          </div>
        )}
      </div>

      {/* ── Left strip (20%) ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: TOP_BAR_H,
        bottom: 0,
        width: '20%',
        padding: '20px 14px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        zIndex: 10,
        textShadow: TEXT_SHADOW,
      }}>

        {/* 1. Affinity icon + Tier badge + Name (top) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          {/* Affinity icon */}
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: `${elemColor}22`,
            border: `2px solid ${elemColor}66`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ElementIcon width={32} height={32} style={{ color: elemColor }} />
          </div>

          {/* Tier badge + Name row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 14,
              background: tierColor,
              border: '2.5px solid #000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 36,
              color: '#fff',
              flexShrink: 0,
            }}>
              {char.tier}
            </div>
            <span style={{
              fontWeight: 800,
              fontSize: 40,
              color: '#f1f5f9',
              lineHeight: 1.1,
              wordBreak: 'break-word' as const,
            }}>
              {char.name}
            </span>
          </div>
        </div>

        {/* 2. Chibi + Action button (bottom) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', flexShrink: 0 }}>
          {/* Chibi with bounce anim — no box, just image */}
          <div style={{
            width: 215,
            height: 215,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: bouncing
              ? 'chibiBounce 0.7s ease'
              : 'chibiBreath 4s ease-in-out infinite',
          }}>
            {CHAR_IMAGE[char.id] ? (
              <img
                src={CHAR_IMAGE[char.id]}
                alt={char.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <span style={{ fontSize: 100, userSelect: 'none' }}>{CHAR_EMOJI[char.id] ?? '❓'}</span>
            )}
          </div>

          {/* Action button */}
          {isActive ? (
            <div style={{
              textAlign: 'center',
              fontWeight: 800,
              fontSize: 14,
              color: '#4ade80',
              letterSpacing: 0.5,
              padding: '8px 0',
            }}>
              ✦ ĐANG SỬ DỤNG
            </div>
          ) : (
            <button
              onClick={() => onSetActiveChar?.(char.id)}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #397BEA, #2563c7)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                letterSpacing: 0.5,
                boxShadow: '0 4px 14px #397BEA44',
              }}
            >
              Sử Dụng
            </button>
          )}
        </div>
      </div>

      {/* ── Right panel (33%) ────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: TOP_BAR_H,
        bottom: 0,
        width: '33%',
        padding: '20px 16px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 10,
        overflowY: 'auto',
        textShadow: TEXT_SHADOW,
      }}>

        {/* ── Group 1: Level + EXP + Stats ── */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ marginBottom: 4, position: 'relative', display: 'inline-block' }}
              onMouseEnter={() => setEnlightTooltip(true)}
              onMouseLeave={() => setEnlightTooltip(false)}
            >
              <EnlightenmentPips current={char.enlightenment} max={char.enlightenmentMax} />
              {enlightTooltip && (
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 6px)',
                  left: 0,
                  width: 248,
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  padding: '8px 10px',
                  fontSize: 12,
                  color: '#cbd5e1',
                  lineHeight: 1.55,
                  zIndex: 100,
                  pointerEvents: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.7)',
                  textShadow: 'none',
                }}>
                  Tăng Cấp độ Khai Sáng để nâng giới hạn Lv tối đa. Nâng đến Lv tối đa để có thể mở Cấp độ Khai Sáng kế tiếp.
                </div>
              )}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 30, color: '#fff', lineHeight: 1 }}>
                  Lv. {char.charLevel}
                </span>
                <span style={{ fontSize: 15, color: '#94a3b8' }}>/ {char.enlightenmentLevelCap}</span>
              </div>
              <button
                onClick={() => setLvlUpOpen(true)}
                style={{
                  padding: '9px 15px',
                  borderRadius: 9,
                  border: 'none',
                  background: `linear-gradient(135deg, ${actionColor}, ${actionColor}cc)`,
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  letterSpacing: 0.3,
                  flexShrink: 0,
                  boxShadow: `0 3px 10px ${actionColor}55`,
                }}
              >
                {atCap ? '✨ Khai Sáng' : '⬆ Nâng cấp'}
              </button>
            </div>
          </div>

          {/* EXP bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ height: 5, borderRadius: 99, background: '#1e293b55', overflow: 'hidden', marginBottom: 4 }}>
              <div style={{
                height: '100%',
                width: `${lvlPct}%`,
                borderRadius: 99,
                background: `linear-gradient(90deg, ${actionColor}, ${actionColor}cc)`,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: '#64748b' }}>
              <span>EXP {char.expCurrent.toLocaleString()}</span>
              <span>{char.expNextLevel.toLocaleString()}</span>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            background: 'rgba(0,0,0,0.45)',
            borderRadius: 12,
            padding: '10px 14px',
            border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            {[
              { icon: '⚔', label: 'ATK', val: derivedStats.atk, color: '#f87171' },
              { icon: '✦', label: 'MAG', val: derivedStats.mag, color: '#60a5fa' },
              { icon: '♥', label: 'HP',  val: derivedStats.hp,  color: '#4ade80' },
            ].map(({ icon, label, val, color }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color, fontSize: 20 }}>{icon}</span>
                  <span style={{ fontSize: 15, color: '#c8d8ec', fontWeight: 700, width: 34 }}>{label}</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color, marginLeft: 'auto' }}>
                    {val.toLocaleString()}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Group 2: Skills ── */}
        <div style={{ flexShrink: 0 }}>
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: '#94a3b8',
            textTransform: 'uppercase' as const,
            marginBottom: 12,
          }}>
            Kỹ Năng
          </div>
          <div style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap' as const,
            alignItems: 'flex-end',
          }}>
            <SkillThumb
              type="ultimate"
              isMax={char.ultimate.level === 2}
              tierColor={tierColor}
              onClick={() => setSkillPopup({ type: 'ultimate' })}
            />
            {char.comboPowers.map((pow: ComboPower) => (
              <SkillThumb
                key={pow.id}
                type="cpow"
                isMax={pow.isPlus}
                tierColor={tierColor}
                onClick={() => setSkillPopup({ type: 'cpow', id: pow.id })}
              />
            ))}
          </div>
        </div>

        {/* ── Group 3: Duplicate ── */}
        <div style={{ flexShrink: 0 }}>
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: '#94a3b8',
            textTransform: 'uppercase' as const,
            marginBottom: 10,
          }}>
            Duplicate
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => {
              const filled = i < char.dupLevel;
              return (
                <div
                  key={i}
                  style={{
                    width: 24,
                    height: 24,
                    transform: 'rotate(45deg)',
                    background: filled ? tierColor : 'transparent',
                    border: `2px solid ${filled ? tierColor : '#334155'}`,
                    borderRadius: 3,
                    boxShadow: filled ? `0 0 8px ${tierColor}88` : 'none',
                  }}
                />
              );
            })}
          </div>
          <div style={{ fontSize: 15, color: '#94a3b8', fontWeight: 600 }}>
            Dup {char.dupLevel} / 5
          </div>
        </div>
      </div>

      {/* ── Popups ─────────────────────────────────────────────────────────── */}
      {lvlUpOpen && (
        <LvlUpPopup char={char} onClose={() => setLvlUpOpen(false)} topOffset={TOP_BAR_H} />
      )}
      {skillPopup.type === 'ultimate' && (
        <SkillLvPopup
          char={char}
          skillType="ultimate"
          onClose={() => setSkillPopup({ type: 'none' })}
        />
      )}
      {skillPopup.type === 'cpow' && (
        <SkillLvPopup
          char={char}
          skillType="cpow"
          cpowId={skillPopup.id}
          onClose={() => setSkillPopup({ type: 'none' })}
        />
      )}
    </div>
  );
};

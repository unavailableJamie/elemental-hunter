import React, { useState, useRef } from 'react';
import { TIER_COLOR, MOCK_INVENTORY } from '../data/mockCharacters.ts';
import type { CharacterData } from '../data/mockCharacters.ts';
import {
  computeCharStats,
  ENLIGHTENMENT_COSTS,
  ENLIGHTENMENT_MATERIALS,
  ENLIGHTENMENT_LEVEL_CAPS,
  computeEnlightenmentGold,
  expToNextLevel,
} from '../../config/characterBalance.ts';

const ENLIGHTEN_COLOR = '#F0B724';

// ── EnMat tooltip descriptions ────────────────────────────────────────────────
const ENMAT_DESCRIPTIONS: Record<keyof typeof ENLIGHTENMENT_MATERIALS, string> = {
  EnMat1: 'Mảnh tinh thần cơ bản. Dùng để Khai Sáng nhân vật lên cấp tiếp theo.',
  EnMat2: 'Mảnh linh hồn tinh luyện. Cần thiết cho các cấp Khai Sáng cao hơn.',
  EnMat3: 'Lõi huyền bí. Nguyên liệu nâng cấp Khai Sáng bậc trung.',
  EnMat4: 'Tinh thể huyền thuật hiếm. Dùng cho Khai Sáng cấp cao.',
  EnMat5: 'Tinh chất thần thánh. Nguyên liệu tối thượng để Khai Sáng đến giới hạn cuối.',
};

type EnMatKey = keyof typeof ENLIGHTENMENT_MATERIALS;

interface EnlightenPopupProps {
  char: CharacterData;
  onClose: () => void;
  topOffset?: number;
}

export const EnlightenPopup: React.FC<EnlightenPopupProps> = ({
  char,
  onClose,
  topOffset = 0,
}) => {
  const nextEn   = char.enlightenment + 1;
  const enCost   = ENLIGHTENMENT_COSTS[nextEn];
  const newLvCap = ENLIGHTENMENT_LEVEL_CAPS[nextEn] ?? char.enlightenmentLevelCap;
  const goldCost = computeEnlightenmentGold(nextEn);
  const goldShort = goldCost > MOCK_INVENTORY.gold;

  const currentStats = computeCharStats(char.tier, char.charLevel);
  const expCap       = expToNextLevel(char.charLevel);

  const matSlots = enCost
    ? (Object.keys(ENLIGHTENMENT_MATERIALS) as EnMatKey[])
        .filter(k => (enCost as Record<string, number | undefined>)[k])
        .map(k => ({
          key: k,
          label:    ENLIGHTENMENT_MATERIALS[k].label,
          color:    ENLIGHTENMENT_MATERIALS[k].color,
          required: (enCost as Record<string, number>)[k],
          owned:    MOCK_INVENTORY[k],
        }))
    : [];

  const canAffordMats = matSlots.every(s => s.owned >= s.required);
  const canConfirm    = matSlots.length > 0 && canAffordMats && !goldShort;

  const stats = [
    { icon: '⚔', label: 'ATK', value: currentStats.atk, color: '#f87171' },
    { icon: '✦', label: 'MAG', value: currentStats.mag, color: '#60a5fa' },
    { icon: '♥', label: 'HP',  value: currentStats.hp,  color: '#4ade80' },
  ];

  // ── Enlightenment pips tooltip state ──────────────────────────────────────
  const [enlightTooltip, setEnlightTooltip] = useState(false);
  const [enlightPos, setEnlightPos] = useState<{ x: number; y: number } | null>(null);
  const enlightPipsRef = useRef<HTMLDivElement | null>(null);

  const openEnlightTooltip = () => {
    const el = enlightPipsRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setEnlightPos({ x: rect.left, y: rect.top + rect.height / 2 });
    setEnlightTooltip(true);
  };
  const closeEnlightTooltip = () => setEnlightTooltip(false);
  const toggleEnlightTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (enlightTooltip) closeEnlightTooltip();
    else openEnlightTooltip();
  };

  // ── Tooltip state ─────────────────────────────────────────────────────────
  const [tooltipMat, setTooltipMat] = useState<EnMatKey | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slotRefs   = useRef<Partial<Record<EnMatKey, HTMLDivElement | null>>>({});

  const getSlotPos = (key: EnMatKey) => {
    const el = slotRefs.current[key];
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top };
  };

  const openTooltip = (key: EnMatKey) => {
    const pos = getSlotPos(key);
    if (pos) setTooltipPos(pos);
    setTooltipMat(key);
  };
  const closeTooltip = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setTooltipMat(null);
  };
  const handleSlotMouseEnter = (key: EnMatKey) => {
    hoverTimer.current = setTimeout(() => {
      const pos = getSlotPos(key);
      if (pos) setTooltipPos(pos);
      setTooltipMat(key);
    }, 500);
  };
  const handleSlotClick = (key: EnMatKey) => {
    if (tooltipMat === key) { closeTooltip(); return; }
    closeTooltip();
    openTooltip(key);
  };

  return (
    <>
      <style>{`
        @keyframes enPipBlink {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px ${ENLIGHTEN_COLOR}cc; }
          50%       { opacity: 0.35; box-shadow: none; }
        }
        @keyframes enTextBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', left: 0, right: 0,
          top: topOffset, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'absolute', right: 0, top: topOffset, bottom: 0, width: '33%',
        zIndex: 101,
        background: 'linear-gradient(180deg, #111827 0%, #0a0f1e 100%)',
        borderLeft: `2px solid ${ENLIGHTEN_COLOR}77`,
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        color: '#fff',
        boxShadow: '-6px 0 32px rgba(0,0,0,0.7)',
      }}>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 8px' }}>

          {/* Custom pips: filled pips + next pip blinks */}
          <div
            ref={enlightPipsRef}
            style={{ display: 'inline-flex', gap: 6, marginBottom: 8, cursor: 'help' }}
            onMouseEnter={openEnlightTooltip}
            onMouseLeave={closeEnlightTooltip}
            onClick={toggleEnlightTooltip}
          >
            {Array.from({ length: char.enlightenmentMax }).map((_, i) => {
              const filled  = i < char.enlightenment;
              const isNext  = i === char.enlightenment;
              return (
                <div
                  key={i}
                  style={{
                    width: 15, height: 15,
                    borderRadius: 3,
                    background: filled
                      ? 'linear-gradient(135deg, #818cf8, #6366f1)'
                      : isNext
                        ? ENLIGHTEN_COLOR
                        : '#1e293b',
                    border: `1px solid ${filled ? '#6366f1' : isNext ? ENLIGHTEN_COLOR : '#334155'}`,
                    boxShadow: filled ? '0 0 6px #6366f188' : 'none',
                    animation: isNext ? 'enPipBlink 1.2s ease-in-out infinite' : 'none',
                  }}
                />
              );
            })}
          </div>

          {/* Level row: Lv.X / [cap → newCap blinks] */}
          <div style={{ marginBottom: 14, display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: 30, color: '#fff', lineHeight: 1 }}>
              Lv. {char.charLevel}
            </span>
            <span style={{ fontSize: 15, color: '#94a3b8' }}>/</span>
            {/* Blinking: "oldCap → newCap" */}
            <span style={{
              fontSize: 15, fontWeight: 800, color: ENLIGHTEN_COLOR,
              animation: 'enTextBlink 1.2s ease-in-out infinite',
            }}>
              {char.enlightenmentLevelCap} → {newLvCap}
            </span>
          </div>

          {/* EXP bar (no label) — always full */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              height: 5, borderRadius: 99, background: '#1e293b55',
              overflow: 'hidden', marginBottom: 4,
            }}>
              <div style={{
                height: '100%', width: '100%', borderRadius: 99,
                background: `linear-gradient(90deg, ${ENLIGHTEN_COLOR}, ${ENLIGHTEN_COLOR}cc)`,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: '#64748b' }}>
              <span>EXP {expCap.toLocaleString()}</span>
              <span>{expCap.toLocaleString()}</span>
            </div>
          </div>

          {/* Stats card */}
          <div style={{
            background: 'rgba(0,0,0,0.45)', borderRadius: 12,
            padding: '10px 14px', border: '1px solid rgba(255,255,255,0.07)',
            marginBottom: 20,
          }}>
            {stats.map(({ icon, label, value, color }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color, fontSize: 20, flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: 15, color: '#c8d8ec', fontWeight: 700, width: 34, flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color, marginLeft: 'auto' }}>
                    {value.toLocaleString()}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div style={{ height: 1, background: '#1e293b', marginBottom: 16 }} />
        </div>

        {/* ── Footer: materials + confirm ── */}
        <div style={{
          padding: '10px 16px 16px',
          borderTop: '1px solid #1e293b',
          flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>

          {/* Material slots */}
          <div style={{
            background: '#0a1122', borderRadius: 10,
            border: '1px solid #1e293b', overflow: 'hidden',
          }}>
            <div style={{
              padding: '6px 12px 4px',
              fontSize: 15, fontWeight: 700, color: '#7a8fa6',
              letterSpacing: 0.8, textTransform: 'uppercase' as const,
              borderBottom: '1px solid #1e293b',
            }}>
              Nguyên liệu
            </div>
            <div style={{ padding: '10px 12px' }}>
              {matSlots.length > 0 ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  {matSlots.map(({ key, color, required, owned }) => {
                    const enough = owned >= required;
                    return (
                      <div
                        key={key}
                        ref={el => { slotRefs.current[key] = el; }}
                        onClick={() => handleSlotClick(key)}
                        onMouseEnter={() => handleSlotMouseEnter(key)}
                        onMouseLeave={closeTooltip}
                        style={{
                          flex: 1, height: 108,
                          borderRadius: 12,
                          background: `${color}0d`,
                          border: `2px solid ${enough ? color + '55' : '#f8717155'}`,
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          gap: 6,
                          cursor: 'pointer',
                          transition: 'border-color 0.12s',
                        }}
                      >
                        {/* Larger gem icon */}
                        <span style={{
                          fontSize: 48, color,
                          filter: `drop-shadow(0 0 8px ${color}77)`,
                          lineHeight: 1,
                        }}>
                          ◈
                        </span>
                        {/* owned / required */}
                        <span style={{ fontSize: 13, lineHeight: 1 }}>
                          <span style={{ fontWeight: 800, color: enough ? '#c8d8ec' : '#f87171', fontSize: 14 }}>
                            {owned}
                          </span>
                          <span style={{ color: '#475569' }}> / </span>
                          <span style={{ fontWeight: 700, color, fontSize: 14 }}>
                            {required}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '4px 0', color: '#475569', fontSize: 12, fontStyle: 'italic' }}>
                  Đã đạt Enlightenment tối đa
                </div>
              )}
            </div>
          </div>

          {/* Confirm row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

            {/* Gold cost */}
            <div style={{
              flex: 1,
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '8px 10px', borderRadius: 10,
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid #1e293b',
              minWidth: 0,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🪙</span>
              <span style={{
                fontSize: 14, fontWeight: 800,
                color: goldShort ? '#f87171' : '#fbbf24',
                whiteSpace: 'nowrap',
              }}>
                {goldCost.toLocaleString()}
              </span>
            </div>

            {/* Khai Sáng button */}
            <button
              onClick={onClose}
              disabled={!canConfirm}
              style={{
                width: '50%', padding: '11px 20px',
                borderRadius: 10, border: 'none', flexShrink: 0,
                background: canConfirm
                  ? `linear-gradient(135deg, ${ENLIGHTEN_COLOR}, ${ENLIGHTEN_COLOR}cc)`
                  : 'rgba(255,255,255,0.06)',
                color: canConfirm ? '#fff' : '#475569',
                fontWeight: 800, fontSize: 14,
                cursor: canConfirm ? 'pointer' : 'not-allowed',
                letterSpacing: 0.5,
                boxShadow: canConfirm ? `0 4px 14px ${ENLIGHTEN_COLOR}44` : 'none',
                transition: 'background 0.15s',
              }}
            >
              ✨ Khai Sáng
            </button>
          </div>

        </div>
      </div>

      {/* Enlightenment pips tooltip — fixed, left of pips cluster */}
      {enlightTooltip && enlightPos && (
        <div style={{
          position: 'fixed',
          top: enlightPos.y,
          left: enlightPos.x - 10,
          transform: 'translateX(-100%) translateY(-50%)',
          zIndex: 9999,
          background: '#0f172a',
          border: '1px solid #6366f166',
          borderRadius: 10,
          padding: '10px 14px',
          width: 230,
          boxShadow: '0 4px 20px rgba(0,0,0,0.85), 0 0 10px #6366f133',
          pointerEvents: 'none',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
          <div style={{
            position: 'absolute',
            right: -6, top: '50%',
            transform: 'translateY(-50%)',
            width: 0, height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderLeft: '6px solid #6366f166',
          }} />
          <div style={{ fontSize: 16, color: '#c7d2fe', lineHeight: 1.6 }}>
            Tăng Cấp độ Khai Sáng để nâng giới hạn Lv tối đa. Nâng đến Lv tối đa để có thể mở Cấp độ Khai Sáng kế tiếp.
          </div>
        </div>
      )}

      {/* ── Fixed tooltip ── */}
      {tooltipMat && tooltipPos && (() => {
        const matDef = ENLIGHTENMENT_MATERIALS[tooltipMat];
        const desc   = ENMAT_DESCRIPTIONS[tooltipMat];
        return (
          <div
            style={{
              position: 'fixed',
              top: tooltipPos.y - 8,
              left: tooltipPos.x,
              transform: 'translateX(-50%) translateY(-100%)',
              zIndex: 9999,
              background: '#0f172a',
              border: `1px solid ${matDef.color}66`,
              borderRadius: 10,
              padding: '9px 13px',
              width: 210,
              boxShadow: `0 4px 20px rgba(0,0,0,0.8), 0 0 10px ${matDef.color}33`,
              pointerEvents: 'none',
              fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}
          >
            {/* Arrow */}
            <div style={{
              position: 'absolute',
              bottom: -7, left: '50%',
              transform: 'translateX(-50%)',
              width: 12, height: 7,
              overflow: 'hidden',
            }}>
              <div style={{
                width: 12, height: 12,
                background: '#0f172a',
                border: `1px solid ${matDef.color}66`,
                transform: 'rotate(45deg) translateY(-7px)',
                borderRadius: 2,
              }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: matDef.color, marginBottom: 5, lineHeight: 1.2 }}>
              {matDef.label}
            </div>
            <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>
              {desc}
            </div>
          </div>
        );
      })()}
    </>
  );
};

import React, { useState, useRef } from 'react';
import { TIER_COLOR, MOCK_INVENTORY } from '../data/mockCharacters.ts';
import type { CharacterData } from '../data/mockCharacters.ts';
import { EnlightenmentPips } from './CharShared.tsx';
import {
  computeCharStats,
  ENLIGHTENMENT_COSTS,
  ENLIGHTENMENT_MATERIALS,
  EXP_MATERIALS,
  effectiveStatLevel,
  computeEnlightenmentGold,
  levelupGoldForEXP,
} from '../../config/characterBalance.ts';

// ── Color tokens ──────────────────────────────────────────────────────────────
const LVLUP_COLOR     = '#3A7FF0';
const ENLIGHTEN_COLOR = '#F0B724';

// ── LvlUp Popup — overlays the Right panel only, below top bar ────────────────
interface LvlUpPopupProps {
  char: CharacterData;
  onClose: () => void;
  topOffset?: number;
}

// ── Material chip (enlightenment mode only) ───────────────────────────────────
const MatChip: React.FC<{ label: string; qty: number; owned: number; color: string }> = ({ label, qty, owned, color }) => {
  const enough = owned >= qty;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      background: `${color}18`, border: `1px solid ${color}44`,
      borderRadius: 7, padding: '4px 8px', flexShrink: 0,
    }}>
      <span style={{ fontSize: 12, fontWeight: 800, color }}>{qty}×</span>
      <span style={{ fontSize: 11, color: '#c8d8ec', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 10, color: enough ? '#4ade80' : '#f87171', marginLeft: 2 }}>
        ({owned})
      </span>
    </div>
  );
};

// ── Material types (level-up) ─────────────────────────────────────────────────
type MatKey = 'ExpN' | 'ExpR' | 'ExpSR';
const MAT_DEFS: Array<{ key: MatKey; color: string; expValue: number; label: string; description: string }> = [
  {
    key: 'ExpN',  color: EXP_MATERIALS.ExpN.color,  expValue: EXP_MATERIALS.ExpN.expValue,
    label: EXP_MATERIALS.ExpN.label,
    description: 'Đá kinh nghiệm thường. Sử dụng để cung cấp 200 EXP cho nhân vật.',
  },
  {
    key: 'ExpR',  color: EXP_MATERIALS.ExpR.color,  expValue: EXP_MATERIALS.ExpR.expValue,
    label: EXP_MATERIALS.ExpR.label,
    description: 'Đá kinh nghiệm hiếm. Sử dụng để cung cấp 800 EXP cho nhân vật.',
  },
  {
    key: 'ExpSR', color: EXP_MATERIALS.ExpSR.color, expValue: EXP_MATERIALS.ExpSR.expValue,
    label: EXP_MATERIALS.ExpSR.label,
    description: 'Đá kinh nghiệm siêu hiếm. Sử dụng để cung cấp 2.500 EXP cho nhân vật.',
  },
];

// ── EXP simulation ─────────────────────────────────────────────────────────────
function simulateExp(
  charLevel: number,
  expCurrent: number,
  expNextLevel: number,
  levelCap: number,
  totalExpGain: number,
): { simLv: number; simExp: number } {
  let lv  = charLevel;
  let exp = expCurrent + totalExpGain;
  while (lv < levelCap && exp >= expNextLevel) {
    exp -= expNextLevel;
    lv++;
  }
  if (lv >= levelCap) exp = Math.min(exp, expNextLevel);
  return { simLv: lv, simExp: exp };
}

export const LvlUpPopup: React.FC<LvlUpPopupProps> = ({
  char,
  onClose,
  topOffset = 0,
}) => {
  const lvCap            = char.enlightenmentLevelCap;
  const isAtLevelCap     = char.charLevel >= lvCap;
  const isEnlightenReady = isAtLevelCap && char.expCurrent >= char.expNextLevel;

  const tierColor   = TIER_COLOR[char.tier];
  const actionColor = isEnlightenReady ? ENLIGHTEN_COLOR : LVLUP_COLOR;

  // ── Material slot state ───────────────────────────────────────────────────
  const [selectedMat, setSelectedMat] = useState<MatKey | null>(null);
  const [matQty, setMatQty] = useState<Record<MatKey, number>>({ ExpN: 0, ExpR: 0, ExpSR: 0 });
  const [flashMat, setFlashMat] = useState<MatKey | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Tooltip state ─────────────────────────────────────────────────────────
  const [tooltipMat, setTooltipMat] = useState<MatKey | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slotRefs = useRef<Partial<Record<MatKey, HTMLDivElement | null>>>({});

  const getSlotPos = (key: MatKey) => {
    const el = slotRefs.current[key];
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top };
  };

  const openTooltip = (key: MatKey) => {
    const pos = getSlotPos(key);
    if (pos) setTooltipPos(pos);
    setTooltipMat(key);
  };
  const closeTooltip = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setTooltipMat(null);
  };
  const handleSlotMouseEnter = (key: MatKey) => {
    hoverTimer.current = setTimeout(() => {
      const pos = getSlotPos(key);
      if (pos) setTooltipPos(pos);
      setTooltipMat(key);
    }, 500);
  };
  const handleSlotMouseLeave = () => closeTooltip();

  const handleSelectMat = (key: MatKey) => {
    if (selectedMat === key) {
      // Second click on same slot → toggle tooltip
      if (tooltipMat === key) {
        closeTooltip();
      } else {
        openTooltip(key);
      }
      return;
    }
    // First click → select + flash (clear any pending tooltip)
    closeTooltip();
    setSelectedMat(key);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlashMat(key);
    flashTimer.current = setTimeout(() => setFlashMat(null), 280);
  };

  const adjustQty = (key: MatKey, delta: number) => {
    const owned = MOCK_INVENTORY[key];
    setMatQty(prev => ({
      ...prev,
      [key]: Math.max(0, Math.min(prev[key] + delta, owned)),
    }));
  };

  // ── EXP simulation ────────────────────────────────────────────────────────
  const totalExpGain = matQty.ExpN  * EXP_MATERIALS.ExpN.expValue
                     + matQty.ExpR  * EXP_MATERIALS.ExpR.expValue
                     + matQty.ExpSR * EXP_MATERIALS.ExpSR.expValue;

  const { simLv, simExp } = simulateExp(
    char.charLevel, char.expCurrent, char.expNextLevel, lvCap, totalExpGain,
  );
  const previewLvDelta = simLv - char.charLevel;
  const expIsFull      = simLv >= lvCap && simExp >= char.expNextLevel;

  // ── Auto-select: minimize wasted EXP ─────────────────────────────────────
  // Use floor for large stones so we never overshoot by a whole stone.
  // Only ceil at the N layer (last resort) — max waste is vN-1 = 199 EXP.
  // If small stones are exhausted, bump up the next tier by 1.
  const autoSelect = () => {
    const expNeeded = (lvCap - char.charLevel) * char.expNextLevel
                    + (char.expNextLevel - char.expCurrent);
    if (expNeeded <= 0) { setMatQty({ ExpN: 0, ExpR: 0, ExpSR: 0 }); return; }

    const vSR = EXP_MATERIALS.ExpSR.expValue;
    const vR  = EXP_MATERIALS.ExpR.expValue;
    const vN  = EXP_MATERIALS.ExpN.expValue;
    const maxSR = MOCK_INVENTORY.ExpSR;
    const maxR  = MOCK_INVENTORY.ExpR;
    const maxN  = MOCK_INVENTORY.ExpN;

    // Floor for SR: don't overshoot by a whole SR stone
    let useSR = Math.min(maxSR, Math.floor(expNeeded / vSR));
    let rem   = expNeeded - useSR * vSR;           // 0 <= rem < vSR

    // Floor for R: don't overshoot by a whole R stone
    let useR  = Math.min(maxR, Math.floor(rem / vR));
    rem      -= useR * vR;                         // 0 <= rem < vR

    // Ceil for N: cover the last fractional piece (waste ≤ vN-1 = 199)
    let useN  = Math.min(maxN, Math.ceil(rem / vN));

    // If inventory was insufficient to cover expNeeded, bump up by 1 stone
    const covered = useSR * vSR + useR * vR + useN * vN;
    if (covered < expNeeded) {
      if (useR < maxR) {
        // Add 1 R — no need to recalculate N, waste is already minimised
        useR++;
      } else if (useSR < maxSR) {
        // Add 1 SR, then recalculate R and N for the new (likely ≤0) remainder
        // so we don't double-count stones that are now redundant.
        useSR++;
        const remAfterSR = Math.max(0, expNeeded - useSR * vSR);
        useR = Math.min(maxR, Math.floor(remAfterSR / vR));
        const remAfterR = remAfterSR - useR * vR;
        useN = Math.min(maxN, Math.ceil(remAfterR / vN));
      }
      // If truly exhausted, commit what we have (best effort)
    }

    setMatQty({ ExpSR: useSR, ExpR: useR, ExpN: useN });
  };

  // ── Bar percentages ───────────────────────────────────────────────────────
  const lvlPct     = char.expNextLevel > 0
    ? Math.min((char.expCurrent / char.expNextLevel) * 100, 100) : 100;
  const previewPct = char.expNextLevel > 0
    ? Math.min((simExp / char.expNextLevel) * 100, 100) : 100;

  // ── Display level & delta ─────────────────────────────────────────────────
  const hasMatPreview = totalExpGain > 0;
  const displayLevel  = hasMatPreview ? char.charLevel + previewLvDelta : char.charLevel;
  const displayDelta  = hasMatPreview ? previewLvDelta : 0;

  // ── Stats ─────────────────────────────────────────────────────────────────
  // Stat gain fires when EXP bar fills — so effective level = charLevel+1 when exp is full.
  const effLvBefore = effectiveStatLevel(char.charLevel, char.expCurrent, char.expNextLevel);
  const effLvAfter  = effectiveStatLevel(simLv, simExp, char.expNextLevel);
  const statsBefore = computeCharStats(char.tier, effLvBefore);
  const statsAfter  = computeCharStats(char.tier, hasMatPreview ? effLvAfter : effLvBefore);
  const enCost      = isAtLevelCap ? ENLIGHTENMENT_COSTS[char.enlightenment + 1] : null;
  const showDelta   = hasMatPreview && effLvAfter > effLvBefore;

  const stats = [
    { icon: '⚔', label: 'ATK', before: statsBefore.atk, after: statsAfter.atk, color: '#f87171' },
    { icon: '✦', label: 'MAG', before: statsBefore.mag, after: statsAfter.mag, color: '#60a5fa' },
    { icon: '♥', label: 'HP',  before: statsBefore.hp,  after: statsAfter.hp,  color: '#4ade80' },
  ];

  // ── Gold cost ─────────────────────────────────────────────────────────────
  // Level-up: gold rate depends on char's current En bracket (En.0=cheap, En.1+=expensive).
  // Enlightenment: totalEnMats × ratio[En level].
  const goldCost = isEnlightenReady
    ? computeEnlightenmentGold(char.enlightenment + 1)
    : levelupGoldForEXP(totalExpGain, char.enlightenment);
  const goldShort = goldCost > MOCK_INVENTORY.gold;

  return (
    <>
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
        borderLeft: `2px solid ${tierColor}77`,
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        color: '#fff',
        boxShadow: '-6px 0 32px rgba(0,0,0,0.7)',
      }}>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 8px' }}>

          {/* Enlightenment pips */}
          <div style={{ marginBottom: 8 }}>
            <EnlightenmentPips current={char.enlightenment} max={char.enlightenmentMax} />
          </div>

          {/* Level row: Lv.X/Y then +delta badge outside */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontWeight: 800, fontSize: 30, color: '#fff', lineHeight: 1 }}>
                Lv. {displayLevel}
              </span>
              <span style={{ fontSize: 15, color: '#94a3b8' }}>/ {lvCap}</span>
              {displayDelta > 0 && (
                <span style={{
                  fontSize: 12, fontWeight: 700, color: '#fff',
                  background: '#92400e',
                  borderRadius: 4, padding: '2px 7px',
                  marginLeft: 2,
                  lineHeight: 1.4,
                }}>
                  +{displayDelta}
                </span>
              )}
            </div>
          </div>

          {/* EXP bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              height: 5, borderRadius: 99, background: '#1e293b55',
              overflow: 'hidden', marginBottom: 4, position: 'relative',
            }}>
              {/* Current fill — hidden when level-up preview is active (would cover preview) */}
              {!(hasMatPreview && previewLvDelta > 0) && (
                <div style={{
                  position: 'absolute', left: 0, top: 0,
                  height: '100%', width: `${lvlPct}%`, borderRadius: 99,
                  background: actionColor,
                  transition: 'width 0.3s ease',
                }} />
              )}
              {/* Preview gain (same level) */}
              {hasMatPreview && previewLvDelta === 0 && previewPct > lvlPct && (
                <div style={{
                  position: 'absolute', left: `${lvlPct}%`, top: 0,
                  height: '100%', width: `${previewPct - lvlPct}%`,
                  background: `${actionColor}66`,
                  transition: 'width 0.3s ease',
                }} />
              )}
              {/* Preview after level-up (new level's EXP position, no old fill behind it) */}
              {hasMatPreview && previewLvDelta > 0 && (
                <div style={{
                  position: 'absolute', left: 0, top: 0,
                  height: '100%', width: `${previewPct}%`, borderRadius: 99,
                  background: `${actionColor}99`,
                  transition: 'width 0.3s ease',
                }} />
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: '#64748b' }}>
              <span>EXP {(hasMatPreview ? simExp : char.expCurrent).toLocaleString()}</span>
              <span>{char.expNextLevel.toLocaleString()}</span>
            </div>
          </div>

          {/* Stats card */}
          <div style={{
            background: 'rgba(0,0,0,0.45)', borderRadius: 12,
            padding: '10px 14px', border: '1px solid rgba(255,255,255,0.07)',
            marginBottom: 20,
          }}>
            {stats.map(({ icon, label, before, after, color }, i) => {
              const delta = after - before;
              return (
                <React.Fragment key={label}>
                  {i > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color, fontSize: 20, flexShrink: 0 }}>{icon}</span>
                    <span style={{ fontSize: 15, color: '#c8d8ec', fontWeight: 700, width: 34, flexShrink: 0 }}>{label}</span>
                    {showDelta ? (
                      <>
                        {/* before — fixed-width column, right-aligned */}
                        <span style={{
                          fontSize: 15, color: '#64748b',
                          minWidth: 44, textAlign: 'right', flexShrink: 0,
                        }}>
                          {before.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 11, color: '#334155', flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: 15, fontWeight: 800, color, flexShrink: 0 }}>
                          {after.toLocaleString()}
                        </span>
                        <span style={{
                          fontSize: 15, color: '#f59e0b',
                          minWidth: 38, textAlign: 'right', marginLeft: 'auto', flexShrink: 0,
                        }}>
                          +{delta.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: 17, fontWeight: 800, color, marginLeft: 'auto' }}>
                        {before.toLocaleString()}
                      </span>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#1e293b', marginBottom: 16 }} />

        </div>

        {/* ── Footer: materials + confirm ── */}
        <div style={{
          padding: '10px 16px 16px',
          borderTop: '1px solid #1e293b',
          flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>

          {/* Materials section */}
          <div style={{
            background: '#0a1122', borderRadius: 10,
            border: '1px solid #1e293b', overflow: 'hidden',
          }}>
            <div style={{
              padding: '6px 12px 4px',
              fontSize: 15, fontWeight: 700, color: '#7a8fa6',
              letterSpacing: 0.8, textTransform: 'uppercase',
              borderBottom: '1px solid #1e293b',
            }}>
              Chọn nguyên liệu
            </div>

            {isEnlightenReady ? (
              /* ── Enlightenment materials ── */
              <div style={{ padding: '10px 12px' }}>
                {enCost ? (
                  <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {(Object.keys(ENLIGHTENMENT_MATERIALS) as Array<keyof typeof ENLIGHTENMENT_MATERIALS>)
                        .filter(k => (enCost as Record<string, number | undefined>)[k])
                        .map(k => (
                          <MatChip
                            key={k}
                            label={ENLIGHTENMENT_MATERIALS[k].label}
                            qty={(enCost as Record<string, number>)[k]}
                            owned={MOCK_INVENTORY[k]}
                            color={ENLIGHTENMENT_MATERIALS[k].color}
                          />
                        ))
                      }
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '4px 0', color: '#475569', fontSize: 12, fontStyle: 'italic' }}>
                    Đã đạt Enlightenment tối đa
                  </div>
                )}
              </div>
            ) : (
              /* ── Level-up: 3 interactive material slots ── */
              <div style={{ padding: '10px 12px' }}>
                {/* Slot row */}
                <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
                  {MAT_DEFS.map(({ key, color, label, description }) => {
                    const owned     = MOCK_INVENTORY[key];
                    const qty       = matQty[key];
                    const isSel     = selectedMat === key;
                    const isFlash   = flashMat === key;
                    const showTip   = tooltipMat === key;
                    return (
                      <div
                        key={key}
                        ref={(el) => { slotRefs.current[key] = el; }}
                        onClick={() => handleSelectMat(key)}
                        onMouseEnter={() => handleSlotMouseEnter(key)}
                        onMouseLeave={handleSlotMouseLeave}
                        style={{
                          position: 'relative',
                          flex: 1,
                          height: 100,
                          borderRadius: 12,
                          background: isSel ? `${color}20` : `${color}0d`,
                          border: `2px solid ${isSel || isFlash ? color : `${color}44`}`,
                          boxShadow: isFlash
                            ? `0 0 20px ${color}99`
                            : isSel ? `0 0 10px ${color}44` : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'border-color 0.12s, box-shadow 0.12s, background 0.12s',
                          userSelect: 'none',
                        }}
                      >
                        {/* Placeholder icon */}
                        <span style={{
                          fontSize: 60,
                          color,
                          opacity: isSel ? 1 : 0.7,
                          filter: `drop-shadow(0 0 6px ${color}66)`,
                          transition: 'opacity 0.12s',
                          lineHeight: 1,
                        }}>
                          ◈
                        </span>

                        {/* Owned qty — bottom center */}
                        <span style={{
                          position: 'absolute', bottom: 4,
                          left: 0, right: 0, textAlign: 'center',
                          fontSize: 20, color: '#64748b', fontWeight: 700,
                          lineHeight: 1,
                        }}>
                          {owned}
                        </span>

                        {/* Selected qty badge — top right */}
                        {qty > 0 && (
                          <span style={{
                            position: 'absolute', top: 4, right: 5,
                            fontSize: 20, fontWeight: 800,
                            color: '#0a0f1e',
                            background: color,
                            borderRadius: 5, padding: '1px 5px',
                            minWidth: 22, textAlign: 'center',
                            lineHeight: 1.3,
                          }}>
                            {qty}
                          </span>
                        )}

                      </div>
                    );
                  })}
                </div>

                {/* Qty control row — only when a slot is selected */}
                {selectedMat && (() => {
                  const selDef  = MAT_DEFS.find(m => m.key === selectedMat)!;
                  const owned   = MOCK_INVENTORY[selectedMat];
                  const qty     = matQty[selectedMat];
                  const plusDis = qty >= owned || expIsFull;
                  const minusDis = qty <= 0;
                  const btnBase: React.CSSProperties = {
                    width: 32, height: 32, borderRadius: 8,
                    border: `1.5px solid ${selDef.color}55`,
                    fontSize: 18, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1, flexShrink: 0,
                  };
                  return (
                    <div style={{
                      position: 'relative',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8, marginTop: 10,
                    }}>
                      {/* Centered: − qty + */}
                      <button
                        onClick={() => adjustQty(selectedMat, -1)}
                        disabled={minusDis}
                        style={{
                          ...btnBase,
                          background: minusDis ? 'rgba(255,255,255,0.04)' : `${selDef.color}18`,
                          color: minusDis ? '#334155' : selDef.color,
                          cursor: minusDis ? 'not-allowed' : 'pointer',
                        }}
                      >
                        −
                      </button>
                      <div style={{
                        minWidth: 44, height: 32, borderRadius: 8,
                        border: `1.5px solid ${selDef.color}55`,
                        background: '#0a1122',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, fontWeight: 800, color: '#fff',
                      }}>
                        {qty}
                      </div>
                      <button
                        onClick={() => adjustQty(selectedMat, 1)}
                        disabled={plusDis}
                        style={{
                          ...btnBase,
                          background: plusDis ? 'rgba(255,255,255,0.04)' : `${selDef.color}18`,
                          color: plusDis ? '#334155' : selDef.color,
                          cursor: plusDis ? 'not-allowed' : 'pointer',
                        }}
                      >
                        +
                      </button>

                      {/* Tự động — pinned to right */}
                      <button
                        onClick={autoSelect}
                        style={{
                          position: 'absolute', right: 0,
                          padding: '5.5px 11px', borderRadius: 8,
                          border: '1.5px solid #475569',
                          background: 'rgba(255,255,255,0.06)',
                          color: '#94a3b8',
                          fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          letterSpacing: 0.3, whiteSpace: 'nowrap',
                        }}
                      >
                        Tự động
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Confirm row: left = gold preview, right = confirm button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Gold preview */}
            <div style={{
              flex: 1,
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '8px 10px', borderRadius: 10,
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid #1e293b',
              minWidth: 0,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🪙</span>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{
                  fontSize: 14, fontWeight: 800,
                  color: goldCost === 0 ? '#475569' : goldShort ? '#f87171' : '#fbbf24',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}>
                  {goldCost.toLocaleString()}
                </span>
                <span style={{ fontSize: 10, color: '#475569', lineHeight: 1 }}>Gold</span>
              </div>
            </div>

            {/* Confirm button — half width, right side */}
            <button
              onClick={onClose}
              style={{
                width: '50%', padding: '11px 20px',
                borderRadius: 10, border: 'none', flexShrink: 0,
                background: `linear-gradient(135deg, ${actionColor}, ${actionColor}cc)`,
                color: '#fff',
                fontWeight: 800, fontSize: 14, cursor: 'pointer',
                letterSpacing: 0.5,
                boxShadow: `0 4px 14px ${actionColor}44`,
              }}
            >
              {isEnlightenReady ? '✨ Khai Sáng' : 'Nâng cấp'}
            </button>
          </div>

        </div>

      </div>

      {/* Fixed tooltip — renders above all overflow:hidden ancestors */}
      {tooltipMat && tooltipPos && (() => {
        const def = MAT_DEFS.find(m => m.key === tooltipMat)!;
        return (
          <div
            style={{
              position: 'fixed',
              top: tooltipPos.y - 8,
              left: tooltipPos.x,
              transform: 'translateX(-50%) translateY(-100%)',
              zIndex: 9999,
              background: '#0f172a',
              border: `1px solid ${def.color}66`,
              borderRadius: 10,
              padding: '9px 13px',
              width: 210,
              boxShadow: `0 4px 20px rgba(0,0,0,0.8), 0 0 10px ${def.color}33`,
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
                border: `1px solid ${def.color}66`,
                transform: 'rotate(45deg) translateY(-7px)',
                borderRadius: 2,
              }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: def.color, marginBottom: 5, lineHeight: 1.2 }}>
              {def.label}
            </div>
            <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>
              {def.description}
            </div>
          </div>
        );
      })()}
    </>
  );
};

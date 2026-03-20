import React from 'react';
import { TIER_COLOR } from '../data/mockCharacters.ts';
import type { CharacterData } from '../data/mockCharacters.ts';

// ── Props ─────────────────────────────────────────────────────────────────────
interface SkillLvPopupProps {
  char: CharacterData;
  skillType: 'ultimate' | 'cpow';
  cpowId?: string;
  onClose: () => void;
}

// ── SkillLv Popup — compact centered modal ────────────────────────────────────
export const SkillLvPopup: React.FC<SkillLvPopupProps> = ({
  char,
  skillType,
  cpowId,
  onClose,
}) => {
  const tierColor = TIER_COLOR[char.tier];
  const ulti = char.ultimate;
  const ultiDupMilestone = char.dupMilestones.find((m) => m.rewardType === 'UltiLvUP');
  const pow = cpowId ? char.comboPowers.find((p) => p.id === cpowId) : undefined;

  const isUlti = skillType === 'ultimate';
  const headerIcon = isUlti ? '✦' : '⚡';
  const headerLabel = isUlti ? ulti.name : (pow?.label ?? '');
  const typeLabel = isUlti ? 'Ultimate' : 'Combo Power';
  const headerIconColor = isUlti ? '#fbbf24' : '#a78bfa';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.72)',
          zIndex: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        {/* Modal panel */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 340,
            maxHeight: '80vh',
            background: 'linear-gradient(180deg, #1a2035 0%, #0d1220 100%)',
            borderRadius: 16,
            border: `1.5px solid ${tierColor}55`,
            boxShadow: `0 24px 72px rgba(0,0,0,0.8), 0 0 40px ${tierColor}22`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* ── Header ── */}
          <div style={{
            padding: '16px 18px 14px',
            borderBottom: '1px solid #1e293b',
            flexShrink: 0,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{
                fontSize: 28,
                filter: `drop-shadow(0 0 6px ${headerIconColor})`,
              }}>
                {headerIcon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 800,
                  fontSize: 16,
                  color: isUlti ? '#fde68a' : '#c4b5fd',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}>
                  {headerLabel}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                  {typeLabel}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  border: 'none',
                  background: 'rgba(255,255,255,0.07)',
                  color: '#94a3b8',
                  fontSize: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>

            {/* ── ULTIMATE content ── */}
            {isUlti && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {([1, 2] as const).map((lv) => {
                  const isCurrent = lv === ulti.level;
                  return (
                    <div key={lv} style={{
                      borderRadius: 12,
                      padding: '14px 16px',
                      background: isCurrent ? `${tierColor}18` : '#0f172a',
                      border: `1.5px solid ${isCurrent ? tierColor : '#1e293b'}`,
                      opacity: lv > ulti.level ? 0.7 : 1,
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 8,
                      }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '2px 10px',
                          borderRadius: 6,
                          background: isCurrent ? tierColor : '#334155',
                          color: isCurrent && char.tier === 'A' ? '#1a1500' : '#fff',
                        }}>
                          Lv. {lv}
                        </span>
                        <span style={{
                          fontWeight: 700,
                          color: '#fde68a',
                          fontSize: 14,
                          flex: 1,
                        }}>
                          {ulti.name}
                        </span>
                        <span style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>
                          {lv === 1 ? ulti.magCost : ulti.magCostLv2} MAG
                        </span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.55 }}>
                        {lv === 1 ? ulti.description : ulti.descriptionLv2}
                      </div>

                      {/* Lv 2 unlock condition */}
                      {lv === 2 && ultiDupMilestone && (
                        <div style={{
                          marginTop: 12,
                          padding: '10px 12px',
                          borderRadius: 8,
                          background: ultiDupMilestone.unlocked ? '#14532d' : '#1a1a2e',
                          border: `1px solid ${ultiDupMilestone.unlocked ? '#16a34a' : '#334155'}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}>
                          <span style={{ fontSize: 16 }}>
                            {ultiDupMilestone.unlocked ? '✅' : '🔒'}
                          </span>
                          <div>
                            <div style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: ultiDupMilestone.unlocked ? '#4ade80' : '#94a3b8',
                            }}>
                              Điều kiện: Dup {ultiDupMilestone.dup}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              {ultiDupMilestone.unlocked
                                ? 'Đã mở khóa'
                                : `Cần thêm ${ultiDupMilestone.dup - char.dupLevel} bản copy`}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── COMBO POWER content ── */}
            {!isUlti && pow && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Lv 1 row */}
                <div style={{
                  borderRadius: 12,
                  padding: '12px 14px',
                  background: '#0f172a',
                  border: '1.5px solid #1e293b',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6,
                  }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 5,
                      background: '#334155',
                      color: '#fff',
                    }}>
                      Lv. 1
                    </span>
                    <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 14 }}>
                      {pow.label}
                    </span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5 }}>
                    {pow.description}
                  </div>
                </div>

                {/* C.Pow + row */}
                <div style={{
                  borderRadius: 12,
                  padding: '12px 14px',
                  background: pow.isPlus ? '#818cf822' : '#0f172a',
                  border: `1.5px solid ${pow.isPlus ? '#818cf8' : '#1e293b'}`,
                  opacity: pow.isPlus ? 1 : 0.75,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6,
                  }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 5,
                      background: pow.isPlus ? '#818cf8' : '#334155',
                      color: '#fff',
                    }}>
                      C.Pow +
                    </span>
                    <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 14 }}>
                      {pow.label}
                    </span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5 }}>
                    {pow.descriptionPlus}
                  </div>

                  {/* Unlock status */}
                  <div style={{
                    marginTop: 10,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: pow.isPlus ? '#14532d' : '#1a1a2e',
                    border: `1px solid ${pow.isPlus ? '#16a34a' : '#334155'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <span style={{ fontSize: 14 }}>
                      {pow.isPlus ? '✅' : '🔒'}
                    </span>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: pow.isPlus ? '#4ade80' : '#94a3b8',
                    }}>
                      {pow.isPlus
                        ? 'Đã mở khóa'
                        : 'Mở khoá bằng cách nhận thêm bản Dup'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Fallback if cpow not found */}
            {!isUlti && !pow && (
              <div style={{ color: '#64748b', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
                Không tìm thấy kỹ năng.
              </div>
            )}
          </div>

          {/* ── Footer close button ── */}
          <div style={{
            padding: '12px 18px 16px',
            borderTop: '1px solid #1e293b',
            flexShrink: 0,
          }}>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '10px 20px',
                borderRadius: 10,
                border: '1px solid #334155',
                background: 'rgba(255,255,255,0.05)',
                color: '#94a3b8',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

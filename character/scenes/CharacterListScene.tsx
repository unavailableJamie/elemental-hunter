import React, { useState } from 'react';
import { MOCK_CHARACTERS, TIER_COLOR, ELEMENT_COLOR } from '../data/mockCharacters.ts';
import type { Tier, Element } from '../data/mockCharacters.ts';
import { CharCard, EmptySlot } from '../components/CharCard.tsx';

interface CharacterListSceneProps {
  onBack: () => void;
  onSelectChar: (charId: string) => void;
  activeCharId: string;
}

type SortMode = 'rarity' | 'level';

const TIER_ORDER: Record<Tier, number> = { A: 0, B: 1, C: 2, D: 3 };
const ALL_TIERS: Tier[] = ['A', 'B', 'C', 'D'];
const ALL_ELEMENTS: Element[] = ['Fire', 'Ice', 'Grass', 'Rock'];
const ELEMENT_LABEL: Record<Element, string> = {
  Fire: '🔥 Fire', Ice: '❄️ Ice', Grass: '🌿 Grass', Rock: '🪨 Rock',
};

export const CharacterListScene: React.FC<CharacterListSceneProps> = ({ onBack, onSelectChar, activeCharId }) => {
  const [sortMode, setSortMode] = useState<SortMode>(
    () => (localStorage.getItem('charListSortMode') as SortMode) ?? 'rarity'
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingTiers, setPendingTiers] = useState<Tier[]>([]);
  const [pendingElems, setPendingElems] = useState<Element[]>([]);
  const [appliedTiers, setAppliedTiers] = useState<Tier[]>([]);
  const [appliedElems, setAppliedElems] = useState<Element[]>([]);

  const openFilter = () => {
    setPendingTiers([...appliedTiers]);
    setPendingElems([...appliedElems]);
    setFilterOpen(true);
  };

  const applyFilter = () => {
    setAppliedTiers([...pendingTiers]);
    setAppliedElems([...pendingElems]);
    setFilterOpen(false);
  };

  const toggleTier = (t: Tier) =>
    setPendingTiers((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const toggleElem = (e: Element) =>
    setPendingElems((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);

  const handleSort = (mode: SortMode) => {
    setSortMode(mode);
    localStorage.setItem('charListSortMode', mode);
  };

  const sorted = [...MOCK_CHARACTERS].sort((a, b) => {
    if (sortMode === 'rarity') {
      if (a.tier !== b.tier) return TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
      if (a.charLevel !== b.charLevel) return b.charLevel - a.charLevel;
      return a.name.localeCompare(b.name);
    } else {
      if (a.charLevel !== b.charLevel) return b.charLevel - a.charLevel;
      if (a.tier !== b.tier) return TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
      return a.name.localeCompare(b.name);
    }
  });

  const filtered = sorted.filter((c) => {
    const tierOk = appliedTiers.length === 0 || appliedTiers.includes(c.tier);
    const elemOk = appliedElems.length === 0 || appliedElems.includes(c.element);
    return tierOk && elemOk;
  });

  // Active char always first
  const displayed = [
    ...filtered.filter((c) => c.id === activeCharId),
    ...filtered.filter((c) => c.id !== activeCharId),
  ];

  const activeFilterCount = appliedTiers.length + appliedElems.length;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 24px 12px',
        background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 10, border: 'none',
          background: 'rgba(255,255,255,0.08)', color: '#e2e8f0',
          fontSize: 20, cursor: 'pointer', flexShrink: 0,
        }}>←</button>

        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: 0.5 }}>Nhân Vật</span>

        <div style={{ flex: 1 }} />

        {/* Sort buttons */}
        <div style={{
          display: 'flex', gap: 4,
          background: 'rgba(0,0,0,0.35)', borderRadius: 10, padding: 4,
        }}>
          {(['rarity', 'level'] as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleSort(mode)}
              style={{
                padding: '7px 16px', borderRadius: 8, border: 'none',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                background: sortMode === mode ? '#6366f1' : 'transparent',
                color: sortMode === mode ? '#fff' : '#64748b',
                transition: 'all 0.15s ease',
              }}
            >
              {mode === 'rarity' ? 'Độ Hiếm' : 'Cấp Độ'}
            </button>
          ))}
        </div>

        {/* Filter button — slightly separated */}
        <div style={{ width: 10 }} />
        <button
          onClick={openFilter}
          style={{
            width: 40, height: 40, borderRadius: 10,
            border: activeFilterCount > 0 ? '1px solid #6366f155' : '1px solid transparent',
            background: activeFilterCount > 0 ? '#6366f122' : 'rgba(255,255,255,0.08)',
            color: activeFilterCount > 0 ? '#818cf8' : '#94a3b8',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', flexShrink: 0,
          }}
        >
          {/* Funnel icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          {activeFilterCount > 0 && (
            <div style={{
              position: 'absolute', top: -5, right: -5,
              width: 18, height: 18, borderRadius: 99,
              background: '#6366f1', color: '#fff',
              fontSize: 10, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {activeFilterCount}
            </div>
          )}
        </button>
      </div>

      {/* ── Grid ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: 18,
        }}>
          {displayed.map((char) => (
            <CharCard key={char.id} char={char} onSelect={() => onSelectChar(char.id)} isActive={char.id === activeCharId} />
          ))}
          {activeFilterCount === 0 && Array.from({ length: Math.max(0, 6 - displayed.length) }).map((_, i) => (
            <EmptySlot key={`empty-${i}`} />
          ))}
        </div>
      </div>

      {/* ── Filter Panel ── */}
      {filterOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setFilterOpen(false)}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 50,
            }}
          />

          {/* Slide-in panel */}
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0,
            width: 280,
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            borderLeft: '1px solid #334155',
            zIndex: 51,
            display: 'flex', flexDirection: 'column',
            padding: '24px 20px',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.7)',
          }}>
            {/* Panel header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 28,
            }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>Bộ Lọc</span>
              <button
                onClick={() => setFilterOpen(false)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none',
                  background: 'rgba(255,255,255,0.08)', color: '#94a3b8',
                  fontSize: 16, cursor: 'pointer',
                }}
              >✕</button>
            </div>

            {/* Rarity filter */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                color: '#475569', textTransform: 'uppercase', marginBottom: 12,
              }}>
                Độ Hiếm
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ALL_TIERS.map((t) => {
                  const active = pendingTiers.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTier(t)}
                      style={{
                        padding: '8px 18px', borderRadius: 8, border: 'none',
                        fontWeight: 700, fontSize: 14, cursor: 'pointer',
                        background: active ? TIER_COLOR[t] : 'rgba(255,255,255,0.07)',
                        color: active ? '#fff' : '#64748b',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Hạng {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Element filter */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                color: '#475569', textTransform: 'uppercase', marginBottom: 12,
              }}>
                Nguyên Tố
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ALL_ELEMENTS.map((e) => {
                  const active = pendingElems.includes(e);
                  const col = ELEMENT_COLOR[e];
                  return (
                    <button
                      key={e}
                      onClick={() => toggleElem(e)}
                      style={{
                        padding: '8px 14px', borderRadius: 8,
                        border: active ? `1px solid ${col}88` : '1px solid rgba(255,255,255,0.07)',
                        fontWeight: 600, fontSize: 13, cursor: 'pointer',
                        background: active ? col + '33' : 'rgba(255,255,255,0.05)',
                        color: active ? col : '#64748b',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {ELEMENT_LABEL[e]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ flex: 1 }} />

            {/* Reset + Apply */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setPendingTiers([]); setPendingElems([]); }}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10,
                  border: '1px solid #334155',
                  background: 'transparent', color: '#64748b',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}
              >
                Xóa lọc
              </button>
              <button
                onClick={applyFilter}
                style={{
                  flex: 2, padding: '12px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                }}
              >
                Áp dụng lọc
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

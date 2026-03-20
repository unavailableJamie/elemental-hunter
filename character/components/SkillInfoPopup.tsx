// SkillInfoPopup — popup wrapper for SkillInfoPanel, mirrors LvlUpPopup structure
import React, { useRef } from 'react';
import { TIER_COLOR } from '../data/mockCharacters.ts';
import type { CharacterData } from '../data/mockCharacters.ts';
import { SkillInfoPanel } from './SkillInfoPanel.tsx';

interface SkillInfoPopupProps {
  char: CharacterData;
  initialIndex?: number;
  onClose: () => void;
  topOffset?: number;
}

export const SkillInfoPopup: React.FC<SkillInfoPopupProps> = ({
  char,
  initialIndex = 0,
  onClose,
  topOffset = 0,
}) => {
  const tierColor = TIER_COLOR[char.tier];
  const panelRef = useRef<HTMLDivElement>(null);

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

      {/* Panel — ref passed to SkillInfoPanel as swipe zone */}
      <div
        ref={panelRef}
        style={{
          position: 'absolute', right: 0, top: topOffset, bottom: 0, width: '33%',
          zIndex: 101,
          background: 'linear-gradient(180deg, #111827 0%, #0a0f1e 100%)',
          borderLeft: `2px solid ${tierColor}77`,
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          color: '#fff',
          boxShadow: '-6px 0 32px rgba(0,0,0,0.7)',
          cursor: 'grab',
        }}
      >
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 16px 20px' }}>
          <SkillInfoPanel char={char} initialIndex={initialIndex} swipeZoneRef={panelRef} />
        </div>
      </div>
    </>
  );
};

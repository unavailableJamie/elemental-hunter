import React from 'react';

// ── Overlay — centered modal ──────────────────────────────────────────────────
export const Overlay: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
  <div
    style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}
    onClick={onClose}
  >
    <div
      style={{
        width: 580, maxHeight: '82vh',
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: 20,
        padding: '32px 32px 36px',
        overflowY: 'auto',
        border: '1px solid #334155',
        boxShadow: '0 28px 80px rgba(0,0,0,0.8)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

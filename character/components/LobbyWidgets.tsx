import React from 'react';

// ── Currency Pill ────────────────────────────────────────────────────────────
export const CurrencyPill: React.FC<{ icon: string; amount: string }> = ({ icon, amount }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 5,
    background: 'rgba(0,0,0,0.3)', borderRadius: 99,
    padding: '4px 12px 4px 6px',
    border: '1px solid rgba(255,255,255,0.1)',
    fontSize: 14, fontWeight: 700, color: '#e2e8f0',
  }}>
    <span style={{ fontSize: 17 }}>{icon}</span>
    {amount}
  </div>
);

// ── Lobby Button ─────────────────────────────────────────────────────────────
export const LobbyBtn: React.FC<{
  icon: string; label: string; color: string;
  onClick?: () => void; highlight?: boolean;
}> = ({ icon, label, color, onClick, highlight }) => (
  <button
    onClick={onClick}
    style={{
      borderRadius: 14, border: highlight ? `2px solid ${color}` : '2px solid transparent',
      background: highlight
        ? `linear-gradient(135deg, ${color}33, ${color}22)`
        : 'rgba(0,0,0,0.4)',
      padding: '12px 14px', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
      width: '100%',
      boxShadow: highlight ? `0 0 22px ${color}44` : 'none',
      transition: 'all 0.15s ease',
    }}
  >
    <span style={{ fontSize: 28 }}>{icon}</span>
    <span style={{
      fontSize: 13, fontWeight: 700,
      color: highlight ? color : '#e2e8f0',
      letterSpacing: 0.3,
    }}>{label}</span>
  </button>
);

// ── Small Button ─────────────────────────────────────────────────────────────
export const SmallBtn: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
    borderRadius: 12, padding: '10px 16px',
    background: 'rgba(0,0,0,0.35)',
    border: '1px solid rgba(255,255,255,0.08)',
    width: '100%',
  }}>
    <span style={{ fontSize: 22 }}>{icon}</span>
    <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{label}</span>
  </div>
);

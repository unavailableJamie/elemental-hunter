import React from 'react';
import { CurrencyPill, LobbyBtn, SmallBtn } from '../components/LobbyWidgets.tsx';
import { CHAR_IMAGE } from './CharacterInfoScene.tsx';

const CHAR_EMOJI: Record<string, string> = {
  pillow: '🐭', kira: '🦊', mucklepuff: '🌑',
  zara: '🧜', luxar: '⭐', vex: '🪨',
};

interface LobbySceneProps {
  onOpenInventory: () => void;
  onBattle: () => void;
  activeCharId?: string;
}

export const LobbyScene: React.FC<LobbySceneProps> = ({ onOpenInventory, onBattle, activeCharId = 'pillow' }) => {
  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(160deg, #4c1d95 0%, #5b21b6 30%, #3730a3 60%, #1e1b4b 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#fff',
      overflow: 'hidden',
    }}>

      {/* ── Top Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 32px 12px',
        background: 'rgba(0,0,0,0.25)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        {/* Player avatar */}
        <div style={{
          width: 52, height: 52, borderRadius: 13,
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          border: '2px solid #fde68a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, flexShrink: 0,
        }}>🧙</div>

        {/* Player info */}
        <div style={{ minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{
              background: '#fbbf24', color: '#000',
              fontSize: 12, fontWeight: 800, padding: '2px 7px', borderRadius: 5,
            }}>99</span>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Tên Người Chơi</span>
            <span style={{ fontSize: 15 }}>🔥💧🌿</span>
          </div>
          <div style={{
            height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.15)', width: 200,
          }}>
            <div style={{
              height: '100%', width: '42%', borderRadius: 99,
              background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
            }} />
          </div>
        </div>

        {/* Currencies */}
        <div style={{ display: 'flex', gap: 12, marginLeft: 20 }}>
          <CurrencyPill icon="🟢" amount="5,678,990" />
          <CurrencyPill icon="🟡" amount="5,678,990" />
        </div>

        <div style={{ flex: 1 }} />

        {/* Notification icons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {(['✉️', '📣', '📋'] as string[]).map((icon, i) => (
            <div key={i} style={{
              width: 42, height: 42, borderRadius: 10,
              background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, cursor: 'pointer', position: 'relative',
            }}>
              {icon}
              {i === 0 && (
                <div style={{
                  position: 'absolute', top: -3, right: -3,
                  width: 10, height: 10, borderRadius: 99,
                  background: '#ef4444',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Hamburger */}
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: 'rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 18, marginLeft: 6,
        }}>☰</div>
      </div>

      {/* ── Main Area ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left Column: Nav Buttons */}
        <div style={{
          width: 180, padding: '24px 16px',
          display: 'flex', flexDirection: 'column', gap: 12,
          background: 'rgba(0,0,0,0.15)',
          flexShrink: 0,
        }}>
          <LobbyBtn icon="🏪" label="SHOP" color="#f59e0b" />
          <LobbyBtn icon="🎲" label="Triệu Hồi" color="#8b5cf6" />
          <LobbyBtn
            icon="👥" label="Nhân Vật"
            color="#10b981"
            onClick={onOpenInventory}
            highlight
          />
          {/* Energy */}
          <div style={{
            borderRadius: 14, padding: '12px 14px',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid #1e3a2f',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 26, marginBottom: 4 }}>⚡</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#4ade80' }}>128</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>/ 3000</div>
          </div>
        </div>

        {/* Center: Character Art */}
        <div style={{
          flex: 1, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            textAlign: 'center',
            transform: 'translateY(-24px)',
          }}>
            <div style={{
              width: 160, height: 32, borderRadius: 99, margin: '0 auto',
              background: 'rgba(0,0,0,0.3)',
              filter: 'blur(14px)',
              marginBottom: -20,
            }} />
            {CHAR_IMAGE[activeCharId] ? (
              <img
                src={CHAR_IMAGE[activeCharId]}
                alt={activeCharId}
                style={{
                  height: 570,
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 12px 36px rgba(0,0,0,0.5))',
                  animation: 'charFloat 3s ease-in-out infinite',
                }}
              />
            ) : (
              <span style={{
                fontSize: 200,
                filter: 'drop-shadow(0 12px 36px rgba(0,0,0,0.5))',
                lineHeight: 1,
                animation: 'charFloat 3s ease-in-out infinite',
              }}>
                {CHAR_EMOJI[activeCharId] ?? '❓'}
              </span>
            )}
            <style>{`
              @keyframes charFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-16px); }
              }
            `}</style>
          </div>
        </div>

        {/* Right Column: Secondary Actions */}
        <div style={{
          width: 220, padding: '24px 16px',
          display: 'flex', flexDirection: 'column', gap: 12,
          background: 'rgba(0,0,0,0.15)',
          flexShrink: 0,
        }}>
          <SmallBtn icon="📋" label="Khảo sát" />
          <SmallBtn icon="🎁" label="Quà 7 ngày" />
          <SmallBtn icon="🎀" label="Tân Thủ" />
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 32px 18px',
        background: 'rgba(0,0,0,0.3)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        {/* Event banner — bottom-left */}
        <div style={{
          borderRadius: 14, padding: '12px 18px',
          background: 'rgba(0,0,0,0.45)',
          border: '1px solid rgba(251,191,36,0.3)',
          display: 'flex', alignItems: 'center', gap: 14,
          minWidth: 320,
        }}>
          <div style={{ fontSize: 32, flexShrink: 0 }}>🏆</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>
              ⚠️ Sự kiện kết thúc sau:{' '}
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>23h 48p</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fde68a', letterSpacing: 0.5, marginBottom: 6 }}>
              ĐẤU TRƯỜNG DANH VỌNG
            </div>
            <div style={{ height: 5, borderRadius: 99, background: '#1e293b' }}>
              <div style={{
                height: '100%', width: '80%', borderRadius: 99,
                background: 'linear-gradient(90deg, #60a5fa, #3b82f6)',
              }} />
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Skill usage — right of center */}
        <div style={{
          borderRadius: 12, padding: '10px 18px',
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid #1e293b',
          fontSize: 13, color: '#94a3b8',
          flexShrink: 0,
        }}>
          Dùng <span style={{ color: '#fbbf24', fontWeight: 700 }}>5/5</span> lần thẻ Kỹ Năng
        </div>

        {/* Chiến ngay — bottom-right */}
        <button
          onClick={onBattle}
          style={{
            padding: '18px 56px', borderRadius: 16, border: 'none',
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            color: '#000', fontWeight: 800, fontSize: 22,
            cursor: 'pointer', letterSpacing: 1,
            boxShadow: '0 4px 28px rgba(251,191,36,0.6)',
            display: 'flex', alignItems: 'center', gap: 10,
            flexShrink: 0,
          }}
        >
          CHIẾN NGAY 🎲
        </button>
      </div>
    </div>
  );
};


import React from 'react';
import type { ActionType, HintTier, AdaptiveHighlightState } from '@tutorial/types.ts';

interface TutorialOverlayProps {
  highlightState: AdaptiveHighlightState;
  isBotTurn: boolean;
  onAutoPerform: (action: ActionType) => void;
  onDismissTier3: () => void;
}

const HINT_TEXTS: Record<ActionType, { tier2: string; tier3Title: string; tier3Body: string }> = {
  rollDice: {
    tier2: 'Bấm vào NÚT XÚC XẮC để bắt đầu lượt',
    tier3Title: 'Đổ Xúc Xắc',
    tier3Body: 'Bấm nút "Đổ Xúc Xắc" để tung 2 viên xúc xắc. Kết quả xác định số bước ngựa di chuyển.',
  },
  selectToken: {
    tier2: 'Chọn 1 NGỰA sáng vàng để di chuyển',
    tier3Title: 'Chọn Ngựa',
    tier3Body: 'Click vào một trong các con ngựa được highlight màu vàng để chọn ngựa di chuyển.',
  },
  useArtifact: {
    tier2: 'Chọn 1 Artifact để tương tác Element Queue',
    tier3Title: 'Sử dụng Artifact',
    tier3Body: 'Bạn đáp xuống ô trống! Chọn 1 trong 3 Artifact để tác động lên hàng đợi nguyên tố của bạn.',
  },
  activateUltimate: {
    tier2: 'Bấm Ultimate để đổi 50 Mana lấy 1 lượt đổ thêm',
    tier3Title: 'Kích Hoạt Ultimate',
    tier3Body: 'Bạn có đủ 50 Mana! Bấm nút Ultimate để nhận thêm 1 lượt đổ xúc xắc trong turn này.',
  },
};

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  highlightState,
  isBotTurn,
  onAutoPerform,
  onDismissTier3,
}) => {
  const { hintTier, currentAction, highlightDisabled } = highlightState;

  if (isBotTurn) return null;

  const showHighlight = hintTier >= 1 && !highlightDisabled[currentAction];
  const showTooltip  = hintTier >= 2 && !highlightDisabled[currentAction];
  const showModal    = hintTier >= 3 && !highlightDisabled[currentAction];

  const hints = HINT_TEXTS[currentAction];

  return (
    <>
      {/* Tier 2: Tooltip — positioned at top-center */}
      {showTooltip && !showModal && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-amber-900/90 border border-amber-500/60 rounded-xl px-4 py-2.5 shadow-xl text-amber-200 text-sm font-medium animate-bounce">
            💡 {hints.tier2}
          </div>
        </div>
      )}

      {/* Tier 3: Modal + "Làm hộ tôi" */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-amber-500/40 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="text-center text-3xl mb-3">💡</div>
            <h3 className="text-lg font-black uppercase tracking-wider text-center text-amber-300 mb-3">
              {hints.tier3Title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed text-center mb-5">
              {hints.tier3Body}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { onDismissTier3(); }}
                className="w-full py-2.5 bg-amber-700 hover:bg-amber-600 text-white font-black rounded-xl uppercase tracking-wider transition-all text-sm"
              >
                Tôi tự làm!
              </button>
              <button
                onClick={() => {
                  // "Làm hộ tôi" — auto-perform nhưng KHÔNG tính consecutiveCorrect
                  onAutoPerform(currentAction);
                  onDismissTier3();
                }}
                className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 text-orange-300 font-bold rounded-xl transition-all text-sm border border-orange-700/40"
              >
                🤖 Làm hộ tôi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invisible marker: used by CSS selectors for highlight targets */}
      {showHighlight && (
        <style>{`
          .tut-highlight-target {
            box-shadow: 0 0 0 3px rgba(251,191,36,0.8), 0 0 16px rgba(251,191,36,0.4) !important;
            animation: tutHighlight 0.9s ease-in-out infinite !important;
          }
          @keyframes tutHighlight {
            0%, 100% { box-shadow: 0 0 0 3px rgba(251,191,36,0.8), 0 0 16px rgba(251,191,36,0.4); }
            50%       { box-shadow: 0 0 0 5px rgba(251,191,36,0.5), 0 0 24px rgba(251,191,36,0.2); }
          }
        `}</style>
      )}
    </>
  );
};

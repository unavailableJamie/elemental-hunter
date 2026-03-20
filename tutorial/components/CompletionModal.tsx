import React from 'react';

interface CompletionModalProps {
  onPlayNew: () => void;
  onReplay: () => void;
  onMenu: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ onPlayNew, onReplay, onMenu }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
    <div className="bg-gray-900 border border-emerald-500/40 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-emerald-900/30 animate-[fadeInScale_0.3s_ease]">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🏆</div>
        <h2 className="text-2xl font-black text-emerald-300 uppercase tracking-wider">
          Tutorial Hoàn Thành!
        </h2>
        <p className="text-gray-400 text-sm mt-2">Bạn đã sẵn sàng cho ván đấu thật.</p>
      </div>

      <div className="space-y-2 mb-6">
        {[
          { icon: '✓', text: 'Movement & Combat', color: 'text-emerald-400' },
          { icon: '✓', text: 'Element & Combo',   color: 'text-emerald-400' },
          { icon: '✓', text: 'Artifact & Ultimate', color: 'text-emerald-400' },
        ].map(({ icon, text, color }) => (
          <div key={text} className="flex items-center gap-3 bg-gray-800/50 rounded-xl px-4 py-2.5">
            <span className={`font-black text-lg ${color}`}>{icon}</span>
            <span className="text-white text-sm font-medium">{text}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={onPlayNew}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl uppercase tracking-wider transition-all text-sm shadow-lg shadow-emerald-900/40"
        >
          🎮 Chơi Ván Mới
        </button>
        <div className="flex gap-2">
          <button
            onClick={onReplay}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-indigo-300 font-bold rounded-xl transition-all text-xs border border-white/5"
          >
            🔄 Xem Lại Tutorial
          </button>
          <button
            onClick={onMenu}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold rounded-xl transition-all text-xs border border-white/5"
          >
            ← Quay Về Menu
          </button>
        </div>
      </div>
    </div>
  </div>
);

import React from 'react';

interface WelcomeModalProps {
  onStart: () => void;
  onSkip: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onStart, onSkip }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div className="bg-gray-900 border border-indigo-500/40 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-indigo-900/30">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🐴</div>
        <h2 className="text-2xl font-black text-indigo-300 uppercase tracking-wider">
          Chào mừng đến Elemental Hunter!
        </h2>
        <p className="text-gray-400 text-sm mt-2">Học cách chơi qua 2 ván tutorial (~8-10 phút)</p>
      </div>

      <div className="space-y-3 mb-6 text-sm">
        <div className="flex items-start gap-3 bg-gray-800/60 rounded-xl p-3 border border-white/5">
          <span className="text-2xl">1️⃣</span>
          <div>
            <p className="font-bold text-white">Ván 1: Cơ bản (~4-5 phút)</p>
            <p className="text-gray-400">Di chuyển ngựa · Thu thập nguyên tố · Chiến đấu</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-gray-800/60 rounded-xl p-3 border border-white/5">
          <span className="text-2xl">2️⃣</span>
          <div>
            <p className="font-bold text-white">Ván 2: Nâng cao (~4-5 phút)</p>
            <p className="text-gray-400">Combo · Artifact · Ultimate · Power Roll</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onStart}
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl uppercase tracking-wider transition-all text-sm shadow-lg shadow-indigo-900/40"
        >
          Bắt đầu
        </button>
        <button
          onClick={onSkip}
          className="px-5 py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold rounded-xl transition-all text-sm border border-white/5"
        >
          Bỏ qua
        </button>
      </div>
    </div>
  </div>
);

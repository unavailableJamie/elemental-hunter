import React from 'react';
import { LEVEL_CONFIGS, GameLevel } from '../config/levels.ts';
import { Zap } from 'lucide-react';

interface LevelSelectProps {
  onLevelSelect: (level: GameLevel) => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({ onLevelSelect, onCancel, showCancelButton = false }) => {
  const levels: GameLevel[] = ['Lv1', 'Lv2', 'Lv3'];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[150]">
      {/* Main Container - Styled Popup */}
      <div className="max-w-4xl w-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-purple-500/30 shadow-2xl p-8 max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        {showCancelButton && onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
            ELEMENTAL QUEST
          </h1>
          <p className="text-xl text-purple-200">Choose Your Challenge Level</p>
        </div>

        {/* Level Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {levels.map((level) => {
            const config = LEVEL_CONFIGS[level];
            const isDisabled = false;

            return (
              <button
                key={level}
                onClick={() => !isDisabled && onLevelSelect(level)}
                disabled={isDisabled}
                className={`relative group transition-all duration-300 ${
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105 active:scale-95'
                }`}
              >
                {/* Card Background */}
                <div
                  className={`p-6 rounded-xl border-2 ${
                    level === 'Lv1'
                      ? 'border-green-400 bg-gradient-to-b from-green-900/30 to-green-900/10'
                      : level === 'Lv2'
                      ? 'border-yellow-400 bg-gradient-to-b from-yellow-900/30 to-yellow-900/10'
                      : 'border-red-400 bg-gradient-to-b from-red-900/30 to-red-900/10'
                  } ${isDisabled ? 'bg-opacity-50' : ''}`}
                >
                  {/* Level Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className={`text-2xl font-black ${
                        level === 'Lv1'
                          ? 'text-green-300'
                          : level === 'Lv2'
                          ? 'text-yellow-300'
                          : 'text-red-300'
                      }`}
                    >
                      {config.name}
                    </h2>
                    {!isDisabled && (
                      <Zap
                        className={`w-6 h-6 ${
                          level === 'Lv1'
                            ? 'text-green-400'
                            : level === 'Lv2'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}
                      />
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-300 mb-4 text-left">
                    {config.description}
                  </p>

                  {/* Stats */}
                  <div className="space-y-2 text-left text-xs text-slate-300 border-t border-slate-600 pt-4">
                    <div className="flex justify-between">
                      <span>HP per Player:</span>
                      <span className="font-bold text-white">{config.playerHP}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Combo Tiers:</span>
                      <span className="font-bold text-white">
                        {config.maxComboTiers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Artifact Slots:</span>
                      <span className="font-bold text-white">
                        {config.artifactSlots}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Rounds:</span>
                      <span className="font-bold text-white">
                        {config.maxRounds}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Hover Glow */}
                {!isDisabled && (
                  <div
                    className={`absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity ${
                      level === 'Lv1'
                        ? 'bg-green-400'
                        : level === 'Lv2'
                        ? 'bg-yellow-400'
                        : 'bg-red-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center text-sm text-slate-300">
          <p>
            ⚡ <span className="text-cyan-300 font-bold">Pro Tip:</span> Start with Lv.1
            to learn the mechanics, then challenge yourself with higher levels!
          </p>
        </div>
      </div>
    </div>
  );
};

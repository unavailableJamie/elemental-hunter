
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TileType } from '../types.ts';
import { ElementIcon } from './PlayerInfo.tsx';
import { ELEMENTAL_TILES } from '../constants.ts';

interface GoalRewardPopupProps {
    onSelect: (element: TileType) => void;
    playerName: string;
    elementQueue: TileType[];
}

export const GoalRewardPopup: React.FC<GoalRewardPopupProps> = ({ onSelect, playerName, elementQueue }) => {
    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[250] flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-zinc-900 border-2 border-yellow-500/50 w-full max-w-md rounded-[2.5rem] shadow-[0_0_100px_rgba(234,179,8,0.3)] overflow-hidden flex flex-col p-8 text-center"
                >
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(234,179,8,0.5)] animate-bounce">
                            <svg viewBox="0 0 24 24" className="w-12 h-12 fill-zinc-900">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">Goal Reached!</h2>
                        <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">
                            {playerName}, choose your elemental reward
                        </p>
                    </div>

                    {/* Current Queue Display */}
                    <div className="mb-6 space-y-2">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Your Current Queue</h3>
                        <div className="flex justify-center gap-2 bg-black/20 p-3 rounded-2xl border border-white/5">
                            {elementQueue.length > 0 ? (
                                elementQueue.map((type, i) => (
                                    <div key={i} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
                                        <ElementIcon type={type} sizeOverride="w-5 h-5" />
                                    </div>
                                ))
                            ) : (
                                <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Empty</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {ELEMENTAL_TILES.map((type) => (
                            <button
                                key={type}
                                onClick={() => onSelect(type)}
                                className="group relative bg-zinc-800 hover:bg-zinc-700 border border-white/5 hover:border-yellow-500/50 p-6 rounded-3xl transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-3"
                            >
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-yellow-500/20 transition-all">
                                    <ElementIcon type={type} sizeOverride="w-10 h-10" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                                    {type}
                                </span>
                            </button>
                        ))}
                    </div>

                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                        Reward will be added to your element queue
                    </p>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

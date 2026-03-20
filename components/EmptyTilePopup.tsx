
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, RefreshCw, Zap, X, Minus, Maximize2 } from 'lucide-react';
import { TileType, GameState } from '../types.ts';
import { ElementIcon } from './PlayerInfo.tsx';
import { ELEMENTAL_TILES } from '../constants.ts';
import { LEVEL_CONFIGS } from '../config/levels.ts';
import {
    ARTIFACT_SWAP_THRESHOLD,
    ARTIFACT_CHANGE_THRESHOLD,
    ARTIFACT_CHARGE_THRESHOLD,
} from '../config/balance.ts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EmptyTilePopupProps {
    gameState: GameState;
    onResolve: (updatedQueue: TileType[]) => void;
    onSkip: () => void;
    onMinimize: (minimized: boolean) => void;
}

type ItemType = 'SWAP' | 'CHANGE' | 'CHARGE' | null;

export const EmptyTilePopup: React.FC<EmptyTilePopupProps> = ({
    gameState,
    onResolve,
    onSkip,
    onMinimize
}) => {
    const player = gameState.players[gameState.currentPlayerId];
    const visits = player.emptyTileVisits;
    const [selectedItem, setSelectedItem] = useState<ItemType>(null);
    const [tempQueue, setTempQueue] = useState<TileType[]>([...player.elementQueue]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const isMinimized = gameState.isEmptyTilePopupMinimized;
    const levelConfig = LEVEL_CONFIGS[gameState.selectedLevel];
    const maxArtifactSlots = levelConfig.artifactSlots;

    const unlockedItems = {
        item1: visits >= ARTIFACT_SWAP_THRESHOLD   && maxArtifactSlots >= 1,
        item2: visits >= ARTIFACT_CHANGE_THRESHOLD && maxArtifactSlots >= 2,
        item3: visits >= ARTIFACT_CHARGE_THRESHOLD && maxArtifactSlots >= 3
    };

    const handleSwap = (idx: number) => {
        if (idx >= tempQueue.length - 1) return;
        const newQueue = [...tempQueue];
        [newQueue[idx], newQueue[idx + 1]] = [newQueue[idx + 1], newQueue[idx]];
        setTempQueue(newQueue);
        onResolve(newQueue);
    };

    const handleChange = (idx: number, newType: TileType) => {
        const newQueue = [...tempQueue];
        newQueue[idx] = newType;
        setTempQueue(newQueue);
        onResolve(newQueue);
    };

    const handleCharge = () => {
        const newQueue = [...tempQueue];
        newQueue.push(player.elementAffinity);
        if (newQueue.length > player.config.maxElementQueue) {
            newQueue.shift();
        }
        setTempQueue(newQueue);
        onResolve(newQueue);
    };

    if (isMinimized) {
        return (
            <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => onMinimize(false)}
                className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-2xl z-[200] flex items-center gap-2 font-bold hover:bg-indigo-700 transition-colors"
            >
                <Maximize2 size={20} />
                <span>Return to Item Menu</span>
            </motion.button>
        );
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-indigo-600 p-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Empty Tile Discovery</h2>
                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest opacity-80">
                                Visit #{visits} • {unlockedItems.item3 ? 'All Items Unlocked' : unlockedItems.item2 ? '2 Items Unlocked' : '1 Item Unlocked'}
                            </p>
                        </div>
                        <button 
                            onClick={() => onMinimize(true)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                        >
                            <Minus size={24} />
                        </button>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Current Queue Display */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Current Element Queue</h3>
                            <div className="flex items-center gap-3 bg-black/40 p-4 rounded-2xl border border-white/5 overflow-x-auto min-h-[80px]">
                                {tempQueue.length === 0 && (
                                    <span className="text-zinc-600 italic text-sm">Queue is empty...</span>
                                )}
                                {tempQueue.map((type, i) => (
                                    <div key={i} className="relative group">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg transition-all",
                                            selectedIndex === i && "ring-4 ring-indigo-500 scale-110"
                                        )}>
                                            <ElementIcon type={type} sizeOverride="w-8 h-8" />
                                        </div>
                                        <div className="absolute -top-2 -right-2 bg-zinc-800 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white/10">
                                            {i + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Item Selection - Only show items available for this level */}
                        <div className={`grid gap-4 ${maxArtifactSlots === 1 ? 'grid-cols-1' : maxArtifactSlots === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                            {/* Item 1: Swap */}
                            {maxArtifactSlots >= 1 && (
                                <button
                                    disabled={!unlockedItems.item1}
                                    onClick={() => setSelectedItem(selectedItem === 'SWAP' ? null : 'SWAP')}
                                    className={cn(
                                        "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all",
                                        selectedItem === 'SWAP'
                                            ? "bg-indigo-500/20 border-indigo-500 text-white"
                                            : "bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-800",
                                        !unlockedItems.item1 && "opacity-50 grayscale cursor-not-allowed bg-zinc-900/80"
                                    )}
                                >
                                    <ArrowLeftRight size={32} className={unlockedItems.item1 ? "text-indigo-400" : "text-zinc-600"} />
                                    <div className="text-center">
                                        <p className={cn("text-sm font-black uppercase tracking-tighter", unlockedItems.item1 ? "text-white" : "text-zinc-500")}>Item 1: Swap</p>
                                        <p className="text-[11px] font-bold opacity-80 mt-1">Swap two adjacent elements in your queue.</p>
                                        {!unlockedItems.item1 && (
                                            <p className="text-[10px] font-black text-amber-500 mt-2 uppercase tracking-widest bg-amber-500/10 py-1 rounded-md border border-amber-500/20">Locked: Land on 1 empty tile</p>
                                        )}
                                    </div>
                                </button>
                            )}

                            {/* Item 2: Change */}
                            {maxArtifactSlots >= 2 && (
                                <button
                                    disabled={!unlockedItems.item2}
                                    onClick={() => setSelectedItem(selectedItem === 'CHANGE' ? null : 'CHANGE')}
                                    className={cn(
                                        "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all",
                                        selectedItem === 'CHANGE'
                                            ? "bg-emerald-500/20 border-emerald-500 text-white"
                                            : "bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-800",
                                        !unlockedItems.item2 && "opacity-50 grayscale cursor-not-allowed bg-zinc-900/80"
                                    )}
                                >
                                    <RefreshCw size={32} className={unlockedItems.item2 ? "text-emerald-400" : "text-zinc-600"} />
                                    <div className="text-center">
                                        <p className={cn("text-sm font-black uppercase tracking-tighter", unlockedItems.item2 ? "text-white" : "text-zinc-500")}>Item 2: Change</p>
                                        <p className="text-[11px] font-bold opacity-80 mt-1">Change one element to any other type.</p>
                                        {!unlockedItems.item2 && (
                                            <p className="text-[10px] font-black text-amber-500 mt-2 uppercase tracking-widest bg-amber-500/10 py-1 rounded-md border border-amber-500/20">Locked: Visit {ARTIFACT_CHANGE_THRESHOLD - visits} more empty tiles</p>
                                        )}
                                    </div>
                                </button>
                            )}

                            {/* Item 3: Charge */}
                            {maxArtifactSlots >= 3 && (
                                <button
                                    disabled={!unlockedItems.item3}
                                    onClick={() => setSelectedItem(selectedItem === 'CHARGE' ? null : 'CHARGE')}
                                    className={cn(
                                        "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all",
                                        selectedItem === 'CHARGE'
                                            ? "bg-amber-500/20 border-amber-500 text-white"
                                            : "bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-800",
                                        !unlockedItems.item3 && "opacity-50 grayscale cursor-not-allowed bg-zinc-900/80"
                                    )}
                                >
                                    <Zap size={32} className={unlockedItems.item3 ? "text-amber-400" : "text-zinc-600"} />
                                    <div className="text-center">
                                        <p className={cn("text-sm font-black uppercase tracking-tighter", unlockedItems.item3 ? "text-white" : "text-zinc-500")}>Item 3: Charge</p>
                                        <p className="text-[11px] font-bold opacity-80 mt-1">Add your affinity element to the end of the queue.</p>
                                        {!unlockedItems.item3 && (
                                            <p className="text-[10px] font-black text-amber-500 mt-2 uppercase tracking-widest bg-amber-500/10 py-1 rounded-md border border-amber-500/20">Locked: Visit {ARTIFACT_CHARGE_THRESHOLD - visits} more empty tiles</p>
                                        )}
                                    </div>
                                </button>
                            )}
                        </div>

                        {/* Item Interaction Area */}
                        <div className="min-h-[140px] bg-black/20 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center">
                            {!selectedItem ? (
                                <p className="text-zinc-500 text-sm font-medium italic">Select an unlocked item to modify your queue</p>
                            ) : (
                                <div className="w-full space-y-4">
                                    {selectedItem === 'SWAP' && (
                                        <div className="space-y-4">
                                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Select a pair to swap</p>
                                            <div className="flex flex-wrap justify-center gap-2">
                                                {tempQueue.map((_, i) => i < tempQueue.length - 1 && (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleSwap(i)}
                                                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black px-3 py-2 rounded-lg transition-colors"
                                                    >
                                                        Swap {i+1} & {i+2}
                                                    </button>
                                                ))}
                                                {tempQueue.length < 2 && <p className="text-zinc-600 text-xs">Need at least 2 elements to swap</p>}
                                            </div>
                                        </div>
                                    )}

                                    {selectedItem === 'CHANGE' && (
                                        <div className="space-y-4">
                                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                                                {selectedIndex === null ? 'Select an element to change' : 'Choose new element type'}
                                            </p>
                                            <div className="flex flex-wrap justify-center gap-4">
                                                {selectedIndex === null ? (
                                                    tempQueue.map((type, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setSelectedIndex(i)}
                                                            className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                                        >
                                                            <ElementIcon type={type} sizeOverride="w-8 h-8" />
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="flex items-center gap-4">
                                                        {ELEMENTAL_TILES.filter(t => t !== tempQueue[selectedIndex]).map(type => (
                                                            <button
                                                                key={type}
                                                                onClick={() => {
                                                                    handleChange(selectedIndex, type);
                                                                    setSelectedIndex(null);
                                                                }}
                                                                className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                                            >
                                                                <ElementIcon type={type} sizeOverride="w-8 h-8" />
                                                            </button>
                                                        ))}
                                                        <button 
                                                            onClick={() => setSelectedIndex(null)}
                                                            className="text-zinc-500 hover:text-white transition-colors"
                                                        >
                                                            <X size={24} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {selectedItem === 'CHARGE' && (
                                        <div className="space-y-4">
                                            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                                                Add <span className="text-white">{player.elementAffinity}</span> to the end of queue:
                                            </p>
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                                                    <ElementIcon type={player.elementAffinity} sizeOverride="w-4 h-4" />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleCharge()}
                                                className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black px-6 py-2 rounded-lg transition-colors"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 bg-zinc-800/50 border-t border-white/5 flex justify-end gap-4">
                        <button
                            onClick={onSkip}
                            className="px-6 py-3 text-zinc-400 hover:text-white font-black uppercase text-xs tracking-widest transition-colors"
                        >
                            Do not use item
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

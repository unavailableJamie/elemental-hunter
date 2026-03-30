
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TileType } from '../types.ts';
import { ElementIcon } from './PlayerInfo.tsx';

// Rock → Ice → Grass → Fire, matching the goal path order
const ELEMENT_SEQUENCE = [TileType.Rock, TileType.Ice, TileType.Grass, TileType.Fire];

const ELEMENT_META: Record<string, { color: string; glow: string; label: string }> = {
    rock:  { color: '#57534E', glow: '#A8A29E', label: 'Rock' },
    ice:   { color: '#0369A1', glow: '#7DD3FC', label: 'Ice' },
    grass: { color: '#15803D', glow: '#4ADE80', label: 'Grass' },
    fire:  { color: '#B91C1C', glow: '#FCA5A5', label: 'Fire' },
};

interface GoalRewardPopupProps {
    onSelect: (element: TileType) => void;
    playerName: string;
}

export const GoalRewardPopup: React.FC<GoalRewardPopupProps> = ({ onSelect, playerName }) => {
    // After icons fly in and settle, enable interaction
    const [landed, setLanded] = useState(false);
    const [selected, setSelected] = useState<TileType | null>(null);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        // 4 icons × 120ms stagger + ~700ms spring settle
        const t = setTimeout(() => setLanded(true), 1000);
        return () => clearTimeout(t);
    }, []);

    const handleSelect = (element: TileType) => {
        if (!landed || selected) return;
        setSelected(element);
        // Impact animation plays for ~500ms, then dismiss
        setTimeout(() => {
            setExiting(true);
            setTimeout(() => onSelect(element), 350);
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-[250] pointer-events-none overflow-hidden">
            {/* Bottom gradient backdrop — only the lower half */}
            <motion.div
                className="absolute bottom-0 left-0 right-0"
                style={{
                    height: '58%',
                    background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.65) 30%, rgba(0,0,0,0.90) 70%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: exiting ? 0 : 1 }}
                transition={{ duration: 0.4 }}
            />

            {/* Content anchored to bottom-center of screen */}
            <AnimatePresence>
                {!exiting && (
                    <motion.div
                        className="absolute"
                        style={{ bottom: '7%', left: '50%', transform: 'translateX(-50%)', width: 'max-content' }}
                        exit={{ opacity: 0, y: 40, transition: { duration: 0.3, ease: 'easeIn' } }}
                    >
                        {/* Title — fades in after icons land */}
                        <motion.div
                            className="text-center mb-7"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: landed && !selected ? 1 : 0, y: landed ? 0 : 12 }}
                            transition={{ duration: 0.35 }}
                        >
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="text-yellow-400 text-base">★</span>
                                <span className="text-white font-black text-base uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(252,211,77,0.6)]">
                                    {playerName}
                                </span>
                                <span className="text-yellow-400 text-base">★</span>
                            </div>
                            <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-[0.28em]">
                                Choose elemental reward
                            </p>
                        </motion.div>

                        {/* Icons row — fly in from above, zoom into position */}
                        <div className="flex gap-6 justify-center items-end">
                            {ELEMENT_SEQUENCE.map((element, i) => {
                                const meta      = ELEMENT_META[element];
                                const isChosen  = selected === element;
                                const isDimmed  = selected !== null && !isChosen;

                                return (
                                    <motion.button
                                        key={element}
                                        className="flex flex-col items-center gap-3 outline-none select-none"
                                        style={{ pointerEvents: landed && !selected ? 'auto' : 'none' }}
                                        // ── Entry: fly down from board-tile area (~y -420 = top quarter) ──
                                        initial={{ y: -420, scale: 0.25, opacity: 0 }}
                                        animate={{
                                            y: isChosen ? -28 : 0,
                                            scale: isChosen ? 1.5 : isDimmed ? 0.62 : 1,
                                            opacity: isDimmed ? 0.14 : 1,
                                        }}
                                        transition={
                                            // Before landing: staggered spring entry
                                            !landed
                                                ? {
                                                    y:       { type: 'spring', delay: i * 0.12, stiffness: 170, damping: 19 },
                                                    scale:   { type: 'spring', delay: i * 0.12, stiffness: 170, damping: 19 },
                                                    opacity: { delay: i * 0.12, duration: 0.14 },
                                                }
                                                // After landing: snappy spring for selection response
                                                : {
                                                    y:       { type: 'spring', stiffness: 520, damping: 28 },
                                                    scale:   { type: 'spring', stiffness: 520, damping: 28 },
                                                    opacity: { duration: 0.18 },
                                                }
                                        }
                                        whileHover={landed && !selected ? { y: -10, scale: 1.1 } : undefined}
                                        onClick={() => handleSelect(element)}
                                    >
                                        {/* Icon card */}
                                        <div
                                            className="w-24 h-24 rounded-[1.5rem] flex items-center justify-center relative overflow-hidden"
                                            style={{
                                                background: `radial-gradient(circle at 35% 30%, ${meta.glow}70, ${meta.color})`,
                                                border: `2px solid ${meta.glow}50`,
                                                boxShadow: isChosen
                                                    ? `0 0 0 3px ${meta.glow}, 0 0 32px ${meta.glow}90, 0 0 70px ${meta.color}60`
                                                    : `0 6px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.15)`,
                                                transition: 'box-shadow 0.15s ease',
                                            }}
                                        >
                                            {/* Impact white flash */}
                                            <AnimatePresence>
                                                {isChosen && (
                                                    <motion.div
                                                        className="absolute inset-0 bg-white rounded-[1.5rem]"
                                                        initial={{ opacity: 0.95 }}
                                                        animate={{ opacity: 0 }}
                                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                                    />
                                                )}
                                            </AnimatePresence>

                                            <ElementIcon type={element} sizeOverride="w-14 h-14" />
                                        </div>

                                        {/* Label */}
                                        <motion.span
                                            className="text-[11px] font-black uppercase tracking-widest"
                                            style={{ color: meta.glow }}
                                            animate={{ opacity: isDimmed ? 0 : 1 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            {meta.label}
                                        </motion.span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

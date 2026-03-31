
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ArrowLeftRight, RefreshCw, Zap } from 'lucide-react';
import { TileType, GameState } from '../types.ts';
import { ElementIcon } from './PlayerInfo.tsx';
import { ELEMENTAL_TILES } from '../constants.ts';
import { LEVEL_CONFIGS } from '../config/levels.ts';
import {
    ARTIFACT_SWAP_THRESHOLD,
    ARTIFACT_CHANGE_THRESHOLD,
    ARTIFACT_CHARGE_THRESHOLD,
} from '../config/balance.ts';
import type { LayoutConfig } from '../layoutConfig.ts';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToolType = 'SWAP' | 'CHANGE' | 'CHARGE';

const MAX_QUEUE = 8;
// Each slot: 56px wide, gap-3 (12px), padding x-4 (16px each side) = 8*56 + 7*12 + 32 = 560px
const QUEUE_SLOT_W = 56;
const QUEUE_GAP    = 12;
const QUEUE_PAD_X  = 16;
const QUEUE_FIXED_W = MAX_QUEUE * QUEUE_SLOT_W + (MAX_QUEUE - 1) * QUEUE_GAP + QUEUE_PAD_X * 2;

interface EmptyTilePopupProps {
    gameState: GameState;
    onResolve: (updatedQueue: TileType[]) => void;
    onSkip: () => void;
    onMinimize: (minimized: boolean) => void;
    layout: LayoutConfig;
    isEditMode?: boolean;
}

// ─── Blinking cursor (thick 3px border) ──────────────────────────────────────

const BlinkCursor: React.FC<{ color?: string }> = ({ color = '#FCD34D' }) => (
    <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{ border: `3px solid ${color}` }}
        animate={{ opacity: [1, 0.25, 1] }}
        transition={{ duration: 0.65, repeat: Infinity }}
    />
);

// ─── Empty slot placeholder ───────────────────────────────────────────────────

const EmptySlot: React.FC<{ index: number }> = ({ index }) => (
    <div
        className="rounded-xl flex items-center justify-center"
        style={{
            width: QUEUE_SLOT_W, height: QUEUE_SLOT_W, flexShrink: 0,
            background: 'rgba(255,255,255,0.06)',
            border: '1.5px dashed rgba(255,255,255,0.12)',
        }}
    >
        <span className="text-[10px] font-black text-white/20">{index + 1}</span>
    </div>
);

// ─── Element tile ─────────────────────────────────────────────────────────────

interface QueueItemProps {
    type: TileType;
    index: number;
    isSelected: boolean;
    isBlinking: boolean;
    isStamping: boolean;
    isDimmed: boolean;
    stampColor?: string;
    onClick: (i: number) => void;
}

const QueueItem: React.FC<QueueItemProps> = ({ type, index, isSelected, isBlinking, isStamping, isDimmed, stampColor = '#FCD34D', onClick }) => (
    <motion.div
        className="relative rounded-xl bg-white flex items-center justify-center shadow-lg cursor-pointer select-none"
        style={{ width: QUEUE_SLOT_W, height: QUEUE_SLOT_W, flexShrink: 0 }}
        whileTap={isStamping ? undefined : { scale: 0.88 }}
        animate={
            isStamping ? { scale: [1, 1.5, 0.88, 1.12, 1], opacity: 1 } :
            isDimmed    ? { scale: 0.85, opacity: 0.22 } :
            isSelected  ? { scale: 1.12, opacity: 1 } :
                          { scale: 1,    opacity: 1 }
        }
        transition={
            isStamping
                ? { duration: 0.42, times: [0, 0.28, 0.58, 0.8, 1], ease: 'easeOut' }
                : { type: 'spring', damping: 18, stiffness: 300 }
        }
        onClick={() => onClick(index)}
    >
        <ElementIcon type={type} sizeOverride="w-9 h-9" />

        {/* Selected cursor — thick gold ring + glow */}
        {isSelected && !isStamping && (
            <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ border: '4px solid #FCD34D' }}
                animate={{
                    boxShadow: [
                        '0 0 0px #FCD34D00',
                        '0 0 14px #FCD34DCC',
                        '0 0 0px #FCD34D00',
                    ],
                }}
                transition={{ duration: 0.75, repeat: Infinity }}
            />
        )}
        {/* Stamp ring — flashes in during stamp */}
        {isStamping && (
            <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ border: `4px solid ${stampColor}` }}
                initial={{ scale: 1.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.22 }}
            />
        )}
        {/* Blinking adjacent cursor — thick cyan ring */}
        {isBlinking && !isSelected && <BlinkCursor color="#60EFFF" />}

        {/* Index badge */}
        <div className="absolute -top-2 -right-2 bg-zinc-700 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center text-white border border-white/20 leading-none">
            {index + 1}
        </div>
    </motion.div>
);

// ─── Change popup (small, above selected element) ─────────────────────────────

interface ChangePopupProps {
    currentType: TileType;
    onSelect: (type: TileType) => void;
}

const ChangePopup: React.FC<ChangePopupProps> = ({ currentType, onSelect }) => {
    const options = ELEMENTAL_TILES.filter(t => t !== currentType);
    return (
        <motion.div
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/20 rounded-2xl p-3 shadow-2xl z-[350]"
            initial={{ opacity: 0, y: 8, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.88 }}
            transition={{ duration: 0.15 }}
        >
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-zinc-900" />
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 text-center">Change to</p>
            <div className="flex gap-2">
                {options.map(t => (
                    <motion.div
                        key={t}
                        className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md cursor-pointer"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.88 }}
                        onClick={(e) => { e.stopPropagation(); onSelect(t); }}
                    >
                        <ElementIcon type={t} sizeOverride="w-8 h-8" />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

// ─── Charge cursor (slot machine) ─────────────────────────────────────────────

interface ChargeCursorProps {
    onComplete: (result: TileType) => void;
}

const ChargeCursor: React.FC<ChargeCursorProps> = ({ onComplete }) => {
    const [current, setCurrent] = useState<TileType>(ELEMENTAL_TILES[0]);
    const [phase, setPhase] = useState<'spinning' | 'slowing' | 'done' | 'stamped'>('spinning');
    const indexRef  = useRef(0);
    const countRef  = useRef(0);
    const targetRef = useRef<TileType>(ELEMENTAL_TILES[0]);
    const onCompleteRef = useRef(onComplete);
    useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

    useEffect(() => {
        const totalChanges = 5 + Math.floor(Math.random() * 3); // 5-7
        targetRef.current = ELEMENTAL_TILES[Math.floor(Math.random() * ELEMENTAL_TILES.length)];

        // Fast spin delays (ms)
        const FAST_DELAYS = [100, 110, 120, 140, 160];
        // Slowing-down delays for last 3 steps
        const SLOW_DELAYS = [280, 420, 620];

        let tid: ReturnType<typeof setTimeout>;

        const fastStep = () => {
            countRef.current += 1;
            indexRef.current = (indexRef.current + 1) % ELEMENTAL_TILES.length;
            setCurrent(ELEMENTAL_TILES[indexRef.current]);

            if (countRef.current < totalChanges) {
                const d = FAST_DELAYS[Math.min(countRef.current - 1, FAST_DELAYS.length - 1)];
                tid = setTimeout(fastStep, d);
            } else {
                // Slowing phase
                setPhase('slowing');
                let slowIdx = 0;
                const slowStep = () => {
                    indexRef.current = (indexRef.current + 1) % ELEMENTAL_TILES.length;
                    setCurrent(ELEMENTAL_TILES[indexRef.current]);
                    slowIdx++;
                    if (slowIdx < SLOW_DELAYS.length) {
                        tid = setTimeout(slowStep, SLOW_DELAYS[slowIdx]);
                    } else {
                        // Land on target — show it clearly for 900ms before stamping
                        setCurrent(targetRef.current);
                        setPhase('done');
                        tid = setTimeout(() => {
                            setPhase('stamped');
                            // Let stamp animation play (380ms) then hand off to parent
                            tid = setTimeout(() => onCompleteRef.current(targetRef.current), 420);
                        }, 900);
                    }
                };
                tid = setTimeout(slowStep, SLOW_DELAYS[0]);
            }
        };

        tid = setTimeout(fastStep, 80);
        return () => clearTimeout(tid);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const isDone    = phase === 'done' || phase === 'stamped';
    const isStamped = phase === 'stamped';

    return (
        <motion.div
            className="relative rounded-xl flex items-center justify-center shadow-lg"
            style={{
                width: QUEUE_SLOT_W, height: QUEUE_SLOT_W, flexShrink: 0,
                background: isDone ? 'rgba(252,211,77,0.18)' : 'rgba(255,255,255,0.07)',
                border: `2px dashed ${isDone ? '#FCD34D' : 'rgba(252,211,77,0.55)'}`,
            }}
            animate={isStamped ? { scale: [1, 1.45, 1.1, 1], rotate: [0, -6, 6, 0] } : {}}
            transition={{ duration: 0.38 }}
        >
            {/* Stamp ring */}
            {isStamped && (
                <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{ border: '4px solid #FCD34D' }}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.18 }}
                />
            )}
            {/* Element icon — zoom in when done */}
            <motion.div
                key={current}
                className="bg-white rounded-xl flex items-center justify-center"
                style={{ width: isDone ? 52 : 44, height: isDone ? 52 : 44 }}
                initial={{ scale: 0.65, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: isDone ? 0.25 : 0.07 }}
            >
                <ElementIcon type={current} sizeOverride={isDone ? 'w-9 h-9' : 'w-7 h-7'} />
            </motion.div>
            {/* Spinning cursor */}
            {!isDone && <BlinkCursor color="#FCD34D" />}
        </motion.div>
    );
};

// ─── Interactive Queue ────────────────────────────────────────────────────────

interface InteractiveQueueProps {
    queue: TileType[];
    maxQueueSize: number;
    tool: ToolType;
    onResolve: (newQueue: TileType[]) => void;
    posX: number;
    posY: number;
}

const InteractiveQueue: React.FC<InteractiveQueueProps> = ({
    queue, maxQueueSize, tool, onResolve, posX, posY,
}) => {
    const [tempQueue, setTempQueue] = useState<TileType[]>([...queue]);
    // Stable per-element IDs — drive framer-motion layout animation on swap
    const [itemIds, setItemIds] = useState<string[]>(() =>
        queue.map((_, i) => `qi-${i}-${Math.random().toString(36).slice(2, 7)}`)
    );
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [chargeComplete, setChargeComplete] = useState(false);
    const [visible, setVisible] = useState(true);

    // Animation phases: idle → animating (swap fly) → stamping → holding → (slide out)
    const [animPhase, setAnimPhase] = useState<'idle' | 'animating' | 'stamping' | 'holding'>('idle');
    const [stampIdxs, setStampIdxs] = useState<number[]>([]);  // slots that play stamp
    const [dimIdxs,   setDimIdxs]   = useState<number[]>([]);  // slots that fade (change tool)

    const toolColor = tool === 'SWAP' ? '#818CF8' : tool === 'CHANGE' ? '#34D399' : '#FCD34D';

    // Hold 500ms then slide out
    const holdThenSlide = useCallback((newQ: TileType[]) => {
        setAnimPhase('holding');
        setTimeout(() => {
            setVisible(false);
            setTimeout(() => onResolve(newQ), 380);
        }, 500);
    }, [onResolve]);

    // ── SWAP ──────────────────────────────────────────────────────────────────
    const handleSwapClick = useCallback((idx: number) => {
        if (animPhase !== 'idle') return;
        if (selectedIdx === null) {
            setSelectedIdx(idx);
        } else if (selectedIdx === idx) {
            setSelectedIdx(null);
        } else {
            if (Math.abs(idx - selectedIdx) === 1) {
                const a = Math.min(selectedIdx, idx);
                const b = Math.max(selectedIdx, idx);
                const newQ   = [...tempQueue];
                const newIds = [...itemIds];
                [newQ[a],   newQ[b]]   = [newQ[b],   newQ[a]];
                [newIds[a], newIds[b]] = [newIds[b], newIds[a]];
                setSelectedIdx(null);
                setAnimPhase('animating');
                setTempQueue(newQ);
                setItemIds(newIds);
                // Wait for layout crossing animation (~420ms), then stamp both
                setTimeout(() => {
                    setStampIdxs([a, b]);
                    setAnimPhase('stamping');
                    setTimeout(() => holdThenSlide(newQ), 460);
                }, 420);
            } else {
                setSelectedIdx(idx);
            }
        }
    }, [animPhase, selectedIdx, tempQueue, itemIds, holdThenSlide]);

    // ── CHANGE ────────────────────────────────────────────────────────────────
    const handleChangeClick = useCallback((idx: number) => {
        if (animPhase !== 'idle') return;
        setSelectedIdx(prev => prev === idx ? null : idx);
    }, [animPhase]);

    const handleChangeSelect = useCallback((newType: TileType) => {
        if (selectedIdx === null || animPhase !== 'idle') return;
        const newQ = [...tempQueue];
        newQ[selectedIdx] = newType;
        const targetIdx = selectedIdx;
        setSelectedIdx(null);
        setTempQueue(newQ);
        // Dim every slot except the changed one; stamp the changed slot
        setDimIdxs(newQ.map((_, i) => i).filter(i => i !== targetIdx));
        setStampIdxs([targetIdx]);
        setAnimPhase('stamping');
        setTimeout(() => holdThenSlide(newQ), 460);
    }, [animPhase, selectedIdx, tempQueue, holdThenSlide]);

    // ── CHARGE ────────────────────────────────────────────────────────────────
    const handleChargeComplete = useCallback((result: TileType) => {
        const newQ   = [...tempQueue, result];
        if (newQ.length > maxQueueSize) newQ.shift();
        const newIds = [...itemIds];
        if (newIds.length >= maxQueueSize) newIds.shift();
        newIds.push(`qi-charge-${Date.now()}`);
        setItemIds(newIds);
        setTempQueue(newQ);
        setChargeComplete(true);
        // Brief pause so ChargeCursor stamp is still fresh, then hold + slide
        setTimeout(() => holdThenSlide(newQ), 180);
    }, [tempQueue, itemIds, maxQueueSize, holdThenSlide]);

    return (
        <motion.div
            className="fixed z-[250]"
            style={{
                bottom: posY,
                left: `calc(50% + ${posX}px)`,
                translateX: '-50%',
            }}
            initial={{ y: 80, opacity: 0 }}
            animate={visible ? { y: 0, opacity: 1 } : { y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        >
            {/* Outer panel — styled like HUD element queue */}
            <div
                className="rounded-3xl shadow-2xl backdrop-blur-md"
                style={{
                    width: QUEUE_FIXED_W,
                    background: 'rgba(24,24,27,0.97)',
                    border: `1.5px solid ${toolColor}44`,
                    padding: `${QUEUE_PAD_X}px`,
                }}
            >
                {/* Tool header */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: toolColor }}>
                        {tool === 'SWAP' ? '⇄ Swap' : tool === 'CHANGE' ? '↺ Change' : '⚡ Charge'}
                        {tool === 'SWAP' && selectedIdx !== null && animPhase === 'idle' && ' — select adjacent'}
                        {tool === 'CHANGE' && selectedIdx !== null && animPhase === 'idle' && ' — choose new element'}
                    </p>
                    <span className="text-[9px] font-black uppercase text-zinc-500">
                        {tempQueue.length}/{maxQueueSize}
                    </span>
                </div>

                {/* Queue row */}
                <LayoutGroup id="iq-row">
                    <div
                        className="rounded-xl flex items-center shadow-inner"
                        style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            gap: QUEUE_GAP,
                            padding: '8px',
                            minHeight: QUEUE_SLOT_W + 16,
                        }}
                    >
                        {Array.from({ length: maxQueueSize }).map((_, i) => {
                            const hasElement = i < tempQueue.length;
                            if (!hasElement) {
                                if (tool === 'CHARGE' && !chargeComplete && i === tempQueue.length) {
                                    return (
                                        <ChargeCursor
                                            key={`charge-cursor-${i}`}
                                            onComplete={handleChargeComplete}
                                        />
                                    );
                                }
                                return <EmptySlot key={`empty-${i}`} index={i} />;
                            }
                            const type = tempQueue[i];
                            let isBlinking = false;
                            if (tool === 'SWAP' && selectedIdx !== null && animPhase === 'idle') {
                                isBlinking = i === selectedIdx - 1 || i === selectedIdx + 1;
                            }
                            const isStamping = stampIdxs.includes(i);
                            const isDimmed   = dimIdxs.includes(i);
                            return (
                                <motion.div
                                    key={itemIds[i] ?? i}
                                    layout
                                    className="relative"
                                    style={{ flexShrink: 0 }}
                                    transition={{ type: 'spring', damping: 26, stiffness: 380 }}
                                >
                                    {tool === 'CHANGE' && selectedIdx === i && animPhase === 'idle' && (
                                        <AnimatePresence>
                                            <ChangePopup currentType={type} onSelect={handleChangeSelect} />
                                        </AnimatePresence>
                                    )}
                                    <QueueItem
                                        type={type}
                                        index={i}
                                        isSelected={selectedIdx === i && animPhase === 'idle'}
                                        isBlinking={isBlinking}
                                        isStamping={isStamping}
                                        isDimmed={isDimmed}
                                        stampColor={toolColor}
                                        onClick={animPhase === 'idle' ? (
                                            tool === 'SWAP'   ? handleSwapClick :
                                            tool === 'CHANGE' ? handleChangeClick :
                                            () => {}
                                        ) : () => {}}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                </LayoutGroup>

                {/* Hint */}
                {tool === 'SWAP' && tempQueue.length < 2 && animPhase === 'idle' && (
                    <p className="text-[10px] text-zinc-500 text-center mt-2 italic">Need at least 2 elements to swap</p>
                )}
            </div>
        </motion.div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const EmptyTilePopup: React.FC<EmptyTilePopupProps> = ({
    gameState,
    onResolve,
    onSkip,
    onMinimize,
    layout,
    isEditMode = false,
}) => {
    const player = gameState.players[gameState.currentPlayerId];
    const visits = player.emptyTileVisits;
    const [phase, setPhase] = useState<'TOOL_SELECT' | 'QUEUE_INTERACT'>('TOOL_SELECT');
    const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);

    const isMinimized = gameState.isEmptyTilePopupMinimized;
    const levelConfig = LEVEL_CONFIGS[gameState.selectedLevel];
    const maxArtifactSlots = levelConfig.artifactSlots;

    const unlockedItems = {
        SWAP:   visits >= ARTIFACT_SWAP_THRESHOLD   && maxArtifactSlots >= 1,
        CHANGE: visits >= ARTIFACT_CHANGE_THRESHOLD && maxArtifactSlots >= 2,
        CHARGE: visits >= ARTIFACT_CHARGE_THRESHOLD && maxArtifactSlots >= 3,
    };

    const toolPopupX = layout.toolPopup.x;
    const toolPopupY = layout.toolPopup.y;
    const queueX = layout.interactiveQueue.x;
    const queueY = layout.interactiveQueue.y;

    const handleToolSelect = (tool: ToolType) => {
        setSelectedTool(tool);
        setPhase('QUEUE_INTERACT');
    };

    if (isMinimized) {
        return (
            <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => onMinimize(false)}
                className="fixed z-[300]"
                style={{ bottom: toolPopupY, left: `calc(50% + ${toolPopupX}px)`, transform: 'translateX(-50%)' }}
            >
                <div className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow-xl font-black text-xs uppercase tracking-widest">
                    Return to Items
                </div>
            </motion.button>
        );
    }

    return (
        <>
            {/* Edit mode previews */}
            {isEditMode && (
                <>
                    <div
                        className="fixed z-[180] border-2 border-dashed border-yellow-400/60 rounded-2xl pointer-events-none"
                        style={{
                            bottom: toolPopupY - 8,
                            left: `calc(50% + ${toolPopupX}px)`,
                            transform: 'translateX(-50%)',
                            width: 240, height: 60,
                        }}
                    >
                        <span className="absolute -top-5 left-0 text-[10px] text-yellow-400 font-black uppercase whitespace-nowrap">Tool Popup</span>
                    </div>
                    <div
                        className="fixed z-[180] border-2 border-dashed border-cyan-400/60 rounded-2xl pointer-events-none"
                        style={{
                            bottom: queueY - 8,
                            left: `calc(50% + ${queueX}px)`,
                            transform: 'translateX(-50%)',
                            width: QUEUE_FIXED_W + 4, height: QUEUE_SLOT_W + 58,
                        }}
                    >
                        <span className="absolute -top-5 left-0 text-[10px] text-cyan-400 font-black uppercase whitespace-nowrap">Interactive Queue</span>
                    </div>
                </>
            )}

            {/* Phase 1: Tool selection small box */}
            <AnimatePresence>
                {phase === 'TOOL_SELECT' && (
                    <motion.div
                        key="tool-select"
                        className="fixed z-[250]"
                        style={{
                            bottom: toolPopupY,
                            left: `calc(50% + ${toolPopupX}px)`,
                            translateX: '-50%',
                        }}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
                    >
                        <div className="bg-zinc-900/97 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-md">
                            <div className="flex items-center gap-1 p-3">
                                <div className="mr-2 text-[9px] font-black uppercase text-zinc-500 tracking-widest whitespace-nowrap">
                                    Visit #{visits}
                                </div>
                                {maxArtifactSlots >= 1 && (
                                    <ToolButton
                                        label="Swap" icon={<ArrowLeftRight size={18} />} color="indigo"
                                        unlocked={unlockedItems.SWAP}
                                        onClick={() => unlockedItems.SWAP && handleToolSelect('SWAP')}
                                        effect="Swap two adjacent elements in your queue to reorder them."
                                        unlockHint={!unlockedItems.SWAP ? `Unlocks at visit #${ARTIFACT_SWAP_THRESHOLD} (${Math.max(0, ARTIFACT_SWAP_THRESHOLD - visits)} more)` : undefined}
                                    />
                                )}
                                {maxArtifactSlots >= 2 && (
                                    <ToolButton
                                        label="Change" icon={<RefreshCw size={18} />} color="emerald"
                                        unlocked={unlockedItems.CHANGE}
                                        onClick={() => unlockedItems.CHANGE && handleToolSelect('CHANGE')}
                                        effect="Replace any element in your queue with a different element type."
                                        unlockHint={!unlockedItems.CHANGE ? `Unlocks at visit #${ARTIFACT_CHANGE_THRESHOLD} (${Math.max(0, ARTIFACT_CHANGE_THRESHOLD - visits)} more)` : undefined}
                                    />
                                )}
                                {maxArtifactSlots >= 3 && (
                                    <ToolButton
                                        label="Charge" icon={<Zap size={18} />} color="amber"
                                        unlocked={unlockedItems.CHARGE}
                                        onClick={() => unlockedItems.CHARGE && handleToolSelect('CHARGE')}
                                        effect="Add a randomly drawn element to your queue."
                                        unlockHint={!unlockedItems.CHARGE ? `Unlocks at visit #${ARTIFACT_CHARGE_THRESHOLD} (${Math.max(0, ARTIFACT_CHARGE_THRESHOLD - visits)} more)` : undefined}
                                    />
                                )}
                                <button onClick={onSkip} className="px-3 py-2 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors ml-1">
                                    Skip
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Phase 2: Interactive queue */}
            <AnimatePresence>
                {phase === 'QUEUE_INTERACT' && selectedTool && (
                    <InteractiveQueue
                        key="queue-interact"
                        queue={player.elementQueue}
                        maxQueueSize={player.config.maxElementQueue}
                        tool={selectedTool}
                        onResolve={onResolve}
                        posX={queueX}
                        posY={queueY}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

// ─── Tool button ──────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; bgHover: string }> = {
    indigo:  { bg: '#312E81', text: '#A5B4FC', border: '#4F46E5', bgHover: '#3730A3' },
    emerald: { bg: '#064E3B', text: '#6EE7B7', border: '#059669', bgHover: '#065F46' },
    amber:   { bg: '#78350F', text: '#FCD34D', border: '#D97706', bgHover: '#92400E' },
};

interface ToolButtonProps {
    label: string; icon: React.ReactNode; color: string; unlocked: boolean; onClick: () => void;
    effect?: string;
    unlockHint?: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({ label, icon, color, unlocked, onClick, effect, unlockHint }) => {
    const c = COLOR_MAP[color] ?? COLOR_MAP.indigo;
    const [showTip, setShowTip] = useState(false);
    const tipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const openTip  = () => setShowTip(true);
    const closeTip = () => {
        if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
        setShowTip(false);
    };
    // Touch: auto-dismiss after 2.5 s
    const touchTip = () => {
        setShowTip(true);
        tipTimerRef.current = setTimeout(() => setShowTip(false), 2500);
    };

    return (
        <div
            className="relative"
            onMouseEnter={openTip}
            onMouseLeave={closeTip}
            onPointerDown={(e) => { if (e.pointerType !== 'mouse') touchTip(); }}
        >
            {/* Tooltip — appears above button on hover/press */}
            <AnimatePresence>
                {showTip && (
                    <motion.div
                        className="absolute bottom-full mb-2 left-1/2 z-[400] pointer-events-none"
                        style={{ translateX: '-50%', width: 168 }}
                        initial={{ opacity: 0, y: 6, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.92 }}
                        transition={{ duration: 0.14 }}
                    >
                        <div
                            className="rounded-xl p-2.5 shadow-2xl text-left"
                            style={{
                                background: '#18181B',
                                border: `1px solid ${c.border}55`,
                            }}
                        >
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: c.text }}>
                                {label}
                            </p>
                            {effect && (
                                <p className="text-xs text-zinc-300 leading-snug mb-2">{effect}</p>
                            )}
                            {unlocked ? (
                                <div className="flex items-center gap-1">
                                    <span className="text-[9px]">✅</span>
                                    <span className="text-[9px] font-black text-emerald-400">Unlocked</span>
                                </div>
                            ) : unlockHint && (
                                <div className="flex items-center gap-1">
                                    <span className="text-[9px]">🔒</span>
                                    <span className="text-[9px] font-black text-amber-400">{unlockHint}</span>
                                </div>
                            )}
                        </div>
                        {/* Arrow pointing down */}
                        <div
                            className="absolute top-full left-1/2 -translate-x-1/2"
                            style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #18181B' }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={onClick}
                disabled={!unlocked}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative"
                style={{
                    background: unlocked ? c.bg : '#18181B',
                    border: `1px solid ${unlocked ? c.border : '#27272A'}`,
                    color: unlocked ? c.text : '#52525B',
                    opacity: unlocked ? 1 : 0.55,
                    cursor: unlocked ? 'pointer' : 'not-allowed',
                    minWidth: 56,
                }}
                whileHover={unlocked ? { scale: 1.06, background: c.bgHover } : {}}
                whileTap={unlocked ? { scale: 0.93 } : {}}
            >
                {icon}
                <span className="text-[10px] font-black uppercase tracking-wider leading-none">{label}</span>
                {!unlocked && (
                    <span className="absolute -top-1.5 -right-1.5 text-[8px] bg-zinc-700 rounded-full px-1 text-amber-400 font-black border border-amber-600/30">🔒</span>
                )}
            </motion.button>
        </div>
    );
};

// ─── Normal-tile toolbox preview popup ────────────────────────────────────────

interface NormalTilePreviewPopupProps {
    gameState: GameState;
    layout: { toolPopup: { x: number; y: number } };
    visible: boolean;
}

export const NormalTilePreviewPopup: React.FC<NormalTilePreviewPopupProps> = ({
    gameState, layout, visible,
}) => {
    const player = gameState.players[gameState.currentPlayerId];
    const visits = player.emptyTileVisits;
    const levelConfig = LEVEL_CONFIGS[gameState.selectedLevel];
    const maxArtifactSlots = levelConfig.artifactSlots;

    const unlockedItems = {
        SWAP:   visits >= ARTIFACT_SWAP_THRESHOLD   && maxArtifactSlots >= 1,
        CHANGE: visits >= ARTIFACT_CHANGE_THRESHOLD && maxArtifactSlots >= 2,
        CHARGE: visits >= ARTIFACT_CHARGE_THRESHOLD && maxArtifactSlots >= 3,
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="normal-tile-preview"
                    className="fixed z-[240]"
                    style={{
                        bottom: layout.toolPopup.y,
                        left: `calc(50% + ${layout.toolPopup.x}px)`,
                        translateX: '-50%',
                    }}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 260 }}
                    onPointerDown={e => e.stopPropagation()}
                >
                    {/* PREVIEW badge */}
                    <div className="flex justify-center mb-1.5">
                        <span className="bg-amber-400 text-[9px] font-black uppercase tracking-widest text-black px-2.5 py-0.5 rounded-full shadow">
                            Preview
                        </span>
                    </div>

                    <div className="bg-zinc-900/97 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-md">
                        <div className="flex items-center gap-1 p-3">
                            <div className="mr-2 text-[9px] font-black uppercase text-zinc-500 tracking-widest whitespace-nowrap">
                                Visit #{visits}
                            </div>
                            {maxArtifactSlots >= 1 && (
                                <ToolButton
                                    label="Swap" icon={<ArrowLeftRight size={18} />} color="indigo"
                                    unlocked={unlockedItems.SWAP}
                                    onClick={() => {}}
                                    effect="Swap two adjacent elements in your queue to reorder them."
                                    unlockHint={!unlockedItems.SWAP ? `Unlocks at visit #${ARTIFACT_SWAP_THRESHOLD} (${Math.max(0, ARTIFACT_SWAP_THRESHOLD - visits)} more)` : undefined}
                                />
                            )}
                            {maxArtifactSlots >= 2 && (
                                <ToolButton
                                    label="Change" icon={<RefreshCw size={18} />} color="emerald"
                                    unlocked={unlockedItems.CHANGE}
                                    onClick={() => {}}
                                    effect="Replace any element in your queue with a different element type."
                                    unlockHint={!unlockedItems.CHANGE ? `Unlocks at visit #${ARTIFACT_CHANGE_THRESHOLD} (${Math.max(0, ARTIFACT_CHANGE_THRESHOLD - visits)} more)` : undefined}
                                />
                            )}
                            {maxArtifactSlots >= 3 && (
                                <ToolButton
                                    label="Charge" icon={<Zap size={18} />} color="amber"
                                    unlocked={unlockedItems.CHARGE}
                                    onClick={() => {}}
                                    effect="Add a randomly drawn element to your queue."
                                    unlockHint={!unlockedItems.CHARGE ? `Unlocks at visit #${ARTIFACT_CHARGE_THRESHOLD} (${Math.max(0, ARTIFACT_CHARGE_THRESHOLD - visits)} more)` : undefined}
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

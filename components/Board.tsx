
import React, { useMemo } from 'react';
import type { GameState, TokenState, TileData, PlayerID, PlayerState } from '../types.ts';
import { TileType, TileRole } from '../types.ts';
import { Token } from './Token.tsx';
import { ManagedImage } from './ManagedImage.tsx';
import { TILE_SIZE, TILE_COLORS, PLAYER_COLORS, PLAYER1_TOKEN_B64, PLAYER2_TOKEN_B64, ELEMENTAL_TILES, EMPTY_TILE_IDS } from '../constants.ts';
import { TILE_REWARD_ATK, TILE_REWARD_MAG, ARTIFACT_SWAP_THRESHOLD, ARTIFACT_CHANGE_THRESHOLD, ARTIFACT_CHARGE_THRESHOLD } from '../config/balance.ts';
import { CHARACTERS } from '../config/characters.ts';
import { ArrowLeftRight, Lock, Unlock, Wrench, Hammer } from 'lucide-react';
import { findPath, getStepsToGoal } from '../utils/pathfinding.ts';
import { FireIcon, IceIcon, GrassIcon, RockIcon, DiceIcon, AtkPip, ManaPip } from './Icons.tsx';
import { TILE_POSITIONS } from '../boardLayout.ts';
import { LEVEL_CONFIGS } from '../config/levels.ts';



interface BoardProps {
    gameState: GameState;
    isEditMode: boolean;
    onTokenSelect: (token: TokenState) => void;
    onSelectTile: (tile: TileData) => void;
    onAddTile?: (row: number, col: number) => void;
    previewTileId: number | null;
    previewReward: { type: 'atk' | 'mana', amount: number } | null;
    isMoveValid: boolean;
    onPreviewTileClick?: () => void;
    onTeleportSelect?: (tileId: number) => void;
}

const SafeZoneSymbol: React.FC<{ owner?: PlayerID }> = ({ owner }) => {
    const tokenImg = owner === 'Player2' ? PLAYER2_TOKEN_B64 : PLAYER1_TOKEN_B64;
    return (
        <ManagedImage 
            src={tokenImg} 
            alt="Safe Zone" 
            className="w-full h-full opacity-50 object-contain"
        />
    );
};

const ArrowSymbol: React.FC<{ rotation: number; color?: string }> = ({ rotation, color }) => (
     <svg 
        viewBox="-10 -10 20 20" 
        className="w-full h-full p-4" 
        style={{ transform: `rotate(${rotation}deg)` }}
    >
        <path d="M -5 5 L 0 -5 L 5 5" stroke={color || "rgba(255, 255, 255, 0.9)"} strokeWidth="3" fill="none" />
    </svg>
);

const StartTriangle: React.FC<{ rotation: number }> = ({ rotation }) => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]">
        <svg
            viewBox="0 0 24 24"
            className="w-12 h-12 fill-[#FCD34D] drop-shadow-sm"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6L12 2z" stroke="#181818" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
    </div>
);

const SingleDiamondIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg viewBox="-12 -12 24 24" className={`${className} drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]`}>
        <path d="M 0 -10 L 10 0 L 0 10 L -10 0 Z" fill="#FBBF24" stroke="#78350F" strokeWidth="1.5"/>
    </svg>
);

const ElementIcon: React.FC<{ type: TileType | null | undefined; className?: string; sizeOverride?: string }> = ({ type, className = "w-8 h-8", sizeOverride }) => {
    if (!type) return null;
    const sizeClass = sizeOverride || className;
    switch (type) {
        case TileType.Fire: return <FireIcon className={`${sizeClass} text-red-600`} />;
        case TileType.Ice: return <IceIcon className={`${sizeClass} text-blue-500`} />;
        case TileType.Grass: return <GrassIcon className={`${sizeClass} text-green-600`} />;
        case TileType.Rock: return <RockIcon className={`${sizeClass} text-gray-600`} />;
        default: return null;
    }
};

const StableRewardDisplay: React.FC = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[15]">
        <div className="relative bg-gray-900/90 p-1.5 rounded-xl border border-white/20 backdrop-blur-md shadow-lg transform hover:scale-110 transition-transform">
            <div className="grid grid-cols-2 gap-0.5 opacity-80">
                <ElementIcon type={TileType.Fire} sizeOverride="w-2.5 h-2.5" />
                <ElementIcon type={TileType.Ice} sizeOverride="w-2.5 h-2.5" />
                <ElementIcon type={TileType.Grass} sizeOverride="w-2.5 h-2.5" />
                <ElementIcon type={TileType.Rock} sizeOverride="w-2.5 h-2.5" />
            </div>
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg border border-indigo-500 z-10">
                <span className="text-indigo-700 font-black text-[9px] leading-none">+</span>
            </div>
        </div>
    </div>
);

const EmptyTileTooltip: React.FC<{ visits: number; x: number; y: number; maxArtifactSlots: number }> = ({ visits, x, y, maxArtifactSlots }) => {
    const allItems = [
        { id: 1, name: 'Swap', desc: 'Swap two adjacent elements.', unlock: ARTIFACT_SWAP_THRESHOLD },
        { id: 2, name: 'Change', desc: 'Change one element to another.', unlock: ARTIFACT_CHANGE_THRESHOLD },
        { id: 3, name: 'Charge', desc: 'Insert affinity element.', unlock: ARTIFACT_CHARGE_THRESHOLD },
    ];
    const items = allItems.filter(item => item.id <= maxArtifactSlots);

    const nextUnlock = items.find(item => visits < item.unlock);

    // Positioning Logic
    const isTop = y < 2; // Close to top edge, show below
    const isLeft = x < 2; // Close to left edge, align left
    const isRight = x > 8; // Close to right edge, align right

    let positionClasses = "absolute z-[200] w-72 bg-gray-900 border-2 border-indigo-500 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-fade-in-up";
    
    // Vertical
    if (isTop) {
        positionClasses += " top-full mt-4";
    } else {
        positionClasses += " bottom-full mb-4";
    }

    // Horizontal
    if (isLeft) {
        positionClasses += " left-0";
    } else if (isRight) {
        positionClasses += " right-0";
    } else {
        positionClasses += " left-1/2 -translate-x-1/2";
    }

    // Arrow Positioning
    let arrowClasses = "absolute w-4 h-4 bg-gray-900 rotate-45";
    if (isTop) {
        arrowClasses += " -top-2.5 border-l-2 border-t-2 border-indigo-500";
    } else {
        arrowClasses += " -bottom-2.5 border-r-2 border-b-2 border-indigo-500";
    }

    const arrowStyle: React.CSSProperties = {};
    if (isLeft) {
        arrowStyle.left = '32px';
        arrowStyle.transform = 'translateX(-50%) rotate(45deg)';
    } else if (isRight) {
        arrowStyle.right = '32px';
        arrowStyle.transform = 'translateX(50%) rotate(45deg)';
    } else {
        arrowStyle.left = '50%';
        arrowStyle.transform = 'translateX(-50%) rotate(45deg)';
    }

    return (
        <div className={positionClasses}>
            <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Empty Tile Benefits</span>
                <span className="text-xs font-black text-white bg-indigo-600/50 px-2 py-0.5 rounded-full">Visits: {visits}</span>
            </div>
            <div className="space-y-3">
                {items.map(item => {
                    const isUnlocked = visits >= item.unlock;
                    const isNext = nextUnlock?.id === item.id;
                    return (
                        <div key={item.id} className={`flex gap-3 items-start transition-all duration-300 ${isUnlocked ? 'opacity-100 scale-100' : 'opacity-40 scale-95'} ${isNext ? 'ring-1 ring-indigo-400/50 bg-indigo-500/10 rounded-lg p-2 -m-2' : ''}`}>
                            <div className={`mt-1 p-1 rounded-lg ${isUnlocked ? 'bg-green-500/20' : 'bg-gray-800'}`}>
                                {isUnlocked ? <Unlock size={14} className="text-green-400 shrink-0" /> : <Lock size={14} className="text-gray-500 shrink-0" />}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-sm font-black uppercase tracking-tight ${isUnlocked ? 'text-white' : 'text-zinc-500'} ${isNext ? 'animate-text-blink' : ''}`}>
                                    {item.name} {!isUnlocked && <span className="text-[10px] font-bold text-indigo-400/60 ml-1">(at {item.unlock} visits)</span>}
                                </span>
                                <span className={`text-[11px] leading-tight font-medium ${isUnlocked ? 'text-gray-100' : 'text-zinc-500'} ${isNext ? 'animate-text-blink' : ''}`}>{item.desc}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className={arrowClasses} style={arrowStyle}></div>
        </div>
    );
};

export const Board: React.FC<BoardProps> = ({
    gameState,
    isEditMode,
    onTokenSelect,
    onSelectTile,
    onAddTile,
    previewTileId,
    
    onPreviewTileClick,
    onTeleportSelect
}) => {
    const [hoveredEmptyTileId, setHoveredEmptyTileId] = React.useState<number | null>(null);
    const hoverTimeoutRef = React.useRef<number | null>(null);

    const handleMouseEnter = (tileId: number) => {
        if (!EMPTY_TILE_IDS.includes(tileId)) return;
        if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = window.setTimeout(() => {
            setHoveredEmptyTileId(tileId);
        }, 500);
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
        setHoveredEmptyTileId(null);
    };

    const tokensByTile = useMemo(() => {
        const map = new Map<number, TokenState[]>();
        (Object.values(gameState.players) as PlayerState[]).forEach(player => {
            player.tokens.forEach(token => {
                if (!map.has(token.tileId)) map.set(token.tileId, []);
                map.get(token.tileId)!.push(token);
            });
        });
        return map;
    }, [gameState.players]);

    const previewNumbers = useMemo(() => {
        const result = new Map<number, { count: number; color: string }>();
        if (isEditMode || gameState.phase !== 'SELECT_DICE' || !gameState.showMovePreview) return result;

        const currentPlayer = gameState.players[gameState.currentPlayerId] as PlayerState;
        if (!currentPlayer) return result;

        const sortedTokens = [...currentPlayer.tokens]
            .map(token => {
                const distToGoal = getStepsToGoal(token.tileId, gameState.currentPlayerId, gameState);
                return { token, distToGoal };
            })
            .sort((a, b) => a.distToGoal - b.distToGoal);

        const priorityColors = ["#3E4853", "#9333EA", "#722D1A"];
        const processedStartTiles = new Set<number>();

        sortedTokens.forEach(({ token }, index) => {
            const color = priorityColors[Math.min(index, priorityColors.length - 1)];
            const tkn = token as TokenState;
            const sharingStartTile = currentPlayer.tokens.filter(t => (t as TokenState).tileId === tkn.tileId);
            if (sharingStartTile.length > 1) {
                const maxDiamonds = Math.max(...sharingStartTile.map(t => (t as TokenState).diamonds));
                if (tkn.diamonds < maxDiamonds) return;
                if (processedStartTiles.has(tkn.tileId)) return;
            }
            processedStartTiles.add(tkn.tileId);

            const path = findPath(tkn.tileId, 12, gameState.currentPlayerId, gameState);
            for (let i = 1; i < path.length; i++) {
                const tileId = path[i];
                if (result.has(tileId)) break;
                result.set(tileId, { count: i, color });
            }
        });
        return result;
    }, [gameState, isEditMode]);

    const getPlayerRotation = (owner?: PlayerID) => {
        switch (owner) {
            case 'Player1': return 0;
            case 'Player2': return 180;
            case 'Player3': return -90;
            case 'Player4': return 90;
            default: return 0;
        }
    };
    

    

    return (
        <div 
            className="relative bg-gray-900/80 overflow-hidden"
            style={{ width: '704px', height: '704px', padding: 0, margin: 0 }}
        >
            <div className="relative w-full h-full">
                {isEditMode && Array.from({ length: 11 }).map((_, r) =>
                    Array.from({ length: 11 }).map((_, c) => (
                        <div
                            key={`grid-bg-${r}-${c}`}
                            className="absolute border border-white/5 hover:bg-white/5 cursor-pointer"
                            style={{ left: c * TILE_SIZE, top: r * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}
                            onClick={() => onAddTile && onAddTile(r, c)}
                        ></div>
                    ))
                )}

                {gameState.board.flat().filter(Boolean).map((tile) => {
                    const pos = TILE_POSITIONS[tile!.id];
                    if (!pos) return null;

                    
                    const isPreview = (tile!.id === previewTileId && gameState.phase === 'MOVE');
                    const isStart = tile!.role === TileRole.START;
                    const previewData = previewNumbers.get(tile!.id);
                    const isP1Stable = tile!.id === 31;
                    const isP2Stable = tile!.id === 25;
                    const isTeleportPhase = gameState.phase === 'SELECT_TELEPORT_DEST';

                    const getTileBgColor = () => {
                        // User request: Change color of tile ID 27 and 30 to #E5E7EB
                        if (tile!.id === 27 || tile!.id === 30) return '#E5E7EB';
                        
                        if (tile!.role === TileRole.START) return '#8B5CF6';
                        if (tile!.type === TileType.Center) return TILE_COLORS[TileType.Center];
                        if (tile!.type === TileType.Ladder) return TILE_COLORS[TileType.Ladder];
                        if (ELEMENTAL_TILES.includes(tile!.type)) {
                            return tile!.currentElement ? TILE_COLORS[tile!.currentElement] : '#F3F4F6';
                        }
                        if (tile!.type === TileType.SafeZone) return TILE_COLORS[TileType.SafeZone];
                        return TILE_COLORS[TileType.Normal];
                    };

                    return (
                        <div 
                            key={`tile-${tile!.id}`}
                            className={`absolute border flex items-center justify-center transition-all duration-300 ${isTeleportPhase && isStart ? 'cursor-pointer hover:scale-110 shadow-[0_0_15px_rgba(168,85,247,0.6)] z-[5]' : ''}`}
                            style={{
                                left: pos.x * TILE_SIZE,
                                top: pos.y * TILE_SIZE,
                                width: TILE_SIZE,
                                height: TILE_SIZE,
                                backgroundColor: getTileBgColor(),
                                borderColor: isPreview ? '#8F0694' : (isTeleportPhase && isStart ? '#A855F7' : (isStart ? 'transparent' : 'rgba(0,0,0,0.2)')),
                                borderWidth: (isPreview || (isTeleportPhase && isStart)) ? '3px' : '1px',
                                zIndex: (isTeleportPhase && isStart || hoveredEmptyTileId === tile!.id) ? 50 : 1
                            }}
                            onMouseEnter={() => handleMouseEnter(tile!.id)}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => {
                                if (isEditMode) onSelectTile(tile!);
                                if (tile!.id === previewTileId && onPreviewTileClick) onPreviewTileClick();
                                if (isTeleportPhase && isStart && onTeleportSelect) onTeleportSelect(tile!.id);
                            }}
                        >
                            {tile!.type === TileType.SafeZone && <SafeZoneSymbol owner={tile!.owner} />}
                            {EMPTY_TILE_IDS.includes(tile!.id) && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                    <Wrench size={28} className="text-black absolute -rotate-45 -translate-x-2" />
                                    <Hammer size={28} className="text-black absolute rotate-45 translate-x-2 scale-x-[-1]" />
                                </div>
                            )}
                            {EMPTY_TILE_IDS.includes(tile!.id) && hoveredEmptyTileId === tile!.id && (
                                <EmptyTileTooltip
                                    visits={gameState.players[gameState.currentPlayerId].emptyTileVisits}
                                    x={pos.x}
                                    y={pos.y}
                                    maxArtifactSlots={LEVEL_CONFIGS[gameState.selectedLevel].artifactSlots}
                                />
                            )}
                            {tile!.type === TileType.Ladder && (
                                <ArrowSymbol 
                                    rotation={tile!.direction ?? getPlayerRotation(tile!.owner)} 
                                    color={(tile!.owner === 'Player3' || tile!.owner === 'Player4') ? "#FFFFFF" : (tile!.owner ? PLAYER_COLORS[tile!.owner].token : undefined)} 
                                />
                            )}
                            
                            <ElementIcon 
                                type={tile!.currentElement} 
                                className={`w-10 h-10 absolute opacity-50`} 
                            />

                            {isStart && <StartTriangle rotation={getPlayerRotation(tile!.owner)} />}
                            {isP1Stable && <StableRewardDisplay />}
                            {isP2Stable && <StableRewardDisplay />}

                            {isPreview && (
                                <div className={`absolute inset-0 animate-pulse`} style={{ border: '4px solid #8F0694', borderRadius: 'inherit' }}></div>
                            )}

                            {isTeleportPhase && isStart && (
                                <div className="absolute inset-0 animate-pulse bg-purple-400/20"></div>
                            )}
                            
                            {/* Global Reward Preview */}
                            {!isEditMode && tile!.currentElement && (
                                <div className="absolute bottom-0.5 left-0 w-full flex justify-center items-center pointer-events-none z-[10]">
                                    {(() => {
                                        const player = gameState.players[gameState.currentPlayerId];
                                        const isAtk = tile!.currentElement === player.elementAffinity;
                                        const multiplier = player.tileGainMultiplier || 1;
                                        const character = CHARACTERS[player.config.characterId];
                                        const amount = (isAtk ? (character?.atk ?? TILE_REWARD_ATK) : (character?.mag ?? TILE_REWARD_MAG)) * multiplier;
                                        const pipCount = Math.max(1, Math.round(amount / 10));
                                        const PipComponent = isAtk ? AtkPip : ManaPip;

                                        return (
                                            <div className="flex flex-row items-center justify-center gap-[1px] opacity-90">
                                                {Array.from({ length: pipCount }).map((_, i) => (
                                                    <PipComponent key={i} className="w-3.5 h-3.5" />
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {gameState.showTileIds && (
                                <span className="absolute top-0.5 left-1 text-[8px] text-black/40 font-bold pointer-events-none">#{tile!.id}</span>
                            )}

                            {previewData && !isEditMode && (
                                <span 
                                    className="absolute top-0.5 right-1.5 text-[14px] font-black pointer-events-none drop-shadow-sm"
                                    style={{ color: previewData.color }}
                                >
                                    {previewData.count}
                                </span>
                            )}
                        </div>
                    );
                })}

                {(Array.from(tokensByTile.entries()) as [number, TokenState[]][]).map(([tileId, tokens]) => {
                    const pos = TILE_POSITIONS[tileId as number];
                    if (!pos) return null;

                    return (tokens as TokenState[]).map((token, index) => {
                        const offsetX = (index % 2 === 0 ? -6 : 6);
                        const offsetY = (index < 2 ? -6 : 6);

                        let pixelPos = { 
                            x: pos.x * TILE_SIZE + TILE_SIZE / 2 + offsetX, 
                            y: pos.y * TILE_SIZE + TILE_SIZE / 2 + offsetY
                        };

                        if (gameState.phase === 'ANIMATING' && gameState.animation?.tokenId === token.id) {
                            const { path, step } = gameState.animation;
                            const currentTileId = path[step];
                            const currentPos = TILE_POSITIONS[currentTileId];
                            if (currentPos) {
                                pixelPos = {
                                    x: currentPos.x * TILE_SIZE + TILE_SIZE / 2,
                                    y: currentPos.y * TILE_SIZE + TILE_SIZE / 2
                                };
                            }
                        }

                        const isSelectable = !isEditMode && (gameState.phase === 'SELECT_DICE' || gameState.phase === 'MOVE' || gameState.phase === 'SELECT_TELEPORT_TOKEN') && token.playerId === gameState.currentPlayerId;
                        const isSelected = token.id === gameState.selectedTokenId;
                        const isCurrentPlayerToken = token.playerId === gameState.currentPlayerId;
                        
                        return (
                            <Token
                                key={token.id}
                                token={token}
                                position={pixelPos}
                                isSelected={isSelected}
                                isSelectable={isSelectable}
                                isCurrentPlayerToken={isCurrentPlayerToken}
                                onClick={onTokenSelect}
                            />
                        );
                    });
                })}
            </div>
        </div>
    );
};

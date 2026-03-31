import Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import type { GameState } from '@/types.ts';
import { BoardScene } from './BoardScene';

interface Props {
  gameState: GameState;
  onTileClick:  (tileId: number)  => void;
  onTokenClick: (tokenId: number) => void;
  /** Tile IDs to highlight as valid move destinations */
  highlightTileIds?: number[];
  /** Token IDs that can move this turn (used for idle-bounce animation) */
  movableTokenIds?: number[];
  /** Board camera offset and zoom */
  boardConfig?: { offsetX: number; offsetY: number; zoom: number };
  /** When true, tile IDs are overlaid on each tile */
  isEditMode?: boolean;
  width?:  number;
  height?: number;
  /** ATK bubble absorption event — change triggers scene animation */
  atkAbsorbEvent?: { tileId: number; tokenId: number; amount: number; eid: number };
  /** MAG bubble → ult button event */
  magAbsorbEvent?: { tileId: number; tokenId: number; eid: number };
  /** Ult button world position for MAG fly-to animation */
  ultButtonWorldPos?: { x: number; y: number };
  /** Element added to queue — swirling light flies to HUD */
  elementAddedEvent?: { tileId: number; tokenId: number; element: string; playerId: string; eid: number };
  /** Fired when a horse reaches the final goal — triggers sequential icon glow */
  goalReachedEvent?: { playerId: string; eid: number };
  /** Fired when player selects an element reward — triggers board glow + horse swirl */
  goalElementChosenEvent?: { playerId: string; element: string; tokenId: number; eid: number };
  /** Called by Phaser after the goal-reached glow sequence completes */
  onGoalAnimationDone?: () => void;
  /** Fires tileId when pointer enters a Normal tile, null on leave */
  onNormalTileHover?: (tileId: number | null) => void;
}

export const PhaserGame = ({
  gameState,
  onTileClick,
  onTokenClick,
  highlightTileIds = [],
  movableTokenIds  = [],
  boardConfig,
  isEditMode = false,
  width  = 760,
  height = 720,
  atkAbsorbEvent,
  magAbsorbEvent,
  ultButtonWorldPos,
  elementAddedEvent,
  goalReachedEvent,
  goalElementChosenEvent,
  onGoalAnimationDone,
  onNormalTileHover,
}: Props) => {
  const containerRef    = useRef<HTMLDivElement>(null);
  const gameRef         = useRef<Phaser.Game | null>(null);
  const sceneRef        = useRef<BoardScene | null>(null);
  const isReadyRef      = useRef(false);
  // Always hold the latest values so the 'ready' callback can use them
  const gameStateRef       = useRef(gameState);
  const highlightRef       = useRef(highlightTileIds);
  const movableRef         = useRef(movableTokenIds);
  const boardConfigRef     = useRef(boardConfig);
  const editModeRef        = useRef(isEditMode);
  useEffect(() => { gameStateRef.current    = gameState; });
  useEffect(() => { highlightRef.current    = highlightTileIds; });
  useEffect(() => { movableRef.current      = movableTokenIds; });
  useEffect(() => { boardConfigRef.current  = boardConfig; });
  useEffect(() => { editModeRef.current     = isEditMode; });

  // ── Mount Phaser game once ──────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    isReadyRef.current = false;
    const scene = new BoardScene();
    sceneRef.current = scene;

    gameRef.current = new Phaser.Game({
      type:        Phaser.AUTO,
      width,
      height,
      backgroundColor: '#1a1035',
      transparent: false,
      parent:      containerRef.current,
      scene:       scene,
      scale: {
        mode:            Phaser.Scale.FIT,
        autoCenter:      Phaser.Scale.CENTER_BOTH,
        width,
        height,
      },
      banner: false,
    });

    // 'ready' fires after all scenes complete create() — push buffered state now
    gameRef.current.events.once('ready', () => {
      isReadyRef.current = true;
      scene.onTileClick         = onTileClick;
      scene.onTokenClick        = onTokenClick;
      scene.onGoalAnimationDone = onGoalAnimationDone;
      scene.onNormalTileHover   = onNormalTileHover;
      scene.events.emit('stateUpdate',     gameStateRef.current);
      scene.events.emit('highlightTiles',  highlightRef.current);
      scene.events.emit('movableTokenIds', movableRef.current);
      scene.events.emit('editMode',        editModeRef.current);
      if (boardConfigRef.current) {
        scene.events.emit('boardConfig', boardConfigRef.current);
      }
    });

    return () => {
      isReadyRef.current = false;
      gameRef.current?.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount once only

  // ── Keep callbacks up to date ────────────────────────────────────────
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.onTileClick        = onTileClick;
    sceneRef.current.onTokenClick       = onTokenClick;
    sceneRef.current.onNormalTileHover  = onNormalTileHover;
  }, [onTileClick, onTokenClick, onNormalTileHover]);

  // ── Push game state into Phaser scene (only after scene is ready) ─────
  useEffect(() => {
    if (!isReadyRef.current || !sceneRef.current) return;
    sceneRef.current.events.emit('stateUpdate', gameState);
  }, [gameState]);

  // ── Push highlight tile list into scene ──────────────────────────────
  useEffect(() => {
    if (!isReadyRef.current || !sceneRef.current) return;
    sceneRef.current.events.emit('highlightTiles', highlightTileIds);
  }, [highlightTileIds]);

  // ── Push movable token IDs into scene ────────────────────────────────
  useEffect(() => {
    if (!isReadyRef.current || !sceneRef.current) return;
    sceneRef.current.events.emit('movableTokenIds', movableTokenIds);
  }, [movableTokenIds]);

  // ── Push board camera config into scene ──────────────────────────────
  useEffect(() => {
    if (!isReadyRef.current || !sceneRef.current || !boardConfig) return;
    sceneRef.current.events.emit('boardConfig', boardConfig);
  }, [boardConfig]);

  // ── Push edit mode flag into scene ───────────────────────────────────
  useEffect(() => {
    if (!isReadyRef.current || !sceneRef.current) return;
    sceneRef.current.events.emit('editMode', isEditMode);
  }, [isEditMode]);

  // ── ATK bubble absorption ─────────────────────────────────────────────
  useEffect(() => {
    if (!isReadyRef.current || !sceneRef.current || !atkAbsorbEvent) return;
    sceneRef.current.events.emit('atkBubbleAbsorb', atkAbsorbEvent);
  }, [atkAbsorbEvent]);

  // ── MAG bubble → ult button ──────────────────────────────────────────
  useEffect(() => {
    if (!isReadyRef.current || !sceneRef.current || !magAbsorbEvent) return;
    sceneRef.current.events.emit('magBubbleAbsorb', magAbsorbEvent);
  }, [magAbsorbEvent]);

  // ── Ult button world position ────────────────────────────────────────
  useEffect(() => {
    if (!isReadyRef.current || !sceneRef.current || !ultButtonWorldPos) return;
    sceneRef.current.events.emit('ultButtonWorldPos', ultButtonWorldPos);
  }, [ultButtonWorldPos]);

  // ── Element added to queue → swirling light fly-to HUD ───────────────
  useEffect(() => {
    if (!isReadyRef.current || !sceneRef.current || !elementAddedEvent) return;
    sceneRef.current.events.emit('elementAdded', elementAddedEvent);
  }, [elementAddedEvent]);

  // ── Keep onGoalAnimationDone callback up to date ──────────────────────
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.onGoalAnimationDone = onGoalAnimationDone;
  }, [onGoalAnimationDone]);

  // ── Goal reached → trigger sequential icon glow ───────────────────────
  useEffect(() => {
    if (!isReadyRef.current || !sceneRef.current || !goalReachedEvent) return;
    sceneRef.current.events.emit('goalReached', { playerId: goalReachedEvent.playerId });
  }, [goalReachedEvent]);

  // ── Goal element chosen → board glow + horse swirl ────────────────────
  useEffect(() => {
    if (!isReadyRef.current || !sceneRef.current || !goalElementChosenEvent) return;
    sceneRef.current.events.emit('goalElementChosen', goalElementChosenEvent);
  }, [goalElementChosenEvent]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset:    0,
        overflow: 'hidden',
      }}
    />
  );
};

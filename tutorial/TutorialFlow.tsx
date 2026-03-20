// ============================================================
// TUTORIAL FLOW — Main container for the Tutorial mode
// Manages game state (Player1 vs Bot), adaptive highlight,
// bot turns, narrative events, and tutorial phase transitions.
// Reuses base game components: Board, PlayerInfo, etc.
// ============================================================

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// --- Base game imports (via @/ alias → v3/) ---
import type { GameState, TokenState, PlayerID } from '@/types.ts';
import { TileType } from '@/types.ts';
import { Board } from '@/components/Board.tsx';
import { PlayerInfo } from '@/components/PlayerInfo.tsx';
import { EmptyTilePopup } from '@/components/EmptyTilePopup.tsx';
import { GoalRewardPopup } from '@/components/GoalRewardPopup.tsx';
import {
  TILE_SIZE,
  EMPTY_TILE_IDS,
  ELEMENTAL_TILES,
} from '@/constants.ts';
import { findPath } from '@/utils/pathfinding.ts';
import {
  resolveMove,
  endTurn,
  addLog,
  hasAnyLegalMove,
  awardMana,
  getRandomElement,
} from '@/utils/gameLogic.ts';
import { ULTIMATES } from '@/config/characters.ts';
import { TILE_POSITIONS } from '@/boardLayout.ts';

// --- Tutorial-internal imports (via @tutorial/ alias → v3/tutorial/) ---
import { createTutorialGameState, createVan2GameState } from '@tutorial/utils/tutorialGameInit.ts';
import { VAN1_BOT_SCRIPT, VAN2_BOT_SCRIPT, SCRIPTED_PHASE_END_ROUND } from '@tutorial/config/botScripts.ts';
import {
  TUT_BOT_TURN_DELAY_MS,
  TUT_ANIMATION_STEP_DELAY,
} from '@tutorial/config/balance.ts';
import type {
  TutorialStage,
  TutorialPhase,
  BotMode,
  ActionType,
  AdaptiveHighlightState,
} from '@tutorial/types.ts';
import { NARRATIVE_IDS } from '@tutorial/types.ts';
import { WelcomeModal }      from '@tutorial/components/WelcomeModal.tsx';
import { TransitionScreen }  from '@tutorial/components/TransitionScreen.tsx';
import { CompletionModal }   from '@tutorial/components/CompletionModal.tsx';
import { NarrativeModal }    from '@tutorial/components/NarrativeModal.tsx';
import type { NarrativeModalData } from '@tutorial/components/NarrativeModal.tsx';
import { TutorialOverlay }   from '@tutorial/components/TutorialOverlay.tsx';
import {
  useAdaptiveHighlight,
  createDefaultHighlightState,
} from '@tutorial/hooks/useAdaptiveHighlight.ts';

// ─── Types ──────────────────────────────────────────────────

interface TutorialFlowProps {
  onExitTutorial: () => void; // Called when player exits (skip or complete)
}

// ─── Component ──────────────────────────────────────────────

export const TutorialFlow: React.FC<TutorialFlowProps> = ({ onExitTutorial }) => {
  // --- Tutorial meta state ---
  const [tutorialPhase,  setTutorialPhase]  = useState<TutorialPhase>('WELCOME');
  const [tutorialStage,  setTutorialStage]  = useState<TutorialStage>('VAN_1');
  const [botMode,        setBotMode]        = useState<BotMode>('SCRIPTED');
  const botScriptStepRef = useRef(0);
  const powerRollFirstUseRef = useRef(true); // Ván 2: force first Power Roll success
  const narrativeSeenRef = useRef<Set<string>>(new Set());

  // --- Game state ---
  const [gameState, setGameState] = useState<GameState>(() => createTutorialGameState());
  const [isMoveValid, setIsMoveValid] = useState(true);

  // --- Narrative modal ---
  const [narrativeModal, setNarrativeModal] = useState<NarrativeModalData | null>(null);

  // --- Adaptive highlight state ---
  const [highlightState, setHighlightState] = useState<AdaptiveHighlightState>(
    createDefaultHighlightState
  );

  // --- Refs ---
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const botTimeoutRef       = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Adaptive highlight hook ─────────────────────────────

  const showTier3 = useCallback((action: ActionType) => {
    setHighlightState(prev => ({ ...prev, hintTier: 3, currentAction: action }));
  }, []);

  const highlightHook = useAdaptiveHighlight({
    setHighlightState,
    onShowTier3: showTier3,
  });

  // ─── Narrative helper ────────────────────────────────────

  const showNarrative = useCallback((data: NarrativeModalData) => {
    if (narrativeSeenRef.current.has(data.id)) return;
    narrativeSeenRef.current.add(data.id);
    highlightHook.pauseAfkTimer();
    setNarrativeModal(data);
  }, [highlightHook]);

  const closeNarrative = useCallback(() => {
    setNarrativeModal(null);
    // Resume AFK timer for current action
    if (gameState.currentPlayerId === 'Player1') {
      highlightHook.startAfkTimer(highlightState.currentAction);
    }
  }, [gameState.currentPlayerId, highlightHook, highlightState.currentAction]);

  // ─── Move validity check ─────────────────────────────────

  useEffect(() => {
    if (gameState.phase === 'MOVE' && gameState.selectedTokenId !== null) {
      const player = gameState.players[gameState.currentPlayerId];
      const token  = player.tokens.find(t => t.id === gameState.selectedTokenId);
      const diceTotal = gameState.dice.reduce((a, b) => a + b, 0);
      if (token && diceTotal > 0) {
        const path = findPath(token.tileId, diceTotal, player.id, gameState);
        const destId = path[path.length - 1];
        const isBlockedByFriendly = gameState.board.flat()
          .find(t => t?.id === destId)?.type !== TileType.SafeZone
          && player.tokens.some(t => t.tileId === destId && t.id !== token.id);
        setIsMoveValid(!isBlockedByFriendly);
      }
    } else {
      setIsMoveValid(true);
    }
  }, [gameState.phase, gameState.selectedTokenId, gameState.dice, gameState]);

  // ─── Animation loop (same pattern as App.tsx) ─────────────

  useEffect(() => {
    if (gameState.phase !== 'ANIMATING' || !gameState.animation) {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      return;
    }
    const { path, step } = gameState.animation;
    if (step >= path.length - 1) {
      setGameState(prev => resolveMove(prev));
    } else {
      animationTimeoutRef.current = setTimeout(() => {
        setGameState(prev => {
          if (prev.phase !== 'ANIMATING' || !prev.animation) return prev;
          return { ...prev, animation: { ...prev.animation, step: prev.animation.step + 1 } };
        });
      }, TUT_ANIMATION_STEP_DELAY);
    }
    return () => { if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current); };
  }, [gameState.phase, gameState.animation]);

  // ─── Win/round-limit detection → end game or transition ──

  useEffect(() => {
    if (gameState.phase !== 'END' && !gameState.winner) return;
    if (tutorialPhase !== 'PLAYING') return;

    highlightHook.clearAllTimers();
    if (tutorialStage === 'VAN_1') {
      // Transition to Ván 2
      setTimeout(() => setTutorialPhase('TRANSITION'), 800);
    } else {
      // Show completion modal
      setTimeout(() => setTutorialPhase('COMPLETE'), 800);
    }
  }, [gameState.phase, gameState.winner, tutorialPhase, tutorialStage, highlightHook]);

  // ─── Post-move narrative detection ────────────────────────

  useEffect(() => {
    if (gameState.phase === 'ANIMATING' || tutorialPhase !== 'PLAYING') return;

    const p1 = gameState.players.Player1;

    // Ván 1: First element collected (same affinity)
    if (
      tutorialStage === 'VAN_1' &&
      p1.elementQueue.length > 0 &&
      gameState.currentPlayerId === 'Player1' &&
      gameState.phase === 'SELECT_DICE'
    ) {
      const lastEl = p1.elementQueue[p1.elementQueue.length - 1];
      if (lastEl === p1.elementAffinity) {
        showNarrative({
          id: NARRATIVE_IDS.FIRST_ELEMENT_AFFINITY,
          icon: '🔥',
          title: 'Thu thập nguyên tố!',
          body: `Nhận ${lastEl === TileType.Fire ? 'Fire 🔥' : lastEl}! Cùng Affinity → +30 ATK cho ngựa đó.`,
          variant: 'info',
        });
      } else {
        showNarrative({
          id: NARRATIVE_IDS.FIRST_ELEMENT_OTHER,
          icon: '❄️',
          title: 'Thu thập nguyên tố!',
          body: `Nhận nguyên tố khác Affinity → +10 Mana. Mana đủ 50 → dùng Ultimate!`,
          variant: 'info',
        });
      }
    }
  }, [gameState.phase, gameState.currentPlayerId, tutorialStage, tutorialPhase, showNarrative, gameState.players]);

  // ─── Bot turn handler ─────────────────────────────────────

  const doBotTurn = useCallback(() => {
    // Flags for side effects that must run OUTSIDE the state updater
    let pendingNarrative: { data: NarrativeModalData; delay: number } | null = null;
    let shouldSwitchToRandom = false;

    setGameState(prev => {
      if (prev.currentPlayerId !== 'Player2' || prev.phase !== 'SELECT_DICE') return prev;

      const script = tutorialStage === 'VAN_1' ? VAN1_BOT_SCRIPT : VAN2_BOT_SCRIPT;
      const isScripted = botMode === 'SCRIPTED' && prev.currentRound <= SCRIPTED_PHASE_END_ROUND;
      const scriptStep = script[botScriptStepRef.current];

      const newState: GameState = JSON.parse(JSON.stringify(prev));
      const bot = newState.players.Player2;
      const player1 = newState.players.Player1;

      // Pick dice
      let diceValues: [number, number];
      if (isScripted && scriptStep) {
        diceValues = scriptStep.diceValues;
        botScriptStepRef.current++;
      } else {
        diceValues = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
        ] as [number, number];
        if (prev.currentRound > SCRIPTED_PHASE_END_ROUND && botMode === 'SCRIPTED') {
          shouldSwitchToRandom = true;
        }
      }

      const diceTotal = diceValues[0] + diceValues[1];
      newState.dice = diceValues;

      // Pre-set bot queue for forceCombo (Ván 2 Round 2)
      if (isScripted && scriptStep?.preSetQueue) {
        const elementMap: Record<string, TileType> = {
          fire: TileType.Fire, ice: TileType.Ice,
          grass: TileType.Grass, rock: TileType.Rock,
        };
        bot.elementQueue = scriptStep.preSetQueue
          .map(s => elementMap[s])
          .filter(Boolean) as TileType[];
      }

      // Pick token
      const tokenIdx = (isScripted && scriptStep) ? (scriptStep.tokenIdx ?? 0) : 0;
      const botToken = bot.tokens[tokenIdx] ?? bot.tokens[0];
      if (!botToken) return endTurn(newState);

      // Build path
      let path = findPath(botToken.tileId, diceTotal, 'Player2', newState);
      if (path.length <= 1) {
        // No valid move → end turn
        return endTurn(newState);
      }

      // forceKick: try to land on a Player1 token (Ván 1 Round 5)
      // Optimized: for each bot token, pre-compute reachable tiles per dice total (2–12),
      // then check if any p1 tile is reachable — avoids 36 findPath calls per token pair.
      if (isScripted && scriptStep?.forceKick && player1.hp > 50) {
        const p1TileSet = new Set(player1.tokens.map(t => t.tileId));
        const flatBoard = newState.board.flat();
        let found = false;
        outer: for (const botTok of bot.tokens) {
          for (let total = 2; total <= 12; total++) {
            const testPath = findPath(botTok.tileId, total, 'Player2', newState);
            const destId = testPath[testPath.length - 1];
            if (p1TileSet.has(destId)) {
              const destTile = flatBoard.find(t => t?.id === destId);
              if (destTile?.type !== TileType.SafeZone) {
                // Find a valid (d1, d2) pair that sums to total
                const d1 = Math.min(6, Math.max(1, total - 6));
                const d2 = total - d1;
                newState.dice = [d1, d2];
                path = testPath;
                newState.animation = { tokenId: botTok.id, path, step: 0 };
                newState.phase = 'ANIMATING';
                newState.logs = addLog(newState, `Bot tìm thấy mục tiêu và tấn công!`);
                pendingNarrative = {
                  data: {
                    id: NARRATIVE_IDS.FIRST_KICK_RECEIVED,
                    icon: '⚔️',
                    title: 'Bị Bắt Ngựa!',
                    body: 'Bot tấn công ngựa của bạn! Khi ngựa địch đáp vào ô bạn đang đứng → bạn mất HP. Đứng ở ô Safe Zone (màu đỏ) để được bảo vệ!',
                    variant: 'kick',
                  },
                  delay: 1200,
                };
                found = true;
                break outer;
              }
            }
          }
        }
        if (found) return newState;
      }

      // Normal scripted / random move
      newState.animation = { tokenId: botToken.id, path, step: 0 };
      newState.phase = 'ANIMATING';
      newState.logs = addLog(newState, `Bot đổ [${diceValues[0]}, ${diceValues[1]}] và di chuyển.`);

      // Handle bot ultimate (Ván 2 Round 5)
      if (isScripted && scriptStep?.useUltimate && bot.mana >= bot.manaCap) {
        bot.mana -= bot.manaCap;
        newState.ultimateExtraRolls += 1;
        pendingNarrative = {
          data: {
            id: NARRATIVE_IDS.BOT_ULTIMATE,
            icon: '⚡',
            title: 'Bot dùng Ultimate!',
            body: 'Bot tiêu 50 Mana để nhận thêm 1 lượt đổ xúc xắc. Bạn cũng có thể làm điều này khi đủ Mana!',
            variant: 'warning',
          },
          delay: 800,
        };
      }

      return newState;
    });

    // Side effects run outside the updater to avoid StrictMode double-invoke issues
    if (shouldSwitchToRandom) setBotMode('RANDOM');
    if (pendingNarrative) {
      const { data, delay } = pendingNarrative;
      setTimeout(() => showNarrative(data), delay);
    }
  }, [tutorialStage, botMode, showNarrative]);

  // ─── Bot turn trigger ─────────────────────────────────────

  useEffect(() => {
    if (
      gameState.currentPlayerId !== 'Player2' ||
      gameState.phase !== 'SELECT_DICE' ||
      gameState.winner !== null ||
      tutorialPhase !== 'PLAYING'
    ) return;

    highlightHook.pauseAfkTimer();
    botTimeoutRef.current = setTimeout(() => doBotTurn(), TUT_BOT_TURN_DELAY_MS);
    return () => { if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current); };
  }, [gameState.currentPlayerId, gameState.phase, gameState.winner, tutorialPhase, doBotTurn]);

  // ─── After bot animation: handle bot artifact (Ván 2) ────

  useEffect(() => {
    if (
      gameState.currentPlayerId !== 'Player2' ||
      gameState.phase !== 'EMPTY_TILE_INTERACTION' ||
      tutorialPhase !== 'PLAYING'
    ) return;

    // Bot auto-uses Swap artifact
    const script = tutorialStage === 'VAN_2' ? VAN2_BOT_SCRIPT : [];
    const prevStep = botScriptStepRef.current - 1; // Already incremented by doBotTurn
    const scriptStep = prevStep >= 0 ? script[prevStep] : undefined;
    const artifactToUse = scriptStep?.useArtifact ?? 'Swap';

    setTimeout(() => {
      setGameState(prev => {
        const newState: GameState = JSON.parse(JSON.stringify(prev));
        const bot = newState.players.Player2;
        const q = bot.elementQueue;

        if (artifactToUse === 'Swap' && q.length >= 2) {
          [q[0], q[1]] = [q[1], q[0]];
        } else if (artifactToUse === 'Charge') {
          q.push(bot.elementAffinity ?? TileType.Ice);
        } else if (artifactToUse === 'Change' && q.length > 0) {
          q[0] = bot.elementAffinity ?? TileType.Ice;
        }

        newState.phase = 'SELECT_DICE';
        newState.logs = addLog(newState, `Bot sử dụng Artifact: ${artifactToUse}`);
        return endTurn(newState);
      });

      showNarrative({
        id: NARRATIVE_IDS.FIRST_ARTIFACT,
        icon: '🔮',
        title: 'Bot dùng Artifact!',
        body: 'Khi đáp vào Ô Trống, bạn có thể dùng Artifact để thay đổi Element Queue. Swap đổi vị trí, Change đổi nguyên tố, Charge thêm nguyên tố!',
        variant: 'info',
      });
    }, 600);
  }, [gameState.phase, gameState.currentPlayerId, tutorialPhase, tutorialStage, showNarrative]);

  // ─── After player's turn ends: start AFK timer ───────────

  useEffect(() => {
    if (
      gameState.currentPlayerId !== 'Player1' ||
      tutorialPhase !== 'PLAYING' ||
      gameState.winner !== null
    ) return;

    if (gameState.phase === 'SELECT_DICE') {
      highlightHook.startAfkTimer('rollDice');
    } else if (gameState.phase === 'MOVE') {
      highlightHook.startAfkTimer('selectToken');
    } else if (gameState.phase === 'EMPTY_TILE_INTERACTION') {
      highlightHook.startAfkTimer('useArtifact');
    }
  }, [gameState.phase, gameState.currentPlayerId, tutorialPhase, gameState.winner, highlightHook]);

  // ─── Mana cap → show Ultimate hint ───────────────────────

  useEffect(() => {
    if (tutorialStage !== 'VAN_2') return;
    const p1 = gameState.players.Player1;
    if (p1.mana >= p1.manaCap) {
      showNarrative({
        id: NARRATIVE_IDS.ULTIMATE_HINT,
        icon: '⚡',
        title: 'Bạn đủ Mana!',
        body: 'Bạn có 50 Mana! Bấm nút Ultimate để nhận thêm 1 lượt đổ xúc xắc trong turn hiện tại.',
        variant: 'warning',
      });
    }
  }, [gameState.players.Player1.mana, tutorialStage, showNarrative]);

  // ─── hasLegalMoves memoized ───────────────────────────────

  const hasLegalMoves = useMemo(() => {
    if (gameState.phase !== 'MOVE') return true;
    return hasAnyLegalMove(gameState, gameState.currentPlayerId);
  }, [gameState]);

  // ─── Player handlers (same pattern as App.tsx) ────────────

  const handleRollDice = useCallback((count: 1 | 2, targetRange?: [number, number]) => {
    if (gameState.currentPlayerId !== 'Player1') return;
    if (gameState.winner || gameState.phase !== 'SELECT_DICE') return;

    setGameState(prev => {
      const { currentPlayerId, accuracyRate } = prev;
      const players = { ...prev.players };
      const currentPlayer = { ...players[currentPlayerId] };
      currentPlayer.tokens = currentPlayer.tokens.map(t => ({ ...t }));
      currentPlayer.manaFeedbackQueue = [...currentPlayer.manaFeedbackQueue];
      players[currentPlayerId] = currentPlayer;

      const now = Date.now();
      const matchStartTime = prev.matchStartTime ?? now;
      const turnStartTime  = prev.turnStartTime  ?? now;

      let newDice: number[];
      let diceTotal: number;

      // Power Roll
      let isPowerRollSuccess = false;
      if (targetRange) {
        // Ván 2: force success on first use
        if (tutorialStage === 'VAN_2' && powerRollFirstUseRef.current) {
          powerRollFirstUseRef.current = false;
          isPowerRollSuccess = true;
        } else {
          isPowerRollSuccess = Math.random() * 100 < accuracyRate;
        }
      }

      if (isPowerRollSuccess && targetRange) {
        diceTotal = Math.floor(Math.random() * (targetRange[1] - targetRange[0] + 1)) + targetRange[0];
        let d1 = Math.floor(Math.random() * 6) + 1;
        let d2 = diceTotal - d1;
        let attempts = 0;
        while ((d2 < 1 || d2 > 6) && attempts < 20) {
          d1 = Math.floor(Math.random() * 6) + 1;
          d2 = diceTotal - d1;
          attempts++;
        }
        if (d2 < 1 || d2 > 6) { d2 = Math.max(1, Math.min(6, d2)); d1 = diceTotal - d2; }
        newDice = [d1, d2];
      } else {
        newDice = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
        diceTotal = newDice.reduce((a, b) => a + b, 0);
      }

      const isDoubles = newDice.length === 2 && newDice[0] === newDice[1];
      if (isDoubles) awardMana(currentPlayer, 30, 'Double Roll');

      const updatedLogs = addLog(prev, `${currentPlayer.name} đổ xúc xắc: [${newDice.join(', ')}] = ${diceTotal}`);
      const tempState = { ...prev, players, logs: updatedLogs, matchStartTime, turnStartTime };

      const movableTokens = currentPlayer.tokens.filter(
        t => t.frozenRounds <= 0 && findPath(t.tileId, diceTotal, currentPlayerId, tempState).length > 1
      );

      if (movableTokens.length === 0) {
        return endTurn({ ...tempState, diceCount: count, dice: newDice, hasRolledDoubles: isDoubles });
      }

      const defaultTokenId = movableTokens[0].id;
      return {
        ...tempState,
        diceCount: count,
        dice: newDice,
        hasRolledDoubles: isDoubles,
        phase: 'MOVE',
        selectedTokenId: defaultTokenId,
      };
    });

    // Record adaptive highlight
    highlightHook.recordAction('rollDice', true);
  }, [gameState, tutorialStage, highlightHook]);

  const handleTokenSelect = useCallback((token: TokenState) => {
    if (gameState.phase !== 'MOVE' || gameState.currentPlayerId !== token.playerId || token.frozenRounds > 0) {
      highlightHook.recordAction('selectToken', false);
      return;
    }
    setGameState(prev => ({ ...prev, selectedTokenId: token.id }));
    highlightHook.recordAction('selectToken', true);
    highlightHook.resetAfkTimer('selectToken');
  }, [gameState.phase, gameState.currentPlayerId, highlightHook]);

  const handleConfirmMove = useCallback(() => {
    if (gameState.phase !== 'MOVE' || gameState.selectedTokenId === null || gameState.winner || !isMoveValid) return;
    setGameState(prev => {
      const player = prev.players[prev.currentPlayerId];
      const token  = player.tokens.find(t => t.id === prev.selectedTokenId);
      if (!token) return endTurn(prev);
      const path   = findPath(token.tileId, prev.dice.reduce((a, b) => a + b, 0), player.id, prev);
      if (path.length <= 1) return endTurn(prev);
      return { ...prev, phase: 'ANIMATING', animation: { tokenId: token.id, path, step: 0 } };
    });
  }, [gameState.phase, gameState.selectedTokenId, gameState.winner, isMoveValid]);

  const handleDeadlockEndTurn = useCallback(() => {
    setGameState(prev => endTurn(prev));
  }, []);

  const handleUltimateActivate = useCallback(() => {
    if (gameState.currentPlayerId !== 'Player1') return;
    const player = gameState.players.Player1;
    const ultimateDef = ULTIMATES[player.config.ultimateType];
    if (!ultimateDef || player.mana < player.manaCap) return;

    setGameState(prev => {
      const newState: GameState = JSON.parse(JSON.stringify(prev));
      const p = newState.players.Player1;
      p.mana = 0;
      newState.ultimateExtraRolls += 1;
      newState.logs = addLog(newState, 'Player1 kích hoạt Ultimate! Nhận thêm 1 lượt đổ.');
      return newState;
    });

    highlightHook.recordAction('activateUltimate', true);
  }, [gameState, highlightHook]);

  const handleClearManaFeedback = useCallback((playerId: PlayerID) => {
    setGameState(prev => ({
      ...prev,
      players: {
        ...prev.players,
        [playerId]: { ...prev.players[playerId], manaFeedbackQueue: [] },
      },
    }));
  }, []);

  // Empty tile popup handlers (player)
  const handleEmptyTileAction = useCallback((action: 'Swap' | 'Change' | 'Charge') => {
    setGameState(prev => {
      const newState: GameState = JSON.parse(JSON.stringify(prev));
      const player = newState.players[newState.currentPlayerId];
      const q = player.elementQueue;

      if (action === 'Swap' && q.length >= 2) {
        [q[0], q[1]] = [q[1], q[0]];
      } else if (action === 'Change' && q.length > 0) {
        q[0] = player.elementAffinity ?? TileType.Fire;
      } else if (action === 'Charge') {
        const el = player.elementAffinity ?? TileType.Fire;
        if (q.length < 8) q.push(el); else { q.shift(); q.push(el); }
      }

      newState.logs = addLog(newState, `${player.name} dùng Artifact: ${action}`);
      return endTurn({ ...newState, phase: 'SELECT_DICE' });
    });

    highlightHook.recordAction('useArtifact', true);
  }, [highlightHook]);

  const handleGoalRewardSelect = useCallback((element: TileType) => {
    setGameState(prev => {
      const newState: GameState = JSON.parse(JSON.stringify(prev));
      const player = newState.players[newState.currentPlayerId];
      if (player.elementQueue.length < 8) {
        player.elementQueue.push(element);
      }
      return endTurn({ ...newState, phase: 'SELECT_DICE' });
    });
  }, []);

  // ─── Tutorial lifecycle ──────────────────────────────────

  const startPlaying = useCallback(() => {
    setTutorialPhase('PLAYING');
    setTutorialStage('VAN_1');
    setGameState(createTutorialGameState());
    setBotMode('SCRIPTED');
    botScriptStepRef.current = 0;
    narrativeSeenRef.current = new Set();
    powerRollFirstUseRef.current = true;
    setHighlightState(createDefaultHighlightState());
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setTutorialStage('VAN_2');
    setGameState(createVan2GameState());
    setBotMode('SCRIPTED');
    botScriptStepRef.current = 0;
    powerRollFirstUseRef.current = true;
    setHighlightState(createDefaultHighlightState());
    setTutorialPhase('PLAYING');
  }, []);

  const handleReplay = useCallback(() => {
    startPlaying();
  }, [startPlaying]);

  // ─── Auto-perform handler (Làm hộ tôi) ──────────────────

  const handleAutoPerform = useCallback((action: ActionType) => {
    // Does NOT count toward consecutiveCorrect
    switch (action) {
      case 'rollDice':
        if (gameState.phase === 'SELECT_DICE') {
          handleRollDice(2);
          // Reset consecutiveCorrect back (auto-perform doesn't count)
          setHighlightState(prev => ({
            ...prev,
            actionProgress: {
              ...prev.actionProgress,
              rollDice: { consecutiveCorrect: 0 },
            },
            highlightDisabled: { ...prev.highlightDisabled, rollDice: false },
          }));
        }
        break;
      case 'selectToken':
        if (gameState.phase === 'MOVE') handleConfirmMove();
        break;
      case 'useArtifact':
        if (gameState.phase === 'EMPTY_TILE_INTERACTION') handleEmptyTileAction('Swap');
        break;
      case 'activateUltimate':
        handleUltimateActivate();
        break;
    }
  }, [gameState.phase, handleRollDice, handleConfirmMove, handleEmptyTileAction, handleUltimateActivate]);

  const dismissTier3 = useCallback(() => {
    setHighlightState(prev => ({ ...prev, hintTier: 1 }));
    if (gameState.currentPlayerId === 'Player1') {
      highlightHook.resetAfkTimer(highlightState.currentAction);
    }
  }, [gameState.currentPlayerId, highlightHook, highlightState.currentAction]);

  // ─── Stage label ─────────────────────────────────────────

  const stageLabel = tutorialStage === 'VAN_1'
    ? 'Tutorial Ván 1 — Cơ Bản'
    : 'Tutorial Ván 2 — Nâng Cao';

  // ─── Highlight class helper ───────────────────────────────

  const getDiceBtnClass = () => {
    const base = 'tut-highlight-target';
    return !highlightState.highlightDisabled.rollDice &&
      highlightState.hintTier >= 1 &&
      highlightState.currentAction === 'rollDice' &&
      gameState.currentPlayerId === 'Player1'
      ? base : '';
  };

  const getUltimateBtnClass = () => {
    const base = 'tut-highlight-target';
    return !highlightState.highlightDisabled.activateUltimate &&
      highlightState.hintTier >= 1 &&
      highlightState.currentAction === 'activateUltimate' &&
      gameState.currentPlayerId === 'Player1'
      ? base : '';
  };

  // ─── Render ──────────────────────────────────────────────

  if (tutorialPhase === 'WELCOME') {
    return (
      <WelcomeModal
        onStart={startPlaying}
        onSkip={onExitTutorial}
      />
    );
  }

  if (tutorialPhase === 'TRANSITION') {
    return <TransitionScreen onComplete={handleTransitionComplete} />;
  }

  if (tutorialPhase === 'COMPLETE') {
    return (
      <CompletionModal
        onPlayNew={onExitTutorial}
        onReplay={handleReplay}
        onMenu={onExitTutorial}
      />
    );
  }

  // tutorialPhase === 'PLAYING'
  return (
    <div className="relative min-h-screen bg-gray-950 text-white flex flex-col font-sans overflow-hidden">
      {/* Tutorial header bar */}
      <header className="bg-gray-950 shadow-2xl p-3 flex items-center justify-between px-8 z-50 sticky top-0 border-b border-white/10">
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none text-indigo-400">
            Elemental Hunter
          </h1>
          <span className="text-[9px] font-bold text-amber-500 uppercase tracking-[0.2em] mt-1">
            📚 {stageLabel}
          </span>
        </div>

        {/* Round counter */}
        <div className={`flex items-center gap-4 px-6 py-2 rounded-full border-2 transition-all duration-500 ${gameState.currentRound > gameState.maxRounds - 2 ? 'border-red-600 bg-red-950/30' : 'border-white/10 bg-white/5'}`}>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Round</span>
          <span className={`text-2xl font-black italic ${gameState.currentRound > gameState.maxRounds - 2 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {gameState.currentRound}
          </span>
          <span className="text-gray-600 font-black text-xl">/</span>
          <span className="text-gray-400 font-black text-xl">{gameState.maxRounds}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            {gameState.currentPlayerId === 'Player1' ? '🟦 Lượt của BẠN' : '🟥 Lượt của BOT'}
          </span>
          <button
            onClick={handleReplay}
            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border border-amber-700/50 bg-amber-950/40 text-amber-400 hover:bg-amber-900/50 hover:border-amber-500 transition-all"
            title="Chơi lại từ đầu Tutorial"
          >
            ↺ Reset
          </button>
          <button
            onClick={onExitTutorial}
            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border border-gray-700/50 bg-gray-800/40 text-gray-400 hover:bg-gray-700/50 hover:text-white transition-all"
            title="Thoát Tutorial, quay về màn hình chính"
          >
            ✕ Thoát
          </button>
        </div>
      </header>

      {/* Main game area — same layout as App.tsx */}
      <main className="flex-grow flex items-center justify-between px-8 py-4 overflow-hidden">
        {/* Left: Player2 (Bot) info */}
        <div className="shrink-0 z-20">
          <PlayerInfo
            player={gameState.players.Player2}
            isActive={gameState.currentPlayerId === 'Player2'}
            onAddToken={() => {}}
            disabled={gameState.currentPlayerId === 'Player2' || gameState.phase === 'ANIMATING'}
            onUltimateActivate={() => {}}
            onClearManaFeedback={handleClearManaFeedback}
            gameState={gameState}
            onRollDice={() => {}}
            onConfirmMove={() => {}}
            isMoveValid={false}
            hasLegalMoves={false}
            onDeadlockEndTurn={() => {}}
          />
        </div>

        {/* Center: Board */}
        <div className="relative flex-grow flex flex-col items-center justify-center gap-8">
          <div className="relative shadow-[0_0_150px_rgba(0,0,0,0.8)] rounded-xl bg-gray-950/40 border border-white/5 p-10">
            <Board
              gameState={gameState}
              onTokenClick={handleTokenSelect}
              onTileClick={() => {}}
              isEditMode={false}
              previewTileId={null}
              visualEffects={[]}
            />

            {/* Empty tile popup (player) */}
            {gameState.phase === 'EMPTY_TILE_INTERACTION' && gameState.currentPlayerId === 'Player1' && (
              <EmptyTilePopup
                gameState={gameState}
                onAction={handleEmptyTileAction}
                onMinimize={() => {}}
                isTutorial
              />
            )}

            {/* Goal reward popup */}
            {gameState.phase === 'GOAL_REWARD_SELECTION' && gameState.currentPlayerId === 'Player1' && (
              <GoalRewardPopup
                gameState={gameState}
                onSelect={handleGoalRewardSelect}
              />
            )}
          </div>
        </div>

        {/* Right: Player1 (Human) info */}
        <div className="shrink-0 z-20">
          <PlayerInfo
            player={gameState.players.Player1}
            isActive={gameState.currentPlayerId === 'Player1'}
            onAddToken={() => {}}
            disabled={gameState.currentPlayerId !== 'Player1' || gameState.phase === 'ANIMATING'}
            onUltimateActivate={handleUltimateActivate}
            onClearManaFeedback={handleClearManaFeedback}
            gameState={gameState}
            onRollDice={handleRollDice}
            onConfirmMove={handleConfirmMove}
            isMoveValid={isMoveValid}
            hasLegalMoves={hasLegalMoves}
            onDeadlockEndTurn={handleDeadlockEndTurn}
            diceButtonClassName={getDiceBtnClass()}
            ultimateButtonClassName={getUltimateBtnClass()}
            tokenSelectableClassName={
              !highlightState.highlightDisabled.selectToken &&
              highlightState.hintTier >= 1 &&
              highlightState.currentAction === 'selectToken' &&
              gameState.currentPlayerId === 'Player1'
                ? 'tut-highlight-target'
                : ''
            }
          />
        </div>
      </main>

      {/* Tutorial Overlay (highlights, tooltip, Tier 3 modal) */}
      <TutorialOverlay
        highlightState={highlightState}
        isBotTurn={gameState.currentPlayerId === 'Player2'}
        onAutoPerform={handleAutoPerform}
        onDismissTier3={dismissTier3}
      />

      {/* Narrative modal (one-time explanations) */}
      {narrativeModal && (
        <NarrativeModal data={narrativeModal} onClose={closeNarrative} />
      )}
    </div>
  );
};

// ============================================================
// ADAPTIVE HIGHLIGHT HOOK
// Theo GDD mục 4: track consecutiveCorrect per action,
// tắt highlight sau 3 lần đúng liên tiếp.
// AFK Safety Net: >5s → bật lại highlight.
// 3-Tier Hint: 0s highlight, +3s tooltip, +10s modal.
// ============================================================

import { useRef, useCallback } from 'react';
import type { ActionType, HintTier, AdaptiveHighlightState } from '@tutorial/types.ts';
import {
  TUT_HIGHLIGHT_DISABLE_THRESHOLD,
  TUT_AFK_TIMEOUT_MS,
  TUT_HINT_TIER2_MS,
  TUT_HINT_TIER3_MS,
} from '@tutorial/config/balance.ts';

interface UseAdaptiveHighlightOptions {
  setHighlightState: (updater: (prev: AdaptiveHighlightState) => AdaptiveHighlightState) => void;
  onShowTier3: (action: ActionType) => void; // Callback to show Tier 3 modal
}

export const useAdaptiveHighlight = ({
  setHighlightState,
  onShowTier3,
}: UseAdaptiveHighlightOptions) => {
  const afkTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tier2TimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tier3TimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (afkTimerRef.current)   clearTimeout(afkTimerRef.current);
    if (tier2TimerRef.current) clearTimeout(tier2TimerRef.current);
    if (tier3TimerRef.current) clearTimeout(tier3TimerRef.current);
    afkTimerRef.current = tier2TimerRef.current = tier3TimerRef.current = null;
  }, []);

  // Gọi sau mỗi player action
  const recordAction = useCallback((actionType: ActionType, success: boolean) => {
    clearAllTimers();

    setHighlightState(prev => {
      const progress = { ...prev.actionProgress };
      const actionProg = { ...progress[actionType] };

      if (success) {
        actionProg.consecutiveCorrect++;
      } else {
        actionProg.consecutiveCorrect = 0;
      }

      progress[actionType] = actionProg;

      const disabled = { ...prev.highlightDisabled };
      // Disable highlight khi đạt threshold
      disabled[actionType] = actionProg.consecutiveCorrect >= TUT_HIGHLIGHT_DISABLE_THRESHOLD;

      return { ...prev, actionProgress: progress, highlightDisabled: disabled, hintTier: 0 };
    });
  }, [clearAllTimers, setHighlightState]);

  // Gọi khi bắt đầu chờ player input (đầu mỗi action phase)
  const startAfkTimer = useCallback((action: ActionType) => {
    clearAllTimers();

    // Set current action
    setHighlightState(prev => ({ ...prev, currentAction: action, hintTier: 1 }));

    // AFK Safety Net: 5s → bật lại highlight (nếu đã disabled)
    afkTimerRef.current = setTimeout(() => {
      setHighlightState(prev => ({
        ...prev,
        highlightDisabled: { ...prev.highlightDisabled, [action]: false },
        hintTier: 1,
      }));

      // Tier 2: Tooltip sau thêm 3s
      tier2TimerRef.current = setTimeout(() => {
        setHighlightState(prev => ({ ...prev, hintTier: 2 }));

        // Tier 3: Modal sau thêm 7s (10s total từ AFK trigger)
        tier3TimerRef.current = setTimeout(() => {
          setHighlightState(prev => ({ ...prev, hintTier: 3 }));
          onShowTier3(action);
        }, TUT_HINT_TIER3_MS - TUT_HINT_TIER2_MS);
      }, TUT_HINT_TIER2_MS);
    }, TUT_AFK_TIMEOUT_MS);
  }, [clearAllTimers, setHighlightState, onShowTier3]);

  // Gọi khi player thực hiện action bất kỳ (kể cả sai) → reset timer
  const resetAfkTimer = useCallback((action: ActionType) => {
    clearAllTimers();
    setHighlightState(prev => ({ ...prev, hintTier: prev.highlightDisabled[action] ? 0 : 1 }));

    // Restart AFK timer
    afkTimerRef.current = setTimeout(() => {
      setHighlightState(prev => ({
        ...prev,
        highlightDisabled: { ...prev.highlightDisabled, [action]: false },
        hintTier: 1,
      }));

      tier2TimerRef.current = setTimeout(() => {
        setHighlightState(prev => ({ ...prev, hintTier: 2 }));

        tier3TimerRef.current = setTimeout(() => {
          setHighlightState(prev => ({ ...prev, hintTier: 3 }));
          onShowTier3(action);
        }, TUT_HINT_TIER3_MS - TUT_HINT_TIER2_MS);
      }, TUT_HINT_TIER2_MS);
    }, TUT_AFK_TIMEOUT_MS);
  }, [clearAllTimers, setHighlightState, onShowTier3]);

  // Gọi khi game đang animate (bot turn, transition) → tạm dừng AFK timer
  const pauseAfkTimer = useCallback(() => {
    clearAllTimers();
    setHighlightState(prev => ({ ...prev, hintTier: 0 }));
  }, [clearAllTimers, setHighlightState]);

  return { recordAction, startAfkTimer, resetAfkTimer, pauseAfkTimer, clearAllTimers };
};

// --- DEFAULT STATE FACTORY ---
export const createDefaultHighlightState = (): AdaptiveHighlightState => ({
  actionProgress: {
    rollDice:        { consecutiveCorrect: 0 },
    selectToken:     { consecutiveCorrect: 0 },
    useArtifact:     { consecutiveCorrect: 0 },
    activateUltimate:{ consecutiveCorrect: 0 },
  },
  highlightDisabled: {
    rollDice:        false,
    selectToken:     false,
    useArtifact:     false,
    activateUltimate:false,
  },
  currentAction: 'rollDice',
  hintTier: 0,
});

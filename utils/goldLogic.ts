
import { TileType } from '../types.ts';

export interface GoldReward {
    gold: number;
    bonusTriggered: boolean;
}

/**
 * Calculates gold based on the player's current element queue and the new element collected.
 * 
 * Rules:
 * - Same-element streak: 1st(10), 2nd(30), 3rd(50 + x2 Bonus)
 * - Different-element streak: 1st(10), 2nd(20), 3rd(30), 4th(40 + x2 Bonus)
 */
export const calculateElementGold = (queue: TileType[], newElement: TileType): GoldReward => {
    if (queue.length === 0) {
        return { gold: 10, bonusTriggered: false };
    }

    const last = queue[queue.length - 1];
    
    if (newElement === last) {
        // Same element streak track
        let sameCount = 1; // including the new one
        for (let i = queue.length - 1; i >= 0; i--) {
            if (queue[i] === newElement) sameCount++;
            else break;
        }
        
        const rewards = [10, 30, 50];
        const gold = rewards[Math.min(sameCount - 1, 2)];
        return { gold, bonusTriggered: sameCount === 3 };
    } else {
        // Different element streak track
        // We look for a unique set starting from the end of the queue
        const uniqueSet = new Set([newElement]);
        let uniqueCount = 1;
        
        for (let i = queue.length - 1; i >= 0; i--) {
            if (!uniqueSet.has(queue[i])) {
                uniqueSet.add(queue[i]);
                uniqueCount++;
            } else {
                break; // Streak broken by repeat
            }
        }
        
        const rewards = [10, 20, 30, 40];
        const gold = rewards[Math.min(uniqueCount - 1, 3)];
        return { gold, bonusTriggered: uniqueCount === 4 };
    }
};


export interface LayoutConfig {
    p1Chibi: { left: number; top: number };
    p1Sidebar: { left: number; top: number };
    p2Chibi: { left: number; top: number };
    p2Sidebar: { left: number; top: number };
    board: { offsetX: number; offsetY: number; zoom: number };
    ultButton:  { bottom: number; left: number; size: number };
    rollButton: { bottom: number; right: number; size: number };
    /** Tool selection popup (3 tool icons).
     *  x = offset from viewport center (negative = left, positive = right).
     *  y = distance from bottom edge (px). */
    toolPopup: { x: number; y: number };
    /** Interactive element queue shown after tool selection.
     *  Same coordinate system as toolPopup. */
    interactiveQueue: { x: number; y: number };
}

export const DEFAULT_LAYOUT: LayoutConfig = {
    p1Chibi:    { left: 330, top: 310 },
    p1Sidebar:  { left: 280, top: 270 },
    p2Chibi:    { left: 1050, top: 310 },
    p2Sidebar:  { left: 1150, top: 270 },
    board:      { offsetX: 0, offsetY: 0, zoom: 1.0 },
    ultButton:  { bottom: 70, left: 180, size: 130 },
    rollButton: { bottom: 70, right: 200, size: 130 },
    toolPopup:       { x: 0, y: 80 },   // centered, 80px from bottom
    interactiveQueue:{ x: 0, y: 20 },   // centered, 20px from bottom
};

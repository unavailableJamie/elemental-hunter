import Phaser from 'phaser';
import type { GameState, TokenState } from '@/types.ts';
import { TileType } from '@/types.ts';
import { TILE_POSITIONS } from '@/boardLayout.ts';
import { GOAL_PATHS } from '@/boardSpec.ts';

// ─── Color maps ────────────────────────────────────────────────────────────

const TILE_HEX: Record<TileType, number> = {
  [TileType.Normal]:   0xF3F4F6,
  [TileType.Fire]:     0xFF8C8C,
  [TileType.Ice]:      0x7DD3F8,
  [TileType.Grass]:    0x5ECF7E,
  [TileType.Rock]:     0x8A8A8A,
  [TileType.SafeZone]: 0x4F46E5,
  [TileType.Center]:   0xFCD34D,
  [TileType.Ladder]:   0xC8D5E8,
};

const PLAYER_HEX: Record<string, number> = {
  Player1: 0xF87171,
  Player2: 0x4ADE80,
  Player3: 0x60A5FA,
  Player4: 0xFBBF24,
};

// Color for each element type (used by swirl fx)
const ELEMENT_HEX: Record<string, number> = {
  fire:  0xFF6B35,
  ice:   0x60A5FA,
  grass: 0x4ADE80,
  rock:  0xA8A29E,
};

// Screen-pixel destination of each player's element queue in the HUD
// (Phaser canvas is 1280×900; PlayerInfo P1 is top-left w:355, P2 top-right w:355)
const HUD_QUEUE_POS: Record<string, { x: number; y: number }> = {
  Player1: { x: 178, y: 62 },
  Player2: { x: 1102, y: 62 },
  Player3: { x: 178, y: 62 },
  Player4: { x: 1102, y: 62 },
};

// Element icon order on each player's goal path (index 0→3 = Rock→Ice→Grass→Fire)
const GOAL_PATH_ELEMENTS = [TileType.Rock, TileType.Ice, TileType.Grass, TileType.Fire];

// Tiles that use a custom dark color and have no element icons (P3 + P4 goal paths)
const DARK_TILE_IDS = new Set([10, 16, 22, 27, 30, 37, 43, 49]);
const DARK_TILE_COLOR = 0x170E31;

// P1 goal path tiles
const P1_TILE_IDS = new Set([31, 26, 28, 33]);
const P1_TILE_COLOR = 0x742929;

// P2 goal path tiles
const P2_TILE_IDS = new Set([25, 19, 13, 7]);
const P2_TILE_COLOR = 0x175B2A;

// Emoji for each element type rendered flat on goal path tiles
const ELEMENT_EMOJI: Record<string, string> = {
  rock:  '🪨',
  ice:   '❄️',
  grass: '🌿',
  fire:  '🔥',
};

// The 4 final-goal tiles form the "center diamond" of the board
const FINAL_GOAL_TILE_IDS = new Set([
  ...GOAL_PATHS.Player1.slice(-1),
  ...GOAL_PATHS.Player2.slice(-1),
  ...GOAL_PATHS.Player3.slice(-1),
  ...GOAL_PATHS.Player4.slice(-1),
]);

// ─── Types ─────────────────────────────────────────────────────────────────

type TileClickCb  = (tileId: number) => void;
type TokenClickCb = (tokenId: number) => void;

// ─── Scene ─────────────────────────────────────────────────────────────────

export class BoardScene extends Phaser.Scene {
  // Tile geometry (+50% scale)
  private readonly TW = 105;  // tile diamond full width
  private readonly TH = 52;   // tile diamond full height
  private readonly TD = 20;   // tile 3-D depth (extrusion)
  private readonly GAP = 3;   // gap between tiles

  // Board render origin — recalculated in create()
  private originX = 0;
  private originY = 0;

  // Scene objects
  private tileGfx   = new Map<number, Phaser.GameObjects.Graphics>();
  private tileLabel  = new Map<number, Phaser.GameObjects.Text>();
  private shieldLabel = new Map<number, Phaser.GameObjects.Text>();
  private tokenGfx  = new Map<number, Phaser.GameObjects.Graphics>();
  private tokenText = new Map<number, Phaser.GameObjects.Text>();
  private centerGlow?: Phaser.GameObjects.Graphics;

  // Arrow pool — one per highlighted destination tile
  private arrowPool: Phaser.GameObjects.Text[] = [];
  private arrowBaseYs: number[] = [];
  private arrowBounce = { y: 0 };

  // Highlight overlay pool — pulsing stroke ring on destination tiles
  private hlPool: Phaser.GameObjects.Graphics[] = [];
  private hlPulse = { s: 1.0 };

  // Tile label (ATK/MAG icon) float animation
  private labelBounce = { y: 0 };
  private labelBaseYs = new Map<number, number>();
  // Round bubble backgrounds for ATK/MAG icons
  private tileLabelBg = new Map<number, Phaser.GameObjects.Graphics>();
  // Hammer icons on Normal (empty) tiles
  private hammerLabel = new Map<number, Phaser.GameObjects.Text>();
  // Tile-ID overlay shown in edit mode
  private tileIdLabel = new Map<number, Phaser.GameObjects.Text>();
  private isEditMode  = false;

  // Token animation helpers
  private movableTokenIds = new Set<number>();
  private tokenTileId = new Map<number, number>(); // tokenId → current displayTileId

  // Board camera config
  private boardOffsetX = 0;
  private boardOffsetY = 0;
  private boardZoom = 1.0;

  // State cache
  private gameState: GameState | null = null;
  private highlightTiles = new Set<number>();

  // Turn-change fade tracking
  private prevPlayerId: string | null = null;
  // Ultimate button world coordinates (for MAG bubble animation)
  private ultBtnX = 60;
  private ultBtnY = 860;

  // Goal path element icons (tileId → icon objects)
  private goalPathIcons = new Map<number, {
    emoji: Phaser.GameObjects.Text;
    glow:  Phaser.GameObjects.Graphics;
    element: TileType;
  }>();

  // React callbacks (set by PhaserGame.tsx via scene.onTileClick = ...)
  onTileClick?:          TileClickCb;
  onTokenClick?:         TokenClickCb;
  onGoalAnimationDone?:  () => void;
  /** Fires tileId when pointer enters a Normal tile, null when it leaves */
  onNormalTileHover?:    (tileId: number | null) => void;

  constructor() { super({ key: 'BoardScene' }); }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  create() {
    const { width, height } = this.scale;
    // Center the board in the canvas
    this.originX = width  / 2;
    this.originY = height / 2 - this.TH * 0.5;

    // Draw background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1035, 0x1a1035, 0x0d0820, 0x0d0820, 1);
    bg.fillRect(0, 0, width, height);
    bg.setDepth(0);

    // Center decorative glow (at grid 5,5 — empty center cell)
    this.centerGlow = this.add.graphics();
    this.drawCenterGlow();
    this.centerGlow.setDepth(1);

    // Tiles — sorted back-to-front (low x+y renders first)
    const sortedIds = Object.keys(TILE_POSITIONS)
      .map(Number)
      .sort((a, b) => {
        const pa = TILE_POSITIONS[a], pb = TILE_POSITIONS[b];
        return (pa.x + pa.y) - (pb.x + pb.y);
      });

    for (const tileId of sortedIds) {
      const pos = TILE_POSITIONS[tileId];
      const depth = (pos.x + pos.y) * 10 + 10;

      const g = this.add.graphics().setDepth(depth);
      // hit area = top diamond face in local space (graphics at 0,0)
      const pts = this.diamondPoints(pos.x, pos.y);
      g.setInteractive(
        new Phaser.Geom.Polygon(pts),
        Phaser.Geom.Polygon.Contains,
      );
      g.on('pointerdown', () => this.onTileClick?.(tileId));
      g.on('pointerover',  () => this.onTileHover(tileId, true));
      g.on('pointerout',   () => this.onTileHover(tileId, false));

      this.tileGfx.set(tileId, g);
    }

    // Pulse animation for center-region tiles
    this.tweens.add({
      targets: this.centerGlow,
      alpha: { from: 0.4, to: 0.9 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Persistent bounce tween — drives all arrow indicators simultaneously
    this.tweens.add({
      targets: this.arrowBounce,
      y: 8,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        this.arrowPool.forEach((a, i) => {
          if (a.visible) {
            a.y = (this.arrowBaseYs[i] ?? 0) + this.arrowBounce.y;
          }
        });
      },
    });

    // Highlight overlay pulse tween (scale 80% → 100%)
    this.tweens.add({
      targets: this.hlPulse,
      s: 0.8,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        this.hlPool.forEach(g => { if (g.visible) g.setScale(this.hlPulse.s); });
      },
    });

    // Tile-label (ATK/MAG icon) gentle float tween
    this.tweens.add({
      targets: this.labelBounce,
      y: 5,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        this.tileLabel.forEach((lbl, tileId) => {
          if (lbl.visible) lbl.y = (this.labelBaseYs.get(tileId) ?? 0) + this.labelBounce.y;
        });
        this.tileLabelBg.forEach((bg, tileId) => {
          if (bg.visible) bg.y = (this.labelBaseYs.get(tileId) ?? 0) + this.labelBounce.y;
        });
      },
    });

    // Listen for state pushes from React
    this.events.on('stateUpdate', (state: GameState) => {
      const turnChanged = !!this.gameState && this.gameState.currentPlayerId !== state.currentPlayerId;
      this.gameState = state;
      if (turnChanged) {
        // Fade out all tile labels
        this.tileLabel.forEach(lbl => {
          this.tweens.killTweensOf(lbl);
          this.tweens.add({ targets: lbl, alpha: 0, duration: 200 });
        });
        this.tileLabelBg.forEach(bg => {
          this.tweens.killTweensOf(bg);
          this.tweens.add({ targets: bg, alpha: 0, duration: 200 });
        });
        // Redraw everything except labels immediately, labels after fade
        this.redrawTiles(state);
        this.redrawTokens(state);
        this.redrawShieldIcons(state);
        this.redrawHammerIcons(state);
        if (this.isEditMode) this.redrawTileIds(true);
        this.time.delayedCall(220, () => {
          this.redrawTileLabels(state);
          // Fade visible labels back in
          this.tileLabel.forEach(lbl => {
            if (lbl.visible) { lbl.setAlpha(0); this.tweens.add({ targets: lbl, alpha: 1, duration: 250 }); }
          });
          this.tileLabelBg.forEach(bg => {
            if (bg.visible) { bg.setAlpha(0); this.tweens.add({ targets: bg, alpha: 1, duration: 250 }); }
          });
        });
      } else {
        this.redraw(state);
      }
    });

    this.events.on('ultButtonWorldPos', ({ x, y }: { x: number; y: number }) => {
      this.ultBtnX = x;
      this.ultBtnY = y;
    });

    this.events.on('atkBubbleAbsorb', ({ tileId, tokenId, amount }: { tileId: number; tokenId: number; amount: number }) => {
      this.playAtkBubbleAbsorb(tileId, tokenId, amount);
    });

    this.events.on('magBubbleAbsorb', ({ tileId, tokenId }: { tileId: number; tokenId: number }) => {
      this.playMagBubbleAbsorb(tileId, tokenId);
    });

    this.events.on('highlightTiles', (ids: number[]) => {
      this.highlightTiles = new Set(ids);
      if (this.gameState) this.redrawTiles(this.gameState);
      this.updateArrows(ids);
      this.updateHighlightOverlays(ids);
    });

    this.events.on('boardConfig', ({ offsetX, offsetY, zoom }: { offsetX: number; offsetY: number; zoom: number }) => {
      this.boardOffsetX = offsetX;
      this.boardOffsetY = offsetY;
      this.boardZoom = zoom;
      this.applyBoardCamera();
    });

    this.events.on('movableTokenIds', (ids: number[]) => {
      this.movableTokenIds = new Set(ids);
      if (this.gameState) this.redrawTokens(this.gameState);
    });

    this.events.on('editMode', (active: boolean) => {
      this.isEditMode = active;
      this.redrawTileIds(active);
    });

    this.events.on('elementAdded', ({ tileId, tokenId, element, playerId }:
      { tileId: number; tokenId: number; element: string; playerId: string }) => {
      this.playElementAddedSwirl(tileId, tokenId, element, playerId);
    });

    this.events.on('goalReached', ({ playerId }: { playerId: string }) => {
      this.playGoalReachSequence(playerId);
    });

    this.events.on('goalElementChosen', ({ playerId, element, tokenId }:
      { playerId: string; element: string; tokenId: number }) => {
      this.playGoalElementChosenAnim(playerId, element, tokenId);
    });

    // Create persistent element icons on all goal path tiles
    this.createGoalPathIcons();
  }

  // ── Coordinate helpers ────────────────────────────────────────────────────

  /** Grid (col, row) → isometric screen {x, y} of tile center-top */
  private iso(col: number, row: number) {
    return {
      x: (col - row) * this.TW / 2 + this.originX,
      y: (col + row) * this.TH / 2 + this.originY - (5 * this.TH),
    };
  }

  /** Returns the 4 corners of the top diamond face in world coords */
  private diamondPoints(col: number, row: number) {
    const { x, y } = this.iso(col, row);
    const hw = this.TW / 2 - this.GAP;
    const hh = this.TH / 2 - this.GAP / 2;
    return [
      new Phaser.Geom.Point(x,      y - hh),
      new Phaser.Geom.Point(x + hw, y),
      new Phaser.Geom.Point(x,      y + hh),
      new Phaser.Geom.Point(x - hw, y),
    ];
  }

  // ── Camera helpers ────────────────────────────────────────────────────────

  /** Apply boardOffsetX/Y and boardZoom to the Phaser camera. */
  private applyBoardCamera() {
    const { width, height } = this.scale;
    const cam = this.cameras.main;
    cam.setZoom(this.boardZoom);
    // centerOn moves the camera so that the given world point appears at screen center.
    // Subtracting offset/zoom shifts the board by (offsetX, offsetY) screen pixels.
    cam.centerOn(
      width  / 2 - this.boardOffsetX / this.boardZoom,
      height / 2 - this.boardOffsetY / this.boardZoom,
    );
  }

  // ── Arrow indicator helpers ────────────────────────────────────────────────

  private getArrow(index: number): Phaser.GameObjects.Text {
    if (this.arrowPool[index]) return this.arrowPool[index];
    const a = this.add.text(0, 0, '▼', {
      fontSize: '26px',
      color: '#FCD34D',
      stroke: '#78350F',
      strokeThickness: 4,
    })
    .setOrigin(0.5, 0.5)
    .setDepth(9500)
    .setVisible(false)
    .setShadow(1, 2, '#000000', 4, false, true);
    this.arrowPool[index] = a;
    return a;
  }

  private updateArrows(ids: number[]) {
    this.arrowPool.forEach(a => a.setVisible(false));
    this.arrowBaseYs = [];
    for (let i = 0; i < ids.length; i++) {
      const pos = TILE_POSITIONS[ids[i]];
      if (!pos) continue;
      const { x, y } = this.iso(pos.x, pos.y);
      // Lower arrow closer to tile top face
      const baseY = y - 34;
      const arrow = this.getArrow(i);
      arrow.setPosition(x, baseY);
      arrow.setVisible(true);
      this.arrowBaseYs[i] = baseY;
    }
  }

  private getHlGraphics(index: number): Phaser.GameObjects.Graphics {
    if (this.hlPool[index]) return this.hlPool[index];
    const g = this.add.graphics().setVisible(false);
    this.hlPool[index] = g;
    return g;
  }

  private updateHighlightOverlays(ids: number[]) {
    this.hlPool.forEach(g => g.setVisible(false));
    const hw = this.TW / 2 - this.GAP;
    const hh = this.TH / 2 - this.GAP / 2;
    for (let i = 0; i < ids.length; i++) {
      const pos = TILE_POSITIONS[ids[i]];
      if (!pos) continue;
      const { x, y } = this.iso(pos.x, pos.y);
      const g = this.getHlGraphics(i);
      g.setPosition(x, y);
      g.setDepth((pos.x + pos.y) * 10 + 11);
      g.clear();
      g.lineStyle(3, 0x60EFFF, 0.9);
      g.beginPath();
      g.moveTo(0, -hh);
      g.lineTo(hw, 0);
      g.lineTo(0, hh);
      g.lineTo(-hw, 0);
      g.closePath();
      g.strokePath();
      g.setVisible(true);
      g.setScale(this.hlPulse.s);
    }
  }

  // ── Draw helpers ──────────────────────────────────────────────────────────

  /**
   * Draw isometric tile into a Graphics object (Graphics must be at 0,0).
   * All coords are world-space.
   */
  private drawTile(
    g: Phaser.GameObjects.Graphics,
    col: number, row: number,
    fillColor: number,
    glowColor?: number,
    alpha = 1,
  ) {
    g.clear();
    const { x, y } = this.iso(col, row);
    const hw = this.TW / 2 - this.GAP;
    const hh = this.TH / 2 - this.GAP / 2;
    const D  = this.TD;

    // ── top face ──────────────────────────────
    g.fillStyle(fillColor, alpha);
    g.beginPath();
    g.moveTo(x,      y - hh);
    g.lineTo(x + hw, y);
    g.lineTo(x,      y + hh);
    g.lineTo(x - hw, y);
    g.closePath();
    g.fillPath();

    // ── top edge highlight (bright rim) ───────
    g.lineStyle(1, 0xFFFFFF, 0.18);
    g.beginPath();
    g.moveTo(x - hw, y);
    g.lineTo(x,      y - hh);
    g.lineTo(x + hw, y);
    g.strokePath();

    // ── left face (darker) ────────────────────
    const lc = Phaser.Display.Color.IntegerToColor(fillColor).darken(28);
    g.fillStyle(lc.color, alpha);
    g.beginPath();
    g.moveTo(x - hw, y);
    g.lineTo(x,      y + hh);
    g.lineTo(x,      y + hh + D);
    g.lineTo(x - hw, y + D);
    g.closePath();
    g.fillPath();

    // ── right face (medium darker) ────────────
    const rc = Phaser.Display.Color.IntegerToColor(fillColor).darken(14);
    g.fillStyle(rc.color, alpha);
    g.beginPath();
    g.moveTo(x,      y + hh);
    g.lineTo(x + hw, y);
    g.lineTo(x + hw, y + D);
    g.lineTo(x,      y + hh + D);
    g.closePath();
    g.fillPath();

    // ── thin bottom edge ──────────────────────
    g.lineStyle(1, 0x000000, 0.12);
    g.beginPath();
    g.moveTo(x - hw, y + D);
    g.lineTo(x,      y + hh + D);
    g.lineTo(x + hw, y + D);
    g.strokePath();

    // ── glow outline (hover / goal) ───────────
    if (glowColor !== undefined) {
      g.lineStyle(3, glowColor, 0.9);
      g.beginPath();
      g.moveTo(x,      y - hh);
      g.lineTo(x + hw, y);
      g.lineTo(x,      y + hh);
      g.lineTo(x - hw, y);
      g.closePath();
      g.strokePath();
    }
  }

  /**
   * Draw chess-piece token (scaled 1.5×) — graphics must be positioned externally.
   */
  private drawToken(
    g: Phaser.GameObjects.Graphics,
    color: number,
    selected: boolean,
    frozen: boolean,
  ) {
    g.clear();
    const c = frozen ? 0x97DFFF : color;

    // soft glow halo (1.5× scale)
    g.fillStyle(c, 0.2);
    g.fillCircle(0, -12, 24);

    // selection ring
    if (selected) {
      g.lineStyle(5, 0xFFFFFF, 1);
      g.strokeCircle(0, -12, 20);
    }

    // base oval
    const bc = Phaser.Display.Color.IntegerToColor(c).darken(25);
    g.fillStyle(bc.color, 1);
    g.fillEllipse(0, 6, 33, 14);

    // body
    g.fillStyle(c, 1);
    g.fillRect(-9, -12, 18, 21);

    // neck taper
    g.fillStyle(c, 1);
    g.fillRect(-6, -21, 12, 12);

    // head
    g.fillStyle(c, 1);
    g.fillCircle(0, -26, 12);

    // head shine
    g.fillStyle(0xFFFFFF, 0.35);
    g.fillCircle(-3, -30, 5);

    // body outline (thin)
    g.lineStyle(2, 0x000000, 0.18);
    g.strokeCircle(0, -26, 12);
  }

  /** Decorative glow at the empty grid center (5, 5) */
  private drawCenterGlow() {
    if (!this.centerGlow) return;
    this.centerGlow.clear();
    const { x, y } = this.iso(5, 5);
    for (let r = 48; r >= 8; r -= 8) {
      const alpha = (1 - r / 48) * 0.6 + 0.05;
      this.centerGlow.fillStyle(0xFCD34D, alpha);
      this.centerGlow.fillCircle(x, y + this.TH / 2, r);
    }
  }

  // ── Redraw logic ──────────────────────────────────────────────────────────

  private redrawTiles(state: GameState) {
    for (const [, tileId] of [...this.tileGfx.keys()].entries()) {
      const g   = this.tileGfx.get(tileId)!;
      const pos = TILE_POSITIONS[tileId];
      const td  = state.board[pos.y]?.[pos.x];
      if (!td) continue;

      const base      = DARK_TILE_IDS.has(tileId) ? DARK_TILE_COLOR
                      : P1_TILE_IDS.has(tileId)   ? P1_TILE_COLOR
                      : P2_TILE_IDS.has(tileId)   ? P2_TILE_COLOR
                      : (TILE_HEX[td.type] ?? 0xF3F4F6);
      this.drawTile(g, pos.x, pos.y, base);
    }
  }

  private redrawTokens(state: GameState, immediate = false) {
    // Collect all live token IDs
    const liveIds = new Set<number>();
    for (const player of Object.values(state.players)) {
      for (const token of player.tokens) liveIds.add(token.id);
    }

    // Remove stale token objects
    for (const tokenId of [...this.tokenGfx.keys()]) {
      if (!liveIds.has(tokenId)) {
        this.tweens.killTweensOf(this.tokenGfx.get(tokenId)!);
        this.tokenGfx.get(tokenId)!.destroy();
        this.tokenGfx.delete(tokenId);
        this.tokenText.get(tokenId)?.destroy();
        this.tokenText.delete(tokenId);
        this.tokenTileId.delete(tokenId);
      }
    }

    // Render (sorted back-to-front)
    const allTokens: Array<{ token: TokenState; pid: string }> = [];
    for (const player of Object.values(state.players)) {
      for (const token of player.tokens) {
        allTokens.push({ token, pid: player.id });
      }
    }
    allTokens.sort((a, b) => {
      const pa = TILE_POSITIONS[a.token.tileId] ?? { x: 0, y: 0 };
      const pb = TILE_POSITIONS[b.token.tileId] ?? { x: 0, y: 0 };
      return (pa.x + pa.y) - (pb.x + pb.y);
    });

    // Build per-tile token count map for stagger offsets
    const tileTokenOrder = new Map<number, number>();
    const tileTokenCount = new Map<number, number>();
    for (const { token } of allTokens) {
      const tid = token.tileId;
      const c = tileTokenCount.get(tid) ?? 0;
      tileTokenOrder.set(token.id, c);
      tileTokenCount.set(tid, c + 1);
    }

    for (const { token, pid } of allTokens) {
      // During animation, use the current step tile for the animating token
      const isAnimatingToken = state.phase === 'ANIMATING' &&
        state.animation?.tokenId === token.id;
      const displayTileId = isAnimatingToken
        ? (state.animation!.path[state.animation!.step] ?? token.tileId)
        : token.tileId;

      const tilePos = TILE_POSITIONS[displayTileId];
      if (!tilePos) continue;

      const { x, y } = this.iso(tilePos.x, tilePos.y);

      // Stagger offset when multiple tokens share a tile (safe zone stacking)
      const tokenIndex = tileTokenOrder.get(token.id) ?? 0;
      const tokenCount = tileTokenCount.get(token.tileId) ?? 1;
      // Spread in a small arc — for 2 tokens: left/right; for 3+: fan
      const SPREAD = 18;
      const staggerOffsets: [number, number][] = [
        [0, 0],
        [-SPREAD, -4], [SPREAD, -4],
        [-SPREAD, -8], [0, -14], [SPREAD, -8],
      ];
      const [staggerX, staggerY] = tokenCount > 1
        ? (staggerOffsets[tokenIndex] ?? [tokenIndex * SPREAD - SPREAD, 0])
        : [0, 0];

      const targetX = x + staggerX;
      const targetY = y - 6 + staggerY; // centered on tile top face
      const isSelected = state.selectedTokenId === token.id;
      const isFrozen   = token.frozenRounds > 0;
      const depth      = 5200 + (tilePos.x + tilePos.y) * 10;

      // Create graphics + label if first time
      const isNew = !this.tokenGfx.has(token.id);
      if (isNew) {
        const tg = this.add.graphics();
        tg.setPosition(targetX, targetY);
        tg.setInteractive(
          new Phaser.Geom.Circle(0, -12, 24),
          Phaser.Geom.Circle.Contains,
        );
        tg.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
          ptr.event.stopPropagation();
          this.onTokenClick?.(token.id);
        });
        this.tokenGfx.set(token.id, tg);

        const txt = this.add.text(targetX, targetY + 22, '', {
          fontSize: '22px',
          color: '#fbbf24',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3,
        }).setOrigin(0.5, 0.5);
        this.tokenText.set(token.id, txt);
      }

      const tg  = this.tokenGfx.get(token.id)!;
      const txt = this.tokenText.get(token.id)!;

      tg.setDepth(depth);
      txt.setDepth(depth + 1);

      // ── Tile-based move detection ──────────────────────────────────────────
      // Comparing tile IDs (not screen positions) prevents bounce tweens from
      // triggering false "moved" signals every frame.
      const prevTileId = this.tokenTileId.get(token.id);
      const hasMoved = prevTileId !== displayTileId;

      if (hasMoved) {
        this.tokenTileId.set(token.id, displayTileId);
        this.tweens.killTweensOf(tg);
        this.tweens.killTweensOf(txt);

        if (immediate || isNew) {
          // Instant reposition (no tween)
          tg.setPosition(targetX, targetY);
          txt.setPosition(targetX, targetY + 22);
        } else if (isAnimatingToken) {
          // Parabolic arc hop: x linear, y follows sin curve
          const fromX = tg.x;
          const fromY = tg.y;
          const arcHeight = 28;
          const dummy = { t: 0 };
          this.tweens.add({
            targets: dummy,
            t: 1,
            duration: 55,
            ease: 'Linear',
            onUpdate: () => {
              const t = dummy.t;
              tg.x = fromX + (targetX - fromX) * t;
              tg.y = fromY + (targetY - fromY) * t - arcHeight * Math.sin(Math.PI * t);
            },
            onComplete: () => { tg.setPosition(targetX, targetY); },
          });
          this.tweens.add({
            targets: txt,
            x: targetX, y: targetY + 22,
            duration: 55,
            ease: 'Linear',
          });
        } else {
          // Regular slide
          this.tweens.add({
            targets: tg,
            x: targetX, y: targetY,
            duration: 280,
            ease: 'Quad.easeOut',
          });
          this.tweens.add({
            targets: txt,
            x: targetX, y: targetY + 22,
            duration: 280,
            ease: 'Quad.easeOut',
          });
        }
      } else {
        // ── Idle bounce for movable tokens (including selected) ──────────────
        const shouldBounce = this.movableTokenIds.has(token.id) && !isFrozen;
        if (shouldBounce) {
          if (!this.tweens.isTweening(tg)) {
            this.tweens.add({
              targets: tg,
              y: targetY - 10,
              duration: 350,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
            });
          }
        } else {
          if (this.tweens.isTweening(tg)) {
            this.tweens.killTweensOf(tg);
            tg.setPosition(targetX, targetY);
          }
          txt.setPosition(targetX, targetY + 22);
        }
      }

      this.drawToken(tg, PLAYER_HEX[pid] ?? 0xFFFFFF, isSelected, isFrozen);
      txt.setText(token.atk > 0 ? String(token.atk) : '');
    }
  }

  private redrawTileLabels(state: GameState) {
    const activePlayer = state.players[state.currentPlayerId];
    const affinity = activePlayer?.elementAffinity;
    const ELEMENT_TYPES = new Set([TileType.Fire, TileType.Ice, TileType.Grass, TileType.Rock]);
    const BUBBLE_R = 18;

    for (const tileId of this.tileGfx.keys()) {
      const pos = TILE_POSITIONS[tileId];
      const td  = state.board[pos.y]?.[pos.x];

      if (!td || !ELEMENT_TYPES.has(td.type)) {
        this.tileLabel.get(tileId)?.setVisible(false);
        this.tileLabelBg.get(tileId)?.setVisible(false);
        continue;
      }

      // Hide label only when a token is statically on this tile (not during animation)
      const occupied = state.phase !== 'ANIMATING' && Object.values(state.players).some(p =>
        p.tokens.some(t => t.tileId === tileId)
      );
      if (occupied) {
        this.tileLabel.get(tileId)?.setVisible(false);
        this.tileLabelBg.get(tileId)?.setVisible(false);
        continue;
      }

      const isMatch  = !!affinity && td.type === affinity;
      // ATK (+sword, red) on matching affinity tiles; MAG (+droplet, blue) on non-matching
      const icon     = isMatch ? '⚔' : '💧';
      const fillHex  = isMatch ? 0xB91C1C : 0x2563EB;
      const rimHex   = isMatch ? 0xF87171 : 0x60A5FA;

      const { x, y } = this.iso(pos.x, pos.y);
      // Tile center (same as shield/hammer icons)
      const labelY = y;
      this.labelBaseYs.set(tileId, labelY);

      // ── Bubble background (round Graphics) ──
      if (!this.tileLabelBg.has(tileId)) {
        const bg = this.add.graphics().setDepth(4999);
        this.tileLabelBg.set(tileId, bg);
      }
      const bg = this.tileLabelBg.get(tileId)!;
      bg.clear();
      bg.fillStyle(fillHex, 0.38);
      bg.fillCircle(0, 0, BUBBLE_R);
      bg.lineStyle(1.5, rimHex, 0.55);
      bg.strokeCircle(0, 0, BUBBLE_R);
      bg.setPosition(x, labelY).setAlpha(0.75).setVisible(true);

      // ── Icon text (no background) ──
      if (!this.tileLabel.has(tileId)) {
        const t = this.add.text(x, labelY, icon, {
          fontSize: '21px',
          color: '#ffffff',
        }).setOrigin(0.5, 0.5).setDepth(5000);
        this.tileLabel.set(tileId, t);
      }
      const lbl = this.tileLabel.get(tileId)!;
      lbl.setPosition(x, labelY);
      lbl.setText(icon);
      lbl.setFontSize('21px');
      lbl.setVisible(true);
    }
  }

  private redrawShieldIcons(state: GameState) {
    for (const tileId of this.tileGfx.keys()) {
      const pos = TILE_POSITIONS[tileId];
      const td  = state.board[pos.y]?.[pos.x];
      if (!td || td.type !== TileType.SafeZone) {
        this.shieldLabel.get(tileId)?.setVisible(false);
        continue;
      }
      const { x, y } = this.iso(pos.x, pos.y);
      // Center of tile top face; scaleY ≈ TH/TW makes emoji appear flat on surface
      const iconY = y + 2;
      if (!this.shieldLabel.has(tileId)) {
        const t = this.add.text(x, iconY, '🛡', {
          fontSize: '54px',
        })
        .setOrigin(0.5, 0.5)
        .setDepth(4500)
        .setScale(0.85, 0.47)
        .setAngle(45);
        this.shieldLabel.set(tileId, t);
      }
      const lbl = this.shieldLabel.get(tileId)!;
      lbl.setPosition(x, iconY);
      lbl.setVisible(true);
    }
  }

  private redrawHammerIcons(state: GameState) {
    for (const tileId of this.tileGfx.keys()) {
      const pos = TILE_POSITIONS[tileId];
      const td  = state.board[pos.y]?.[pos.x];
      if (!td || td.type !== TileType.Normal) {
        this.hammerLabel.get(tileId)?.setVisible(false);
        continue;
      }
      const { x, y } = this.iso(pos.x, pos.y);
      const iconY = y + 2;
      if (!this.hammerLabel.has(tileId)) {
        const t = this.add.text(x, iconY, '🔨', { fontSize: '54px' })
          .setOrigin(0.5, 0.5)
          .setDepth(4500)
          .setScale(0.85, 0.47)
          .setAngle(45)
          .setTint(0x8A8A8A);
        this.hammerLabel.set(tileId, t);
      }
      const lbl = this.hammerLabel.get(tileId)!;
      lbl.setPosition(x, iconY);
      lbl.setVisible(true);
    }
  }

  private redrawTileIds(show: boolean) {
    for (const tileId of this.tileGfx.keys()) {
      const pos = TILE_POSITIONS[tileId];
      if (!show) {
        this.tileIdLabel.get(tileId)?.setVisible(false);
        continue;
      }
      const { x, y } = this.iso(pos.x, pos.y);
      if (!this.tileIdLabel.has(tileId)) {
        const t = this.add.text(x, y - 6, String(tileId), {
          fontSize: '11px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 3,
          fontStyle: 'bold',
        }).setOrigin(0.5, 0.5).setDepth(9000);
        this.tileIdLabel.set(tileId, t);
      }
      const lbl = this.tileIdLabel.get(tileId)!;
      lbl.setPosition(x, y - 6);
      lbl.setVisible(true);
    }
  }

  private redraw(state: GameState, immediate = false) {
    this.redrawTiles(state);
    this.redrawTokens(state, immediate);
    this.redrawTileLabels(state);
    this.redrawShieldIcons(state);
    this.redrawHammerIcons(state);
    if (this.isEditMode) this.redrawTileIds(true);
  }

  // ── Hover ─────────────────────────────────────────────────────────────────

  // ── ATK bubble absorption animation ─────────────────────────────────────
  private playAtkBubbleAbsorb(tileId: number, tokenId: number, amount: number) {
    const tg = this.tokenGfx.get(tokenId);
    const pos = TILE_POSITIONS[tileId];
    if (!tg || !pos) return;
    const { x: tx, y: ty } = this.iso(pos.x, pos.y);

    // Temporary bubble objects (the real ones are hidden by occupied-check)
    const tempBg = this.add.graphics().setDepth(7000);
    tempBg.fillStyle(0xB91C1C, 0.38);
    tempBg.fillCircle(0, 0, 18);
    tempBg.lineStyle(1, 0xF87171, 0.55);
    tempBg.strokeCircle(0, 0, 18);
    tempBg.setPosition(tx, ty).setAlpha(0);

    const tempLbl = this.add.text(tx, ty, '⚔', { fontSize: '21px', color: '#ffffff' })
      .setOrigin(0.5, 0.5).setDepth(7001).setAlpha(0);

    // Phase 1: appear at tile
    this.tweens.add({ targets: [tempBg, tempLbl], alpha: 0.75, duration: 200 });

    // Phase 2: fly above horse head
    this.time.delayedCall(350, () => {
      this.tweens.add({ targets: [tempBg, tempLbl], x: tg.x, y: tg.y - 55, duration: 300, ease: 'Quad.easeOut' });
    });

    // Phase 3: slam down onto horse (absorb)
    this.time.delayedCall(750, () => {
      this.tweens.add({
        targets: [tempBg, tempLbl], y: tg.y - 15, alpha: 0,
        duration: 180, ease: 'Quad.easeIn',
        onComplete: () => { tempBg.destroy(); tempLbl.destroy(); },
      });
    });

    // Phase 4: show +N ATK floating text + zoom horse (power-up)
    this.time.delayedCall(860, () => {
      const atkText = this.add.text(tg.x, tg.y - 5, `+${amount} ATK`, {
        fontSize: '28px', fontStyle: 'bold',
        color: '#C62326', stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5, 0.5).setDepth(8000);
      this.tweens.add({
        targets: atkText, y: tg.y - 60, alpha: 0,
        duration: 1200, ease: 'Quad.easeOut',
        onComplete: () => atkText.destroy(),
      });
      // Horse power-up zoom
      this.tweens.add({
        targets: tg,
        scaleX: 1.35, scaleY: 1.35,
        duration: 130, ease: 'Quad.easeOut',
        yoyo: true, hold: 120,
      });
    });
  }

  // ── MAG bubble → Ultimate button animation ───────────────────────────────
  private playMagBubbleAbsorb(tileId: number, tokenId: number) {
    const tg = this.tokenGfx.get(tokenId);
    const pos = TILE_POSITIONS[tileId];
    if (!tg || !pos) return;
    const { x: tx, y: ty } = this.iso(pos.x, pos.y);

    const tempBg = this.add.graphics().setDepth(9500);
    tempBg.fillStyle(0x2563EB, 0.38);
    tempBg.fillCircle(0, 0, 18);
    tempBg.lineStyle(1, 0x60A5FA, 0.55);
    tempBg.strokeCircle(0, 0, 18);
    tempBg.setPosition(tx, ty).setAlpha(0);

    const tempLbl = this.add.text(tx, ty, '💧', { fontSize: '21px', color: '#ffffff' })
      .setOrigin(0.5, 0.5).setDepth(9501).setAlpha(0);

    // Phase 1: appear at tile
    this.tweens.add({ targets: [tempBg, tempLbl], alpha: 0.75, duration: 200 });

    // Phase 2: fly above horse, pause 0.5s
    this.time.delayedCall(300, () => {
      this.tweens.add({ targets: [tempBg, tempLbl], x: tg.x, y: tg.y - 50, duration: 300, ease: 'Quad.easeOut' });
    });

    // Phase 3: fly to ult button — slow deceleration so it visually lands on target
    this.time.delayedCall(1100, () => {
      // Position: slow easeOut so it decelerates into the button
      this.tweens.add({
        targets: [tempBg, tempLbl],
        x: this.ultBtnX, y: this.ultBtnY,
        scaleX: 0.3, scaleY: 0.3,
        duration: 950, ease: 'Cubic.easeOut',
        onComplete: () => { tempBg.destroy(); tempLbl.destroy(); },
      });
      // Alpha: fade out at ~65% of journey so it disappears before hitting React layer
      this.tweens.add({
        targets: [tempBg, tempLbl],
        alpha: 0,
        duration: 620, ease: 'Quad.easeIn',
      });
    });
  }

  private onTileHover(tileId: number, over: boolean) {
    const g   = this.tileGfx.get(tileId);
    if (!g || !this.gameState) return;
    const pos = TILE_POSITIONS[tileId];
    const td  = this.gameState.board[pos.y]?.[pos.x];
    if (!td) return;

    const base = DARK_TILE_IDS.has(tileId) ? DARK_TILE_COLOR
               : P1_TILE_IDS.has(tileId)   ? P1_TILE_COLOR
               : P2_TILE_IDS.has(tileId)   ? P2_TILE_COLOR
               : (TILE_HEX[td.type] ?? 0xF3F4F6);
    const glow = over ? 0xFFFFFF : undefined;
    this.drawTile(g, pos.x, pos.y, base, glow);

    if (td.type === TileType.Normal) {
      this.onNormalTileHover?.(over ? tileId : null);
    }
  }

  // ── Element-added swirling light → HUD fly ────────────────────────────────
  private playElementAddedSwirl(
    tileId: number, tokenId: number,
    element: string, playerId: string,
  ) {
    const tg  = this.tokenGfx.get(tokenId);
    const pos = TILE_POSITIONS[tileId];
    if (!tg || !pos) return;

    const { x: tx, y: ty } = this.iso(pos.x, pos.y);
    const col = ELEMENT_HEX[element] ?? 0xFFFFFF;
    const NUM_PARTICLES  = 12;   // more orbs for clarity
    const SWIRL_R        = 52;   // larger orbit radius
    const SWIRL_DURATION = 900;  // ms — longer, more visible swirl
    const ANGULAR_SPEED  = Math.PI * 2.8; // ~1.4 rotations — slower than before

    // ── Phase 1: swirling particles around horse ───────────────────────────
    const particles: Phaser.GameObjects.Graphics[] = [];
    const angles: number[] = [];

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const g = this.add.graphics().setDepth(8000);
      // Larger orbs; alternating bright-core style for odd indices
      const r = 7 - i * 0.35;
      g.fillStyle(col, 0.92);
      g.fillCircle(0, 0, r);
      // Bright specular highlight on each orb
      g.fillStyle(0xFFFFFF, 0.55);
      g.fillCircle(-r * 0.3, -r * 0.35, r * 0.38);
      const startAngle = (i / NUM_PARTICLES) * Math.PI * 2;
      g.setPosition(
        tg.x + Math.cos(startAngle) * SWIRL_R,
        tg.y - 12 + Math.sin(startAngle) * SWIRL_R * 0.5,
      );
      // Burst-in: orbs pop from zero scale
      g.setScale(0);
      this.tweens.add({ targets: g, scaleX: 1, scaleY: 1, duration: 120, ease: 'Back.easeOut', delay: i * 20 });
      particles.push(g);
      angles.push(startAngle);
    }

    // Swirl tween via time callback
    let swirlT = 0;
    const swirlTimer = this.time.addEvent({
      delay: 16,
      repeat: Math.floor(SWIRL_DURATION / 16),
      callback: () => {
        swirlT += 16;
        const progress = swirlT / SWIRL_DURATION;
        const r = SWIRL_R * (1 - progress * 0.65); // spiral inward
        particles.forEach((p, i) => {
          const a = angles[i] + progress * ANGULAR_SPEED;
          p.setPosition(
            tg.x + Math.cos(a) * r,
            tg.y - 12 + Math.sin(a) * r * 0.5,
          );
          p.setAlpha(1 - progress * 0.2);   // stays bright longer
          p.setScale(1 - progress * 0.3);   // stays larger longer
        });
      },
    });

    // ── Phase 2: collapse into light sphere, then fly to HUD ──────────────
    this.time.delayedCall(SWIRL_DURATION, () => {
      swirlTimer.remove();
      particles.forEach(p => p.destroy());

      // Sphere — larger and more opaque
      const sphere = this.add.graphics().setDepth(9502);
      sphere.fillStyle(col, 0.95);
      sphere.fillCircle(0, 0, 18);
      sphere.fillStyle(0xFFFFFF, 0.55);
      sphere.fillCircle(-5, -5, 7);
      sphere.setPosition(tg.x, tg.y - 12);

      // Glow halo — wider
      const halo = this.add.graphics().setDepth(9501);
      halo.fillStyle(col, 0.35);
      halo.fillCircle(0, 0, 32);
      halo.setPosition(tg.x, tg.y - 12);

      // Flash on spawn
      this.tweens.add({
        targets: [sphere, halo],
        scaleX: [1, 1.6, 1], scaleY: [1, 1.6, 1],
        duration: 180, ease: 'Quad.easeOut',
      });

      // Fly to HUD queue destination
      const dest = HUD_QUEUE_POS[playerId] ?? { x: 640, y: 60 };

      this.time.delayedCall(200, () => {
        // Position: slow deceleration — lands gently at destination
        this.tweens.add({
          targets: [sphere, halo],
          x: dest.x,
          y: dest.y,
          scaleX: 0.3,
          scaleY: 0.3,
          duration: 950,
          ease: 'Cubic.easeOut',
          onComplete: () => { sphere.destroy(); halo.destroy(); },
        });
        // Alpha: fades out at ~65% of journey so it visually arrives before going behind React UI
        this.tweens.add({
          targets: [sphere, halo],
          alpha: 0,
          duration: 620,
          ease: 'Quad.easeIn',
        });
      });
    });
  }

  // ── Goal path element icons ────────────────────────────────────────────────

  /** Draw flat element icons on every player's ladder + goal tiles (purely visual). */
  private createGoalPathIcons() {
    for (const [, path] of Object.entries(GOAL_PATHS)) {
      path.forEach((tileId, idx) => {
        if (DARK_TILE_IDS.has(tileId)) return;  // no icons on dark tiles
        const pos = TILE_POSITIONS[tileId];
        if (!pos) return;
        const element = GOAL_PATH_ELEMENTS[idx];
        if (!element) return;

        const col  = ELEMENT_HEX[element as string] ?? 0xFFFFFF;
        const { x, y } = this.iso(pos.x, pos.y);
        const iconY  = y + 2;
        const depth  = (pos.x + pos.y) * 10 + 12;

        // Pre-drawn glow circle — hidden until animated
        const glow = this.add.graphics()
          .setPosition(x, iconY)
          .setDepth(depth)
          .setAlpha(0);
        glow.fillStyle(col, 0.55);
        glow.fillCircle(0, 0, 20);
        glow.lineStyle(2.5, col, 0.95);
        glow.strokeCircle(0, 0, 20);

        // Emoji icon — always visible, flat isometric projection
        const emoji = this.add.text(x, iconY, ELEMENT_EMOJI[element as string] ?? '?', {
          fontSize: '48px',
        })
          .setOrigin(0.5, 0.5)
          .setDepth(depth + 1)
          .setScale(0.85, 0.47)
          .setAngle(45);

        this.goalPathIcons.set(tileId, { emoji, glow, element });
      });
    }
  }

  /** Sequential glow on all 4 path icons when horse reaches final goal. */
  private playGoalReachSequence(playerId: string) {
    const path = GOAL_PATHS[playerId as keyof typeof GOAL_PATHS];
    if (!path) return;

    path.forEach((tileId, idx) => {
      const iconData = this.goalPathIcons.get(tileId);
      if (!iconData) return;

      const delay       = idx * 420;
      const isGoalTile  = idx === path.length - 1;
      const glowScale   = isGoalTile ? 2.2 : 1.6;
      const glowDur     = isGoalTile ? 280 : 220;

      this.time.delayedCall(delay, () => {
        const g = iconData.glow;
        const e = iconData.emoji;
        const pos = TILE_POSITIONS[tileId];
        this.tweens.killTweensOf(g);
        this.tweens.killTweensOf(e);

        // Glow burst
        g.setAlpha(0).setScale(0.5);
        this.tweens.add({
          targets: g,
          alpha: isGoalTile ? 1 : 0.88,
          scaleX: glowScale, scaleY: glowScale,
          duration: glowDur,
          ease: 'Quad.easeOut',
          onComplete: () => {
            this.tweens.add({
              targets: g, alpha: 0,
              scaleX: glowScale + 0.8, scaleY: glowScale + 0.8,
              duration: 380, ease: 'Quad.easeIn',
              onComplete: () => g.setAlpha(0).setScale(1),
            });
          },
        });

        // Emoji scale punch (preserve isometric proportions)
        const baseX = 0.85, baseY = 0.47;
        const punchX = baseX * (isGoalTile ? 1.55 : 1.35);
        const punchY = baseY * (isGoalTile ? 1.55 : 1.35);
        e.setScale(baseX, baseY);
        this.tweens.add({
          targets: e,
          scaleX: punchX, scaleY: punchY,
          duration: isGoalTile ? 200 : 160,
          ease: 'Back.easeOut',
          yoyo: true, hold: isGoalTile ? 200 : 100,
          onComplete: () => e.setScale(baseX, baseY),
        });

        // Expanding ripple ring
        if (pos) {
          const { x, y } = this.iso(pos.x, pos.y);
          const col = ELEMENT_HEX[iconData.element as string] ?? 0xFFFFFF;
          const ring = this.add.graphics().setDepth(9000).setPosition(x, y + 2);
          ring.lineStyle(isGoalTile ? 4 : 3, col, 1);
          ring.strokeCircle(0, 0, 18);
          this.tweens.add({
            targets: ring,
            scaleX: isGoalTile ? 4 : 3, scaleY: isGoalTile ? 4 : 3,
            alpha: 0,
            duration: isGoalTile ? 600 : 480,
            ease: 'Quad.easeOut',
            onComplete: () => ring.destroy(),
          });
        }
      });
    });

    // Signal React popup can show (after last glow + its ring fade)
    const totalDelay = (path.length - 1) * 420 + 700;
    this.time.delayedCall(totalDelay, () => {
      this.onGoalAnimationDone?.();
    });
  }

  /** Glow the chosen element icon on the board + horse absorb swirl. */
  private playGoalElementChosenAnim(playerId: string, element: string, tokenId: number) {
    const path = GOAL_PATHS[playerId as keyof typeof GOAL_PATHS];
    if (!path) return;

    // Find tile whose icon matches the chosen element
    const tileId = path.find(tid => this.goalPathIcons.get(tid)?.element === element);
    if (tileId === undefined) return;

    const iconData = this.goalPathIcons.get(tileId)!;
    const pos = TILE_POSITIONS[tileId];
    const g   = iconData.glow;
    const e   = iconData.emoji;
    this.tweens.killTweensOf(g);
    this.tweens.killTweensOf(e);

    // Big cinematic glow burst
    g.setAlpha(0).setScale(0.5);
    this.tweens.add({
      targets: g,
      alpha: 1, scaleX: 2.8, scaleY: 2.8,
      duration: 250, ease: 'Quad.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: g, alpha: 0, scaleX: 4, scaleY: 4,
          duration: 500, ease: 'Quad.easeIn',
          onComplete: () => g.setAlpha(0).setScale(1),
        });
      },
    });

    // Emoji big punch
    e.setScale(0.85, 0.47);
    this.tweens.add({
      targets: e, scaleX: 1.4, scaleY: 0.78,
      duration: 200, ease: 'Back.easeOut',
      yoyo: true, hold: 300,
      onComplete: () => e.setScale(0.85, 0.47),
    });

    // Large expanding double-ring
    if (pos) {
      const { x, y } = this.iso(pos.x, pos.y);
      const col = ELEMENT_HEX[element] ?? 0xFFFFFF;
      [20, 32].forEach((r, ri) => {
        const ring = this.add.graphics().setDepth(9000).setPosition(x, y + 2);
        ring.lineStyle(3 - ri, col, 1);
        ring.strokeCircle(0, 0, r);
        this.tweens.add({
          targets: ring, scaleX: 5, scaleY: 5, alpha: 0,
          duration: 700, delay: ri * 80, ease: 'Quad.easeOut',
          onComplete: () => ring.destroy(),
        });
      });
    }

    // Horse absorb swirl — slight delay to let impact settle
    this.time.delayedCall(250, () => {
      const goalTileId = path[path.length - 1];
      this.playElementAddedSwirl(goalTileId, tokenId, element, playerId);
    });
  }
}

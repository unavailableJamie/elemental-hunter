// Mock data for Character System prototype

export type Tier = 'D' | 'C' | 'B' | 'A';
export type Element = 'Fire' | 'Ice' | 'Grass' | 'Rock';
export type DupLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface ComboPower {
  id: 'cpow1' | 'cpow2' | 'cpow3';
  label: string;
  description: string;
  descriptionPlus: string;
  isPlus: boolean;
  isUnlocked: boolean;
}

export interface UltimateData {
  name: string;
  description: string;
  descriptionLv2: string;
  magCost: number;
  magCostLv2: number;
  level: 1 | 2;
}

export type DupRewardType = 'StatBonus' | 'CPowLvUP' | 'UltiLvUP';

export interface DupMilestone {
  dup: 1 | 2 | 3 | 4 | 5;
  rewardType: DupRewardType;
  rewardLabel: string;
  unlocked: boolean;
}

export interface CharacterData {
  id: string;
  name: string;
  tier: Tier;
  element: Element;
  charLevel: number;
  charLevelMax: number;
  enlightenment: number;
  enlightenmentMax: number;
  enlightenmentLevelCap: number;
  expCurrent: number;
  expNextLevel: number;
  atk: number;
  mag: number;
  maxHp: number;
  dupLevel: DupLevel;
  dupMilestones: DupMilestone[];
  comboPowers: ComboPower[];
  ultimate: UltimateData;
  // for list display
  owned: boolean;
}

// Tier color map
export const TIER_COLOR: Record<Tier, string> = {
  D: '#25B366',
  C: '#00A1FB',
  B: '#9B3EE8',
  A: '#FCEA0B',
};

export const ELEMENT_COLOR: Record<Element, string> = {
  Fire: '#ef4444',
  Ice: '#60a5fa',
  Grass: '#10b981',
  Rock: '#a16207',
};

export const ELEMENT_ICON: Record<Element, string> = {
  Fire: '🔥',
  Ice: '❄️',
  Grass: '🌿',
  Rock: '🪨',
};

// --- Mock Characters ---

export const MOCK_CHARACTERS: CharacterData[] = [
  {
    id: 'pillow',
    name: 'Pillow',
    tier: 'C',
    element: 'Grass',
    charLevel: 40,
    charLevelMax: 80,
    enlightenment: 2,
    enlightenmentMax: 4,
    enlightenmentLevelCap: 40,
    expCurrent: 2340,
    expNextLevel: 4800,
    atk: 96,
    mag: 48,
    maxHp: 1680,
    dupLevel: 1,
    dupMilestones: [
      { dup: 1, rewardType: 'StatBonus', rewardLabel: '+120 HP', unlocked: true },
      { dup: 2, rewardType: 'CPowLvUP', rewardLabel: 'C.Pow 1+', unlocked: false },
      { dup: 3, rewardType: 'StatBonus', rewardLabel: '+8 ATK', unlocked: false },
      { dup: 4, rewardType: 'CPowLvUP', rewardLabel: 'C.Pow 2+', unlocked: false },
      { dup: 5, rewardType: 'UltiLvUP', rewardLabel: 'Ulti Lv2', unlocked: false },
    ],
    comboPowers: [
      {
        id: 'cpow1',
        label: 'Power Surge',
        description: '+20 ATK to all horses',
        descriptionPlus: '+32 ATK to all horses',
        isPlus: false,
        isUnlocked: true,
      },
      {
        id: 'cpow2',
        label: 'Double Harvest',
        description: 'Double tile ATK/MAG gains for 1 turn',
        descriptionPlus: 'Double tile ATK/MAG gains for 2 turns',
        isPlus: false,
        isUnlocked: true,
      },
    ],
    ultimate: {
      name: 'Extra Roll',
      description: 'Kích hoạt thêm 1 lượt đổ xúc xắc ngay lúc này.',
      descriptionLv2: 'Kích hoạt thêm 2 lượt đổ xúc xắc ngay lúc này.',
      magCost: 70,
      magCostLv2: 50,
      level: 1,
    },
    owned: true,
  },
  {
    id: 'kira',
    name: 'Kira',
    tier: 'B',
    element: 'Fire',
    charLevel: 60,
    charLevelMax: 90,
    enlightenment: 3,
    enlightenmentMax: 5,
    enlightenmentLevelCap: 60,
    expCurrent: 810,
    expNextLevel: 6200,
    atk: 160,
    mag: 120,
    maxHp: 2600,
    dupLevel: 0,
    dupMilestones: [
      { dup: 1, rewardType: 'StatBonus', rewardLabel: '+200 HP', unlocked: false },
      { dup: 2, rewardType: 'CPowLvUP', rewardLabel: 'C.Pow 1+', unlocked: false },
      { dup: 3, rewardType: 'StatBonus', rewardLabel: '+15 ATK', unlocked: false },
      { dup: 4, rewardType: 'CPowLvUP', rewardLabel: 'C.Pow 2+', unlocked: false },
      { dup: 5, rewardType: 'UltiLvUP', rewardLabel: 'Ulti Lv2', unlocked: false },
    ],
    comboPowers: [
      {
        id: 'cpow1',
        label: 'Flame Strike',
        description: '+30 ATK to all horses',
        descriptionPlus: '+48 ATK to all horses',
        isPlus: false,
        isUnlocked: true,
      },
      {
        id: 'cpow2',
        label: 'Blaze Field',
        description: 'Deal 80 damage to opponent on combo',
        descriptionPlus: 'Deal 120 damage to opponent on combo',
        isPlus: false,
        isUnlocked: true,
      },
    ],
    ultimate: {
      name: 'Inferno',
      description: 'Deal 200 damage to all opponent horses.',
      descriptionLv2: 'Deal 300 damage to all opponent horses.',
      magCost: 80,
      magCostLv2: 80,
      level: 1,
    },
    owned: true,
  },
  {
    id: 'mucklepuff',
    name: 'Mucklepuff',
    tier: 'A',
    element: 'Rock',
    charLevel: 20,
    charLevelMax: 90,
    enlightenment: 1,
    enlightenmentMax: 5,
    enlightenmentLevelCap: 20,
    expCurrent: 4100,
    expNextLevel: 4100,
    atk: 75,
    mag: 45,
    maxHp: 1500,
    dupLevel: 5,
    dupMilestones: [
      { dup: 1, rewardType: 'StatBonus', rewardLabel: '+80 HP', unlocked: true },
      { dup: 2, rewardType: 'CPowLvUP', rewardLabel: 'C.Pow 1+', unlocked: true },
      { dup: 3, rewardType: 'CPowLvUP', rewardLabel: 'C.Pow 2+', unlocked: true },
      { dup: 4, rewardType: 'CPowLvUP', rewardLabel: 'C.Pow 3+', unlocked: true },
      { dup: 5, rewardType: 'UltiLvUP', rewardLabel: 'Ulti Lv2', unlocked: true },
    ],
    comboPowers: [
      {
        id: 'cpow1',
        label: 'Shadow Veil',
        description: 'Negate next 50 damage received',
        descriptionPlus: 'Negate next 100 damage received',
        isPlus: true,
        isUnlocked: true,
      },
      {
        id: 'cpow2',
        label: 'Dark Pulse',
        description: 'Reduce opponent ATK by 20 for 1 turn',
        descriptionPlus: 'Reduce opponent ATK by 40 for 1 turn',
        isPlus: true,
        isUnlocked: true,
      },
      {
        id: 'cpow3',
        label: 'Void Collapse',
        description: 'Swap HP with opponent (up to 500 HP stolen)',
        descriptionPlus: 'Swap HP with opponent (up to 800 HP stolen)',
        isPlus: true,
        isUnlocked: true,
      },
    ],
    ultimate: {
      name: 'Singularity',
      description: 'Pull all opponent horses back 3 tiles.',
      descriptionLv2: 'Pull all opponent horses back 5 tiles.',
      magCost: 90,
      magCostLv2: 70,
      level: 2,
    },
    owned: true,
  },
  {
    id: 'zara',
    name: 'Zara',
    tier: 'D',
    element: 'Ice',
    charLevel: 30,
    charLevelMax: 60,
    enlightenment: 2,
    enlightenmentMax: 3,
    enlightenmentLevelCap: 40,
    expCurrent: 1200,
    expNextLevel: 3600,
    atk: 60,
    mag: 30,
    maxHp: 1200,
    dupLevel: 1,
    dupMilestones: [
      { dup: 1, rewardType: 'StatBonus', rewardLabel: '+100 HP', unlocked: true },
      { dup: 2, rewardType: 'CPowLvUP', rewardLabel: 'C.Pow 1+', unlocked: false },
      { dup: 3, rewardType: 'StatBonus', rewardLabel: '+6 ATK', unlocked: false },
      { dup: 4, rewardType: 'StatBonus', rewardLabel: '+6 MAG', unlocked: false },
      { dup: 5, rewardType: 'UltiLvUP', rewardLabel: 'Ulti Lv2', unlocked: false },
    ],
    comboPowers: [
      {
        id: 'cpow1',
        label: 'Tidal Wave',
        description: '+15 MAG on each combo trigger',
        descriptionPlus: '+25 MAG on each combo trigger',
        isPlus: false,
        isUnlocked: true,
      },
    ],
    ultimate: {
      name: 'Ebb Tide',
      description: 'Move any opponent horse back 2 tiles.',
      descriptionLv2: 'Move any opponent horse back 4 tiles.',
      magCost: 60,
      magCostLv2: 45,
      level: 1,
    },
    owned: true,
  },
  {
    id: 'luxar',
    name: 'Luxar',
    tier: 'B',
    element: 'Fire',
    charLevel: 1,
    charLevelMax: 90,
    enlightenment: 1,
    enlightenmentMax: 5,
    enlightenmentLevelCap: 20,
    expCurrent: 0,
    expNextLevel: 1200,
    atk: 65,
    mag: 52,
    maxHp: 1300,
    dupLevel: 0,
    dupMilestones: [
      { dup: 1, rewardType: 'StatBonus', rewardLabel: '+150 HP', unlocked: false },
      { dup: 2, rewardType: 'CPowLvUP', rewardLabel: 'C.Pow 1+', unlocked: false },
      { dup: 3, rewardType: 'StatBonus', rewardLabel: '+10 ATK', unlocked: false },
      { dup: 4, rewardType: 'CPowLvUP', rewardLabel: 'C.Pow 2+', unlocked: false },
      { dup: 5, rewardType: 'UltiLvUP', rewardLabel: 'Ulti Lv2', unlocked: false },
    ],
    comboPowers: [
      {
        id: 'cpow1',
        label: 'Holy Ray',
        description: 'Heal 80 HP on combo',
        descriptionPlus: 'Heal 140 HP on combo',
        isPlus: false,
        isUnlocked: true,
      },
      {
        id: 'cpow2',
        label: 'Radiance',
        description: '+25 ATK to highest-ATK horse',
        descriptionPlus: '+45 ATK to highest-ATK horse',
        isPlus: false,
        isUnlocked: true,
      },
    ],
    ultimate: {
      name: 'Divine Smite',
      description: 'Deal 150 damage. Heal self for 50% of damage dealt.',
      descriptionLv2: 'Deal 220 damage. Heal self for 50% of damage dealt.',
      magCost: 75,
      magCostLv2: 75,
      level: 1,
    },
    owned: true,
  },
  {
    id: 'vex',
    name: 'Vex',
    tier: 'C',
    element: 'Rock',
    charLevel: 1,
    charLevelMax: 80,
    enlightenment: 1,
    enlightenmentMax: 4,
    enlightenmentLevelCap: 20,
    expCurrent: 550,
    expNextLevel: 1200,
    atk: 55,
    mag: 40,
    maxHp: 1400,
    dupLevel: 0,
    dupMilestones: [
      { dup: 1, rewardType: 'StatBonus', rewardLabel: '+110 HP', unlocked: false },
      { dup: 2, rewardType: 'CPowLvUP', rewardLabel: 'C.Pow 1+', unlocked: false },
      { dup: 3, rewardType: 'StatBonus', rewardLabel: '+7 ATK', unlocked: false },
      { dup: 4, rewardType: 'CPowLvUP', rewardLabel: 'C.Pow 2+', unlocked: false },
      { dup: 5, rewardType: 'UltiLvUP', rewardLabel: 'Ulti Lv2', unlocked: false },
    ],
    comboPowers: [
      {
        id: 'cpow1',
        label: 'Rock Armor',
        description: 'Reduce incoming damage by 15 for 1 turn',
        descriptionPlus: 'Reduce incoming damage by 25 for 1 turn',
        isPlus: false,
        isUnlocked: true,
      },
      {
        id: 'cpow2',
        label: 'Tremor',
        description: 'Stun 1 opponent horse for 1 turn',
        descriptionPlus: 'Stun 1 opponent horse for 2 turns',
        isPlus: false,
        isUnlocked: true,
      },
    ],
    ultimate: {
      name: 'Earthquake',
      description: 'Reroll all opponent horses\' positions within 3 tiles.',
      descriptionLv2: 'Reroll all opponent horses\' positions within 5 tiles.',
      magCost: 65,
      magCostLv2: 50,
      level: 1,
    },
    owned: true,
  },
];

export const getCharById = (id: string) =>
  MOCK_CHARACTERS.find((c) => c.id === id) ?? MOCK_CHARACTERS[0];

// Enlightenment bracket label
export const getEnLabel = (en: number) => `En. ${en}`;

// Dup reward display color
export const DUP_REWARD_COLOR: Record<DupRewardType, string> = {
  StatBonus: '#60a5fa',
  CPowLvUP: '#a78bfa',
  UltiLvUP: '#fbbf24',
};

// ── Mock player inventory (placeholder — 100 of each mat, 1M Gold) ────────────
export const MOCK_INVENTORY = {
  gold:   100_000_000,
  ExpN:   100,
  ExpR:   100,
  ExpSR:  100,
  EnMat1: 100,
  EnMat2: 100,
  EnMat3: 100,
  EnMat4: 100,
  EnMat5: 100,
} as const;

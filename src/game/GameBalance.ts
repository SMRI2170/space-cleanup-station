export type UpgradeId = 'speed' | 'capacity' | 'range' | 'recycle' | 'drone';

export interface UpgradeDefinition {
  id: UpgradeId;
  label: string;
  shortLabel: string;
  maxLevel: number;
  baseCost: number;
  costStep: number;
}

export const UPGRADES: Record<UpgradeId, UpgradeDefinition> = {
  speed: {
    id: 'speed',
    label: 'THRUST',
    shortLabel: 'SPD',
    maxLevel: 5,
    baseCost: 20,
    costStep: 18,
  },
  capacity: {
    id: 'capacity',
    label: 'CARGO',
    shortLabel: 'BAG',
    maxLevel: 5,
    baseCost: 20,
    costStep: 22,
  },
  range: {
    id: 'range',
    label: 'MAGNET',
    shortLabel: 'MAG',
    maxLevel: 5,
    baseCost: 25,
    costStep: 24,
  },
  recycle: {
    id: 'recycle',
    label: 'PROCESSOR',
    shortLabel: 'REC',
    maxLevel: 5,
    baseCost: 30,
    costStep: 28,
  },
  drone: {
    id: 'drone',
    label: 'DRONE',
    shortLabel: 'BOT',
    maxLevel: 4,
    baseCost: 55,
    costStep: 45,
  },
};

export const UPGRADE_ORDER: UpgradeId[] = ['speed', 'capacity', 'range', 'recycle', 'drone'];

export function upgradeCost(id: UpgradeId, level: number): number {
  const definition = UPGRADES[id];
  return definition.baseCost + definition.costStep * level;
}

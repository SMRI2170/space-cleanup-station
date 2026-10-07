import { UPGRADES, type UpgradeId, upgradeCost } from './GameBalance';

export interface SaveData {
  version: 2;
  credits: number;
  speedLevel: number;
  capacityLevel: number;
  rangeLevel: number;
  recycleLevel: number;
  droneLevel: number;
  cargo: number[];
}

const SAVE_KEY = 'space-cleanup-station:v2';
const LEGACY_SAVE_KEY = 'space-cleanup-station:v1';

const DEFAULT_SAVE: SaveData = {
  version: 2,
  credits: 0,
  speedLevel: 0,
  capacityLevel: 0,
  rangeLevel: 0,
  recycleLevel: 0,
  droneLevel: 0,
  cargo: [],
};

export class GameState {
  credits = 0;
  speedLevel = 0;
  capacityLevel = 0;
  rangeLevel = 0;
  recycleLevel = 0;
  droneLevel = 0;
  cargo: number[] = [];

  constructor() {
    const saved = this.load();
    this.credits = saved.credits;
    this.speedLevel = saved.speedLevel;
    this.capacityLevel = saved.capacityLevel;
    this.rangeLevel = saved.rangeLevel;
    this.recycleLevel = saved.recycleLevel;
    this.droneLevel = saved.droneLevel;
    this.cargo = saved.cargo.slice(0, this.capacity);
  }

  get speed(): number {
    return 3.8 + this.speedLevel * 0.5;
  }

  get capacity(): number {
    return 5 + this.capacityLevel * 2;
  }

  get collectionRange(): number {
    return 0.72 + this.rangeLevel * 0.14;
  }

  get recycleInterval(): number {
    return Math.max(90, 260 - this.recycleLevel * 38);
  }

  get droneUnlocked(): boolean {
    return this.droneLevel > 0;
  }

  get droneSpeed(): number {
    return 2.5 + Math.max(0, this.droneLevel - 1) * 0.55;
  }

  getUpgradeLevel(id: UpgradeId): number {
    switch (id) {
      case 'speed': return this.speedLevel;
      case 'capacity': return this.capacityLevel;
      case 'range': return this.rangeLevel;
      case 'recycle': return this.recycleLevel;
      case 'drone': return this.droneLevel;
    }
  }

  getUpgradeCost(id: UpgradeId): number {
    return upgradeCost(id, this.getUpgradeLevel(id));
  }

  canUpgrade(id: UpgradeId): boolean {
    const level = this.getUpgradeLevel(id);
    return level < UPGRADES[id].maxLevel && this.credits >= this.getUpgradeCost(id);
  }

  buyUpgrade(id: UpgradeId): boolean {
    if (!this.canUpgrade(id)) return false;

    this.credits -= this.getUpgradeCost(id);
    switch (id) {
      case 'speed': this.speedLevel += 1; break;
      case 'capacity': this.capacityLevel += 1; break;
      case 'range': this.rangeLevel += 1; break;
      case 'recycle': this.recycleLevel += 1; break;
      case 'drone': this.droneLevel += 1; break;
    }
    this.save();
    return true;
  }

  tryAddCargo(value: number): boolean {
    if (this.cargo.length >= this.capacity) return false;
    this.cargo.push(value);
    this.save();
    return true;
  }

  takeCargo(): number {
    const value = this.cargo.shift() ?? 0;
    if (value > 0) this.save();
    return value;
  }

  credit(value: number): void {
    if (value <= 0) return;
    this.credits += value;
    this.save();
  }

  private load(): SaveData {
    try {
      const current = localStorage.getItem(SAVE_KEY);
      if (current) {
        const parsed = JSON.parse(current) as Partial<SaveData>;
        return this.sanitize(parsed);
      }

      const legacy = localStorage.getItem(LEGACY_SAVE_KEY);
      if (legacy) {
        const parsed = JSON.parse(legacy) as {
          credits?: number;
          speedLevel?: number;
          capacityLevel?: number;
        };
        return this.sanitize({
          version: 2,
          credits: parsed.credits,
          speedLevel: parsed.speedLevel,
          capacityLevel: parsed.capacityLevel,
        });
      }
    } catch {
      return { ...DEFAULT_SAVE, cargo: [] };
    }

    return { ...DEFAULT_SAVE, cargo: [] };
  }

  private sanitize(raw: Partial<SaveData>): SaveData {
    const clampLevel = (value: unknown, id: UpgradeId): number => {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return 0;
      return Math.max(0, Math.min(UPGRADES[id].maxLevel, Math.floor(numeric)));
    };

    const cargo = Array.isArray(raw.cargo)
      ? raw.cargo
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value) && value > 0)
          .slice(0, 20)
      : [];

    return {
      version: 2,
      credits: Number.isFinite(Number(raw.credits)) ? Math.max(0, Math.floor(Number(raw.credits))) : 0,
      speedLevel: clampLevel(raw.speedLevel, 'speed'),
      capacityLevel: clampLevel(raw.capacityLevel, 'capacity'),
      rangeLevel: clampLevel(raw.rangeLevel, 'range'),
      recycleLevel: clampLevel(raw.recycleLevel, 'recycle'),
      droneLevel: clampLevel(raw.droneLevel, 'drone'),
      cargo,
    };
  }

  private save(): void {
    const data: SaveData = {
      version: 2,
      credits: this.credits,
      speedLevel: this.speedLevel,
      capacityLevel: this.capacityLevel,
      rangeLevel: this.rangeLevel,
      recycleLevel: this.recycleLevel,
      droneLevel: this.droneLevel,
      cargo: this.cargo,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }
}

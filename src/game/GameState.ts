export interface SaveData {
  credits: number;
  speedLevel: number;
  capacityLevel: number;
}

const SAVE_KEY = 'space-cleanup-station:v1';
const DEFAULT_SAVE: SaveData = { credits: 0, speedLevel: 0, capacityLevel: 0 };

export class GameState {
  credits = 0;
  speedLevel = 0;
  capacityLevel = 0;
  cargo: number[] = [];

  constructor() {
    const saved = this.load();
    this.credits = saved.credits;
    this.speedLevel = saved.speedLevel;
    this.capacityLevel = saved.capacityLevel;
  }

  get speed(): number {
    return 3.7 + this.speedLevel * 0.45;
  }

  get capacity(): number {
    return 5 + this.capacityLevel * 2;
  }

  get speedUpgradeCost(): number {
    return 30 + this.speedLevel * 25;
  }

  get capacityUpgradeCost(): number {
    return 35 + this.capacityLevel * 30;
  }

  tryAddCargo(value: number): boolean {
    if (this.cargo.length >= this.capacity) return false;
    this.cargo.push(value);
    return true;
  }

  sellOne(): number {
    const value = this.cargo.shift() ?? 0;
    this.credits += value;
    if (value > 0) this.save();
    return value;
  }

  buySpeed(): boolean {
    if (this.credits < this.speedUpgradeCost) return false;
    this.credits -= this.speedUpgradeCost;
    this.speedLevel += 1;
    this.save();
    return true;
  }

  buyCapacity(): boolean {
    if (this.credits < this.capacityUpgradeCost) return false;
    this.credits -= this.capacityUpgradeCost;
    this.capacityLevel += 1;
    this.save();
    return true;
  }

  private load(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return { ...DEFAULT_SAVE };
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      return {
        credits: Number.isFinite(parsed.credits) ? Number(parsed.credits) : 0,
        speedLevel: Number.isFinite(parsed.speedLevel) ? Number(parsed.speedLevel) : 0,
        capacityLevel: Number.isFinite(parsed.capacityLevel) ? Number(parsed.capacityLevel) : 0,
      };
    } catch {
      return { ...DEFAULT_SAVE };
    }
  }

  private save(): void {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      credits: this.credits,
      speedLevel: this.speedLevel,
      capacityLevel: this.capacityLevel,
    } satisfies SaveData));
  }
}

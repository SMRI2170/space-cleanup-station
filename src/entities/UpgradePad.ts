import Phaser from 'phaser';
import { UPGRADES, type UpgradeId } from '../game/GameBalance';
import type { GameState } from '../game/GameState';
import { distance, worldToIso } from '../game/iso';

const PAD_COLORS: Record<UpgradeId, number> = {
  speed: 0x65d9ff,
  capacity: 0xffc857,
  range: 0x7de6c4,
  recycle: 0xff8fa3,
  drone: 0xc69cff,
};

export class UpgradePad {
  readonly id: UpgradeId;
  readonly worldX: number;
  readonly worldY: number;
  private readonly ring: Phaser.GameObjects.Arc;
  private readonly label: Phaser.GameObjects.Text;
  private holdMs = 0;
  private cooldownMs = 0;

  constructor(
    scene: Phaser.Scene,
    id: UpgradeId,
    worldX: number,
    worldY: number,
    originX: number,
    originY: number,
  ) {
    this.id = id;
    this.worldX = worldX;
    this.worldY = worldY;

    const p = worldToIso(worldX, worldY, originX, originY);
    const color = PAD_COLORS[id];

    const shadow = scene.add.ellipse(p.x, p.y + 8, 65, 23, 0x02060b, 0.38).setDepth(p.y + 5);
    shadow.setRotation(-0.02);

    this.ring = scene.add.circle(p.x, p.y, 25, color, 0.16)
      .setStrokeStyle(4, color, 0.86)
      .setDepth(p.y + 6);

    this.label = scene.add.text(p.x, p.y - 44, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      align: 'center',
      color: '#f7fbff',
      backgroundColor: '#07111fe8',
      padding: { x: 7, y: 5 },
    }).setOrigin(0.5).setDepth(p.y + 7);
  }

  update(delta: number, playerX: number, playerY: number, state: GameState): boolean {
    if (this.cooldownMs > 0) {
      this.cooldownMs = Math.max(0, this.cooldownMs - delta);
    }

    const near = distance(playerX, playerY, this.worldX, this.worldY) <= 0.72;
    const level = state.getUpgradeLevel(this.id);
    const maxed = level >= UPGRADES[this.id].maxLevel;
    const affordable = !maxed && state.credits >= state.getUpgradeCost(this.id);

    if (near && affordable && this.cooldownMs <= 0) {
      this.holdMs += delta;
      this.ring.setScale(1 + Math.min(0.18, this.holdMs / 2500));
      this.ring.setAlpha(0.75 + Math.min(0.25, this.holdMs / 1800));

      if (this.holdMs >= 520) {
        this.holdMs = 0;
        this.cooldownMs = 900;
        this.ring.setScale(1);
        return state.buyUpgrade(this.id);
      }
    } else {
      this.holdMs = 0;
      this.ring.setScale(near ? 1.08 : 1);
      this.ring.setAlpha(near ? 1 : 0.86);
    }

    return false;
  }

  refresh(state: GameState): void {
    const definition = UPGRADES[this.id];
    const level = state.getUpgradeLevel(this.id);
    if (level >= definition.maxLevel) {
      this.label.setText(`${definition.label}\nMAX`);
      return;
    }

    const cost = state.getUpgradeCost(this.id);
    const prefix = this.id === 'drone' && level === 0 ? 'UNLOCK' : `LV ${level + 1}`;
    this.label.setText(`${definition.label}\n${prefix} · CR ${cost}`);
  }
}

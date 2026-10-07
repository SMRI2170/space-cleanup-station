import Phaser from 'phaser';
import { worldToIso } from '../game/iso';

const COLORS = [0x91a4b7, 0xffc857, 0x7de6c4, 0xc69cff];
const NAMES = ['SCRAP', 'PANEL', 'CORE', 'RELIC'];

export class Debris {
  readonly worldX: number;
  readonly worldY: number;
  readonly value: number;
  readonly tier: number;
  readonly name: string;
  readonly view: Phaser.GameObjects.Container;
  active = true;
  reserved = false;

  constructor(scene: Phaser.Scene, worldX: number, worldY: number, tier: number) {
    this.worldX = worldX;
    this.worldY = worldY;
    this.tier = tier;
    this.name = NAMES[tier] ?? 'SCRAP';
    this.value = [5, 8, 14, 24][tier] ?? 5;

    const shadow = scene.add.ellipse(0, 9, 32, 13, 0x02060b, 0.35);
    const glow = scene.add.circle(0, -1, 13 + tier, COLORS[tier], 0.12);
    const scrap = scene.add.rectangle(0, 0, 20 + tier * 3, 12 + tier * 2, COLORS[tier], 1);
    scrap.setStrokeStyle(2, 0xeaf5ff, 0.62);
    scrap.setRotation(Phaser.Math.FloatBetween(-0.55, 0.55));
    const spark = scene.add.circle(7, -7, 3, 0xffffff, 0.8);
    this.view = scene.add.container(0, 0, [shadow, glow, scrap, spark]);
  }

  render(originX: number, originY: number): void {
    const p = worldToIso(this.worldX, this.worldY, originX, originY);
    this.view.setPosition(p.x, p.y);
    this.view.setDepth(p.y + 20);
  }

  destroy(): void {
    if (!this.active) return;
    this.active = false;
    this.reserved = false;
    this.view.destroy(true);
  }
}

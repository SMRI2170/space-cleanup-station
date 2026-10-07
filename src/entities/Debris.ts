import Phaser from 'phaser';
import { worldToIso } from '../game/iso';

const COLORS = [0x90a4ae, 0xffc857, 0x9fe870, 0xcf9cff];

export class Debris {
  readonly worldX: number;
  readonly worldY: number;
  readonly value: number;
  readonly view: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, worldX: number, worldY: number, tier: number) {
    this.worldX = worldX;
    this.worldY = worldY;
    this.value = 5 + tier * 5;

    const shadow = scene.add.ellipse(0, 7, 30, 12, 0x02060b, 0.28);
    const scrap = scene.add.rectangle(0, 0, 20 + tier * 2, 12 + tier * 2, COLORS[tier], 1);
    scrap.setStrokeStyle(2, 0xeaf5ff, 0.55);
    scrap.setRotation(Phaser.Math.FloatBetween(-0.6, 0.6));
    const spark = scene.add.circle(6, -6, 3, 0xffffff, 0.75);
    this.view = scene.add.container(0, 0, [shadow, scrap, spark]);
  }

  render(originX: number, originY: number): void {
    const p = worldToIso(this.worldX, this.worldY, originX, originY);
    this.view.setPosition(p.x, p.y);
    this.view.setDepth(p.y + 20);
  }

  destroy(): void {
    this.view.destroy(true);
  }
}

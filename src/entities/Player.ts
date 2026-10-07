import Phaser from 'phaser';
import { worldToIso } from '../game/iso';

export class Player {
  worldX = 0;
  worldY = 2.5;
  readonly view: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    const shadow = scene.add.ellipse(0, 13, 46, 18, 0x02060b, 0.38);
    const body = scene.add.circle(0, 0, 18, 0x7ee7ff);
    body.setStrokeStyle(3, 0xffffff, 0.9);
    const visor = scene.add.rectangle(7, -4, 15, 8, 0x173b68).setRotation(-0.12);
    const pack = scene.add.rectangle(-14, 1, 10, 22, 0xffb35c);
    this.view = scene.add.container(0, 0, [shadow, pack, body, visor]);
  }

  move(dx: number, dy: number, speed: number, deltaSeconds: number): void {
    const length = Math.hypot(dx, dy);
    if (length < 0.01) return;
    const nx = dx / Math.max(1, length);
    const ny = dy / Math.max(1, length);
    this.worldX = Phaser.Math.Clamp(this.worldX + nx * speed * deltaSeconds, -9.2, 9.2);
    this.worldY = Phaser.Math.Clamp(this.worldY + ny * speed * deltaSeconds, -9.2, 9.2);
  }

  render(originX: number, originY: number): void {
    const p = worldToIso(this.worldX, this.worldY, originX, originY);
    this.view.setPosition(p.x, p.y - 18);
    this.view.setDepth(p.y + 100);
  }
}

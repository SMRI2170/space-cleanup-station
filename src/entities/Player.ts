import Phaser from 'phaser';
import { worldToIso } from '../game/iso';

const CARGO_COLORS = [0x91a4b7, 0xffc857, 0x7de6c4, 0xc69cff];

function colorForValue(value: number): number {
  if (value >= 20) return CARGO_COLORS[3];
  if (value >= 12) return CARGO_COLORS[2];
  if (value >= 8) return CARGO_COLORS[1];
  return CARGO_COLORS[0];
}

export class Player {
  worldX = 0;
  worldY = 2.5;
  readonly view: Phaser.GameObjects.Container;
  private readonly scene: Phaser.Scene;
  private readonly cargoLayer: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const shadow = scene.add.ellipse(0, 16, 50, 19, 0x02060b, 0.42);
    const pack = scene.add.rectangle(-16, 1, 12, 24, 0xffb35c);
    pack.setStrokeStyle(2, 0xffe0a8, 0.8);
    const body = scene.add.circle(0, 0, 19, 0x7ee7ff);
    body.setStrokeStyle(3, 0xffffff, 0.92);
    const visor = scene.add.rectangle(7, -5, 16, 8, 0x173b68).setRotation(-0.12);
    const antenna = scene.add.line(0, 0, -3, -20, 2, -31, 0xc7f4ff, 0.9).setLineWidth(2);
    const beacon = scene.add.circle(2, -31, 3, 0xff7f76, 1);

    this.cargoLayer = scene.add.container(-24, 4);
    this.view = scene.add.container(0, 0, [shadow, this.cargoLayer, pack, body, visor, antenna, beacon]);
  }

  move(dx: number, dy: number, speed: number, deltaSeconds: number): void {
    const length = Math.hypot(dx, dy);
    if (length < 0.01) return;
    const nx = dx / Math.max(1, length);
    const ny = dy / Math.max(1, length);
    this.worldX = Phaser.Math.Clamp(this.worldX + nx * speed * deltaSeconds, -9.2, 9.2);
    this.worldY = Phaser.Math.Clamp(this.worldY + ny * speed * deltaSeconds, -9.2, 9.2);
  }

  syncCargo(values: number[], capacity: number): void {
    this.cargoLayer.removeAll(true);

    const visible = values.slice(0, 9);
    visible.forEach((value, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const crate = this.scene.add.rectangle(
        -column * 9,
        -row * 10,
        12,
        8,
        colorForValue(value),
        1,
      );
      crate.setStrokeStyle(1, 0xffffff, 0.55);
      crate.setRotation((column - 1) * 0.07);
      this.cargoLayer.add(crate);
    });

    if (values.length >= capacity) {
      const full = this.scene.add.text(-10, -37, 'FULL', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#ffdf8c',
        backgroundColor: '#111827dd',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5);
      this.cargoLayer.add(full);
    }
  }

  render(originX: number, originY: number): void {
    const p = worldToIso(this.worldX, this.worldY, originX, originY);
    this.view.setPosition(p.x, p.y - 18);
    this.view.setDepth(p.y + 100);
  }
}

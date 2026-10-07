import Phaser from 'phaser';
import type { Debris } from './Debris';
import { distance, worldToIso } from '../game/iso';

export interface DroneUpdateResult {
  picked?: Debris;
  deliveredValue?: number;
}

export class Drone {
  worldX = 0.4;
  worldY = 0.4;
  readonly view: Phaser.GameObjects.Container;
  private target: Debris | null = null;
  private cargoValue = 0;
  private phase: 'idle' | 'collect' | 'return' = 'idle';

  constructor(scene: Phaser.Scene) {
    const shadow = scene.add.ellipse(0, 11, 34, 12, 0x02060b, 0.32);
    const leftWing = scene.add.rectangle(-14, 0, 16, 5, 0xc69cff, 0.95);
    const rightWing = scene.add.rectangle(14, 0, 16, 5, 0xc69cff, 0.95);
    const body = scene.add.circle(0, 0, 9, 0xf6f0ff, 1);
    body.setStrokeStyle(2, 0xc69cff, 0.9);
    const eye = scene.add.circle(3, -1, 3, 0x173b68, 1);
    this.view = scene.add.container(0, 0, [shadow, leftWing, rightWing, body, eye]);
    this.view.setVisible(false);
  }

  update(
    deltaSeconds: number,
    speed: number,
    debris: Debris[],
    originX: number,
    originY: number,
    enabled: boolean,
  ): DroneUpdateResult {
    this.view.setVisible(enabled);
    if (!enabled) return {};

    if (this.phase === 'idle') {
      this.acquireTarget(debris);
    }

    if (this.phase === 'collect') {
      if (!this.target || !this.target.active) {
        this.target = null;
        this.phase = 'idle';
      } else {
        this.moveToward(this.target.worldX, this.target.worldY, speed, deltaSeconds);
        if (distance(this.worldX, this.worldY, this.target.worldX, this.target.worldY) <= 0.3) {
          const picked = this.target;
          this.cargoValue = picked.value;
          picked.reserved = false;
          this.target = null;
          this.phase = 'return';
          this.render(originX, originY);
          return { picked };
        }
      }
    }

    if (this.phase === 'return') {
      this.moveToward(0.4, 0.4, speed, deltaSeconds);
      if (distance(this.worldX, this.worldY, 0.4, 0.4) <= 0.26) {
        const deliveredValue = this.cargoValue;
        this.cargoValue = 0;
        this.phase = 'idle';
        this.render(originX, originY);
        return { deliveredValue };
      }
    }

    this.render(originX, originY);
    return {};
  }

  private acquireTarget(debris: Debris[]): void {
    let best: Debris | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const item of debris) {
      if (!item.active || item.reserved) continue;
      const currentDistance = distance(this.worldX, this.worldY, item.worldX, item.worldY);
      if (currentDistance < bestDistance) {
        bestDistance = currentDistance;
        best = item;
      }
    }

    if (!best) return;
    best.reserved = true;
    this.target = best;
    this.phase = 'collect';
  }

  private moveToward(targetX: number, targetY: number, speed: number, deltaSeconds: number): void {
    const dx = targetX - this.worldX;
    const dy = targetY - this.worldY;
    const length = Math.max(0.001, Math.hypot(dx, dy));
    const step = Math.min(length, speed * deltaSeconds);
    this.worldX += (dx / length) * step;
    this.worldY += (dy / length) * step;
  }

  private render(originX: number, originY: number): void {
    const p = worldToIso(this.worldX, this.worldY, originX, originY);
    this.view.setPosition(p.x, p.y - 28);
    this.view.setDepth(p.y + 120);
  }
}

import Phaser from 'phaser';
import { Debris } from '../entities/Debris';
import { Drone } from '../entities/Drone';
import { Player } from '../entities/Player';
import { UpgradePad } from '../entities/UpgradePad';
import { UPGRADE_ORDER } from '../game/GameBalance';
import { GameState } from '../game/GameState';
import { distance, TILE_HEIGHT, TILE_WIDTH, worldToIso } from '../game/iso';

export class GameScene extends Phaser.Scene {
  private state = new GameState();
  private player!: Player;
  private drone!: Drone;
  private debris: Debris[] = [];
  private pads: UpgradePad[] = [];

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

  private creditsText!: Phaser.GameObjects.Text;
  private cargoText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;
  private tipText!: Phaser.GameObjects.Text;
  private processorText!: Phaser.GameObjects.Text;
  private magnetRing!: Phaser.GameObjects.Ellipse;

  private joystickPointerId: number | null = null;
  private joystickStart = new Phaser.Math.Vector2();
  private joystickVector = new Phaser.Math.Vector2();
  private joystickBase!: Phaser.GameObjects.Arc;
  private joystickKnob!: Phaser.GameObjects.Arc;

  private lastProcessAt = 0;
  private readonly origin = { x: 640, y: 232 };

  constructor() {
    super('game');
  }

  create(): void {
    this.drawBackdrop();
    this.drawIsoGrid();
    this.drawStation();
    this.createUpgradePads();

    this.player = new Player(this);
    this.player.syncCargo(this.state.cargo, this.state.capacity);
    this.player.render(this.origin.x, this.origin.y);

    this.drone = new Drone(this);

    for (let i = 0; i < 30; i += 1) this.spawnDebris();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

    this.createHud();
    this.createJoystick();
    this.bindTouchControls();
    this.scale.on('resize', this.layoutHud, this);
    this.layoutHud();
    this.refreshPads();
  }

  update(time: number, delta: number): void {
    const keyboardX = Number(this.cursors.right.isDown || this.wasd.D.isDown)
      - Number(this.cursors.left.isDown || this.wasd.A.isDown);
    const keyboardY = Number(this.cursors.down.isDown || this.wasd.S.isDown)
      - Number(this.cursors.up.isDown || this.wasd.W.isDown);

    const moveX = keyboardX || this.joystickVector.x;
    const moveY = keyboardY || this.joystickVector.y;

    this.player.move(moveX, moveY, this.state.speed, delta / 1000);
    this.player.render(this.origin.x, this.origin.y);
    this.updateMagnetRing();

    this.collectNearbyDebris();
    this.processCargoAtStation(time);
    this.updateUpgradePads(delta);
    this.updateDrone(delta);
    this.updateHud();
  }

  private drawBackdrop(): void {
    const graphics = this.add.graphics().setDepth(-2000);
    graphics.fillStyle(0x050b16, 1);
    graphics.fillRect(0, 0, 1280, 720);

    graphics.fillStyle(0x10264a, 0.72);
    graphics.fillCircle(1040, 655, 250);
    graphics.fillStyle(0x18345c, 0.7);
    graphics.fillCircle(1040, 655, 195);
    graphics.lineStyle(18, 0x8bb9d9, 0.12);
    graphics.strokeEllipse(1040, 655, 570, 105);

    graphics.fillStyle(0x203c6b, 0.18);
    graphics.fillCircle(230, 110, 150);

    for (let i = 0; i < 150; i += 1) {
      const alpha = Phaser.Math.FloatBetween(0.18, 0.92);
      graphics.fillStyle(i % 9 === 0 ? 0x8fdfff : 0xe8f4ff, alpha);
      graphics.fillCircle(
        Phaser.Math.Between(0, 1280),
        Phaser.Math.Between(0, 720),
        Phaser.Math.FloatBetween(0.45, i % 11 === 0 ? 1.9 : 1.25),
      );
    }

    const title = this.add.text(640, 54, 'ORBITAL CLEANUP DIVISION', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      letterSpacing: 4,
      color: '#7fa6c8',
    }).setOrigin(0.5).setDepth(-1500);
    title.setAlpha(0.85);
  }

  private drawIsoGrid(): void {
    const graphics = this.add.graphics().setDepth(-200);
    graphics.lineStyle(1, 0x6992b7, 0.12);

    for (let x = -10; x <= 10; x += 1) {
      for (let y = -10; y <= 10; y += 1) {
        const p = worldToIso(x, y, this.origin.x, this.origin.y);
        const points = [
          new Phaser.Math.Vector2(p.x, p.y - TILE_HEIGHT / 2),
          new Phaser.Math.Vector2(p.x + TILE_WIDTH / 2, p.y),
          new Phaser.Math.Vector2(p.x, p.y + TILE_HEIGHT / 2),
          new Phaser.Math.Vector2(p.x - TILE_WIDTH / 2, p.y),
        ];
        graphics.strokePoints(points, true);
      }
    }

    const border = [
      worldToIso(-10, -10, this.origin.x, this.origin.y),
      worldToIso(10, -10, this.origin.x, this.origin.y),
      worldToIso(10, 10, this.origin.x, this.origin.y),
      worldToIso(-10, 10, this.origin.x, this.origin.y),
    ].map((point) => new Phaser.Math.Vector2(point.x, point.y));
    graphics.lineStyle(3, 0x5fc5dd, 0.18);
    graphics.strokePoints(border, true);
  }

  private drawStation(): void {
    const p = worldToIso(0, 0, this.origin.x, this.origin.y);
    const base = this.add.graphics().setDepth(p.y + 10);

    const platform = [
      new Phaser.Math.Vector2(p.x, p.y - 64),
      new Phaser.Math.Vector2(p.x + 116, p.y),
      new Phaser.Math.Vector2(p.x, p.y + 64),
      new Phaser.Math.Vector2(p.x - 116, p.y),
    ];

    base.fillStyle(0x122c4f, 0.98);
    base.fillPoints(platform, true);
    base.lineStyle(4, 0x62dfc1, 0.82);
    base.strokePoints(platform, true);

    base.fillStyle(0x07111f, 0.7);
    base.fillRect(p.x - 65, p.y - 17, 132, 34);

    for (let i = 0; i < 6; i += 1) {
      base.fillStyle(i % 2 === 0 ? 0x294f70 : 0x1c3a57, 1);
      base.fillCircle(p.x - 52 + i * 22, p.y, 8);
    }

    base.fillStyle(0x27496a, 1);
    base.fillRect(p.x + 68, p.y - 16, 105, 32);
    base.lineStyle(3, 0xff9f7c, 0.9);
    base.strokeRect(p.x + 68, p.y - 16, 105, 32);

    const reactor = this.add.circle(p.x - 2, p.y - 32, 24, 0x60e2c1, 0.18)
      .setStrokeStyle(4, 0x62dfc1, 0.9)
      .setDepth(p.y + 12);
    this.add.circle(p.x - 2, p.y - 32, 9, 0xd7fff5, 0.9).setDepth(p.y + 13);

    this.tweens.add({
      targets: reactor,
      scale: 1.14,
      alpha: 0.72,
      duration: 950,
      yoyo: true,
      repeat: -1,
    });

    this.add.text(p.x, p.y + 37, 'RECYCLING STATION', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#b9ffe9',
      backgroundColor: '#07111fcc',
      padding: { x: 7, y: 4 },
    }).setOrigin(0.5).setDepth(p.y + 15);

    this.processorText = this.add.text(p.x + 121, p.y - 33, 'PROCESSOR', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffd5c5',
    }).setOrigin(0.5).setDepth(p.y + 15);
  }

  private createUpgradePads(): void {
    const placements = [
      { id: UPGRADE_ORDER[0], x: -2.4, y: 1.15 },
      { id: UPGRADE_ORDER[1], x: 2.4, y: 1.15 },
      { id: UPGRADE_ORDER[2], x: -2.4, y: -1.65 },
      { id: UPGRADE_ORDER[3], x: 2.4, y: -1.65 },
      { id: UPGRADE_ORDER[4], x: 0, y: 3.25 },
    ];

    this.pads = placements.map(({ id, x, y }) => (
      new UpgradePad(this, id, x, y, this.origin.x, this.origin.y)
    ));
  }

  private createHud(): void {
    this.add.rectangle(20, 18, 342, 92, 0x07111f, 0.86)
      .setOrigin(0)
      .setStrokeStyle(2, 0x315b7a, 0.65)
      .setDepth(5000);

    this.creditsText = this.add.text(38, 30, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '27px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setDepth(5001);

    this.cargoText = this.add.text(38, 67, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#9bded0',
    }).setDepth(5001);

    this.objectiveText = this.add.text(640, 88, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#dcecff',
      backgroundColor: '#07111fd9',
      padding: { x: 13, y: 8 },
    }).setOrigin(0.5).setDepth(5001);

    this.tipText = this.add.text(0, 0, 'MOVE  •  COLLECT  •  RECYCLE  •  STAND ON A PAD TO UPGRADE', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#88a9c5',
      backgroundColor: '#07111fbb',
      padding: { x: 10, y: 6 },
    }).setOrigin(1, 1).setDepth(5001);

    this.magnetRing = this.add.ellipse(0, 0, 82, 38, 0x61e1c1, 0.03)
      .setStrokeStyle(2, 0x61e1c1, 0.22)
      .setDepth(20);

    this.updateHud();
  }

  private createJoystick(): void {
    this.joystickBase = this.add.circle(112, 596, 57, 0x18334f, 0.58)
      .setStrokeStyle(2, 0x7ee7ff, 0.48)
      .setDepth(5000);
    this.joystickKnob = this.add.circle(112, 596, 24, 0x7ee7ff, 0.76)
      .setStrokeStyle(2, 0xffffff, 0.35)
      .setDepth(5001);
  }

  private bindTouchControls(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < this.scale.height * 0.43 || pointer.x > this.scale.width * 0.58) return;
      this.joystickPointerId = pointer.id;
      this.joystickStart.set(pointer.x, pointer.y);
      this.joystickBase.setPosition(pointer.x, pointer.y).setVisible(true);
      this.joystickKnob.setPosition(pointer.x, pointer.y).setVisible(true);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown || pointer.id !== this.joystickPointerId) return;

      const movement = new Phaser.Math.Vector2(
        pointer.x - this.joystickStart.x,
        pointer.y - this.joystickStart.y,
      );
      const maxDistance = 57;
      if (movement.length() > maxDistance) movement.setLength(maxDistance);

      this.joystickKnob.setPosition(
        this.joystickStart.x + movement.x,
        this.joystickStart.y + movement.y,
      );
      this.joystickVector.copy(movement).scale(1 / maxDistance);
    });

    const release = (pointer: Phaser.Input.Pointer) => {
      if (pointer.id !== this.joystickPointerId) return;
      this.joystickPointerId = null;
      this.joystickVector.set(0, 0);
      this.layoutHud();
    };

    this.input.on('pointerup', release);
    this.input.on('pointerupoutside', release);
  }

  private collectNearbyDebris(): void {
    if (this.state.cargo.length >= this.state.capacity) return;

    for (let i = this.debris.length - 1; i >= 0; i -= 1) {
      const scrap = this.debris[i];
      if (!scrap.active || scrap.reserved) continue;
      if (distance(this.player.worldX, this.player.worldY, scrap.worldX, scrap.worldY) > this.state.collectionRange) continue;
      if (!this.state.tryAddCargo(scrap.value)) return;

      this.animatePickup(scrap);
      scrap.destroy();
      this.debris.splice(i, 1);
      this.player.syncCargo(this.state.cargo, this.state.capacity);
      this.spawnDebris();
      break;
    }
  }

  private processCargoAtStation(time: number): void {
    const atStation = distance(this.player.worldX, this.player.worldY, 0, 0) <= 1.42;
    if (!atStation || this.state.cargo.length === 0) {
      this.processorText.setText(this.state.cargo.length > 0 ? 'PROCESSOR · RETURN TO BASE' : 'PROCESSOR · READY');
      return;
    }

    this.processorText.setText('PROCESSOR · RUNNING');
    if (time - this.lastProcessAt < this.state.recycleInterval) return;

    const value = this.state.takeCargo();
    if (value <= 0) return;

    this.lastProcessAt = time;
    this.player.syncCargo(this.state.cargo, this.state.capacity);
    this.animateProcessing(value);
  }

  private updateUpgradePads(delta: number): void {
    let purchased = false;

    for (const pad of this.pads) {
      if (pad.update(delta, this.player.worldX, this.player.worldY, this.state)) {
        purchased = true;
        this.showToast(`${pad.id.toUpperCase()} UPGRADED`);
      }
    }

    if (purchased) {
      this.player.syncCargo(this.state.cargo, this.state.capacity);
      this.refreshPads();
    }
  }

  private updateDrone(delta: number): void {
    const result = this.drone.update(
      delta / 1000,
      this.state.droneSpeed,
      this.debris,
      this.origin.x,
      this.origin.y,
      this.state.droneUnlocked,
    );

    if (result.picked) {
      const picked = result.picked;
      picked.destroy();
      const index = this.debris.indexOf(picked);
      if (index >= 0) this.debris.splice(index, 1);
      this.spawnDebris();
    }

    if (result.deliveredValue) {
      const payout = Math.max(1, Math.round(result.deliveredValue * 0.85));
      this.state.credit(payout);
      const station = worldToIso(0.4, 0.4, this.origin.x, this.origin.y);
      this.showFloatingText(`BOT +${payout}`, station.x, station.y - 35, '#d8c5ff');
      this.refreshPads();
    }
  }

  private updateMagnetRing(): void {
    const p = worldToIso(this.player.worldX, this.player.worldY, this.origin.x, this.origin.y);
    const rangeScale = this.state.collectionRange / 0.72;
    this.magnetRing
      .setPosition(p.x, p.y + 1)
      .setScale(rangeScale)
      .setDepth(p.y + 40);
  }

  private spawnDebris(): void {
    let x = 0;
    let y = 0;

    do {
      x = Phaser.Math.FloatBetween(-8.7, 8.7);
      y = Phaser.Math.FloatBetween(-8.7, 8.7);
    } while (distance(x, y, 0, 0) < 2.65);

    const roll = Math.random();
    const tier = roll > 0.965 ? 3 : roll > 0.82 ? 2 : roll > 0.47 ? 1 : 0;
    const scrap = new Debris(this, x, y, tier);
    scrap.render(this.origin.x, this.origin.y);
    this.debris.push(scrap);
  }

  private animatePickup(scrap: Debris): void {
    const start = worldToIso(scrap.worldX, scrap.worldY, this.origin.x, this.origin.y);
    const target = worldToIso(this.player.worldX, this.player.worldY, this.origin.x, this.origin.y);
    const token = this.add.circle(start.x, start.y - 8, 7, scrap.tier >= 2 ? 0x7de6c4 : 0xffc857, 0.95)
      .setDepth(4000);

    this.tweens.add({
      targets: token,
      x: target.x - 20,
      y: target.y - 28,
      scale: 0.55,
      alpha: 0.35,
      duration: 180,
      onComplete: () => token.destroy(),
    });

    this.showFloatingText(`+${scrap.value}`, start.x, start.y - 20, '#d8f6ff');
  }

  private animateProcessing(value: number): void {
    const p = worldToIso(0, 0, this.origin.x, this.origin.y);
    const token = this.add.rectangle(p.x - 47, p.y, 16, 11, value >= 14 ? 0x7de6c4 : 0xffc857, 1)
      .setStrokeStyle(2, 0xffffff, 0.55)
      .setDepth(p.y + 50);

    this.tweens.add({
      targets: token,
      x: p.x + 146,
      y: p.y - 2,
      angle: 45,
      duration: 410,
      onComplete: () => {
        token.destroy();
        this.state.credit(value);
        this.showFloatingText(`+${value} CR`, p.x + 145, p.y - 22, '#ffe4a3');
        this.refreshPads();
      },
    });
  }

  private showFloatingText(message: string, x: number, y: number, color: string): void {
    const text = this.add.text(x, y, message, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color,
      backgroundColor: '#07111fbb',
      padding: { x: 5, y: 3 },
    }).setOrigin(0.5).setDepth(6000);

    this.tweens.add({
      targets: text,
      y: y - 38,
      alpha: 0,
      duration: 720,
      onComplete: () => text.destroy(),
    });
  }

  private showToast(message: string): void {
    const toast = this.add.text(640, 147, message, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#07111f',
      backgroundColor: '#9ff4df',
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setDepth(6500);

    this.tweens.add({
      targets: toast,
      y: 130,
      alpha: 0,
      duration: 900,
      delay: 350,
      onComplete: () => toast.destroy(),
    });
  }

  private refreshPads(): void {
    for (const pad of this.pads) pad.refresh(this.state);
  }

  private updateHud(): void {
    this.creditsText.setText(`CR ${this.state.credits}`);
    this.cargoText.setText(
      `CARGO  ${this.state.cargo.length}/${this.state.capacity}   ·   MAGNET  ${this.state.collectionRange.toFixed(2)}`,
    );

    if (!this.state.droneUnlocked) {
      const droneCost = this.state.getUpgradeCost('drone');
      this.objectiveText.setText(`NEXT GOAL  ·  UNLOCK DRONE  CR ${droneCost}`);
    } else if (this.state.droneLevel < 2) {
      this.objectiveText.setText('AUTOMATION ONLINE  ·  UPGRADE THE STATION');
    } else {
      this.objectiveText.setText('CLEANUP NETWORK ONLINE  ·  EXPAND EFFICIENCY');
    }
  }

  private layoutHud(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const joyX = Math.min(112, width * 0.18);
    const joyY = height - 104;

    this.joystickBase?.setPosition(joyX, joyY);
    this.joystickKnob?.setPosition(joyX, joyY);
    this.tipText?.setPosition(width - 20, height - 18);
    this.objectiveText?.setPosition(width / 2, 88);
  }
}

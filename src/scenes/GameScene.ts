import Phaser from 'phaser';
import { Debris } from '../entities/Debris';
import { Player } from '../entities/Player';
import { GameState } from '../game/GameState';
import { distance, TILE_HEIGHT, TILE_WIDTH, worldToIso } from '../game/iso';

export class GameScene extends Phaser.Scene {
  private state = new GameState();
  private player!: Player;
  private debris: Debris[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private hud!: Phaser.GameObjects.Text;
  private speedButton!: Phaser.GameObjects.Text;
  private capacityButton!: Phaser.GameObjects.Text;
  private joystickPointerId: number | null = null;
  private joystickStart = new Phaser.Math.Vector2();
  private joystickVector = new Phaser.Math.Vector2();
  private joystickBase!: Phaser.GameObjects.Arc;
  private joystickKnob!: Phaser.GameObjects.Arc;
  private lastSellAt = 0;
  private readonly origin = { x: 640, y: 230 };

  constructor() {
    super('game');
  }

  create(): void {
    this.drawBackdrop();
    this.drawIsoGrid();
    this.drawBase();

    this.player = new Player(this);
    this.player.render(this.origin.x, this.origin.y);

    for (let i = 0; i < 24; i += 1) this.spawnDebris();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

    this.createHud();
    this.createJoystick();
    this.bindTouchControls();
    this.scale.on('resize', this.layoutHud, this);
    this.layoutHud();
  }

  update(time: number, delta: number): void {
    const keyboardX = Number(this.cursors.right.isDown || this.wasd.D.isDown) - Number(this.cursors.left.isDown || this.wasd.A.isDown);
    const keyboardY = Number(this.cursors.down.isDown || this.wasd.S.isDown) - Number(this.cursors.up.isDown || this.wasd.W.isDown);
    const moveX = keyboardX || this.joystickVector.x;
    const moveY = keyboardY || this.joystickVector.y;

    this.player.move(moveX, moveY, this.state.speed, delta / 1000);
    this.player.render(this.origin.x, this.origin.y);
    this.collectNearbyDebris();
    this.sellAtBase(time);
    this.updateHud();
  }

  private drawBackdrop(): void {
    const graphics = this.add.graphics().setDepth(-1000);
    graphics.fillStyle(0x07111f, 1);
    graphics.fillRect(0, 0, 1280, 720);
    for (let i = 0; i < 90; i += 1) {
      const alpha = Phaser.Math.FloatBetween(0.2, 0.85);
      graphics.fillStyle(0xd7eaff, alpha);
      graphics.fillCircle(Phaser.Math.Between(0, 1280), Phaser.Math.Between(0, 720), Phaser.Math.FloatBetween(0.5, 1.6));
    }
  }

  private drawIsoGrid(): void {
    const graphics = this.add.graphics().setDepth(-100);
    graphics.lineStyle(1, 0x5e86ad, 0.16);
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
  }

  private drawBase(): void {
    const p = worldToIso(0, 0, this.origin.x, this.origin.y);
    const points = [
      new Phaser.Math.Vector2(p.x, p.y - 52),
      new Phaser.Math.Vector2(p.x + 98, p.y),
      new Phaser.Math.Vector2(p.x, p.y + 52),
      new Phaser.Math.Vector2(p.x - 98, p.y),
    ];
    const base = this.add.graphics().setDepth(p.y + 10);
    base.fillStyle(0x173b68, 0.95);
    base.fillPoints(points, true);
    base.lineStyle(4, 0x63e6be, 0.9);
    base.strokePoints(points, true);
    this.add.text(p.x, p.y - 8, 'RECYCLE', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#b9ffe9',
    }).setOrigin(0.5).setDepth(p.y + 11);
  }

  private createHud(): void {
    this.hud = this.add.text(24, 24, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#f4f8ff',
      backgroundColor: '#07111fcc',
      padding: { x: 14, y: 10 },
    }).setScrollFactor(0).setDepth(5000);

    this.add.text(24, 104, 'Collect debris · return to RECYCLE · upgrade · repeat', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      color: '#9fc3e8',
    }).setScrollFactor(0).setDepth(5000);

    this.speedButton = this.makeUpgradeButton('SPEED', () => this.state.buySpeed());
    this.capacityButton = this.makeUpgradeButton('CARGO', () => this.state.buyCapacity());
    this.updateHud();
  }

  private makeUpgradeButton(label: string, action: () => boolean): Phaser.GameObjects.Text {
    const button = this.add.text(0, 0, label, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#07111f',
      backgroundColor: '#7ee7ff',
      padding: { x: 16, y: 11 },
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(5000);

    button.on('pointerdown', () => {
      const ok = action();
      button.setAlpha(ok ? 0.55 : 0.3);
      this.time.delayedCall(120, () => button.setAlpha(1));
      this.updateHud();
    });
    return button;
  }

  private createJoystick(): void {
    this.joystickBase = this.add.circle(112, 596, 54, 0x18334f, 0.55).setStrokeStyle(2, 0x7ee7ff, 0.5).setDepth(5000);
    this.joystickKnob = this.add.circle(112, 596, 24, 0x7ee7ff, 0.72).setDepth(5001);
  }

  private bindTouchControls(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < this.scale.height * 0.45 || pointer.x > this.scale.width * 0.58) return;
      this.joystickPointerId = pointer.id;
      this.joystickStart.set(pointer.x, pointer.y);
      this.joystickBase.setPosition(pointer.x, pointer.y).setVisible(true);
      this.joystickKnob.setPosition(pointer.x, pointer.y).setVisible(true);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown || pointer.id !== this.joystickPointerId) return;
      const delta = new Phaser.Math.Vector2(pointer.x - this.joystickStart.x, pointer.y - this.joystickStart.y);
      const maxDistance = 54;
      if (delta.length() > maxDistance) delta.setLength(maxDistance);
      this.joystickKnob.setPosition(this.joystickStart.x + delta.x, this.joystickStart.y + delta.y);
      this.joystickVector.copy(delta).scale(1 / maxDistance);
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
      if (distance(this.player.worldX, this.player.worldY, scrap.worldX, scrap.worldY) > 0.72) continue;
      if (!this.state.tryAddCargo(scrap.value)) return;
      scrap.destroy();
      this.debris.splice(i, 1);
      this.spawnDebris();
      break;
    }
  }

  private sellAtBase(time: number): void {
    if (this.state.cargo.length === 0 || time - this.lastSellAt < 190) return;
    if (distance(this.player.worldX, this.player.worldY, 0, 0) > 1.55) return;
    this.lastSellAt = time;
    this.state.sellOne();
  }

  private spawnDebris(): void {
    let x = 0;
    let y = 0;

    do {
      x = Phaser.Math.FloatBetween(-8.6, 8.6);
      y = Phaser.Math.FloatBetween(-8.6, 8.6);
    } while (distance(x, y, 0, 0) < 2.4);

    const roll = Math.random();
    const tier = roll > 0.94 ? 3 : roll > 0.78 ? 2 : roll > 0.48 ? 1 : 0;
    const scrap = new Debris(this, x, y, tier);
    scrap.render(this.origin.x, this.origin.y);
    this.debris.push(scrap);
  }

  private updateHud(): void {
    this.hud.setText(`CR ${this.state.credits}   CARGO ${this.state.cargo.length}/${this.state.capacity}`);
    this.speedButton.setText(`SPEED  CR ${this.state.speedUpgradeCost}`);
    this.capacityButton.setText(`CARGO  CR ${this.state.capacityUpgradeCost}`);
  }

  private layoutHud(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    this.speedButton?.setPosition(width - 22, 22);
    this.capacityButton?.setPosition(width - 22, 74);
    const joyX = Math.min(112, width * 0.18);
    const joyY = height - 104;
    this.joystickBase?.setPosition(joyX, joyY);
    this.joystickKnob?.setPosition(joyX, joyY);
  }
}

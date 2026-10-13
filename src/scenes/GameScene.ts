import Phaser from 'phaser';

/** Minimal reboot. Only player movement and a station marker are implemented. */
export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Arc;
  private arrows!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private pointerTarget: Phaser.Math.Vector2 | null = null;

  constructor() { super('GameScene'); }

  create(): void {
    this.cameras.main.setBackgroundColor('#061326');
    this.add.text(640, 90, 'SPACE CLEANUP STATION', {
      color: '#e7f5ff', fontSize: '34px', fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    this.add.text(640, 135, 'Clean rebuild • Phase 0', {
      color: '#8eabbf', fontSize: '18px', fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    this.add.text(640, 670, 'WASD / Arrows or touch to move', {
      color: '#8eabbf', fontSize: '18px', fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    const grid = this.add.graphics();
    grid.lineStyle(1, 0x345875, 0.55);
    for (let x = 120; x <= 1160; x += 80) grid.lineBetween(x, 190, x, 600);
    for (let y = 190; y <= 600; y += 80) grid.lineBetween(120, y, 1160, y);

    this.add.circle(640, 390, 85, 0x15364e).setStrokeStyle(3, 0x4aa3ad);
    this.add.text(640, 390, 'STATION', {
      color: '#b3ddde', fontSize: '16px', fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    this.player = this.add.circle(640, 490, 18, 0xe5eff6)
      .setStrokeStyle(4, 0xffbd67);
    this.arrows = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.pointerTarget = new Phaser.Math.Vector2(p.x, p.y);
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.isDown) this.pointerTarget?.set(p.x, p.y);
    });
    this.input.on('pointerup', () => { this.pointerTarget = null; });
    this.input.on('pointerupoutside', () => { this.pointerTarget = null; });
  }

  update(_time: number, delta: number): void {
    const x = Number(this.arrows.right.isDown || this.wasd.D.isDown)
      - Number(this.arrows.left.isDown || this.wasd.A.isDown);
    const y = Number(this.arrows.down.isDown || this.wasd.S.isDown)
      - Number(this.arrows.up.isDown || this.wasd.W.isDown);
    const movement = new Phaser.Math.Vector2(x, y);
    if (movement.lengthSq() > 0) {
      movement.normalize();
      this.pointerTarget = null;
    } else if (this.pointerTarget) {
      movement.copy(this.pointerTarget).subtract(new Phaser.Math.Vector2(this.player.x, this.player.y));
      if (movement.length() > 10) movement.normalize();
      else movement.set(0, 0);
    }
    const seconds = Math.min(delta / 1000, 0.05);
    this.player.x = Phaser.Math.Clamp(this.player.x + movement.x * 250 * seconds, 140, 1140);
    this.player.y = Phaser.Math.Clamp(this.player.y + movement.y * 250 * seconds, 210, 580);
  }
}
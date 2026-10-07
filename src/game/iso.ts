export const TILE_WIDTH = 74;
export const TILE_HEIGHT = 38;

export interface Point2 {
  x: number;
  y: number;
}

export function worldToIso(worldX: number, worldY: number, originX: number, originY: number): Point2 {
  return {
    x: originX + (worldX - worldY) * (TILE_WIDTH / 2),
    y: originY + (worldX + worldY) * (TILE_HEIGHT / 2),
  };
}

export function distance(aX: number, aY: number, bX: number, bY: number): number {
  return Math.hypot(aX - bX, aY - bY);
}

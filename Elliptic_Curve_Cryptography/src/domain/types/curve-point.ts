// Điểm affine (x, y) trên đường cong elliptic, hoặc điểm vô cực O.
export interface AffinePoint {
  readonly x: bigint;
  readonly y: bigint;
  readonly infinity: false;
}

export interface InfinityPoint {
  readonly infinity: true;
}

export type CurvePoint = AffinePoint | InfinityPoint;

export const POINT_AT_INFINITY: InfinityPoint = { infinity: true };

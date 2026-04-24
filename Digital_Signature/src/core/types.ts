import { CurvePoint } from '../ecc-proxy';

// ─── Biểu diễn Khóa ──────────────────────────────────────────────────────────

/**
 * Cặp khóa Schnorr dựa trên Elliptic Curve
 */
export interface SchnorrKeyPair {
  /** Khóa riêng (Private Key): d (1 <= d < n) */
  privateKey: bigint;
  /** Khóa công khai (Public Key): P = d * G */
  publicKey: CurvePoint;
}

// ─── Biểu diễn Chữ.ký ────────────────────────────────────────────────────────

/**
 * Chữ ký Schnorr tiêu chuẩn
 * Sig = (R, s) trong đó:
 * - R là điểm sinh tạm thời (R = k * G)
 * - s là giá trị chữ ký (s = k + e * d mod n)
 */
export interface SchnorrSignature {
  /** Điểm sinh tạm thời */
  R: CurvePoint;
  /** Đại lượng s của chữ ký */
  s: bigint;
}

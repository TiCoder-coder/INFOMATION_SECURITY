import { SECP256K1 } from '../src/domain/curves/secp256k1';
import { isPointOnCurve } from '../src/curve/is-point-on-curve';
import { isCurveNonSingular } from '../src/domain/validation/check-non-singular';
import { scalarMultiply } from '../src/curve/scalar-multiply';

describe('secp256k1 — kiểm tra tham số chuẩn Bitcoin', () => {
  it('a=0, b=7 → phương trình y² = x³ + 7', () => {
    expect(SECP256K1.a).toBe(0n);
    expect(SECP256K1.b).toBe(7n);
  });

  it('đường cong không suy biến (4a³+27b² ≢ 0 mod p)', () => {
    expect(isCurveNonSingular(SECP256K1.a, SECP256K1.b, SECP256K1.p)).toBe(true);
  });

  it('điểm sinh G nằm trên đường cong', () => {
    expect(isPointOnCurve(SECP256K1.G, SECP256K1)).toBe(true);
  });

  it('n · G = O (điểm vô cực) — xác nhận n là order của G', () => {
    const nG = scalarMultiply(SECP256K1.n, SECP256K1.G, SECP256K1);
    expect(nG.infinity).toBe(true);
  });

  it('p khớp công thức Bitcoin: p = 2^256 − 2^32 − 977', () => {
    expect(SECP256K1.p).toBe(2n ** 256n - 2n ** 32n - 977n);
  });
});

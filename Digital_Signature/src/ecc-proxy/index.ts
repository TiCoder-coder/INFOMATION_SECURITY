// index.ts
// ─────────────────────────────────────────────────────────────────────────────
// ECC Proxy Module
// Module này gom các thành phần toán học, đường cong và sinh số ngẫu nhiên
// từ dự án Elliptic_Curve_Cryptography để tận dụng cấu trúc Micro-architecture.
// ─────────────────────────────────────────────────────────────────────────────

// Lấy tham số của đường cong
export { SECP256K1 as secp256k1 } from '../../../Elliptic_Curve_Cryptography/src/domain/curves/secp256k1';
export type { DomainParameters } from '../../../Elliptic_Curve_Cryptography/src/domain/types/domain-parameters';
export type { CurvePoint } from '../../../Elliptic_Curve_Cryptography/src/domain/types/curve-point';

// Phép toán trên đường cong (ECC)
export { pointAdd } from '../../../Elliptic_Curve_Cryptography/src/curve/point-add';
export { scalarMultiply } from '../../../Elliptic_Curve_Cryptography/src/curve/scalar-multiply';
export { isPointOnCurve } from '../../../Elliptic_Curve_Cryptography/src/curve/is-point-on-curve';

// Phép toán trường (Field)
export { modInverse } from '../../../Elliptic_Curve_Cryptography/src/field/mod-inverse';

// Utilities
export { generateRandomScalar } from '../../../Elliptic_Curve_Cryptography/src/keys/generate-random-scalar';

// Chuyển đổi (Encoding)
export { pointToOctets } from '../../../Elliptic_Curve_Cryptography/src/encoding/point-to-octets';

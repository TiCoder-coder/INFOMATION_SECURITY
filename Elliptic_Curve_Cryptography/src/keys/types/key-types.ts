// Kiểu khóa riêng / khóa công khai / cặp khóa.
import type { CurvePoint } from '../../domain/types/curve-point';
import type { DomainParameters } from '../../domain/types/domain-parameters';

export type PrivateKey = bigint;

export interface PublicKey {
  readonly Q: CurvePoint;
  readonly params: DomainParameters;
}

export interface KeyPair {
  readonly privateKey: PrivateKey;
  readonly publicKey: PublicKey;
}

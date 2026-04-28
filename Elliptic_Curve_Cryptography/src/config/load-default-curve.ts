import type { DomainParameters } from '../domain/types/domain-parameters';
import { getEnv } from './get-env';
import { loadCurveFromEnv } from './load-curve-from-env';

export function loadDefaultCurve(): DomainParameters {
  const name = getEnv('ECC_CURVE').toLowerCase();
  if (name === 'secp256k1') return loadCurveFromEnv('SECP256K1');
  if (name === 'secp256r1') return loadCurveFromEnv('SECP256R1');
  throw new Error(`Unsupported ECC_CURVE: ${name}`);
}

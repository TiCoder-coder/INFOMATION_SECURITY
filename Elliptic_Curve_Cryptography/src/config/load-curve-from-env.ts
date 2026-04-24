// Load tham số miền của một curve từ .env.
import type { DomainParameters } from '../domain/types/domain-parameters';
import { getEnvHex, getEnvInt } from './get-env';

export function loadCurveFromEnv(prefix: 'SECP256K1' | 'SECP256R1'): DomainParameters {
  return {
    name: prefix.toLowerCase(),
    p: getEnvHex(`${prefix}_P`),
    a: getEnvHex(`${prefix}_A`),
    b: getEnvHex(`${prefix}_B`),
    G: {
      infinity: false,
      x: getEnvHex(`${prefix}_GX`),
      y: getEnvHex(`${prefix}_GY`),
    },
    n: getEnvHex(`${prefix}_N`),
    h: getEnvInt(`${prefix}_H`),
  };
}

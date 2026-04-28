import type { DomainParameters } from '../types/domain-parameters';

export const SECP256K1: DomainParameters = {
  name: 'secp256k1',
  p: 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn,
  a: 0n,
  b: 7n,
  G: {
    infinity: false,
    x: 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n,
    y: 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n,
  },
  n: 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n,
  h: 1n,
};

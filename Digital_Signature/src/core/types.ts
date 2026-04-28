import { CurvePoint } from '../ecc-proxy';

export interface SchnorrKeyPair {
  
  privateKey: bigint;
  
  publicKey: CurvePoint;
}

export interface SchnorrSignature {
  
  R: CurvePoint;
  
  s: bigint;
}

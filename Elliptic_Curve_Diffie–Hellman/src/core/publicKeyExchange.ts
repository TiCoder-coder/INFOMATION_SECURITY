import type { CurveParams, ECPoint } from "../math/index.ts";
import {
  decodePointUncompressed,
  scalarMultiply,
} from "../math/index.ts";

export interface PublicKeyEnvelope {
  owner: string;
  curveName: string;
  publicKey: Buffer; 
}

export function packPublicKey(
  owner: string,
  curveName: string,
  publicKey: Buffer,
): PublicKeyEnvelope {
  return { owner, curveName, publicKey };
}

export function unpackAndValidate(
  env: PublicKeyEnvelope,
  expectedCurveName: string,
  c: CurveParams,
): ECPoint {
  if (env.curveName !== expectedCurveName && env.curveName !== c.name) {
    throw new Error(
      `[publicKeyExchange] Curve không khớp: nhận "${env.curveName}", kỳ vọng "${expectedCurveName}"`,
    );
  }
  
  const Q: ECPoint = decodePointUncompressed(env.publicKey, c);

  if (Q.infinity) {
    throw new Error("[publicKeyExchange] Khoá công khai là điểm vô cực");
  }

  
  const nQ = scalarMultiply(c.n, Q, c);
  if (!nQ.infinity) {
    throw new Error(
      "[publicKeyExchange] n·Q ≠ O — khoá công khai không nằm trong nhóm bậc n",
    );
  }

  return Q;
}

export function exchangePublicKeys(
  envA: PublicKeyEnvelope,
  envB: PublicKeyEnvelope,
  curveName: string,
  c: CurveParams,
): { QA_receivedByB: ECPoint; QB_receivedByA: ECPoint } {
  return {
    QA_receivedByB: unpackAndValidate(envA, curveName, c),
    QB_receivedByA: unpackAndValidate(envB, curveName, c),
  };
}

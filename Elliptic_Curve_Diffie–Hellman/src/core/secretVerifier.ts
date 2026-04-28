export interface VerifyResult {
  equal: boolean;
  lengthA: number;
  lengthB: number;
}

export function constantTimeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    
    let diff = 1;
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) {
      const av = i < a.length ? a[i] : 0;
      const bv = i < b.length ? b[i] : 0;
      diff |= av ^ bv;
    }
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export function verifySharedSecrets(SA: Buffer, SB: Buffer): VerifyResult {
  return {
    equal: constantTimeEqual(SA, SB),
    lengthA: SA.length,
    lengthB: SB.length,
  };
}

export function assertSharedSecretsEqual(SA: Buffer, SB: Buffer): Buffer {
  const r = verifySharedSecrets(SA, SB);
  if (!r.equal) {
    throw new Error(
      `[secretVerifier] SA ≠ SB — ECDH thất bại. ` +
        `lengthA=${r.lengthA}, lengthB=${r.lengthB}. Dừng pipeline.`,
    );
  }
  return SA;
}

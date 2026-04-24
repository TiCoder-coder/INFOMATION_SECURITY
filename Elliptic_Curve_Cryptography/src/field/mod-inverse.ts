// Nghịch đảo modular bằng thuật toán Extended Euclidean.
export function modInverse(a: bigint, p: bigint): bigint {
  if (a === 0n) throw new Error('Zero has no modular inverse');
  let [oldR, r] = [((a % p) + p) % p, p];
  let [oldS, s] = [1n, 0n];
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  if (oldR !== 1n) throw new Error('Inverse does not exist');
  return ((oldS % p) + p) % p;
}

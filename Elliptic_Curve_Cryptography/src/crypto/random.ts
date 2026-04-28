export function randomBytes(n: number): Uint8Array {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('randomBytes: n phải là số nguyên không âm');
  }
  const buf = new Uint8Array(n);
  
  const chunkSize = 65536;
  for (let off = 0; off < n; off += chunkSize) {
    const chunk = buf.subarray(off, Math.min(off + chunkSize, n));
    globalThis.crypto.getRandomValues(chunk);
  }
  return buf;
}

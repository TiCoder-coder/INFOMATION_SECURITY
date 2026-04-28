export function fieldSizeBytes(p: bigint): number {
  return Math.ceil(p.toString(2).length / 8);
}

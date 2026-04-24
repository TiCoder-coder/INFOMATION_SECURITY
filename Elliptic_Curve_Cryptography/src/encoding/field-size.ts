// Tính kích thước một field element theo byte, dựa vào p.
export function fieldSizeBytes(p: bigint): number {
  return Math.ceil(p.toString(2).length / 8);
}

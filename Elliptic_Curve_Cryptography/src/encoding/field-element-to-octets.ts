export function fieldElementToOctets(z: bigint, fieldSizeBytes: number): Buffer {
  const hex = z.toString(16).padStart(fieldSizeBytes * 2, '0');
  return Buffer.from(hex, 'hex');
}

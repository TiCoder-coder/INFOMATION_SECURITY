// Chuyển số nguyên (tọa độ x của shared secret) thành chuỗi byte có độ dài cố định.
// SEC 1 §2.3.7: Field-Element-to-Octet-String.
export function fieldElementToOctets(z: bigint, fieldSizeBytes: number): Buffer {
  const hex = z.toString(16).padStart(fieldSizeBytes * 2, '0');
  return Buffer.from(hex, 'hex');
}

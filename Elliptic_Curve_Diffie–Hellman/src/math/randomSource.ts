/**
 * randomSource.ts
 * -----------------------------------------------------------
 * NGUỒN ENTROPY duy nhất dùng trong toàn bộ project.
 *
 * Đọc trực tiếp từ `/dev/urandom` (Unix/macOS) — đây là một
 * file đặc biệt do kernel cung cấp, KHÔNG phải thư viện. Việc
 * cần một nguồn ngẫu nhiên do OS cung cấp là bất khả kháng vì
 * JavaScript/V8 không thể tự sinh ngẫu nhiên mật mã-an toàn.
 * -----------------------------------------------------------
 */

import fs from "node:fs";

/** Sinh `n` byte ngẫu nhiên mạnh từ /dev/urandom. */
export function randomBytes(n: number): Buffer {
  if (n <= 0) throw new Error("[randomSource] n phải > 0");
  const fd = fs.openSync("/dev/urandom", "r");
  try {
    const buf = Buffer.alloc(n);
    let offset = 0;
    while (offset < n) {
      const read = fs.readSync(fd, buf, offset, n - offset, null);
      if (read <= 0) throw new Error("[randomSource] Đọc /dev/urandom thất bại");
      offset += read;
    }
    return buf;
  } finally {
    fs.closeSync(fd);
  }
}

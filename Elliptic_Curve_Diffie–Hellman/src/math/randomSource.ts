import fs from "node:fs";

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

import fs from "node:fs";
import path from "node:path";
import type { KeyPair } from "../core/index.ts";
import { packKeyPair } from "../core/index.ts";
import type { CurveParams, ECPoint } from "../math/index.ts";
import {
  decodePointUncompressed,
  bufferToBigInt,
  bigIntToBuffer,
} from "../math/index.ts";

interface StoredKey {
  owner: string;
  curveName: string;
  kind: "private" | "public";
  keyHex: string;
  createdAt: string;
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath: string, data: StoredKey): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), {
    encoding: "utf8",
    mode: 0o600,
  });
}

function readJson(filePath: string): StoredKey {
  if (!fs.existsSync(filePath)) {
    throw new Error(`[keyStore] Không tìm thấy file: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as StoredKey;
}

export function saveKeyPair(
  kp: KeyPair,
  privPath: string,
  pubPath: string,
): void {
  const now = new Date().toISOString();
  writeJson(privPath, {
    owner: kp.owner,
    curveName: kp.curveName,
    kind: "private",
    keyHex: kp.privateKey.toString("hex"),
    createdAt: now,
  });
  writeJson(pubPath, {
    owner: kp.owner,
    curveName: kp.curveName,
    kind: "public",
    keyHex: kp.publicKey.toString("hex"),
    createdAt: now,
  });
}

export function loadKeyPair(
  privPath: string,
  pubPath: string,
  c: CurveParams,
): KeyPair {
  const priv = readJson(privPath);
  const pub = readJson(pubPath);
  if (priv.owner !== pub.owner) {
    throw new Error(`[keyStore] Owner không khớp`);
  }
  if (priv.kind !== "private" || pub.kind !== "public") {
    throw new Error(`[keyStore] File sai "kind"`);
  }

  const dBuf = Buffer.from(priv.keyHex, "hex");
  const d = bufferToBigInt(dBuf);
  const Q: ECPoint = decodePointUncompressed(Buffer.from(pub.keyHex, "hex"), c);

  return packKeyPair(priv.owner, priv.curveName, d, Q, c);
}

export function keyPairExists(privPath: string, pubPath: string): boolean {
  return fs.existsSync(privPath) && fs.existsSync(pubPath);
}

export { bigIntToBuffer };

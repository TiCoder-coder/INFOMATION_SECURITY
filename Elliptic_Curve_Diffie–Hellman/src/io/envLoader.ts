import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

dotenv.config({ path: path.join(PROJECT_ROOT, ".env") });

export interface AppConfig {
  
  curveName: string;
  
  kdfHash: string;
  kdfSalt: Buffer;
  kdfInfo: Buffer;
  kdfKeyLength: number;

  symmetricAlgorithm: string;

  keyDir: string;
  partyA: {
    privateKeyPath: string;
    publicKeyPath: string;
  };
  partyB: {
    privateKeyPath: string;
    publicKeyPath: string;
  };
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`[envLoader] Thiếu biến môi trường bắt buộc: ${name}`);
  }
  return v.trim();
}

export function loadConfig(): AppConfig {
  const keyDirRaw = requireEnv("KEY_DIR");
  const keyDir = path.isAbsolute(keyDirRaw)
    ? keyDirRaw
    : path.resolve(PROJECT_ROOT, keyDirRaw);

  return {
    curveName: requireEnv("ECDH_CURVE"),

    kdfHash: requireEnv("KDF_HASH"),
    kdfSalt: Buffer.from(requireEnv("KDF_SALT_HEX"), "hex"),
    kdfInfo: Buffer.from(requireEnv("KDF_INFO"), "utf8"),
    kdfKeyLength: parseInt(requireEnv("KDF_KEY_LENGTH"), 10),

    symmetricAlgorithm: requireEnv("SYMMETRIC_ALGORITHM"),

    keyDir,
    partyA: {
      privateKeyPath: path.join(keyDir, requireEnv("PARTY_A_PRIVATE_KEY_FILE")),
      publicKeyPath: path.join(keyDir, requireEnv("PARTY_A_PUBLIC_KEY_FILE")),
    },
    partyB: {
      privateKeyPath: path.join(keyDir, requireEnv("PARTY_B_PRIVATE_KEY_FILE")),
      publicKeyPath: path.join(keyDir, requireEnv("PARTY_B_PUBLIC_KEY_FILE")),
    },
  };
}

export { PROJECT_ROOT };

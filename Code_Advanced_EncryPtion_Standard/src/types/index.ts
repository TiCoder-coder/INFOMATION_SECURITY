export type AESKeySize = 128 | 192 | 256;

export type AESMode = 'encrypt' | 'decrypt';

export type State = number[][];

export type Word = [number, number, number, number];

export interface AESConfig {
  keySize: AESKeySize;
  Nk: number;
  Nb: number;
  Nr: number;
}

export interface MixColumnsColumnLog {
  column: number;
  input: string[];
  row0: string;
  row1: string;
  row2: string;
  row3: string;
  output: string[];
}

export interface SubBytesByteLog {
  position: string;
  inputByte: string;
  sBoxValue: string;
}

export interface SubBytesDetail {
  byteDetails: SubBytesByteLog[];
}

export interface StepLog {
  step: string;
  state: string[][];
  mixColumnsDetails?: MixColumnsColumnLog[];
  subBytesDetails?: SubBytesDetail;
  roundKeyIndex?: number;
  roundKeyHex?: string;
}

export interface RoundLog {
  round: number;
  steps: StepLog[];
}

export interface AESOperationLog {
  mode: AESMode;
  timestamp: string;
  keySize: AESKeySize;
  rounds: number;
  keyHex: string;
  iv: string;
  roundKeys: string[];
  roundDetails: RoundLog[];

  
  plaintext: string;
  plaintextHex: string;

  
  ciphertextHex: string;
  ciphertextBase64: string;
}

export type EncryptionLog = AESOperationLog;
export type DecryptionLog = AESOperationLog;

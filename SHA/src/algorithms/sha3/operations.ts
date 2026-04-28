import { BitUtils } from '../../utils/bit_utils';

export class Keccak256Operations {
  
  static theta(state: bigint[][]): bigint[][] {
    const newState = state.map(row => [...row]);
    const c = Array(5).fill(0n).map((_, x) =>
      state[x][0] ^ state[x][1] ^ state[x][2] ^ state[x][3] ^ state[x][4]
    );

    const d = Array(5).fill(0n).map((_, x) =>
      c[(x - 1 + 5) % 5] ^ BitUtils.rotateLeft64(c[(x + 1) % 5], 1n)
    );

    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        newState[x][y] ^= d[x];
      }
    }

    return newState;
  }

  static rho(state: bigint[][], offsets: number[][]): bigint[][] {
    const newState = state.map(row => [...row]);

    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        const shift = BigInt(offsets[x][y]);
        newState[x][y] = BitUtils.rotateLeft64(state[x][y], shift);
      }
    }

    return newState;
  }

  static pi(state: bigint[][]): bigint[][] {
    const newState: bigint[][] = Array(5).fill(null).map(() => Array(5).fill(0n));

    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        newState[(y) % 5][(2 * x + 3 * y) % 5] = state[x][y];
      }
    }

    return newState;
  }

  static chi(state: bigint[][]): bigint[][] {
    const newState = state.map(row => [...row]);

    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        newState[x][y] ^=
          (~state[(x + 1) % 5][y]) & state[(x + 2) % 5][y];
      }
    }

    return newState;
  }

  static iota(state: bigint[][], roundConstant: bigint): bigint[][] {
    const newState = state.map(row => [...row]);
    newState[0][0] ^= roundConstant;
    return newState;
  }

  static round(
    state: bigint[][],
    roundConstant: bigint,
    offsets: number[][]
  ): bigint[][] {
    let newState = this.theta(state);
    newState = this.rho(newState, offsets);
    newState = this.pi(newState);
    newState = this.chi(newState);
    newState = this.iota(newState, roundConstant);
    return newState;
  }

  static roundVerbose(
    state: bigint[][],
    roundConstant: bigint,
    offsets: number[][],
    logger: import('../../utils/logger').Logger,
    roundNum: number,
    showMatrix: boolean
  ): bigint[][] {
    logger.subStep(
      `Round ${roundNum.toString().padStart(2, '0')}`,
      `RC = 0x${roundConstant.toString(16).padStart(16, '0')}`
    );

    const afterTheta = this.theta(state);
    if (showMatrix) logger.matrix5x5(`  State sau θ (theta)`, afterTheta);

    const afterRho = this.rho(afterTheta, offsets);
    if (showMatrix) logger.matrix5x5(`  State sau ρ (rho)`, afterRho);

    const afterPi = this.pi(afterRho);
    if (showMatrix) logger.matrix5x5(`  State sau π (pi)`, afterPi);

    const afterChi = this.chi(afterPi);
    if (showMatrix) logger.matrix5x5(`  State sau χ (chi)`, afterChi);

    const afterIota = this.iota(afterChi, roundConstant);
    if (showMatrix) logger.matrix5x5(`  State sau ι (iota)`, afterIota);

    return afterIota;
  }

  static pad10_1(message: Uint8Array, blockSize: number): Uint8Array {
    const messageLength = message.length;
    const paddingLength = blockSize - (messageLength % blockSize);

    const paddedMessage = new Uint8Array(messageLength + paddingLength);
    paddedMessage.set(message);
    paddedMessage[messageLength] = 0x06; 
    paddedMessage[paddedMessage.length - 1] |= 0x80;

    return paddedMessage;
  }

  static bytesToState(bytes: Uint8Array, blockSize: number): bigint[][] {
    const state: bigint[][] = Array(5).fill(null).map(() => Array(5).fill(0n));
    let byteIndex = 0;

    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        if (byteIndex < bytes.length) {
          let lane = 0n;
          for (let z = 0; z < 8 && byteIndex < bytes.length; z++) {
            lane |= BigInt(bytes[byteIndex++]) << BigInt(z * 8);
          }
          state[x][y] = lane;
        }
      }
    }

    return state;
  }

  static stateToBytes(state: bigint[][], outputSize: number): Uint8Array {
    const bytes = new Uint8Array(outputSize);
    let byteIndex = 0;

    for (let x = 0; x < 5 && byteIndex < outputSize; x++) {
      for (let y = 0; y < 5 && byteIndex < outputSize; y++) {
        let lane = state[x][y];
        for (let z = 0; z < 8 && byteIndex < outputSize; z++) {
          bytes[byteIndex++] = Number((lane >> BigInt(z * 8)) & 0xFFn);
        }
      }
    }

    return bytes;
  }

  static absorb(
    message: Uint8Array,
    blockSize: number,
    rounds: number,
    roundConstants: bigint[],
    offsets: number[][]
  ): bigint[][] {
    let state: bigint[][] = Array(5).fill(null).map(() => Array(5).fill(0n));
    const paddedMessage = this.pad10_1(message, blockSize);
    const blockSizeBytes = blockSize / 8;

    for (let blockIndex = 0; blockIndex < paddedMessage.length; blockIndex += blockSizeBytes) {
      const block = paddedMessage.slice(blockIndex, blockIndex + blockSizeBytes);
      const blockState = this.bytesToState(block, blockSize);
      
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          state[x][y] ^= blockState[x][y];
        }
      }
      
      for (let round = 0; round < rounds; round++) {
        state = this.round(state, roundConstants[round], offsets);
      }
    }

    return state;
  }

  static squeeze(
    state: bigint[][],
    outputSize: number,
    blockSize: number,
    rounds: number,
    roundConstants: bigint[],
    offsets: number[][]
  ): Uint8Array {
    const output = new Uint8Array(outputSize);
    const blockSizeBytes = blockSize / 8;
    let outputIndex = 0;

    while (outputIndex < outputSize) {
      const stateBytes = this.stateToBytes(state, blockSizeBytes);
      const copySize = Math.min(blockSizeBytes, outputSize - outputIndex);

      output.set(stateBytes.slice(0, copySize), outputIndex);
      outputIndex += copySize;

      if (outputIndex < outputSize) {
        for (let round = 0; round < rounds; round++) {
          state = this.round(state, roundConstants[round], offsets);
        }
      }
    }

    return output;
  }
}

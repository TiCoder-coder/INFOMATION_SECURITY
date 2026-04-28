export const KECCAK_ROUND_CONSTANTS = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an,
  0x8000000080008000n, 0x000000000000808bn, 0x0000000080000001n,
  0x8000000080008081n, 0x8000000000008009n, 0x000000000000008an,
  0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n,
  0x8000000000008003n, 0x8000000000008002n, 0x8000000000000080n,
  0x000000000000800an, 0x800000008000000an, 0x8000000080008081n,
  0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];

export const KECCAK_ROTATION_OFFSETS: number[][] = [
  [0, 36, 3, 41, 18],
  [1, 44, 10, 45, 2],
  [62, 6, 43, 15, 61],
  [28, 55, 25, 21, 56],
  [27, 20, 39, 8, 14],
];

export const SHA3_DOMAIN_SEPARATION = {
  SHA3_256: 0x06,   
  SHA3_384: 0x06,   
  SHA3_512: 0x06,   
  SHAKE128: 0x1f,   
  SHAKE256: 0x1f,   
};

export const SHA3_CONFIG = {
  SHA3_256: {
    blockSize: 1088,    
    capacity: 512,      
    outputSize: 256,    
    rounds: 24,         
    domainSeparation: 0x06,
  },
  SHA3_384: {
    blockSize: 832,     
    capacity: 768,      
    outputSize: 384,    
    rounds: 24,
    domainSeparation: 0x06,
  },
  SHA3_512: {
    blockSize: 576,     
    capacity: 1024,     
    outputSize: 512,    
    rounds: 24,
    domainSeparation: 0x06,
  },
};

export const KECCAK_STATE_SIZE = {
  width: 1600,      
  x: 5,             
  y: 5,             
  z: 64,            
  laneSize: 64,     
};

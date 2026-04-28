import type { CurvePoint } from './curve-point';

export interface DomainParameters {
  
  readonly p: bigint;
  
  readonly a: bigint;
  
  readonly b: bigint;
  
  readonly G: CurvePoint;
  
  readonly n: bigint;
  
  readonly h: bigint;
  
  readonly name: string;
}

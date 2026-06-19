export interface Sequence {
  id: string;
  name: string;
  data: string;  // ACGT nucleotides
  length: number;
}

export interface AlignmentResult {
  seq1: string;
  seq2: string;
  aligned1: string;  // with gaps '-'
  aligned2: string;
  score: number;
  identity: number;  // percentage
  gaps: number;
  algorithm: string;
}

export interface PhyloNode {
  name: string;
  branchLength: number;
  children: PhyloNode[];
  x?: number;
  y?: number;
}

export interface GCContent {
  window: number;
  position: number;
  gc: number;
}

export type TimelineActionType =
  | 'load_mock'
  | 'add_sequence'
  | 'remove_sequence'
  | 'run_alignment'
  | 'analyze_gc'
  | 'build_tree';

export interface TimelineEntry {
  id: string;
  timestamp: number;
  actionType: TimelineActionType;
  title: string;
  description: string;
  details?: Record<string, string | number>;
}

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Sequence, AlignmentResult, GCContent, PhyloNode, TimelineEntry, TimelineActionType } from '../types';
import {
  needlemanWunsch,
  smithWaterman,
  calculateGCContent,
  calculateDistanceMatrix,
  buildNJTree,
  MOCK_SEQUENCES
} from '../utils/alignment';

export const useSequenceStore = defineStore('sequence', () => {
  const sequences = ref<Sequence[]>([]);
  const alignmentResult = ref<AlignmentResult | null>(null);
  const currentAlgorithm = ref<'nw' | 'sw'>('nw');
  const gcData = ref<GCContent[]>([]);
  const phyloTree = ref<PhyloNode | null>(null);
  const selectedSeq1 = ref<string>('');
  const selectedSeq2 = ref<string>('');
  const timeline = ref<TimelineEntry[]>([]);

  const alignmentIdentity = computed(() => {
    return alignmentResult.value ? alignmentResult.value.identity : 0;
  });

  const alignmentScore = computed(() => {
    return alignmentResult.value ? alignmentResult.value.score : 0;
  });

  function addTimelineEntry(
    actionType: TimelineActionType,
    title: string,
    description: string,
    details?: Record<string, string | number>
  ) {
    const entry: TimelineEntry = {
      id: 'tl-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      timestamp: Date.now(),
      actionType,
      title,
      description,
      details
    };
    timeline.value.unshift(entry);
  }

  function clearTimeline() {
    timeline.value = [];
  }

  function addSequence(id: string, name: string, data: string) {
    const cleanData = data.toUpperCase().replace(/[^ACGT]/g, '');
    sequences.value.push({
      id,
      name,
      data: cleanData,
      length: cleanData.length
    });
    addTimelineEntry(
      'add_sequence',
      '添加序列',
      `新增序列「${name}」，长度 ${cleanData.length} bp`,
      { id, name, length: cleanData.length }
    );
  }

  function removeSequence(id: string) {
    const seq = sequences.value.find(s => s.id === id);
    sequences.value = sequences.value.filter(s => s.id !== id);
    if (seq) {
      addTimelineEntry(
        'remove_sequence',
        '删除序列',
        `移除序列「${seq.name}」`,
        { id, name: seq.name }
      );
    }
  }

  function runAlignment(seq1Id: string, seq2Id: string, algorithm: 'nw' | 'sw') {
    const s1 = sequences.value.find(s => s.id === seq1Id);
    const s2 = sequences.value.find(s => s.id === seq2Id);

    if (!s1 || !s2) return;

    currentAlgorithm.value = algorithm;

    let result: AlignmentResult;
    if (algorithm === 'nw') {
      result = needlemanWunsch(s1.data, s2.data);
    } else {
      result = smithWaterman(s1.data, s2.data);
    }
    alignmentResult.value = result;

    const algoName = algorithm === 'nw' ? 'Needleman-Wunsch (全局)' : 'Smith-Waterman (局部)';
    addTimelineEntry(
      'run_alignment',
      '序列比对',
      `使用 ${algoName} 比对「${s1.name}」与「${s2.name}」，相似度 ${result.identity.toFixed(1)}%，得分 ${result.score}`,
      {
        seq1: s1.name,
        seq2: s2.name,
        algorithm: algoName,
        identity: result.identity.toFixed(1) + '%',
        score: result.score,
        gaps: result.gaps
      }
    );
  }

  function loadMockSequences() {
    sequences.value = [];
    for (const mock of MOCK_SEQUENCES) {
      addSequence(mock.id, mock.name, mock.data);
    }
    selectedSeq1.value = MOCK_SEQUENCES[0].id;
    selectedSeq2.value = MOCK_SEQUENCES[1].id;
    clearTimeline();
    addTimelineEntry(
      'load_mock',
      '加载示例序列',
      `加载了 ${MOCK_SEQUENCES.length} 条示例序列：${MOCK_SEQUENCES.map(s => s.name).join('、')}`,
      { count: MOCK_SEQUENCES.length }
    );
  }

  function buildTree() {
    if (sequences.value.length < 2) return;

    const seqData = sequences.value.map(s => ({ name: s.name, data: s.data }));
    const distMatrix = calculateDistanceMatrix(seqData);
    const names = sequences.value.map(s => s.name);
    phyloTree.value = buildNJTree(distMatrix, names);

    addTimelineEntry(
      'build_tree',
      '构建进化树',
      `基于 ${names.length} 条序列构建 Neighbor-Joining 系统发育树`,
      { sequenceCount: names.length, sequences: names.join(', ') }
    );
  }

  function analyzeGC(seqId: string, windowSize: number) {
    const seq = sequences.value.find(s => s.id === seqId);
    if (!seq) return;
    const data = calculateGCContent(seq.data, windowSize);
    gcData.value = data;

    const avgGC = data.length > 0
      ? (data.reduce((sum, d) => sum + d.gc, 0) / data.length).toFixed(1)
      : '0';
    addTimelineEntry(
      'analyze_gc',
      'GC含量分析',
      `分析「${seq.name}」的 GC 含量，窗口大小 ${windowSize} bp，平均 GC 含量 ${avgGC}%`,
      { sequence: seq.name, windowSize, avgGC: avgGC + '%' }
    );
  }

  return {
    sequences,
    alignmentResult,
    currentAlgorithm,
    gcData,
    phyloTree,
    selectedSeq1,
    selectedSeq2,
    timeline,
    alignmentIdentity,
    alignmentScore,
    addSequence,
    removeSequence,
    runAlignment,
    loadMockSequences,
    buildTree,
    analyzeGC,
    clearTimeline
  };
});

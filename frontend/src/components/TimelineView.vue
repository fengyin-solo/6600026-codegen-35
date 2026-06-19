<script setup lang="ts">
import type { TimelineEntry } from '../types';

defineProps<{
  entries: TimelineEntry[];
}>();

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function getActionColor(actionType: string): { bg: string; icon: string } {
  const map: Record<string, { bg: string; icon: string }> = {
    load_mock: { bg: 'bg-emerald-500', icon: '📦' },
    add_sequence: { bg: 'bg-blue-500', icon: '➕' },
    remove_sequence: { bg: 'bg-red-500', icon: '🗑️' },
    run_alignment: { bg: 'bg-cyan-500', icon: '🔗' },
    analyze_gc: { bg: 'bg-amber-500', icon: '📊' },
    build_tree: { bg: 'bg-purple-500', icon: '🌳' }
  };
  return map[actionType] || { bg: 'bg-gray-500', icon: '•' };
}
</script>

<template>
  <div class="timeline-container">
    <div v-if="entries.length === 0" class="empty-state">
      <span class="text-gray-500 text-sm">暂无操作记录</span>
    </div>
    <div v-else class="timeline-list">
      <div
        v-for="(entry, index) in entries"
        :key="entry.id"
        class="timeline-item"
      >
        <div class="timeline-left">
          <div :class="['timeline-dot', getActionColor(entry.actionType).bg]">
            <span class="timeline-icon">{{ getActionColor(entry.actionType).icon }}</span>
          </div>
          <div v-if="index < entries.length - 1" class="timeline-line"></div>
        </div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="timeline-title">{{ entry.title }}</span>
            <span class="timeline-time">{{ formatTime(entry.timestamp) }}</span>
          </div>
          <p class="timeline-desc">{{ entry.description }}</p>
          <div v-if="entry.details && Object.keys(entry.details).length > 0" class="timeline-details">
            <span
              v-for="(value, key) in entry.details"
              :key="key"
              class="detail-tag"
            >
              <span class="detail-key">{{ key }}:</span>
              <span class="detail-value">{{ value }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-container {
  max-height: 320px;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.timeline-list {
  position: relative;
  padding: 4px 0;
}

.timeline-item {
  display: flex;
  gap: 12px;
  margin-bottom: 0;
}

.timeline-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 32px;
  flex-shrink: 0;
}

.timeline-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}

.timeline-icon {
  font-size: 12px;
}

.timeline-line {
  flex: 1;
  width: 2px;
  background-color: #374151;
  margin: 4px 0;
}

.timeline-content {
  flex: 1;
  padding-bottom: 16px;
  min-width: 0;
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 2px;
}

.timeline-title {
  font-size: 13px;
  font-weight: 600;
  color: #e5e7eb;
}

.timeline-time {
  font-size: 11px;
  color: #6b7280;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  flex-shrink: 0;
}

.timeline-desc {
  font-size: 12px;
  color: #9ca3af;
  margin: 0 0 6px 0;
  line-height: 1.5;
}

.timeline-details {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.detail-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background-color: #1f2937;
  border: 1px solid #374151;
  border-radius: 4px;
  font-size: 11px;
}

.detail-key {
  color: #6b7280;
}

.detail-value {
  color: #22d3ee;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
</style>

<template>
  <div
    class="wf-node"
    :class="{ 'wf-node--selected': selected }"
    :style="{ minWidth: '200px' }"
  >
    <Handle
      v-if="!isStartNode"
      type="target"
      :position="Position.Left"
      :style="handleStyle('left')"
      class="wf-handle"
    />

    <div class="wf-node__header">
      <div class="wf-node__icon" :style="{ backgroundColor: classification.color }">
        <el-icon>
          <component :is="iconComponent" />
        </el-icon>
      </div>
      <div class="wf-node__meta">
        <div class="wf-node__title">{{ data.title || classification.title }}</div>
        <div v-if="data.desc" class="wf-node__desc">{{ data.desc }}</div>
      </div>
    </div>

    <div v-if="!data.desc && classification.description" class="wf-node__hint">
      {{ classification.description }}
    </div>

    <Handle
      v-if="!isEndNode"
      type="source"
      :position="Position.Right"
      :style="handleStyle('right')"
      class="wf-handle"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
import type { CommonNodeType } from '@/types/workflow'
import { BLOCK_CLASSIFICATIONS, BlockEnum } from '@/types/workflow'
import {
  VideoPlay,
  VideoPause,
  Cpu,
  Search,
  Connection,
  EditPen,
  Link,
  ChatDotSquare,
  Tools,
  List,
  Grid,
  Document,
  Files,
  Filter,
  Refresh,
  User,
} from '@element-plus/icons-vue'

const props = defineProps<NodeProps<CommonNodeType>>()

const classification = computed(() => {
  return BLOCK_CLASSIFICATIONS[props.data.type] || {
    title: props.data.type,
    description: '',
    color: '#6B7280',
    icon: 'cpu',
  }
})

const isStartNode = computed(() => props.data.type === BlockEnum.Start)
const isEndNode = computed(() => props.data.type === BlockEnum.End)

const iconComponent = computed(() => {
  const icon = classification.value.icon
  const map: Record<string, any> = {
    play: VideoPlay,
    stop: VideoPause,
    cpu: Cpu,
    search: Search,
    'git-branch': Connection,
    code: EditPen,
    globe: Link,
    'message-circle': ChatDotSquare,
    tool: Tools,
    variable: List,
    layers: Grid,
    'file-text': Document,
    extract: Filter,
    repeat: Refresh,
    file: Files,
    list: List,
    bot: User,
    refresh: Refresh,
  }

  return map[icon] || Cpu
})

const handleStyle = (position: 'left' | 'right' | 'top' | 'bottom') => {
  const baseStyle = {
    width: '10px',
    height: '10px',
    background: '#3b82f6',
    border: '2px solid #ffffff',
  }

  if (position === 'left') return { ...baseStyle, left: '-5px' }
  if (position === 'right') return { ...baseStyle, right: '-5px' }
  if (position === 'top') return { ...baseStyle, top: '-5px' }
  if (position === 'bottom') return { ...baseStyle, bottom: '-5px' }
  return baseStyle
}
</script>

<style scoped>
.wf-node {
  position: relative;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.wf-node:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
}

.wf-node--selected {
  border-color: #3b82f6;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.2);
}

.wf-node__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wf-node__icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.wf-node__meta {
  flex: 1;
  min-width: 0;
}

.wf-node__title {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wf-node__desc {
  margin-top: 2px;
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wf-node__hint {
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.wf-handle {
  background: #3b82f6;
}
</style>

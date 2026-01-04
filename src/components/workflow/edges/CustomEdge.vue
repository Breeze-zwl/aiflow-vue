<template>
  <BaseEdge
    :id="id"
    :path="edgePath"
    :marker-end="markerEnd"
    :style="edgeStyle"
  />
  <!-- 删除按钮 -->
  <EdgeLabelRenderer>
    <div
      class="edge-delete-btn-wrapper"
      :style="{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
        pointerEvents: 'all',
      }"
    >
      <div
        class="edge-delete-btn"
        @click.stop="handleDelete"
      >
        <el-icon class="edge-delete-icon"><Delete /></el-icon>
      </div>
    </div>
  </EdgeLabelRenderer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useVueFlow } from '@vue-flow/core'
import type { EdgeProps } from '@vue-flow/core'
import type { CommonEdgeType } from '@/types/workflow'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps<EdgeProps<CommonEdgeType>>()

const { removeEdges } = useVueFlow()

const edgePath = computed(() => {
  const [path] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
  })
  return path
})

// 计算删除按钮位置（连线中点）
const labelX = computed(() => (props.sourceX + props.targetX) / 2)
const labelY = computed(() => (props.sourceY + props.targetY) / 2)

const isHovering = computed(() => props.data?._hovering)
const isConnectedNodeHovering = computed(() => props.data?._connectedNodeIsHovering)
const isConnectedNodeSelected = computed(() => props.data?._connectedNodeIsSelected)

const edgeStyle = computed(() => {
  const highlight = isHovering.value || isConnectedNodeHovering.value || isConnectedNodeSelected.value
  return {
    stroke: highlight ? '#3b82f6' : '#9ca3af',
    strokeWidth: highlight ? 2 : 1.5,
    transition: 'stroke 0.2s, stroke-width 0.2s',
  }
})

const handleDelete = () => {
  removeEdges([props.id])
}
</script>

<style>
.edge-delete-btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.edge-delete-btn {
  width: 20px;
  height: 20px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
}

.edge-delete-btn:hover {
  background: #fee2e2;
  border-color: #fecaca;
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
}

.edge-delete-icon {
  font-size: 12px;
  color: #9ca3af;
}

.edge-delete-btn:hover .edge-delete-icon {
  color: #ef4444;
}
</style>

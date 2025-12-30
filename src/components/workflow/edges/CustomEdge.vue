<template>
  <BaseEdge
    :id="id"
    :path="edgePath"
    :marker-end="markerEnd"
    :style="edgeStyle"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseEdge, getBezierPath } from '@vue-flow/core'
import type { EdgeProps } from '@vue-flow/core'
import type { CommonEdgeType } from '@/types/workflow'

const props = defineProps<EdgeProps<CommonEdgeType>>()

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
</script>

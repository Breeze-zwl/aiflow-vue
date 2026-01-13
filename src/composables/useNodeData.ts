import { computed, inject, unref } from 'vue'
import type { Ref } from 'vue'
import type { BlockEnum } from '../types/workflow'

export type UpdateNodeData = (nodeId: string, data: Record<string, unknown>) => void
export type AddNodeFromSource = (sourceNodeId: string, nodeType: BlockEnum) => void

export const updateNodeDataKey = Symbol('update-node-data')
export const addNodeFromSourceKey = Symbol('add-node-from-source')

export const useNodeData = <T extends Record<string, unknown>>(id: string, data: T | Ref<T>) => {
  const updateNodeData = inject<UpdateNodeData | null>(updateNodeDataKey, null)

  const inputs = computed(() => unref(data))

  const setInputs = (patch: Partial<T>) => {
    if (!updateNodeData) {
      return
    }
    updateNodeData(id, patch)
  }

  return {
    inputs,
    setInputs,
  }
}

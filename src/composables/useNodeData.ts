import { computed, inject } from 'vue'

export type UpdateNodeData = (nodeId: string, data: Record<string, unknown>) => void

export const updateNodeDataKey = Symbol('update-node-data')

export const useNodeData = <T extends Record<string, unknown>>(id: string, data: T) => {
  const updateNodeData = inject<UpdateNodeData | null>(updateNodeDataKey, null)

  const inputs = computed(() => data)

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

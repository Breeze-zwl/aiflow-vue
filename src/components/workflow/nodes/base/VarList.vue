<template>
  <div v-if="list.length" class="wf-var-list">
    <div v-for="(variable, index) in list" :key="index" class="wf-var-item">
      <el-input
        v-model="variable.variable"
        :disabled="readonly"
        placeholder="变量名"
        class="wf-var-name"
        @input="(value: string) => handleVarNameChange(index, value)"
      />
      <VarReferencePicker
        :node-id="nodeId"
        :readonly="readonly"
        :is-show-node-name="true"
        :available-vars="availableVars"
        :model-value="variable.value_selector || []"
        @update:model-value="(value) => handleVarReferenceChange(index, value)"
        @change="(value, varInfo) => handleVarReferenceChange(index, value, varInfo)"
        class="wf-var-picker"
      />
      <RemoveButton v-if="!readonly" @click="handleVarRemove(index)" />
    </div>
  </div>
  <div v-else class="wf-empty">暂无变量，点击添加</div>
</template>

<script setup lang="ts">
import VarReferencePicker from './VarReferencePicker.vue'
import RemoveButton from './RemoveButton.vue'
import type { Variable, ValueSelector, Var } from '@/types/workflow'

type AvailableVarGroup = {
  nodeId: string
  nodeName: string
  vars: Var[]
}

const props = withDefaults(defineProps<{
  nodeId: string
  readonly?: boolean
  list: Variable[]
  onVarNameChange?: (oldName: string, newName: string) => void
  availableVars?: AvailableVarGroup[]
}>(), {
  availableVars: () => [],
})

const emit = defineEmits<{
  (e: 'change', list: Variable[]): void
}>()

const handleVarNameChange = (index: number, value: string) => {
  const newKey = value.replace(/\s/g, '_')
  const current = props.list[index]
  if (!current) return
  const oldName = current.variable
  props.onVarNameChange?.(oldName, newKey)
  const next = [...props.list]
  next[index] = {
    ...current,
    variable: newKey,
    value_selector: current.value_selector || [],
  }
  emit('change', next)
}

const handleVarReferenceChange = (
  index: number,
  value: ValueSelector | string,
  varInfo?: Var
) => {
  const next = [...props.list]
  const current = next[index]
  if (!current) return
  next[index] = {
    ...current,
    value_selector: value as ValueSelector,
    value_type: varInfo?.type,
  }

  if (!next[index].variable && Array.isArray(value) && value.length > 0) {
    const variables = next.map((item) => item?.variable || '')
    const baseName = String(value[value.length - 1] ?? '').trim()
    if (!baseName) {
      emit('change', next)
      return
    }
    let newVarName = baseName
    let count = 1
    while (variables.includes(newVarName)) {
      newVarName = `${baseName}_${count}`
      count += 1
    }
    next[index].variable = newVarName
  }

  emit('change', next)
}

const handleVarRemove = (index: number) => {
  const next = [...props.list]
  next.splice(index, 1)
  emit('change', next)
}
</script>

<style scoped>
.wf-var-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wf-var-item {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.wf-var-name :deep(.el-input__wrapper) {
  border-radius: 8px;
}

.wf-var-picker {
  width: 100%;
}

.wf-empty {
  padding: 16px 0;
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}
</style>

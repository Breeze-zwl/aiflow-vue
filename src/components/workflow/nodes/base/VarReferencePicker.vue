<template>
  <el-select
    :model-value="modelValueString"
    :disabled="readonly"
    :placeholder="placeholder"
    filterable
    clearable
    class="wf-var-picker"
    @change="handleChange"
  >
    <template v-if="availableVars.length">
      <el-option-group
        v-for="node in availableVars"
        :key="node.nodeId"
        :label="isShowNodeName ? node.nodeName : ''"
      >
        <el-option
          v-for="variable in node.vars"
          :key="variable.variable"
          :label="formatLabel(node.nodeId, variable.variable)"
          :value="formatValue(node.nodeId, variable.variable)"
        />
      </el-option-group>
    </template>
    <template v-else>
      <el-option disabled label="暂无可用变量" value="" />
    </template>
  </el-select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ValueSelector, Var } from '../../../../types/workflow'

type AvailableVarGroup = {
  nodeId: string
  nodeName: string
  vars: Var[]
}

const props = withDefaults(defineProps<{
  nodeId: string
  modelValue: ValueSelector | string
  readonly?: boolean
  isShowNodeName?: boolean
  placeholder?: string
  availableVars?: AvailableVarGroup[]
}>(), {
  isShowNodeName: true,
  placeholder: '选择变量',
  availableVars: () => [],
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: ValueSelector | string): void
  (e: 'change', value: ValueSelector | string, varInfo?: Var): void
}>()

const modelValueString = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.join('.')
  }
  return props.modelValue || ''
})

const formatLabel = (nodeId: string, variable: string) => {
  return props.isShowNodeName === false ? variable : `${nodeId}.${variable}`
}

// 用于内部存储和选择的值（始终包含 nodeId）
const formatValue = (nodeId: string, variable: string) => {
  return `${nodeId}.${variable}`
}

const handleChange = (value: string) => {
  if (!value) {
    emit('update:modelValue', [])
    emit('change', [])
    return
  }

  const parts = value.split('.')
  emit('update:modelValue', parts)

  const varInfo = props.availableVars
    ?.flatMap((group) => group.vars.map((v) => ({ ...v, nodeId: group.nodeId })))
    .find((v) => formatValue(v.nodeId, v.variable) === value)

  emit('change', parts, varInfo)
}
</script>

<style scoped>
.wf-var-picker {
  width: 100%;
}
</style>

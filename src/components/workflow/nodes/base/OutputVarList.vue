<template>
  <div v-if="outputs.length" class="wf-output-list">
    <div v-for="(output, index) in outputs" :key="index" class="wf-output-item">
      <el-input
        v-model="output.variable"
        :disabled="readonly"
        placeholder="变量名"
        @input="(value: string) => handleNameChange(index, value)"
      />
      <el-select
        v-model="output.type"
        class="wf-output-type"
        @change="(value: string) => handleTypeChange(index, value)"
      >
        <el-option
          v-for="option in varTypeOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <RemoveButton v-if="!readonly" @click="handleRemove(index)" />
    </div>
  </div>
  <div v-else class="wf-empty">暂无输出变量，点击添加</div>
</template>

<script setup lang="ts">
import RemoveButton from './RemoveButton.vue'
import { VarType } from '../../../../types/workflow'

interface OutputVar {
  variable: string
  type: VarType
  children?: OutputVar[]
}

const props = defineProps<{
  readonly?: boolean
  outputs: OutputVar[]
}>()

const emit = defineEmits<{
  (e: 'change', outputs: OutputVar[]): void
  (e: 'remove', index: number): void
}>()

const varTypeOptions = [
  { label: 'String', value: VarType.string },
  { label: 'Number', value: VarType.number },
  { label: 'Boolean', value: VarType.boolean },
  { label: 'Object', value: VarType.object },
  { label: 'Array', value: VarType.array },
  { label: 'Any', value: VarType.any },
]

const handleNameChange = (index: number, value: string) => {
  const next = [...props.outputs]
  if (!next[index]) return
  next[index] = { ...next[index], variable: value.replace(/\s/g, '_') }
  emit('change', next)
}

const handleTypeChange = (index: number, value: string) => {
  const next = [...props.outputs]
  if (!next[index]) return
  next[index] = { ...next[index], type: value as VarType }
  emit('change', next)
}

const handleRemove = (index: number) => {
  emit('remove', index)
}
</script>

<style scoped>
.wf-output-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wf-output-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px auto;
  gap: 8px;
  align-items: center;
}

.wf-output-type {
  width: 120px;
}

.wf-empty {
  padding: 16px 0;
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}
</style>

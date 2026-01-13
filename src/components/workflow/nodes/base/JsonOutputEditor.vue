<template>
  <div class="wf-json-editor" :class="{ 'wf-json-editor--nested': nested }">
    <div v-if="!nested" class="wf-json-editor__header">
      <el-button size="small" @click="addField">添加字段</el-button>
    </div>

    <div v-if="fields.length" class="wf-json-editor__list">
      <div v-for="(field, index) in fields" :key="field.id" class="wf-json-editor__item">
        <div class="wf-json-editor__row">
          <el-input
            v-model="field.name"
            placeholder="字段名"
            @input="(value: string) => updateField(index, { name: value })"
          />
          <el-select
            v-model="field.dataType"
            class="wf-json-editor__type"
            @change="(value: string) => handleTypeChange(index, value)"
          >
            <el-option label="String" value="String" />
            <el-option label="Number" value="Number" />
            <el-option label="Boolean" value="Boolean" />
            <el-option label="File" value="File" />
            <el-option label="Object" value="Object" />
            <el-option label="Array" value="Array" />
          </el-select>
          <el-input
            v-model="field.defaultValue"
            placeholder="默认值"
            @input="(value: string) => updateField(index, { defaultValue: value })"
          />
          <el-button
            v-if="field.dataType === 'Object'"
            class="wf-json-editor__child-btn"
            circle
            size="small"
            @click="() => addChild(index)"
          >
            <el-icon><Plus /></el-icon>
          </el-button>
          <el-button
            circle
            size="small"
            @click="() => removeField(index)"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div class="wf-json-editor__row">
          <el-input
            v-model="field.description"
            placeholder="添加描述"
            @input="(value: string) => updateField(index, { description: value })"
          />
        </div>
        <div v-if="field.children?.length" class="wf-json-editor__children">
          <JsonOutputEditor
            :model-value="field.children"
            nested
            @update:modelValue="(value) => updateField(index, { children: value })"
          />
        </div>
      </div>
    </div>
    <div v-else class="wf-json-editor__empty">暂无字段</div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Close } from '@element-plus/icons-vue'
import { v4 as uuid } from 'uuid'

defineOptions({ name: 'JsonOutputEditor' })

type OutputField = {
  id: string
  name?: string
  dataType?: string
  description?: string
  defaultValue?: string
  children?: OutputField[]
}

const props = withDefaults(defineProps<{
  modelValue: OutputField[]
  nested?: boolean
}>(), {
  modelValue: () => [],
  nested: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: OutputField[]): void
}>()

const fields = computed(() => props.modelValue || [])

const emitChange = (next: OutputField[]) => {
  emit('update:modelValue', next)
}

const addField = () => {
  const next = [...fields.value]
  next.push({
    id: uuid(),
    name: '',
    dataType: 'String',
    description: '',
    defaultValue: '',
    children: [],
  })
  emitChange(next)
}

const removeField = (index: number) => {
  const next = [...fields.value]
  next.splice(index, 1)
  emitChange(next)
}

const updateField = (index: number, patch: Partial<OutputField>) => {
  const next = [...fields.value]
  const current = next[index]
  if (!current) return
  next[index] = { ...current, ...patch }
  emitChange(next)
}

const addChild = (index: number) => {
  const next = [...fields.value]
  const current = next[index]
  if (!current) return
  const children = [...(current.children || [])]
  children.push({
    id: uuid(),
    name: '',
    dataType: 'String',
    description: '',
    defaultValue: '',
    children: [],
  })
  next[index] = { ...current, children }
  emitChange(next)
}

const handleTypeChange = (index: number, value: string) => {
  const next = [...fields.value]
  const current = next[index]
  if (!current) return
  const nextField: OutputField = { ...current, dataType: value }
  if (value !== 'Object') {
    nextField.children = []
  }
  next[index] = nextField
  emitChange(next)
}
</script>

<style scoped>
.wf-json-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wf-json-editor__header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.wf-json-editor__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wf-json-editor__item {
  border-radius: 10px;
  background: #f9fafb;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wf-json-editor__row {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 1.4fr auto auto;
  gap: 8px;
  align-items: center;
}

.wf-json-editor__row + .wf-json-editor__row {
  grid-template-columns: 1fr;
}

.wf-json-editor__type {
  width: 100%;
}

.wf-json-editor__child-btn {
  margin-left: 4px;
}

.wf-json-editor__children {
  padding-left: 16px;
  border-left: 2px solid #e5e7eb;
}

.wf-json-editor__empty {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
}

.wf-json-editor--nested .wf-json-editor__header {
  display: none;
}
</style>

<template>
  <div class="wf-panel-block">
    <Field title="输入变量" required tooltip="选择需要分类的问题内容">
      <VarReferencePicker
        :node-id="id"
        :model-value="queryVariable"
        placeholder="选择输入变量"
        @change="(value) => handleQueryVariableChange(value as string[])"
      />
    </Field>

    <Split />

    <Field title="分类" required>
      <template #operations>
        <AddButton @click="handleAddClass" />
      </template>
      <div class="wf-panel-block__stack">
        <div v-for="(classItem, index) in classes" :key="classItem.id" class="wf-class-item">
          <div class="wf-class-item__header">
            <div class="wf-class-index">{{ index + 1 }}</div>
            <el-input
              :model-value="classItem.name"
              placeholder="分类名称"
              @input="(value: string) => handleClassChange(index, { name: value })"
            />
            <RemoveButton v-if="classes.length > 1" @click="() => handleRemoveClass(index)" />
          </div>
          <el-input
            type="textarea"
            :rows="2"
            :model-value="classItem.description || ''"
            placeholder="分类描述（可选，帮助模型更准确地分类）"
            @input="(value: string) => handleClassChange(index, { description: value })"
          />
        </div>
        <div v-if="classes.length === 0" class="wf-empty">点击上方按钮添加分类</div>
      </div>
    </Field>

    <Split />

    <Field title="分类指令" tooltip="可选，为模型提供额外的分类指导">
      <el-input
        type="textarea"
        :rows="3"
        :model-value="instruction"
        placeholder="输入额外的分类指导说明..."
        @input="(value: string) => handleInstructionChange(value)"
      />
    </Field>

    <div class="wf-hint">
      提示：问题分类节点会根据配置的分类和描述，将输入内容分配到最匹配的分类中。每个分类对应一个输出分支。
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { v4 as uuid } from 'uuid'
import Field from '../base/Field.vue'
import Split from '../base/Split.vue'
import AddButton from '../base/AddButton.vue'
import RemoveButton from '../base/RemoveButton.vue'
import VarReferencePicker from '../base/VarReferencePicker.vue'
import { useNodeData } from '@/composables/useNodeData'
import type { QuestionClassifierNodeType, ClassItem } from '@/types/node-config'

const props = defineProps<{
  id: string
  data: QuestionClassifierNodeType
}>()

const { inputs, setInputs } = useNodeData<QuestionClassifierNodeType>(props.id, props.data)

const queryVariable = computed(() => inputs.value.query_variable_selector || [])
const classes = computed(() => inputs.value.classes || [])
const instruction = computed(() => inputs.value.instruction || '')

const handleQueryVariableChange = (value: string[]) => setInputs({ query_variable_selector: value })

const handleAddClass = () => {
  const next = [...(inputs.value.classes || [])]
  next.push({ id: uuid(), name: '', description: '' })
  setInputs({ classes: next })
}

const handleRemoveClass = (index: number) => {
  const next = [...(inputs.value.classes || [])]
  next.splice(index, 1)
  setInputs({ classes: next })
}

const handleClassChange = (index: number, patch: Partial<ClassItem>) => {
  const next = [...(inputs.value.classes || [])]
  if (!next[index]) return
  next[index] = { ...next[index], ...patch }
  setInputs({ classes: next })
}

const handleInstructionChange = (value: string) => setInputs({ instruction: value })
</script>

<style scoped>
.wf-panel-block {
  padding: 12px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wf-panel-block__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wf-class-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wf-class-item__header {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.wf-class-index {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #ede9fe;
  color: #7c3aed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.wf-empty {
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}

.wf-hint {
  padding: 10px 12px;
  background: #f3e8ff;
  border-radius: 10px;
  font-size: 12px;
  color: #6b21a8;
}
</style>

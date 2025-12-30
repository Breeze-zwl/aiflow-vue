<template>
  <div class="wf-panel-block">
    <Field title="输入字段">
      <template #operations>
        <AddButton @click="() => (showAddForm = true)" />
      </template>
      <div class="wf-panel-block__stack">
        <div v-for="(variable, index) in variables" :key="index" class="wf-list-item">
          <div>
            <div class="wf-list-item__title">
              <span class="wf-mono">{{ variable.variable }}</span>
              <span class="wf-muted">{{ variable.type }}</span>
              <span v-if="variable.required" class="wf-required">*必填</span>
            </div>
            <div v-if="variable.label && variable.label !== variable.variable" class="wf-muted">
              {{ variable.label }}
            </div>
          </div>
          <RemoveButton @click="() => handleRemoveVariable(index)" />
        </div>

        <div v-if="showAddForm" class="wf-inline-form">
          <div class="wf-inline-grid">
            <div>
              <label class="wf-field-label">变量名</label>
              <el-input
                v-model="newVar.variable"
                placeholder="variable_name"
                @input="(value: string) => (newVar.variable = value.replace(/\s/g, '_'))"
              />
            </div>
            <div>
              <label class="wf-field-label">显示名称</label>
              <el-input v-model="newVar.label" placeholder="显示名称" />
            </div>
          </div>
          <div class="wf-inline-grid">
            <div>
              <label class="wf-field-label">类型</label>
              <el-select v-model="newVar.type">
                <el-option v-for="option in varTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
            </div>
            <div class="wf-inline-switch">
              <el-switch v-model="newVar.required" />
              <span class="wf-muted">必填</span>
            </div>
          </div>
          <div class="wf-inline-actions">
            <el-button text @click="cancelAdd">取消</el-button>
            <el-button
              type="primary"
              :disabled="!newVar.variable || !newVar.label"
              @click="handleAdd"
            >
              添加
            </el-button>
          </div>
        </div>

        <div v-if="variables.length === 0 && !showAddForm" class="wf-empty">
          暂无输入变量，点击上方按钮添加
        </div>

        <Split />

        <div class="wf-system-vars">
          <div class="wf-list-item">
            <div>
              <div class="wf-list-item__title">
                <span class="wf-mono wf-purple">sys.query</span>
                <span class="wf-muted">String</span>
              </div>
              <div class="wf-muted">用户输入的查询内容</div>
            </div>
            <el-tag size="small" type="info">系统</el-tag>
          </div>
          <div class="wf-list-item">
            <div>
              <div class="wf-list-item__title">
                <span class="wf-mono wf-purple">sys.files</span>
                <span class="wf-muted">Array[File]</span>
              </div>
              <div class="wf-muted">用户上传的文件列表</div>
            </div>
            <el-tag size="small" type="info">系统</el-tag>
          </div>
        </div>
      </div>
    </Field>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Field from '../base/Field.vue'
import Split from '../base/Split.vue'
import AddButton from '../base/AddButton.vue'
import RemoveButton from '../base/RemoveButton.vue'
import { useNodeData } from '@/composables/useNodeData'
import type { StartNodeType } from '@/types/node-config'
import type { InputVar } from '@/types/workflow'

const props = defineProps<{
  id: string
  data: StartNodeType
}>()

const { inputs, setInputs } = useNodeData<StartNodeType>(props.id, props.data)

const varTypeOptions = [
  { label: '文本', value: 'string' },
  { label: '段落', value: 'paragraph' },
  { label: '数字', value: 'number' },
  { label: '下拉选项', value: 'select' },
  { label: '文件', value: 'file' },
  { label: '文件列表', value: 'file-list' },
]

const showAddForm = ref(false)
const newVar = reactive<Partial<InputVar>>({
  variable: '',
  label: '',
  type: 'string',
  required: false,
})

const variables = computed(() => inputs.value.variables || [])

const handleAddVariable = (payload: InputVar) => {
  const newList = [...(inputs.value.variables || []), payload]
  const varNames = newList.map((item) => item.variable)
  if (new Set(varNames).size !== varNames.length) {
    return false
  }
  setInputs({ variables: newList })
  return true
}

const handleRemoveVariable = (index: number) => {
  const newList = [...(inputs.value.variables || [])]
  newList.splice(index, 1)
  setInputs({ variables: newList })
}

const handleAdd = () => {
  if (!newVar.variable || !newVar.label) return
  const success = handleAddVariable({
    variable: newVar.variable,
    label: newVar.label || newVar.variable,
    type: newVar.type || 'string',
    required: newVar.required || false,
  })
  if (success) {
    newVar.variable = ''
    newVar.label = ''
    newVar.type = 'string'
    newVar.required = false
    showAddForm.value = false
  }
}

const cancelAdd = () => {
  showAddForm.value = false
}
</script>

<style scoped>
.wf-panel-block {
  padding: 12px 16px 20px;
}

.wf-panel-block__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wf-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 10px;
}

.wf-list-item__title {
  display: flex;
  gap: 8px;
  align-items: center;
}

.wf-mono {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  color: #2563eb;
}

.wf-mono.wf-purple {
  color: #7c3aed;
}

.wf-muted {
  font-size: 12px;
  color: #6b7280;
}

.wf-required {
  font-size: 11px;
  color: #ef4444;
}

.wf-inline-form {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wf-inline-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.wf-field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #6b7280;
}

.wf-inline-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 24px;
}

.wf-inline-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.wf-empty {
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
  padding: 12px 0;
}

.wf-system-vars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>

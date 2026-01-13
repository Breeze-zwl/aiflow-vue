<template>
  <Field title="输入变量">
    <template #operations>
      <AddButton @click="openEditorForAdd" />
    </template>
    <div class="wf-panel-block__stack">
      <template v-for="(param, index) in parameters" :key="param.name || index">
        <div class="wf-list-item">
          <div>
            <div class="wf-list-item__title">
              <span class="wf-mono">{{ param.name || '未命名' }}</span>
            </div>
            <div v-if="param.defaultValue" class="wf-muted">
              {{ getDefaultValueLabel(param.defaultValue) }}
            </div>
          </div>
          <div class="wf-list-actions">
            <el-button
              circle
              size="small"
              plain
              class="wf-icon-btn"
              @click="() => openEditorForEdit(index)"
            >
              <el-icon><EditPen /></el-icon>
            </el-button>
            <RemoveButton @click="() => handleRemoveParameter(index)" />
          </div>
        </div>

        <div
          v-if="editingIndex === index"
          class="wf-inline-form wf-inline-form--inline"
        >
          <div class="wf-inline-grid">
            <div>
              <label class="wf-field-label">参数名称</label>
              <el-input
                v-model="editorParam.name"
                placeholder="variable_name"
                @input="(value: string) => (editorParam.name = value.replace(/\\s/g, '_'))"
              />
            </div>
            <div>
              <label class="wf-field-label">默认值</label>
              <el-select
                v-model="editorParam.defaultValue"
                placeholder="选择变量"
                filterable
                clearable
              >
                <template v-if="availableDefaultGroups.length">
                  <el-option-group
                    v-for="group in availableDefaultGroups"
                    :key="group.label"
                    :label="group.label"
                    class="wf-option-group"
                  >
                    <el-option
                      v-for="option in group.options"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    >
                      <span class="wf-option-label">{{ option.label }}</span>
                      <span class="wf-option-type">{{ option.typeLabel }}</span>
                    </el-option>
                  </el-option-group>
                </template>
                <template v-else>
                  <el-option disabled label="暂无可用变量" value="" />
                </template>
              </el-select>
            </div>
          </div>
          <div class="wf-inline-actions">
            <el-button text @click="cancelEdit">取消</el-button>
            <el-button
              type="primary"
              :disabled="!editorParam.name"
              @click="handleSave"
            >
              保存
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="editingIndex === -1" class="wf-inline-form wf-inline-form--inline">
        <div class="wf-inline-grid">
          <div>
            <label class="wf-field-label">参数名称</label>
            <el-input
              v-model="editorParam.name"
              placeholder="variable_name"
              @input="(value: string) => (editorParam.name = value.replace(/\\s/g, '_'))"
            />
          </div>
          <div>
            <label class="wf-field-label">默认值</label>
            <el-select
              v-model="editorParam.defaultValue"
              placeholder="选择变量"
              filterable
              clearable
            >
              <template v-if="availableDefaultGroups.length">
                <el-option-group
                  v-for="group in availableDefaultGroups"
                  :key="group.label"
                  :label="group.label"
                  class="wf-option-group"
                >
                  <el-option
                    v-for="option in group.options"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  >
                    <span class="wf-option-label">{{ option.label }}</span>
                    <span class="wf-option-type">{{ option.typeLabel }}</span>
                  </el-option>
                </el-option-group>
              </template>
              <template v-else>
                <el-option disabled label="暂无可用变量" value="" />
              </template>
            </el-select>
          </div>
        </div>
        <div class="wf-inline-actions">
          <el-button text @click="cancelEdit">取消</el-button>
          <el-button
            type="primary"
            :disabled="!editorParam.name"
            @click="handleSave"
          >
            添加
          </el-button>
        </div>
      </div>

      <div v-if="parameters.length === 0 && editingIndex === null" class="wf-empty">
        暂无输入变量，点击上方按钮添加
      </div>
    </div>
  </Field>
</template>

<script setup lang="ts">
import { computed, reactive, ref, inject, type Ref } from 'vue'
import { EditPen } from '@element-plus/icons-vue'
import Field from './Field.vue'
import AddButton from './AddButton.vue'
import RemoveButton from './RemoveButton.vue'
import type { Parameter } from '../../../../types/node-config'
import type { Node, Edge } from '../../../../types/workflow'
import { BlockEnum } from '../../../../types/workflow'

const props = defineProps<{
  nodeId: string
  parameters: Parameter[]
}>()

const emit = defineEmits<{
  (e: 'change', value: Parameter[]): void
}>()

const editingIndex = ref<number | null>(null)
const editorParam = reactive<Partial<Parameter>>({
  name: '',
  defaultValue: '',
})

const workflowNodes = inject<Ref<Node[]>>('workflowNodes')
const workflowEdges = inject<Ref<Edge[]>>('workflowEdges')

type AvailableOption = {
  label: string
  value: string
  typeLabel: string
}

type AvailableGroup = {
  label: string
  options: AvailableOption[]
}

const getUpstreamNodeIds = (nodeId: string, edges: Edge[]): string[] => {
  const upstreamIds: string[] = []
  const visited = new Set<string>()

  const traverse = (currentId: string) => {
    if (visited.has(currentId)) return
    visited.add(currentId)

    for (const edge of edges) {
      if (edge.target === currentId && edge.source) {
        upstreamIds.push(edge.source)
        traverse(edge.source)
      }
    }
  }

  traverse(nodeId)
  return upstreamIds
}

const collectOutputNames = (data: Record<string, any> | undefined): Array<{ name: string; typeLabel: string }> => {
  if (!data) return []
  const outputs = data.outputs as Array<{
    variable?: string
    name?: string
    dataType?: string
    type?: string
    value_type?: string
  }> | Record<string, any> | undefined
  if (Array.isArray(outputs)) {
    return outputs
      .map((item) => ({
        name: item?.variable || item?.name || '',
        typeLabel: item?.dataType || item?.type || item?.value_type || 'String',
      }))
      .filter((item) => item.name)
  }
  if (outputs && typeof outputs === 'object') {
    return Object.keys(outputs).map((key) => ({
      name: key,
      typeLabel: outputs[key]?.dataType || outputs[key]?.type || outputs[key]?.value_type || 'String',
    }))
  }
  const outputDefs = data.outputDefs as Array<{
    name?: string
    variable?: string
    dataType?: string
    type?: string
  }> | undefined
  if (Array.isArray(outputDefs)) {
    return outputDefs
      .map((item) => ({
        name: item?.name || item?.variable || '',
        typeLabel: item?.dataType || item?.type || 'String',
      }))
      .filter((item) => item.name)
  }
  return []
}

const availableDefaultOptions = computed<AvailableOption[]>(() => {
  if (!workflowNodes?.value || !workflowEdges?.value) return []
  const upstreamNodeIds = new Set(getUpstreamNodeIds(props.nodeId, workflowEdges.value))
  const options: AvailableOption[] = []

  for (const node of workflowNodes.value) {
    const data = node.data as Record<string, any> | undefined
    if (!data) continue

    if (data.type === BlockEnum.Start) {
      const parameters = data.parameters as Array<{ name?: string; dataType?: string }> | undefined
      if (!Array.isArray(parameters)) continue
      for (const param of parameters) {
        if (!param?.name) continue
        options.push({
          label: param.name,
          value: `${node.id}.${param.name}`,
          typeLabel: param.dataType || 'String',
        })
      }
      continue
    }

    if (!upstreamNodeIds.has(node.id)) continue
    const outputNames = collectOutputNames(data)
    for (const output of outputNames) {
      options.push({
        label: output.name,
        value: `${node.id}.${output.name}`,
        typeLabel: output.typeLabel || 'String',
      })
    }
  }

  return options
})

const availableDefaultGroups = computed<AvailableGroup[]>(() => {
  if (!workflowNodes?.value) return []
  const nodeNameMap = new Map<string, string>()
  for (const node of workflowNodes.value) {
    const data = node.data as Record<string, any> | undefined
    nodeNameMap.set(node.id, (data?.title as string) || node.id)
  }

  const groups = new Map<string, AvailableOption[]>()
  for (const option of availableDefaultOptions.value) {
    const nodeId = option.value.split('.', 1)[0]
    const groupLabel = nodeNameMap.get(nodeId) || nodeId
    if (!groups.has(groupLabel)) {
      groups.set(groupLabel, [])
    }
    groups.get(groupLabel)?.push(option)
  }
  return Array.from(groups.entries()).map(([label, options]) => ({ label, options }))
})

const getDefaultValueLabel = (value: string) => {
  const match = availableDefaultOptions.value.find((item) => item.value === value)
  return match?.label || value
}

const handleAddParameter = (payload: Parameter) => {
  const newList = [...(props.parameters || []), payload]
  const paramNames = newList.map((item) => item.name).filter(Boolean)
  if (new Set(paramNames).size !== paramNames.length) {
    return false
  }
  emit('change', newList)
  return true
}

const handleRemoveParameter = (index: number) => {
  const newList = [...(props.parameters || [])]
  newList.splice(index, 1)
  emit('change', newList)
}

const resetEditor = () => {
  editorParam.name = ''
  editorParam.defaultValue = ''
}

const openEditorForAdd = () => {
  if (editingIndex.value === -1) {
    cancelEdit()
    return
  }
  editingIndex.value = -1
  resetEditor()
}

const openEditorForEdit = (index: number) => {
  if (index < 0) return
  if (editingIndex.value === index) {
    cancelEdit()
    return
  }
  const current = props.parameters[index]
  if (!current) return
  editingIndex.value = index
  editorParam.name = current.name || ''
  editorParam.defaultValue = current.defaultValue || ''
}

const hasDuplicateName = (name: string, ignoreIndex: number | null) => {
  const names = props.parameters
    .filter((_item, idx) => idx !== ignoreIndex)
    .map((item) => item?.name)
    .filter(Boolean)
  return names.includes(name)
}

const handleSave = () => {
  if (!editorParam.name) return
  if (hasDuplicateName(editorParam.name, editingIndex.value)) return

  if (editingIndex.value === -1) {
    const success = handleAddParameter({
      name: editorParam.name,
      defaultValue: editorParam.defaultValue || '',
    })
    if (!success) return
  } else {
    const index = editingIndex.value
    if (index === null || index < 0) return
    const next = [...(props.parameters || [])]
    const current = next[index]
    if (!current) return
    next[index] = {
      ...current,
      name: editorParam.name,
      defaultValue: editorParam.defaultValue || '',
    }
    emit('change', next)
  }

  resetEditor()
  editingIndex.value = null
}

const cancelEdit = () => {
  editingIndex.value = null
}
</script>

<style scoped>
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

.wf-list-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wf-icon-btn {
  padding: 0;
}

.wf-mono {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  color: #2563eb;
}

.wf-muted {
  font-size: 12px;
  color: #6b7280;
}

.wf-inline-form {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wf-inline-form--inline {
  margin: 4px 0 10px;
  background: #ffffff;
}

.wf-inline-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
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

.wf-option-label {
  margin-right: 12px;
}

.wf-option-type {
  color: #6b7280;
  font-size: 12px;
  float: right;
}

.wf-option-group :deep(.el-select-group__title) {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
  font-size: 13px;
  color: #111827;
}
</style>

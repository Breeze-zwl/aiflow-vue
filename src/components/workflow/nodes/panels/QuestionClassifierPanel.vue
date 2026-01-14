<template>
  <div class="wf-panel-block">
    <InputParameters
      :node-id="id"
      :parameters="inputs.parameters || []"
      @change="(list) => setInputs({ parameters: list })"
    />

    <Split />

    <Field title="选择模型">
      <el-select
        :model-value="modelName"
        placeholder="请选择模型"
        @change="(value: string) => handleModelChange(value)"
      >
        <el-option
          v-for="option in modelOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </Field>

    <Field title="分类" required>
      <template #operations>
        <AddButton @click="handleAddClass" />
      </template>
      <div class="wf-panel-block__stack">
        <div
          v-for="(classItem, index) in classes"
          :key="classItem.id"
          class="wf-class-item"
        >
          <div v-if="editingId === classItem.id" class="wf-class-form">
            <div class="wf-class-form__header">
              <span class="wf-class-form__title">分类 {{ index + 1 }}</span>
            </div>
            <div class="wf-class-form__grid">
              <div>
                <label class="wf-field-label">选择参数</label>
                <el-select
                  v-model="editorParam.name"
                  placeholder="选择分类名称"
                  filterable
                >
                  <template v-if="availableClassGroups.length">
                    <el-option-group
                      v-for="group in availableClassGroups"
                      :key="group.label"
                      :label="group.label"
                      class="wf-option-group"
                    >
                      <el-option
                        v-for="option in group.options"
                        :key="option.value"
                        :label="option.label"
                        :value="option.label"
                      >
                        <span class="wf-option-label">{{ option.label }}</span>
                        <span class="wf-option-type">{{
                          option.typeLabel
                        }}</span>
                      </el-option>
                    </el-option-group>
                  </template>
                  <template v-else>
                    <el-option disabled label="暂无可用变量" value="" />
                  </template>
                </el-select>
              </div>
              <div>
                <label class="wf-field-label">分类描述</label>
                <el-input
                  v-model="editorParam.description"
                  type="textarea"
                  :rows="3"
                  placeholder="分类描述（可选，帮助模型更准确地分类）"
                />
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
          <div v-else class="wf-class-display">
            <div class="wf-class-display__header">
              <div class="wf-class-display__title">分类 {{ index + 1 }}</div>
              <div class="wf-class-display__meta">
                <span class="wf-class-display__count">
                  {{ (classItem.description || '').length }}
                </span>
                <el-button
                  circle
                  size="small"
                  plain
                  class="wf-icon-btn"
                  @click="() => openEdit(classItem.id)"
                >
                  <el-icon><EditPen /></el-icon>
                </el-button>
                <el-button
                  circle
                  size="small"
                  plain
                  class="wf-icon-btn wf-icon-btn-cus"
                  @click="() => handleCopyClass(classItem)"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
                <RemoveButton
                  v-if="classes.length > 1"
                  @click="() => handleRemoveClass(index)"
                />
              </div>
            </div>
            <div class="wf-class-display__param">
              参数：{{ classItem.name || '-' }}
            </div>
            <div class="wf-class-display__content">
              {{ classItem.description || '暂无描述' }}
            </div>
          </div>
        </div>
        <div v-if="classes.length === 0" class="wf-empty">
          点击上方按钮添加分类
        </div>
      </div>
    </Field>

    <Split />

    <Field title="输出参数">
      <div class="wf-output-table">
        <div class="wf-output-header">
          <span>参数名称</span>
          <span>参数类型</span>
          <span></span>
        </div>
        <div class="wf-output-row">
          <div class="wf-output-cell">
            <el-input
              :model-value="outputDef.name"
              placeholder="content"
              @input="(value: string) => updateOutputDef({ name: value })"
            />
          </div>
          <div class="wf-output-cell wf-output-type">
            {{ outputDef.dataType }}
          </div>
          <div class="wf-output-cell wf-output-action">
            <el-button text size="small" @click="toggleExpand">
              <el-icon><EditPen /></el-icon>
            </el-button>
          </div>
          <div v-if="expanded" class="wf-output-expand">
            <div class="wf-output-expand-item">
              <label class="wf-field-label">默认值</label>
              <el-input
                :model-value="outputDef.defaultValue"
                placeholder="请输入默认值"
                @input="(value: string) => updateOutputDef({ defaultValue: value })"
              />
            </div>
            <div class="wf-output-expand-item">
              <label class="wf-field-label">参数描述</label>
              <el-input
                :model-value="outputDef.description"
                placeholder="请输入参数描述"
                @input="(value: string) => updateOutputDef({ description: value })"
              />
            </div>
          </div>
        </div>
      </div>
    </Field>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef, inject, type Ref, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import Field from '../base/Field.vue'
import Split from '../base/Split.vue'
import InputParameters from '../base/InputParameters.vue'
import AddButton from '../base/AddButton.vue'
import RemoveButton from '../base/RemoveButton.vue'
import { useNodeData } from '../../../../composables/useNodeData'
import { EditPen, CopyDocument } from '@element-plus/icons-vue'
import type {
  QuestionClassifierNodeType,
  ClassItem,
} from '../../../../types/node-config'
import type { Node, Edge } from '../../../../types/workflow'
import { BlockEnum } from '../../../../types/workflow'

const props = defineProps<{
  id: string
  data: QuestionClassifierNodeType
}>()

const { inputs, setInputs } = useNodeData<QuestionClassifierNodeType>(
  props.id,
  toRef(props, 'data')
)

const classes = computed(() => inputs.value.classes || [])
const workflowNodes = inject<Ref<Node[]>>('workflowNodes')
const workflowEdges = inject<Ref<Edge[]>>('workflowEdges')
const editingId = ref<string | null>(null)
const editorParam = reactive({
  name: '',
  description: '',
})
const newClassIds = ref<string[]>([])

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

const collectOutputNames = (
  data: Record<string, any> | undefined
): Array<{ name: string; typeLabel: string }> => {
  if (!data) return []
  const outputs = data.outputs as
    | Array<{
        variable?: string
        name?: string
        dataType?: string
        type?: string
        value_type?: string
      }>
    | Record<string, any>
    | undefined
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
      typeLabel:
        outputs[key]?.dataType ||
        outputs[key]?.type ||
        outputs[key]?.value_type ||
        'String',
    }))
  }
  const outputDefs = data.outputDefs as
    | Array<{
        name?: string
        variable?: string
        dataType?: string
        type?: string
      }>
    | undefined
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

const availableClassGroups = computed<AvailableGroup[]>(() => {
  if (!workflowNodes?.value || !workflowEdges?.value) return []
  const upstreamNodeIds = new Set(
    getUpstreamNodeIds(props.id, workflowEdges.value)
  )
  const options: AvailableOption[] = []

  for (const node of workflowNodes.value) {
    const data = node.data as Record<string, any> | undefined
    if (!data) continue

    if (data.type === BlockEnum.Start) {
      const parameters = data.parameters as
        | Array<{ name?: string; dataType?: string }>
        | undefined
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

  const nodeNameMap = new Map<string, string>()
  for (const node of workflowNodes.value) {
    const data = node.data as Record<string, any> | undefined
    nodeNameMap.set(node.id, (data?.title as string) || node.id)
  }

  const groups = new Map<string, AvailableOption[]>()
  for (const option of options) {
    const nodeId = option.value.split('.', 1)[0]
    const groupLabel = nodeNameMap.get(nodeId) || nodeId
    if (!groups.has(groupLabel)) {
      groups.set(groupLabel, [])
    }
    groups.get(groupLabel)?.push(option)
  }
  return Array.from(groups.entries()).map(([label, options]) => ({
    label,
    options,
  }))
})

const modelName = computed(() => inputs.value.model?.name || '')

const modelOptions = [
  { label: 'GPT-4', value: 'gpt-4' },
  { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
  { label: 'GPT-4o', value: 'gpt-4o' },
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'Claude 3 Opus', value: 'claude-3-opus' },
  { label: 'Claude 3 Sonnet', value: 'claude-3-sonnet' },
  { label: 'Claude 3.5 Sonnet', value: 'claude-3.5-sonnet' },
  { label: 'Qwen Max', value: 'qwen-max' },
  { label: 'Qwen Plus', value: 'qwen-plus' },
  { label: 'DeepSeek Chat', value: 'deepseek-chat' },
]

const handleModelChange = (value: string) => {
  setInputs({
    model: {
      provider: inputs.value.model?.provider || 'openai',
      name: value,
    },
  })
}

const handleAddClass = () => {
  const next = [...(inputs.value.classes || [])]
  const id = uuid()
  next.push({ id, name: '', description: '' })
  setInputs({ classes: next })
  editingId.value = id
  newClassIds.value = [...newClassIds.value, id]
  editorParam.name = ''
  editorParam.description = ''
}

const handleRemoveClass = (index: number) => {
  const next = [...(inputs.value.classes || [])]
  next.splice(index, 1)
  setInputs({ classes: next })
}

const openEdit = (id: string) => {
  if (editingId.value === id) {
    cancelEdit()
    return
  }
  const current = classes.value.find((item) => item.id === id)
  if (!current) return
  editingId.value = id
  editorParam.name = current.name || ''
  editorParam.description = current.description || ''
}

const handleSave = () => {
  if (!editingId.value || !editorParam.name) return
  const next = [...(inputs.value.classes || [])]
  const index = next.findIndex((item) => item.id === editingId.value)
  if (index === -1) return
  next[index] = {
    ...next[index],
    name: editorParam.name,
    description: editorParam.description,
  }
  setInputs({ classes: next })
  newClassIds.value = newClassIds.value.filter((id) => id !== editingId.value)
  editingId.value = null
  editorParam.name = ''
  editorParam.description = ''
}

const cancelEdit = () => {
  if (!editingId.value) return
  const currentId = editingId.value
  editingId.value = null
  editorParam.name = ''
  editorParam.description = ''
  if (newClassIds.value.includes(currentId)) {
    newClassIds.value = newClassIds.value.filter((id) => id !== currentId)
    const next = [...(inputs.value.classes || [])].filter(
      (item) => item.id !== currentId
    )
    setInputs({ classes: next })
  }
}

const handleCopyClass = (item: ClassItem) => {
  const next = [...(inputs.value.classes || [])]
  next.push({
    id: uuid(),
    name: item.name,
    description: item.description || '',
  })
  setInputs({ classes: next })
}

const outputDef = computed(() => {
  const current = Array.isArray((inputs.value as any).outputDefs)
    ? (inputs.value as any).outputDefs
    : []
  const first = current[0] || {}
  return {
    name: first.name || 'content',
    dataType: first.dataType || 'String',
    description: first.description || '',
    defaultValue: first.defaultValue ?? '',
  }
})

const expanded = ref(false)

const toggleExpand = () => {
  expanded.value = !expanded.value
}

const updateOutputDef = (patch: {
  name?: string
  description?: string
  defaultValue?: string
}) => {
  const next = [
    {
      ...outputDef.value,
      ...patch,
    },
  ]
  setInputs({ outputDefs: next } as any)
}
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
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wf-empty {
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}

.wf-class-form,
.wf-class-display {
  border-radius: 12px;
  background: #f3f4f6;
  padding: 12px;
}

.wf-class-form__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.wf-class-form__title {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.wf-class-form__grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wf-class-display__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wf-class-display__title {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.wf-class-display__meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wf-class-display__count {
  font-size: 12px;
  color: #6b7280;
  min-width: 24px;
  text-align: right;
}

.wf-class-display__param {
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
}

.wf-class-display__content {
  margin-top: 6px;
  color: #374151;
  font-size: 13px;
  line-height: 1.6;
}

.wf-icon-btn {
  padding: 0;
}

.wf-icon-btn-cus {
  margin-left: 0px;
}

.wf-field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #6b7280;
}

.wf-inline-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.wf-output-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0px;
}

.wf-output-header,
.wf-output-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 32px;
  gap: 8px;
  align-items: center;
}

.wf-output-header {
  font-size: 12px;
  color: #6b7280;
}

.wf-output-row {
  padding: 6px 8px;
  border-radius: 8px;
  background: #f8fafc;
}

.wf-output-cell {
  font-size: 13px;
  color: #374151;
}

.wf-output-action {
  display: flex;
  justify-content: flex-end;
}

.wf-output-expand {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 0 6px;
}

.wf-output-expand-item {
  display: flex;
  flex-direction: column;
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

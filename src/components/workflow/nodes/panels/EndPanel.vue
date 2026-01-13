<template>
  <div class="wf-panel-block">
    <Field title="输出变量" required>
      <template #operations>
        <AddButton @click="handleAddVariable" />
      </template>
      <div v-if="outputs.length" class="wf-output-list">
        <div v-for="(item, index) in outputs" :key="index" class="wf-output-item">
          <el-input
            v-model="item.variable"
            placeholder="变量名"
            class="wf-output-name"
            @input="(value: string) => handleNameChange(index, value)"
          />
          <el-select
            :model-value="formatValueSelector(item.value_selector)"
            placeholder="选择参数"
            filterable
            clearable
            class="wf-output-ref"
            @change="(value: string) => handleRefChange(index, value)"
          >
            <el-option
              v-for="param in availableParams"
              :key="param.ref"
              :label="param.name"
              :value="param.ref"
            />
          </el-select>
          <RemoveButton @click="handleRemoveVariable(index)" />
        </div>
      </div>
      <div v-else class="wf-empty">暂无输出变量，点击添加</div>
    </Field>
    <div class="wf-hint">
      结束节点用于定义工作流的输出变量。将上游节点的输出映射到最终输出。
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef, inject, type Ref } from 'vue'
import Field from '../base/Field.vue'
import AddButton from '../base/AddButton.vue'
import RemoveButton from '../base/RemoveButton.vue'
import { useNodeData } from '../../../../composables/useNodeData'
import type { EndNodeType } from '../../../../types/node-config'
import type { Variable, Node, Edge, ValueSelector } from '../../../../types/workflow'

const props = defineProps<{
  id: string
  data: EndNodeType
}>()

const { inputs, setInputs } = useNodeData<EndNodeType>(props.id, toRef(props, 'data'))

const outputs = computed(() => inputs.value.outputs || [])

// 注入工作流节点和边数据
const workflowNodes = inject<Ref<Node[]>>('workflowNodes')
const workflowEdges = inject<Ref<Edge[]>>('workflowEdges')

// 获取当前节点的所有上游节点ID
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

// 可用的参数列表（来自上游节点的 parameters）
type AvailableParam = {
  name: string
  ref: string  // nodeId.paramName
  nodeId: string
  nodeTitle: string
}

const availableParams = computed<AvailableParam[]>(() => {
  if (!workflowNodes?.value || !workflowEdges?.value) return []

  const upstreamNodeIds = getUpstreamNodeIds(props.id, workflowEdges.value)
  const params: AvailableParam[] = []

  for (const node of workflowNodes.value) {
    if (!upstreamNodeIds.includes(node.id)) continue

    const data = node.data as Record<string, unknown> | undefined
    if (!data) continue

    const parameters = data.parameters as Array<{ name?: string }> | undefined
    if (!parameters || !Array.isArray(parameters)) continue

    for (const param of parameters) {
      if (param.name) {
        params.push({
          name: param.name,
          ref: `${node.id}.${param.name}`,
          nodeId: node.id,
          nodeTitle: (data.title as string) || node.id,
        })
      }
    }
  }

  return params
})

// 将 value_selector 数组转换为字符串格式用于显示
const formatValueSelector = (selector: ValueSelector | undefined): string => {
  if (!selector || selector.length === 0) return ''
  return selector.join('.')
}

// 将字符串格式转换回 value_selector 数组
const parseValueSelector = (ref: string): ValueSelector => {
  if (!ref) return []
  return ref.split('.')
}

const handleAddVariable = () => {
  const newList: Variable[] = [...(inputs.value.outputs || [])]
  newList.push({
    variable: '',
    label: '',
    value_selector: [],
    required: false,
  })
  setInputs({ outputs: newList })
}

const handleRemoveVariable = (index: number) => {
  const newList = [...(inputs.value.outputs || [])]
  newList.splice(index, 1)
  setInputs({ outputs: newList })
}

const handleNameChange = (index: number, value: string) => {
  const newList = [...(inputs.value.outputs || [])]
  const current = newList[index]
  if (!current) return
  newList[index] = {
    ...current,
    variable: value.replace(/\s/g, '_'),
  }
  setInputs({ outputs: newList })
}

const handleRefChange = (index: number, value: string) => {
  const newList = [...(inputs.value.outputs || [])]
  const current = newList[index]
  if (!current) return

  // 如果 variable 为空，自动使用参数名
  let variable = current.variable
  if (!variable && value) {
    const paramName = value.split('.').pop() || ''
    // 检查是否重名
    const existingNames = newList.map(item => item.variable).filter(Boolean)
    let newName = paramName
    let count = 1
    while (existingNames.includes(newName)) {
      newName = `${paramName}_${count}`
      count++
    }
    variable = newName
  }

  newList[index] = {
    ...current,
    variable,
    value_selector: parseValueSelector(value),
  }
  setInputs({ outputs: newList })
}
</script>

<style scoped>
.wf-panel-block {
  padding: 12px 16px 20px;
}

.wf-output-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wf-output-item {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.wf-output-name :deep(.el-input__wrapper) {
  border-radius: 8px;
}

.wf-output-ref {
  width: 100%;
}

.wf-empty {
  padding: 16px 0;
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}

.wf-hint {
  margin-top: 12px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 10px;
  font-size: 12px;
  color: #6b7280;
}
</style>

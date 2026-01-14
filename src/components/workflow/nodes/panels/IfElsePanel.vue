<template>
  <div class="wf-panel-block">
    <InputParameters
      :node-id="id"
      :parameters="inputs.parameters || []"
      @change="(list) => setInputs({ parameters: list })"
    />

    <Split />

    <Field title="条件分支">
      <template #operations>
        <AddButton @click="handleAddCase" />
      </template>
      <div class="wf-conditions">
        <div v-for="(caseItem, caseIndex) in cases" :key="caseItem.case_id" class="wf-case">
          <div class="wf-case__header">
            <span class="wf-case__title">IF {{ caseIndex > 0 ? `(分支 ${caseIndex + 1})` : '' }}</span>
            <RemoveButton v-if="cases.length > 1" @click="() => handleRemoveCase(caseIndex)" />
          </div>

          <div v-for="(condition, conditionIndex) in caseItem.conditions" :key="condition.id">
            <div v-if="conditionIndex > 0" class="wf-condition-divider">
              <span class="wf-condition-divider__line"></span>
              <el-select
                :model-value="caseItem.logical_operator"
                size="small"
                class="wf-logic"
                @change="(value: LogicalOperator) => handleLogicalOperatorChange(caseIndex, value)"
              >
                <el-option v-for="option in logicalOperatorOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
              <span class="wf-condition-divider__line"></span>
            </div>

            <div class="wf-condition-row">
              <VarReferencePicker
                :node-id="id"
                :model-value="condition.variable_selector || []"
                :available-vars="availableVars"
                class="wf-condition-input"
                @change="(value: string[] | string) => handleConditionChange(caseIndex, conditionIndex, { variable_selector: value as string[] })"
              />
              <el-select
                :model-value="condition.comparison_operator"
                class="wf-condition-operator"
                @change="(value: ComparisonOperator) => handleConditionChange(caseIndex, conditionIndex, { comparison_operator: value })"
              >
                <el-option v-for="option in comparisonOperatorOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
              <RemoveButton
                v-if="caseItem.conditions.length > 1"
                @click="() => handleRemoveCondition(caseIndex, conditionIndex)"
              />
            </div>
          </div>

          <el-button text class="wf-add-condition" @click="() => handleAddCondition(caseIndex)">
            + 添加条件
          </el-button>
        </div>

        <div v-if="cases.length === 0" class="wf-empty">
          点击上方按钮添加条件分支
        </div>
      </div>
    </Field>

    <div class="wf-else">ELSE（不满足以上条件时执行）</div>

    <Split />

    <div class="wf-hint">
      提示：条件分支节点会根据条件判断结果，将流程分发到不同的分支。满足条件的分支会继续执行，不满足则走 ELSE 分支。
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef, inject, type Ref } from 'vue'
import { v4 as uuid } from 'uuid'
import Field from '../base/Field.vue'
import Split from '../base/Split.vue'
import InputParameters from '../base/InputParameters.vue'
import AddButton from '../base/AddButton.vue'
import RemoveButton from '../base/RemoveButton.vue'
import VarReferencePicker from '../base/VarReferencePicker.vue'
import { useNodeData } from '../../../../composables/useNodeData'
import type { IfElseNodeType, ConditionCase, Condition } from '../../../../types/node-config'
import { ComparisonOperator, LogicalOperator } from '../../../../types/node-config'
import type { Node, Edge, Var } from '../../../../types/workflow'
import { BlockEnum, VarType } from '../../../../types/workflow'

const props = defineProps<{
  id: string
  data: IfElseNodeType
}>()

const { inputs, setInputs } = useNodeData<IfElseNodeType>(props.id, toRef(props, 'data'))

const workflowNodes = inject<Ref<Node[]>>('workflowNodes')
const workflowEdges = inject<Ref<Edge[]>>('workflowEdges')

const logicalOperatorOptions = [
  { label: 'AND', value: LogicalOperator.and },
  { label: 'OR', value: LogicalOperator.or },
]

const comparisonOperatorOptions = [
  { label: '等于', value: ComparisonOperator.equal },
  { label: '不等于', value: ComparisonOperator.notEqual },
  { label: '包含', value: ComparisonOperator.contains },
  { label: '不包含', value: ComparisonOperator.notContains },
  { label: '以...开头', value: ComparisonOperator.startWith },
  { label: '以...结尾', value: ComparisonOperator.endWith },
  { label: '为空', value: ComparisonOperator.isEmpty },
  { label: '不为空', value: ComparisonOperator.isNotEmpty },
  { label: '大于', value: ComparisonOperator.greaterThan },
  { label: '小于', value: ComparisonOperator.lessThan },
  { label: '大于等于', value: ComparisonOperator.greaterThanOrEqual },
  { label: '小于等于', value: ComparisonOperator.lessThanOrEqual },
]

const cases = computed(() => inputs.value.cases || [])

type AvailableVarGroup = {
  nodeId: string
  nodeName: string
  vars: Var[]
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
      typeLabel:
        outputs[key]?.dataType || outputs[key]?.type || outputs[key]?.value_type || 'String',
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

const mapTypeLabelToVarType = (label?: string) => {
  if (!label) return VarType.any
  const key = label.toLowerCase()
  if (key === 'string') return VarType.string
  if (key === 'number') return VarType.number
  if (key === 'boolean') return VarType.boolean
  if (key === 'object') return VarType.object
  if (key === 'array') return VarType.array
  return VarType.any
}

const availableVars = computed<AvailableVarGroup[]>(() => {
  if (!workflowNodes?.value || !workflowEdges?.value) return []
  const upstreamNodeIds = new Set(getUpstreamNodeIds(props.id, workflowEdges.value))
  const groups: AvailableVarGroup[] = []

  for (const node of workflowNodes.value) {
    const data = node.data as Record<string, any> | undefined
    if (!data) continue

    if (data.type !== BlockEnum.Start && !upstreamNodeIds.has(node.id)) continue

    const vars: Var[] = []
    if (data.type === BlockEnum.Start) {
      const parameters = data.parameters as Array<{ name?: string; dataType?: string }> | undefined
      if (Array.isArray(parameters)) {
        for (const param of parameters) {
          if (!param?.name) continue
          vars.push({
            variable: param.name,
            type: mapTypeLabelToVarType(param.dataType),
          })
        }
      }
    } else {
      const outputs = collectOutputNames(data)
      for (const output of outputs) {
        vars.push({
          variable: output.name,
          type: mapTypeLabelToVarType(output.typeLabel),
        })
      }
    }

    if (!vars.length) continue
    groups.push({
      nodeId: node.id,
      nodeName: (data.title as string) || node.id,
      vars,
    })
  }

  return groups
})

const handleAddCase = () => {
  const next = [...(inputs.value.cases || [])]
  const newCase: ConditionCase = {
    case_id: uuid(),
    logical_operator: LogicalOperator.and,
    conditions: [
      {
        id: uuid(),
        variable_selector: [],
        comparison_operator: ComparisonOperator.equal,
        value: '',
      },
    ],
  }
  next.push(newCase)
  setInputs({ cases: next })
}

const handleRemoveCase = (caseIndex: number) => {
  const next = [...(inputs.value.cases || [])]
  next.splice(caseIndex, 1)
  setInputs({ cases: next })
}

const handleAddCondition = (caseIndex: number) => {
  const next = [...(inputs.value.cases || [])]
  const target = next[caseIndex]
  if (!target) return
  target.conditions.push({
    id: uuid(),
    variable_selector: [],
    comparison_operator: ComparisonOperator.equal,
    value: '',
  })
  setInputs({ cases: next })
}

const handleRemoveCondition = (caseIndex: number, conditionIndex: number) => {
  const next = [...(inputs.value.cases || [])]
  if (!next[caseIndex]) return
  next[caseIndex].conditions.splice(conditionIndex, 1)
  setInputs({ cases: next })
}

const handleConditionChange = (caseIndex: number, conditionIndex: number, patch: Partial<Condition>) => {
  const next = [...(inputs.value.cases || [])]
  const target = next[caseIndex]
  if (!target || !target.conditions[conditionIndex]) return
  target.conditions[conditionIndex] = { ...target.conditions[conditionIndex], ...patch }
  setInputs({ cases: next })
}

const handleLogicalOperatorChange = (caseIndex: number, value: LogicalOperator) => {
  const next = [...(inputs.value.cases || [])]
  if (!next[caseIndex]) return
  next[caseIndex].logical_operator = value
  setInputs({ cases: next })
}
</script>

<style scoped>
.wf-panel-block {
  padding: 12px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wf-conditions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wf-case {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wf-case__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wf-case__title {
  font-weight: 600;
  font-size: 13px;
  color: #2563eb;
}

.wf-condition-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}

.wf-condition-divider__line {
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.wf-condition-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 140px auto;
  gap: 8px;
  align-items: center;
}

.wf-condition-operator {
  width: 140px;
}

.wf-add-condition {
  align-self: flex-start;
  font-size: 13px;
}

.wf-else {
  padding: 10px 12px;
  background: #f3f4f6;
  border-radius: 10px;
  font-size: 12px;
  color: #6b7280;
}

.wf-hint {
  padding: 10px 12px;
  background: #fef3c7;
  border-radius: 10px;
  font-size: 12px;
  color: #92400e;
}

.wf-empty {
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}
</style>

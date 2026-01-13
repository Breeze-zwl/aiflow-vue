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
              <el-input
                v-if="needsValue(condition.comparison_operator)"
                :model-value="condition.value"
                placeholder="值"
                class="wf-condition-value"
                @input="(value: string) => handleConditionChange(caseIndex, conditionIndex, { value })"
              />
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
import { computed, toRef } from 'vue'
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

const props = defineProps<{
  id: string
  data: IfElseNodeType
}>()

const { inputs, setInputs } = useNodeData<IfElseNodeType>(props.id, toRef(props, 'data'))

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

const needsValue = (operator: ComparisonOperator) => {
  return ![
    ComparisonOperator.isEmpty,
    ComparisonOperator.isNotEmpty,
    ComparisonOperator.isNull,
    ComparisonOperator.isNotNull,
  ].includes(operator)
}

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
  grid-template-columns: minmax(0, 1fr) 140px 140px auto;
  gap: 8px;
  align-items: center;
}

.wf-condition-operator,
.wf-condition-value {
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

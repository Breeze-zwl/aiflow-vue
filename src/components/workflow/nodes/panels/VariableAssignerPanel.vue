<template>
  <div>
    <div class="wf-panel-block">
      <Field title="变量赋值" required>
        <template #operations>
          <AddButton @click="handleAddVariable" />
        </template>
        <VarList :node-id="id" :list="variables" @change="handleVariablesChange" />
      </Field>

      <Split />

      <Field title="输出类型" tooltip="选择输出变量的数据类型">
        <el-select :model-value="outputType" @change="(value: 'object' | 'array' | 'string') => handleOutputTypeChange(value)">
          <el-option v-for="option in outputTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </Field>

      <div class="wf-hint">
        提示：变量赋值节点用于将上游节点的输出变量重新组织并赋值给新的变量名，便于在下游节点中使用统一的变量名称。
      </div>
    </div>

    <Split />

    <OutputVars>
      <VarItem name="output" :type="outputType" description="组合后的输出变量" />
    </OutputVars>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Field from '../base/Field.vue'
import Split from '../base/Split.vue'
import VarList from '../base/VarList.vue'
import AddButton from '../base/AddButton.vue'
import OutputVars from '../base/OutputVars.vue'
import VarItem from '../base/VarItem.vue'
import { useNodeData } from '@/composables/useNodeData'
import type { VariableAssignerNodeType } from '@/types/node-config'
import type { Variable } from '@/types/workflow'

const props = defineProps<{
  id: string
  data: VariableAssignerNodeType
}>()

const { inputs, setInputs } = useNodeData<VariableAssignerNodeType>(props.id, props.data)

const outputTypeOptions = [
  { label: '对象 (Object)', value: 'object' },
  { label: '数组 (Array)', value: 'array' },
  { label: '字符串 (String)', value: 'string' },
]

const variables = computed(() => inputs.value.variables || [])
const outputType = computed(() => inputs.value.output_type || 'object')

const handleVariablesChange = (list: Variable[]) => setInputs({ variables: list })

const handleAddVariable = () => {
  const list = [...(inputs.value.variables || [])]
  list.push({
    variable: '',
    label: '',
    value_selector: [],
    required: false,
  })
  setInputs({ variables: list })
}

const handleOutputTypeChange = (value: 'object' | 'array' | 'string') => {
  setInputs({ output_type: value })
}
</script>

<style scoped>
.wf-panel-block {
  padding: 12px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wf-hint {
  padding: 10px 12px;
  background: #ecfccb;
  border-radius: 10px;
  font-size: 12px;
  color: #3f6212;
}
</style>

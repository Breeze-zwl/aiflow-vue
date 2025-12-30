<template>
  <div class="wf-panel-block">
    <Field title="输出变量" required>
      <template #operations>
        <AddButton @click="handleAddVariable" />
      </template>
      <VarList :node-id="id" :list="outputs" @change="handleVarListChange" />
    </Field>
    <div class="wf-hint">
      结束节点用于定义工作流的输出变量。将上游节点的输出映射到最终输出。
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Field from '../base/Field.vue'
import AddButton from '../base/AddButton.vue'
import VarList from '../base/VarList.vue'
import { useNodeData } from '@/composables/useNodeData'
import type { EndNodeType } from '@/types/node-config'
import type { Variable } from '@/types/workflow'

const props = defineProps<{
  id: string
  data: EndNodeType
}>()

const { inputs, setInputs } = useNodeData<EndNodeType>(props.id, props.data)

const outputs = computed(() => inputs.value.outputs || [])

const handleVarListChange = (list: Variable[]) => {
  setInputs({ outputs: list })
}

const handleAddVariable = () => {
  const newList = [...(inputs.value.outputs || [])]
  newList.push({
    variable: '',
    label: '',
    value_selector: [],
    required: false,
  })
  setInputs({ outputs: newList })
}
</script>

<style scoped>
.wf-panel-block {
  padding: 12px 16px 20px;
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

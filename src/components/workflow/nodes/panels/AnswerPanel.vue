<template>
  <div class="wf-panel-block">
    <InputParameters
      :node-id="id"
      :parameters="inputs.parameters || []"
      @change="(list) => setInputs({ parameters: list })"
    />

    <Split />

    <Field title="回复内容" required tooltip="配置直接回复给用户的内容，可使用变量">
      <el-input
        type="textarea"
        :rows="6"
        :model-value="inputs.answer || ''"
        placeholder="输入回复内容，可使用 {{变量名}} 引用上游节点的输出"
        @input="(value: string) => handleAnswerChange(value)"
      />
      <p class="wf-hint-text">使用 {{ '{' }}{{ '变量名' }}{{ '}' }} 引用上游节点的输出变量</p>
    </Field>

    <Split />

    <div class="wf-hint">
      提示：直接回复节点会将配置的内容直接返回给用户，适用于固定回复或模板化回复场景。
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import Field from '../base/Field.vue'
import Split from '../base/Split.vue'
import InputParameters from '../base/InputParameters.vue'
import { useNodeData } from '../../../../composables/useNodeData'
import type { AnswerNodeType } from '../../../../types/node-config'

const props = defineProps<{
  id: string
  data: AnswerNodeType
}>()

const { inputs, setInputs } = useNodeData<AnswerNodeType>(props.id, toRef(props, 'data'))

const handleAnswerChange = (value: string) => {
  setInputs({ answer: value })
}
</script>

<style scoped>
.wf-panel-block {
  padding: 12px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wf-hint-text {
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.wf-hint {
  padding: 10px 12px;
  background: #ffedd5;
  border-radius: 10px;
  font-size: 12px;
  color: #9a3412;
}
</style>

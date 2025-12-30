<template>
  <div>
    <div class="wf-panel-block">
      <Field title="输入变量">
        <template #operations>
          <AddButton @click="handleAddVariable" />
        </template>
        <VarList :node-id="id" :list="variables" @change="handleVarListChange" />
      </Field>

      <Split />

      <CodeEditor
        :value="code"
        :language="language"
        :min-height="250"
        @change="handleCodeChange"
      >
        <template #title>
          <TypeSelector
            :options="codeLanguages"
            :value="language"
            @change="handleLanguageChange"
          />
        </template>
      </CodeEditor>
    </div>

    <Split />

    <div class="wf-panel-block">
      <Field title="输出变量" required>
        <template #operations>
          <AddButton @click="handleAddOutputVariable" />
        </template>
        <div class="wf-output-list">
          <div v-for="(value, key) in outputs" :key="key" class="wf-output-row">
            <el-input
              :model-value="key"
              placeholder="变量名"
              @input="(val: string) => handleOutputKeyChange(key, val)"
            />
            <el-select
              :model-value="value.type"
              class="wf-output-type"
              @change="(val: string) => handleOutputTypeChange(key, val)"
            >
              <el-option v-for="option in varTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
            <RemoveButton @click="() => handleRemoveOutputVariable(key)" />
          </div>
          <div v-if="Object.keys(outputs).length === 0" class="wf-empty">
            暂无输出变量，点击添加
          </div>
        </div>
      </Field>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Field from '../base/Field.vue'
import Split from '../base/Split.vue'
import VarList from '../base/VarList.vue'
import AddButton from '../base/AddButton.vue'
import RemoveButton from '../base/RemoveButton.vue'
import CodeEditor from '../base/CodeEditor.vue'
import TypeSelector from '../base/TypeSelector.vue'
import { useNodeData } from '@/composables/useNodeData'
import type { CodeNodeType } from '@/types/node-config'
import { CodeLanguage } from '@/types/node-config'
import { VarType } from '@/types/workflow'
import type { Variable } from '@/types/workflow'

const props = defineProps<{
  id: string
  data: CodeNodeType
}>()

const { inputs, setInputs } = useNodeData<CodeNodeType>(props.id, props.data)

const codeLanguages = [
  { label: 'Python3', value: CodeLanguage.python3 },
  { label: 'JavaScript', value: CodeLanguage.javascript },
]

const varTypeOptions = [
  { label: 'String', value: VarType.string },
  { label: 'Number', value: VarType.number },
  { label: 'Boolean', value: VarType.boolean },
  { label: 'Object', value: VarType.object },
  { label: 'Array', value: VarType.array },
]

const defaultPythonCode = `def main(arg1: str, arg2: int) -> dict:\n    \"\"\"\n    处理输入并返回结果\n    \"\"\"\n    result = {\n        \"output\": f\"Hello {arg1}, your number is {arg2}\"\n    }\n    return result\n`

const defaultJsCode = "function main({ arg1, arg2 }) {\\n    // 处理输入并返回结果\\n    return {\\n        output: `Hello ${arg1}, your number is ${arg2}`\\n    };\\n}\\n"

type OutputVarRecord = Record<string, { type: VarType; children: null }>

const language = computed(() => inputs.value.code_language || CodeLanguage.python3)
const code = computed(() => {
  if (inputs.value.code) return inputs.value.code
  return language.value === CodeLanguage.python3 ? defaultPythonCode : defaultJsCode
})

const variables = computed(() => inputs.value.variables || [])
const outputs = computed<OutputVarRecord>(() => (inputs.value.outputs || {}) as OutputVarRecord)

const handleLanguageChange = (value: string) => {
  setInputs({ code_language: value as CodeLanguage })
  if (!inputs.value.code) {
    setInputs({
      code: value === CodeLanguage.python3 ? defaultPythonCode : defaultJsCode,
    })
  }
}

const handleCodeChange = (value: string) => {
  setInputs({ code: value })
}

const handleVarListChange = (list: Variable[]) => {
  setInputs({ variables: list })
}

const handleAddVariable = () => {
  const newList = [...(inputs.value.variables || [])]
  newList.push({
    variable: '',
    label: '',
    value_selector: [],
    required: false,
  })
  setInputs({ variables: newList })
}

const handleOutputsChange = (value: OutputVarRecord) => {
  setInputs({ outputs: value })
}

const handleOutputTypeChange = (key: string, type: string) => {
  if (!outputs.value[key]) return
  handleOutputsChange({
    ...outputs.value,
    [key]: { ...outputs.value[key], type: type as VarType },
  })
}

const handleOutputKeyChange = (oldKey: string, newKey: string) => {
  const updated = { ...outputs.value }
  if (!updated[oldKey]) return
  updated[newKey.replace(/\s/g, '_')] = updated[oldKey]
  delete updated[oldKey]
  handleOutputsChange(updated)
}

const handleAddOutputVariable = () => {
  const updated = { ...outputs.value }
  const baseKey = 'output'
  let key = baseKey
  let count = 1
  while (updated[key]) {
    key = `${baseKey}_${count}`
    count += 1
  }
  updated[key] = { type: VarType.string, children: null }
  handleOutputsChange(updated)
}

const handleRemoveOutputVariable = (key: string) => {
  const updated = { ...outputs.value }
  if (!updated[key]) return
  delete updated[key]
  handleOutputsChange(updated)
}
</script>

<style scoped>
.wf-panel-block {
  padding: 12px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wf-output-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wf-output-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 140px auto;
  gap: 8px;
  align-items: center;
}

.wf-output-type {
  width: 140px;
}

.wf-empty {
  padding: 16px 0;
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}
</style>

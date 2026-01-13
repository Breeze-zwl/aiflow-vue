<template>
  <div>
    <div class="wf-panel-block">
      <InputParameters
        :node-id="id"
        :parameters="inputs.parameters || []"
        @change="(list) => setInputs({ parameters: list })"
      />

      <Split />

      <Field title="模型配置" required>
        <div class="wf-grid">
          <div>
            <label class="wf-field-label">模型</label>
            <el-select
              :model-value="model.name"
              @change="(value: string) => handleModelChanged({ name: value })"
            >
              <el-option
                v-for="option in modelOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
          <div>
            <label class="wf-field-label">Temperature</label>
            <el-input
              type="number"
              :model-value="model.completion_params?.temperature ?? 0.7"
              min="0"
              max="2"
              step="0.1"
              @input="(value: string) => handleCompletionParamsChange({ temperature: Number(value) })"
            />
          </div>
        </div>
        <div class="wf-grid">
          <div>
            <label class="wf-field-label">Top P</label>
            <el-input
              type="number"
              :model-value="model.completion_params?.top_p ?? 1"
              min="0"
              max="1"
              step="0.05"
              @input="(value: string) => handleCompletionParamsChange({ top_p: Number(value) })"
            />
          </div>
          <div>
            <label class="wf-field-label">Top K</label>
            <el-input
              type="number"
              :model-value="model.completion_params?.top_k ?? 50"
              min="0"
              max="200"
              step="1"
              @input="(value: string) => handleCompletionParamsChange({ top_k: Number(value) })"
            />
          </div>
        </div>
      </Field>

      <Field title="系统提示词" tooltip="设置 AI 的角色和行为规范">
        <el-input
          type="textarea"
          :rows="4"
          placeholder="你是一个有帮助的 AI 助手..."
          :model-value="systemPrompt"
          @input="(value: string) => handleSystemPromptChange(value)"
        />
      </Field>
      <Split />

      <Field title="输出变量" required>
        <div class="wf-output-row">
          <el-select
            :model-value="outputType"
            placeholder="选择输出类型"
            @change="handleOutputTypeChange"
          >
            <el-option label="文本" value="text" />
            <el-option label="JSON" value="json" />
          </el-select>
          <el-button
            v-if="outputType"
            text
            size="small"
            @click="handleOutputEdit"
          >
            编辑
          </el-button>
        </div>
        <div v-if="outputSummary" class="wf-output-summary">
          <span class="wf-output-summary__name">{{ outputSummary.name }}</span>
          <span class="wf-output-summary__value">{{
            outputSummary.defaultValue
          }}</span>
        </div>
      </Field>
      <div class="wf-output-spacer"></div>
    </div>

    <el-dialog
      v-model="outputDialogVisible"
      :title="outputDialogTitle"
      width="720px"
    >
      <template v-if="outputType === 'text'">
        <div class="wf-output-form">
          <div class="wf-output-field">
            <label class="wf-field-label">变量名</label>
            <el-input v-model="outputForm.name" placeholder="output" />
          </div>
          <div class="wf-output-field">
            <label class="wf-field-label">变量类型</label>
            <el-input :model-value="outputForm.dataType" disabled />
          </div>
          <div class="wf-output-field">
            <label class="wf-field-label">描述</label>
            <el-input
              v-model="outputForm.description"
              placeholder="请输入变量的作用的描述语句"
            />
          </div>
          <div class="wf-output-field">
            <label class="wf-field-label">默认值</label>
            <el-input v-model="outputForm.defaultValue" placeholder="默认值" />
          </div>
        </div>
      </template>
      <template v-else>
        <JsonOutputEditor v-model="jsonFields" />
      </template>
      <template #footer>
        <el-button @click="outputDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleOutputSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, toRef } from 'vue'
import Field from '../base/Field.vue'
import Split from '../base/Split.vue'
import InputParameters from '../base/InputParameters.vue'
import JsonOutputEditor from '../base/JsonOutputEditor.vue'
import { useNodeData } from '../../../../composables/useNodeData'
import type {
  LLMNodeType,
  ModelConfig,
  PromptItem,
} from '../../../../types/node-config'

const props = defineProps<{
  id: string
  data: LLMNodeType
}>()

const { inputs, setInputs } = useNodeData<LLMNodeType>(
  props.id,
  toRef(props, 'data')
)

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

const model = computed<ModelConfig>(() => {
  return (
    inputs.value.model || {
      provider: 'openai',
      name: 'gpt-4',
      completion_params: {},
    }
  )
})

const promptTemplate = computed<PromptItem[]>(() => {
  if (Array.isArray(inputs.value.prompt_template)) {
    return inputs.value.prompt_template
  }
  if (inputs.value.prompt_template) {
    return [inputs.value.prompt_template]
  }
  return [
    { role: 'system', text: '' },
    { role: 'user', text: '' },
  ]
})

const systemPrompt = computed(
  () => promptTemplate.value.find((item) => item.role === 'system')?.text || ''
)
const outputType = computed(() => inputs.value.output_type || '')
const outputConfig = computed(() => inputs.value.output_variable || {})
const outputDialogVisible = ref(false)
const outputDialogTitle = computed(() =>
  outputType.value === 'json' ? 'JSON 输出' : '文本输出'
)
const outputForm = reactive({
  name: '',
  dataType: 'String',
  description: '',
  defaultValue: '',
})
const jsonFields = ref<any[]>([])
const outputSummary = computed(() => {
  const config = outputConfig.value || {}
  if (!config.name && !config.defaultValue) return null
  return {
    name: config.name || 'output',
    defaultValue: config.defaultValue || '-',
  }
})

const handleModelChanged = (patch: Partial<ModelConfig>) => {
  setInputs({
    model: {
      ...model.value,
      ...patch,
    },
  })
}

const handleCompletionParamsChange = (params: Record<string, any>) => {
  setInputs({
    model: {
      ...model.value,
      completion_params: {
        ...model.value.completion_params,
        ...params,
      },
    },
  })
}

const handlePromptChange = (prompt: PromptItem[] | PromptItem) => {
  setInputs({ prompt_template: prompt })
}

const handleSystemPromptChange = (text: string) => {
  const updated = promptTemplate.value.map((item) =>
    item.role === 'system' ? { ...item, text } : item
  )
  if (!updated.find((item) => item.role === 'system')) {
    updated.unshift({ role: 'system', text })
  }
  handlePromptChange(updated)
}

const syncOutputForm = () => {
  const current = outputConfig.value || {}
  outputForm.name = current.name || 'output'
  outputForm.dataType = current.dataType || 'String'
  outputForm.description = current.description || ''
  outputForm.defaultValue = current.defaultValue || ''
}

const openOutputDialog = (nextType?: string) => {
  const type = nextType || outputType.value
  if (!type) return
  if (type === 'text') {
    syncOutputForm()
  } else if (type === 'json') {
    jsonFields.value = Array.isArray(outputConfig.value?.children)
      ? JSON.parse(JSON.stringify(outputConfig.value.children))
      : []
  }
  outputDialogVisible.value = true
}

const handleOutputTypeChange = (value: 'text' | 'json') => {
  setInputs({ output_type: value })
  openOutputDialog(value)
}

const handleOutputEdit = () => {
  openOutputDialog()
}

const handleOutputSave = () => {
  if (outputType.value === 'text') {
    setInputs({
      output_variable: {
        name: outputForm.name,
        dataType: outputForm.dataType,
        description: outputForm.description,
        defaultValue: outputForm.defaultValue,
      },
    })
    jsonFields.value = []
  } else if (outputType.value === 'json') {
    setInputs({
      output_variable: {
        name: outputConfig.value?.name || 'json',
        dataType: 'Object',
        children: jsonFields.value,
      },
    })
    outputForm.name = ''
    outputForm.dataType = 'String'
    outputForm.description = ''
    outputForm.defaultValue = ''
  }
  outputDialogVisible.value = false
}
</script>

<style scoped>
.wf-panel-block {
  padding: 12px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wf-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.wf-field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #6b7280;
}

.wf-output-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wf-output-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wf-output-empty {
  min-height: 120px;
}

.wf-output-summary {
  margin-top: 10px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

.wf-output-summary__name {
  font-weight: 600;
  color: #111827;
}

.wf-output-summary__value {
  color: #64748b;
}

.wf-output-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wf-output-row :deep(.el-select) {
  flex: 1;
}

.wf-output-spacer {
  height: 30px;
  border-top: 1px solid var(--el-border-color);
}
</style>

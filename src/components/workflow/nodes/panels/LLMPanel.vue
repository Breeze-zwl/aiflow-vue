<template>
  <div>
    <div class="wf-panel-block">
      <Field title="模型配置" required>
        <div class="wf-grid">
          <div>
            <label class="wf-field-label">提供商</label>
            <el-select :model-value="model.provider" @change="(value: string) => handleModelChanged({ provider: value })">
              <el-option v-for="option in providerOptions" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </div>
          <div>
            <label class="wf-field-label">模型</label>
            <el-select :model-value="model.name" @change="(value: string) => handleModelChanged({ name: value })">
              <el-option v-for="option in modelOptions" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </div>
        </div>
        <div class="wf-grid">
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
          <div>
            <label class="wf-field-label">Max Tokens</label>
            <el-input
              type="number"
              :model-value="model.completion_params?.max_tokens ?? 2048"
              min="1"
              max="128000"
              @input="(value: string) => handleCompletionParamsChange({ max_tokens: Number(value) })"
            />
          </div>
        </div>
      </Field>

      <Field title="上下文" tooltip="选择作为上下文的变量">
        <VarReferencePicker
          :node-id="id"
          :model-value="inputs.context?.variable_selector || []"
          placeholder="选择上下文变量"
          @change="(value: string[] | string) => handleContextChange({ enabled: true, variable_selector: value as string[] })"
        />
      </Field>

      <Split />

      <Field title="系统提示词" tooltip="设置 AI 的角色和行为规范">
        <el-input
          type="textarea"
          :rows="4"
          placeholder="你是一个有帮助的 AI 助手..."
          :model-value="systemPrompt"
          @input="(value: string) => handleSystemPromptChange(value)"
        />
      </Field>

      <Field title="用户提示词" tooltip="定义用户输入的模板，可使用变量">
        <el-input
          type="textarea"
          :rows="4"
          placeholder="请根据以下内容回答问题：{{context}}\n\n问题：{{query}}"
          :model-value="userPrompt"
          @input="(value: string) => handleUserPromptChange(value)"
        />
        <p class="wf-hint-text">使用 {{ '{' }}{{ '变量名' }}{{ '}' }} 引用上游节点的输出</p>
      </Field>

      <Split />

      <Field title="高级设置">
        <div class="wf-toggle-row">
          <div>
            <p class="wf-toggle-title">启用对话记忆</p>
            <p class="wf-muted">保留历史对话上下文</p>
          </div>
          <el-switch
            :model-value="inputs.memory?.window?.enabled || false"
            @change="(value: boolean) => handleMemoryChange({ ...inputs.memory, window: { enabled: value, size: inputs.memory?.window?.size || 10 } })"
          />
        </div>
        <div class="wf-toggle-row">
          <div>
            <p class="wf-toggle-title">启用视觉能力</p>
            <p class="wf-muted">支持图片输入分析</p>
          </div>
          <el-switch
            :model-value="inputs.vision?.enabled || false"
            @change="(value: boolean) => handleVisionChange(value)"
          />
        </div>
      </Field>
    </div>

    <Split />

    <OutputVars>
      <VarItem name="text" type="string" description="模型生成的文本内容" />
      <VarItem name="reasoning_content" type="string" description="推理过程内容（如支持）" />
      <VarItem name="usage" type="object" description="Token 使用量统计" />
    </OutputVars>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Field from '../base/Field.vue'
import Split from '../base/Split.vue'
import OutputVars from '../base/OutputVars.vue'
import VarItem from '../base/VarItem.vue'
import VarReferencePicker from '../base/VarReferencePicker.vue'
import { useNodeData } from '@/composables/useNodeData'
import type { LLMNodeType, ModelConfig, PromptItem } from '@/types/node-config'

const props = defineProps<{
  id: string
  data: LLMNodeType
}>()

const { inputs, setInputs } = useNodeData<LLMNodeType>(props.id, props.data)

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

const providerOptions = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Anthropic', value: 'anthropic' },
  { label: 'Qwen', value: 'qwen' },
  { label: 'DeepSeek', value: 'deepseek' },
  { label: 'Azure OpenAI', value: 'azure' },
]

const model = computed<ModelConfig>(() => {
  return inputs.value.model || { provider: 'openai', name: 'gpt-4', completion_params: {} }
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

const systemPrompt = computed(() => promptTemplate.value.find((item) => item.role === 'system')?.text || '')
const userPrompt = computed(() => promptTemplate.value.find((item) => item.role === 'user')?.text || '')

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

const handleMemoryChange = (memory: LLMNodeType['memory']) => {
  setInputs({ memory })
}

const handleVisionChange = (enabled: boolean) => {
  setInputs({
    vision: {
      ...inputs.value.vision,
      enabled,
    },
  })
}

const handleContextChange = (context: LLMNodeType['context']) => {
  setInputs({ context })
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

const handleUserPromptChange = (text: string) => {
  const updated = promptTemplate.value.map((item) =>
    item.role === 'user' ? { ...item, text } : item
  )
  if (!updated.find((item) => item.role === 'user')) {
    updated.push({ role: 'user', text })
  }
  handlePromptChange(updated)
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

.wf-hint-text {
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.wf-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.wf-toggle-title {
  margin: 0;
  font-size: 13px;
  color: #374151;
}

.wf-muted {
  margin: 4px 0 0;
  font-size: 12px;
  color: #9ca3af;
}
</style>

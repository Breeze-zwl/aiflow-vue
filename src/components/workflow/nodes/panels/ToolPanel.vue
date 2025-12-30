<template>
  <div>
    <div class="wf-panel-block">
      <Field title="选择工具" required>
        <el-select :model-value="toolName" @change="handleToolSelect">
          <el-option v-for="tool in availableTools" :key="tool.value" :label="tool.label" :value="tool.value" />
        </el-select>
      </Field>

      <div v-if="toolName" class="wf-tool-card">
        <div class="wf-tool-card__icon">
          <el-icon><Tools /></el-icon>
        </div>
        <div>
          <div class="wf-tool-card__name">{{ toolLabel }}</div>
          <div class="wf-tool-card__provider">{{ inputs.provider_name }}</div>
        </div>
      </div>

      <Split v-if="toolName" />

      <Field v-if="toolName" title="工具参数">
        <div class="wf-panel-block__stack">
          <div v-if="parameters.length" class="wf-param" v-for="(param, index) in parameters" :key="index">
            <div class="wf-param__header">
              <span class="wf-param__name">
                {{ param.name }}
                <span v-if="param.required" class="wf-required">*</span>
              </span>
              <span class="wf-muted">{{ param.type }}</span>
            </div>
            <p v-if="param.description" class="wf-muted">{{ param.description }}</p>
            <VarReferencePicker
              :node-id="id"
              :model-value="param.variable_selector || []"
              placeholder="选择变量或输入值"
              @change="(value) => handleParameterChange(index, { variable_selector: value as string[] })"
            />
          </div>
          <div v-else class="wf-empty">此工具无需配置参数</div>
        </div>
      </Field>
    </div>

    <Split />

    <OutputVars>
      <VarItem name="text" type="string" description="工具返回的文本结果" />
      <VarItem name="json" type="object" description="工具返回的 JSON 数据（如有）" />
      <VarItem name="files" type="array" description="工具返回的文件列表（如有）" />
    </OutputVars>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Tools } from '@element-plus/icons-vue'
import Field from '../base/Field.vue'
import Split from '../base/Split.vue'
import OutputVars from '../base/OutputVars.vue'
import VarItem from '../base/VarItem.vue'
import VarReferencePicker from '../base/VarReferencePicker.vue'
import { useNodeData } from '@/composables/useNodeData'
import type { ToolNodeType } from '@/types/node-config'

const props = defineProps<{
  id: string
  data: ToolNodeType
}>()

const { inputs, setInputs } = useNodeData<ToolNodeType>(props.id, props.data)

const availableTools = [
  { label: 'Google 搜索', value: 'google_search', provider: 'google' },
  { label: 'Wikipedia', value: 'wikipedia', provider: 'wikipedia' },
  { label: '天气查询', value: 'weather', provider: 'weather' },
  { label: '计算器', value: 'calculator', provider: 'math' },
  { label: '网页抓取', value: 'web_scraper', provider: 'web' },
]

const toolName = computed(() => inputs.value.tool_name || '')
const toolLabel = computed(() => inputs.value.tool_label || '')
const parameters = computed(() => inputs.value.tool_parameters || [])

const handleToolSelect = (value: string) => {
  const tool = availableTools.find((item) => item.value === value)
  if (!tool) return
  setInputs({
    provider_id: tool.provider,
    provider_name: tool.provider,
    tool_name: tool.value,
    tool_label: tool.label,
  })
}

const handleParameterChange = (index: number, patch: Partial<ToolNodeType['tool_parameters'][number]>) => {
  const next = [...(inputs.value.tool_parameters || [])]
  if (!next[index]) return
  next[index] = { ...next[index], ...patch }
  setInputs({ tool_parameters: next })
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

.wf-tool-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #eff6ff;
  padding: 12px;
  border-radius: 12px;
}

.wf-tool-card__icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.wf-tool-card__name {
  font-weight: 600;
  color: #111827;
}

.wf-tool-card__provider {
  font-size: 12px;
  color: #6b7280;
}

.wf-param {
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wf-param__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wf-param__name {
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}

.wf-required {
  color: #ef4444;
  margin-left: 4px;
}

.wf-muted {
  font-size: 12px;
  color: #9ca3af;
}

.wf-empty {
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}
</style>

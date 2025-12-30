<template>
  <div>
    <div class="wf-panel-block">
      <Field title="输入变量">
        <template #operations>
          <AddButton @click="handleAddVariable" />
        </template>
        <VarList :node-id="id" :list="variables" @change="handleVariablesChange" />
      </Field>

      <Split />

      <Field title="模板" required tooltip="使用 Jinja2 语法编写模板">
        <el-input
          type="textarea"
          :rows="8"
          :model-value="template"
          class="wf-template"
          :placeholder="placeholderText"
          @input="(value: string) => handleTemplateChange(value)"
        />
        <div class="wf-template-hint">
          <p>Jinja2 语法提示：</p>
          <ul>
            <li>• {{ '{' }}{{ '变量名' }}{{ '}' }} - 输出变量值</li>
            <li>• {% raw %}{% for item in list %}{% endraw %} - 循环</li>
            <li>• {% raw %}{% if condition %}{% endraw %} - 条件判断</li>
            <li>• {{ '{' }}{{ 'value | filter' }}{{ '}' }} - 使用过滤器</li>
          </ul>
        </div>
      </Field>
    </div>

    <Split />

    <OutputVars>
      <VarItem name="output" type="string" description="模板转换后的结果" />
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
import type { TemplateTransformNodeType } from '@/types/node-config'
import type { Variable } from '@/types/workflow'

const props = defineProps<{
  id: string
  data: TemplateTransformNodeType
}>()

const { inputs, setInputs } = useNodeData<TemplateTransformNodeType>(props.id, props.data)

const variables = computed(() => inputs.value.variables || [])
const template = computed(() => inputs.value.template || '')

const placeholderText = `使用 Jinja2 语法编写模板，例如：\n\n你好，{{ name }}！\n\n{% for item in items %}\n- {{ item.title }}: {{ item.description }}\n{% endfor %}\n\n总计：{{ total }}`

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

const handleTemplateChange = (value: string) => setInputs({ template: value })
</script>

<style scoped>
.wf-panel-block {
  padding: 12px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wf-template :deep(.el-textarea__inner) {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
}

.wf-template-hint {
  margin-top: 8px;
  background: #f9fafb;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 12px;
  color: #6b7280;
}

.wf-template-hint ul {
  margin: 6px 0 0;
  padding-left: 14px;
}
</style>

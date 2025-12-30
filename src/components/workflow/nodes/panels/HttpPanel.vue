<template>
  <div>
    <div class="wf-panel-block">
      <Field title="请求配置" required>
        <div class="wf-inline">
          <el-select
            :model-value="method"
            class="wf-method"
          @change="(value: Method) => handleMethodChange(value)"
          >
            <el-option v-for="option in methodOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
          <el-input
            :model-value="url"
            placeholder="https://api.example.com/endpoint"
            @input="(value: string) => handleUrlChange(value)"
          />
        </div>
      </Field>

      <Field title="变量" tooltip="在 URL 或请求体中使用 {{变量名}} 引用">
        <template #operations>
          <AddButton @click="handleAddVariable" />
        </template>
        <VarList :node-id="id" :list="variables" @change="handleVarListChange" />
      </Field>

      <Split />

      <el-tabs v-model="activeTab" class="wf-tabs">
        <el-tab-pane label="查询参数" name="params">
          <el-input
            type="textarea"
            :rows="4"
            :model-value="params"
            placeholder="key1=value1\nkey2=value2"
            @input="(value: string) => handleParamsChange(value)"
          />
        </el-tab-pane>
        <el-tab-pane label="请求头" name="headers">
          <el-input
            type="textarea"
            :rows="4"
            :model-value="headers"
            placeholder="Content-Type: application/json\nAuthorization: Bearer {{token}}"
            @input="(value: string) => handleHeadersChange(value)"
          />
        </el-tab-pane>
        <el-tab-pane v-if="showBody" label="请求体" name="body">
          <div class="wf-body">
            <el-select
              :model-value="body.type"
              @change="(value: BodyType) => handleBodyChange({ ...body, type: value })"
            >
              <el-option v-for="option in bodyTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
            <el-input
              v-if="body.type !== BodyType.none"
              type="textarea"
              :rows="6"
              :model-value="body.data"
              :placeholder="bodyPlaceholder"
              @input="(value: string) => handleBodyChange({ ...body, data: value })"
            />
          </div>
        </el-tab-pane>
      </el-tabs>

      <Split />

      <Field title="认证">
        <el-select
          :model-value="authorization.type"
          @change="(value: AuthorizationType) => handleAuthorizationChange({ type: value })"
        >
          <el-option v-for="option in authTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
        <el-input
          v-if="authorization.type !== AuthorizationType.none"
          :model-value="authorization.config?.api_key || ''"
          :placeholder="authorization.type === AuthorizationType.bearer ? 'Bearer Token' : 'API Key'"
          @input="(value: string) => handleAuthorizationChange({ ...authorization, config: { ...authorization.config, api_key: value } })"
        />
      </Field>

      <Field title="超时设置">
        <div class="wf-timeout-grid">
          <div>
            <label class="wf-field-label">连接 (秒)</label>
            <el-input
              type="number"
              min="1"
              max="300"
              :model-value="timeout.connect || 10"
              @input="(value: string) => handleTimeoutChange({ ...timeout, connect: Number(value) })"
            />
          </div>
          <div>
            <label class="wf-field-label">读取 (秒)</label>
            <el-input
              type="number"
              min="1"
              max="600"
              :model-value="timeout.read || 60"
              @input="(value: string) => handleTimeoutChange({ ...timeout, read: Number(value) })"
            />
          </div>
          <div>
            <label class="wf-field-label">写入 (秒)</label>
            <el-input
              type="number"
              min="1"
              max="600"
              :model-value="timeout.write || 60"
              @input="(value: string) => handleTimeoutChange({ ...timeout, write: Number(value) })"
            />
          </div>
        </div>
      </Field>
    </div>

    <Split />

    <OutputVars>
      <VarItem name="body" type="string" description="响应体内容" />
      <VarItem name="status_code" type="number" description="HTTP 状态码" />
      <VarItem name="headers" type="object" description="响应头" />
    </OutputVars>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Field from '../base/Field.vue'
import Split from '../base/Split.vue'
import VarList from '../base/VarList.vue'
import AddButton from '../base/AddButton.vue'
import OutputVars from '../base/OutputVars.vue'
import VarItem from '../base/VarItem.vue'
import { useNodeData } from '@/composables/useNodeData'
import type { HttpNodeType } from '@/types/node-config'
import { Method, BodyType, AuthorizationType } from '@/types/node-config'
import type { Variable } from '@/types/workflow'

const props = defineProps<{
  id: string
  data: HttpNodeType
}>()

const { inputs, setInputs } = useNodeData<HttpNodeType>(props.id, props.data)

const methodOptions = [
  { label: 'GET', value: Method.get },
  { label: 'POST', value: Method.post },
  { label: 'PUT', value: Method.put },
  { label: 'PATCH', value: Method.patch },
  { label: 'DELETE', value: Method.delete },
  { label: 'HEAD', value: Method.head },
]

const bodyTypeOptions = [
  { label: '无', value: BodyType.none },
  { label: 'JSON', value: BodyType.json },
  { label: 'Form Data', value: BodyType.formData },
  { label: 'x-www-form-urlencoded', value: BodyType.xWwwFormUrlencoded },
  { label: 'Raw Text', value: BodyType.rawText },
]

const authTypeOptions = [
  { label: '无', value: AuthorizationType.none },
  { label: 'API Key', value: AuthorizationType.apiKey },
  { label: 'Bearer Token', value: AuthorizationType.bearer },
]

const activeTab = ref<'params' | 'headers' | 'body'>('params')

const method = computed(() => inputs.value.method || Method.get)
const url = computed(() => inputs.value.url || '')
const headers = computed(() => inputs.value.headers || '')
const params = computed(() => inputs.value.params || '')
const body = computed(() => inputs.value.body || { type: BodyType.none, data: '' })
const authorization = computed(() => inputs.value.authorization || { type: AuthorizationType.none })
const timeout = computed(() => inputs.value.timeout || {})
const variables = computed(() => inputs.value.variables || [])
const bodyPlaceholder = computed(() =>
  body.value.type === BodyType.json ? '{\\n  \"key\": \"value\"\\n}' : 'key=value'
)

const showBody = computed(() => [Method.post, Method.put, Method.patch].includes(method.value))

const handleMethodChange = (value: Method) => setInputs({ method: value })
const handleUrlChange = (value: string) => setInputs({ url: value })
const handleHeadersChange = (value: string) => setInputs({ headers: value })
const handleParamsChange = (value: string) => setInputs({ params: value })
const handleBodyChange = (value: HttpNodeType['body']) => setInputs({ body: value })
const handleAuthorizationChange = (value: HttpNodeType['authorization']) => setInputs({ authorization: value })
const handleTimeoutChange = (value: HttpNodeType['timeout']) => setInputs({ timeout: value })

const handleVarListChange = (list: Variable[]) => setInputs({ variables: list })
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
</script>

<style scoped>
.wf-panel-block {
  padding: 12px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wf-inline {
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr);
  gap: 10px;
}

.wf-method {
  width: 100px;
}

.wf-tabs {
  background: #ffffff;
}

.wf-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wf-timeout-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.wf-field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #6b7280;
}
</style>

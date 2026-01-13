<template>
  <div class="wf-panel-block">
    <Field title="输入字段">
      <template #operations>
        <AddButton @click="openEditorForAdd" />
      </template>
      <div class="wf-panel-block__stack">
        <template v-for="item in displayParameters" :key="item.key">
          <div class="wf-list-item">
            <div>
              <div class="wf-list-item__title">
                <span class="wf-mono">{{ item.param.name }}</span>
                <span class="wf-muted">{{
                  item.param.dataType || 'String'
                }}</span>
                <span v-if="item.param.required" class="wf-required"
                  >*必填</span
                >
              </div>
              <div v-if="item.param.defaultValue" class="wf-muted">
                {{ item.param.defaultValue }}
              </div>
            </div>
            <div class="wf-list-actions">
              <el-button
                v-if="item.editable"
                circle
                size="small"
                plain
                class="wf-icon-btn"
                @click="() => openEditorForEdit(item.index)"
              >
                <el-icon><EditPen /></el-icon>
              </el-button>
              <RemoveButton
                v-if="item.deletable"
                @click="() => handleRemoveParameter(item.index)"
              />
            </div>
          </div>

          <div
            v-if="editingIndex === item.index && item.editable"
            class="wf-inline-form wf-inline-form--inline"
          >
            <div v-if="editingIndex === systemParamIndex">
              <label class="wf-field-label">默认值</label>
              <template v-if="editorParam.dataType === 'File'">
                <div class="wf-file-field">
                  <input
                    ref="fileInputRef"
                    class="wf-file-input"
                    type="file"
                    @change="handleFileChange"
                  />
                  <el-button type="primary" @click="triggerFilePick">上传文件</el-button>
                  <span v-if="editorParam.defaultValue" class="wf-muted">
                    {{ editorParam.defaultValue }}
                  </span>
                </div>
              </template>
              <template v-else>
                <el-input
                  v-model="editorParam.defaultValue"
                  placeholder="默认值"
                />
              </template>
            </div>
            <template v-else>
              <div class="wf-inline-grid">
                <div>
                  <label class="wf-field-label">类型</label>
                  <el-select v-model="editorParam.dataType">
                    <el-option
                      v-for="option in varTypeOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </div>
                <div class="wf-inline-switch">
                  <el-switch v-model="editorParam.required" />
                  <span class="wf-muted">必填</span>
                </div>
              </div>
              <div class="wf-inline-grid">
                <div>
                  <label class="wf-field-label">参数名称</label>
                  <el-input
                    v-model="editorParam.name"
                    placeholder="variable_name"
                    @input="(value: string) => (editorParam.name = value.replace(/\s/g, '_'))"
                  />
                </div>
                <div>
                  <label class="wf-field-label">默认值</label>
                  <template v-if="editorParam.dataType === 'File'">
                    <div class="wf-file-field">
                      <input
                        ref="fileInputRef"
                        class="wf-file-input"
                        type="file"
                        @change="handleFileChange"
                      />
                      <el-button type="primary" @click="triggerFilePick"
                        >上传文件</el-button
                      >
                      <span v-if="editorParam.defaultValue" class="wf-muted">
                        {{ editorParam.defaultValue }}
                      </span>
                    </div>
                  </template>
                  <template v-else>
                    <el-input
                      v-model="editorParam.defaultValue"
                      placeholder="默认值"
                    />
                  </template>
                </div>
              </div>
              <div>
                <label class="wf-field-label">参数描述</label>
                <el-input
                  v-model="editorParam.description"
                  type="textarea"
                  :rows="2"
                  placeholder="输入参数说明"
                />
              </div>
            </template>
            <div class="wf-inline-actions">
              <el-button text @click="cancelEdit">取消</el-button>
              <el-button
                type="primary"
                :disabled="
                  editingIndex === systemParamIndex ? false : !editorParam.name
                "
                @click="handleSave"
              >
                保存
              </el-button>
            </div>
          </div>
        </template>

        <div
          v-if="editingIndex === -1"
          class="wf-inline-form wf-inline-form--inline"
        >
          <div class="wf-inline-grid">
            <div>
              <label class="wf-field-label">类型</label>
              <el-select v-model="editorParam.dataType">
                <el-option
                  v-for="option in varTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </div>
            <div class="wf-inline-switch">
              <el-switch v-model="editorParam.required" />
              <span class="wf-muted">必填</span>
            </div>
          </div>
          <div class="wf-inline-grid">
            <div>
              <label class="wf-field-label">参数名称</label>
              <el-input
                v-model="editorParam.name"
                placeholder="variable_name"
                @input="(value: string) => (editorParam.name = value.replace(/\s/g, '_'))"
              />
            </div>
            <div>
              <label class="wf-field-label">默认值</label>
              <template v-if="editorParam.dataType === 'File'">
                <div class="wf-file-field">
                  <input
                    ref="fileInputRef"
                    class="wf-file-input"
                    type="file"
                    @change="handleFileChange"
                  />
                  <el-button type="primary" @click="triggerFilePick"
                    >上传文件</el-button
                  >
                  <span v-if="editorParam.defaultValue" class="wf-muted">
                    {{ editorParam.defaultValue }}
                  </span>
                </div>
              </template>
              <template v-else>
                <el-input
                  v-model="editorParam.defaultValue"
                  placeholder="默认值"
                />
              </template>
            </div>
          </div>
          <div>
            <label class="wf-field-label">参数描述</label>
            <el-input
              v-model="editorParam.description"
              type="textarea"
              :rows="2"
              placeholder="输入参数说明"
            />
          </div>
          <div class="wf-inline-actions">
            <el-button text @click="cancelEdit">取消</el-button>
            <el-button
              type="primary"
              :disabled="!editorParam.name"
              @click="handleSave"
            >
              添加
            </el-button>
          </div>
        </div>

        <div
          v-if="parameters.length === 0 && editingIndex === null"
          class="wf-empty"
        >
          暂无输入变量，点击上方按钮添加
        </div>
      </div>
    </Field>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, toRef, watch } from 'vue'
import { EditPen } from '@element-plus/icons-vue'
import Field from '../base/Field.vue'
import AddButton from '../base/AddButton.vue'
import RemoveButton from '../base/RemoveButton.vue'
import { useNodeData } from '../../../../composables/useNodeData'
import type { Parameter, StartNodeType } from '../../../../types/node-config'

const props = defineProps<{
  id: string
  data: StartNodeType
}>()

const { inputs, setInputs } = useNodeData<StartNodeType>(
  props.id,
  toRef(props, 'data')
)

const varTypeOptions = [
  { label: 'String', value: 'String' },
  { label: 'File', value: 'File' },
  // { label: 'Number', value: 'Number' },
  // { label: 'Boolean', value: 'Boolean' },
  // { label: 'Object', value: 'Object' },
  // { label: 'Array', value: 'Array' },
]

const editingIndex = ref<number | null>(null)
const editorParam = reactive<Partial<Parameter>>({
  name: '',
  defaultValue: '',
  dataType: 'String',
  required: false,
  description: '',
})

const systemParamName = 'sys.query'
const systemParam: Parameter = {
  name: systemParamName,
  dataType: 'String',
  required: true,
}
const fileInputRef = ref<HTMLInputElement | null>(null)
// const booleanDefault = computed({
//   get: () => editorParam.defaultValue === 'true',
//   set: (value: boolean) => {
//     editorParam.defaultValue = value ? 'true' : 'false'
//   },
// })

const triggerFilePick = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  editorParam.defaultValue = file?.name || ''
  if (target) target.value = ''
}

const parameters = computed(() => inputs.value.parameters || [])
const systemParamIndex = computed(() => {
  return parameters.value.findIndex((item) => item?.name === systemParamName)
})

const displayParameters = computed(() => {
  const list = parameters.value || []
  const systemIndex = systemParamIndex.value
  const filtered = list
    .map((param, index) => ({ param, index }))
    .filter((item) => item.param?.name !== systemParamName)

  return [
    {
      key: systemParamName,
      index: systemIndex,
      param: systemParam,
      editable: false,
      deletable: false,
    },
    ...filtered.map((item) => ({
      key: item.param?.name || `param-${item.index}`,
      index: item.index,
      param: item.param,
      editable: true,
      deletable: true,
    })),
  ]
})

watch(
  () => inputs.value.parameters,
  (list) => {
    const current = list || []
    const index = current.findIndex((item) => item?.name === systemParamName)
    if (index === -1) {
      setInputs({ parameters: [systemParam, ...current] })
      return
    }

    const existing = current[index]
    if (
      existing?.dataType !== systemParam.dataType ||
      existing?.required !== systemParam.required
    ) {
      const next = [...current]
      next[index] = {
        ...existing,
        dataType: systemParam.dataType,
        required: systemParam.required,
        description: '',
      }
      setInputs({ parameters: next })
    }
  },
  { immediate: true }
)

const handleAddParameter = (payload: Parameter) => {
  const newList = [...(inputs.value.parameters || []), payload]
  const paramNames = newList.map((item) => item.name).filter(Boolean)
  if (new Set(paramNames).size !== paramNames.length) {
    return false
  }
  setInputs({ parameters: newList })

  return true
}

const handleRemoveParameter = (index: number) => {
  const newList = [...(inputs.value.parameters || [])]
  newList.splice(index, 1)
  setInputs({ parameters: newList })
}

const resetEditor = () => {
  editorParam.name = ''
  editorParam.defaultValue = ''
  editorParam.dataType = 'String'
  editorParam.required = false
  editorParam.description = ''
}

// watch(
//   () => editorParam.dataType,
//   (value) => {
//     if (value === 'Boolean') {
//       if (editorParam.defaultValue !== 'true' && editorParam.defaultValue !== 'false') {
//         editorParam.defaultValue = 'false'
//       }
//     }
//   }
// )

const normalizeDefaultValue = () => {
  return editorParam.defaultValue || ''
}

const openEditorForAdd = () => {
  if (editingIndex.value === -1) {
    cancelEdit()
    return
  }
  editingIndex.value = -1
  resetEditor()
}

const openEditorForEdit = (index: number) => {
  if (index < 0) return
  if (editingIndex.value === index) {
    cancelEdit()
    return
  }
  const current = parameters.value[index]
  if (!current) return
  editingIndex.value = index
  editorParam.name = current.name || ''
  editorParam.defaultValue = current.defaultValue || ''
  editorParam.dataType = current.dataType || 'String'
  editorParam.required = current.required || false
  editorParam.description = current.description || ''
}

const hasDuplicateName = (name: string, ignoreIndex: number | null) => {
  const names = displayParameters.value
    .filter((item) => item.index !== ignoreIndex)
    .map((item) => item.param?.name)
    .filter(Boolean)
  return names.includes(name)
}

const handleSave = () => {
  if (!editorParam.name) return
  if (hasDuplicateName(editorParam.name, editingIndex.value)) return

  if (editingIndex.value === -1) {
    const success = handleAddParameter({
      name: editorParam.name,
      defaultValue: normalizeDefaultValue(),
      dataType: editorParam.dataType || 'String',
      required: editorParam.required || false,
      description: editorParam.description || '',
    })
    if (!success) return
  } else if (editingIndex.value === systemParamIndex.value) {
    const next = [...(inputs.value.parameters || [])]
    const current = next[editingIndex.value]
    if (!current) return
    next[editingIndex.value] = {
      ...current,
      defaultValue: normalizeDefaultValue(),
      dataType: systemParam.dataType,
      required: systemParam.required,
      description: '',
    }
    setInputs({ parameters: next })
  } else {
    const index = editingIndex.value
    if (index === null || index < 0) return
    const next = [...(inputs.value.parameters || [])]
    const current = next[index]
    if (!current) return
    next[index] = {
      ...current,
      name: editorParam.name,
      defaultValue: normalizeDefaultValue(),
      dataType: editorParam.dataType || 'String',
      required: editorParam.required || false,
      description: editorParam.description || '',
    }
    setInputs({ parameters: next })
  }

  resetEditor()
  editingIndex.value = null
}

const cancelEdit = () => {
  editingIndex.value = null
}
</script>

<style scoped>
.wf-panel-block {
  padding: 12px 16px 20px;
}

.wf-panel-block__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wf-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 10px;
}

.wf-list-item__title {
  display: flex;
  gap: 8px;
  align-items: center;
}

.wf-list-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wf-icon-btn {
  padding: 0;
}

.wf-mono {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  color: #2563eb;
}

.wf-muted {
  font-size: 12px;
  color: #6b7280;
}

.wf-required {
  font-size: 11px;
  color: #ef4444;
}

.wf-inline-form {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wf-inline-form--inline {
  margin: 4px 0 10px;
  background: #ffffff;
}

.wf-inline-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.wf-field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #6b7280;
}

.wf-inline-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 24px;
}

.wf-inline-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.wf-file-field {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.wf-file-input {
  display: none;
}

.wf-empty {
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
  padding: 12px 0;
}
</style>

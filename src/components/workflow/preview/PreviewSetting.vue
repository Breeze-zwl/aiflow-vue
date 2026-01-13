<template>
  <el-tooltip content="设置" placement="bottom" :disabled="visible">
    <el-button
      :icon="Setting"
      text
      size="small"
      :class="{ 'setting-btn-active': visible }"
      @click="handleToggle"
    />
  </el-tooltip>

  <teleport v-if="visible && teleportTarget" :to="teleportTarget">
    <div class="preview-setting-wrapper">
      <div class="preview-setting-arrow"></div>
      <div class="preview-setting-panel">
        <div
          v-for="param in params"
          :key="param.name"
          class="preview-setting-item"
        >
          <label class="preview-setting-label">
            {{ param.name }}
            <span v-if="param.required" class="preview-setting-required">*必填</span>
          </label>
          <template v-if="param.dataType === 'Boolean'">
            <el-checkbox v-model="param.value">启用</el-checkbox>
          </template>
          <template v-else-if="param.dataType === 'File'">
            <div class="preview-setting-file">
              <input
                :ref="(el) => (previewFileRefs[param.name] = el as HTMLInputElement)"
                class="preview-setting-file-input"
                type="file"
                @change="(event) => handlePreviewFileChange(event, param)"
              />
              <el-button size="small" @click="() => triggerPreviewFilePick(param.name)">
                上传文件
              </el-button>
              <span v-if="param.value" class="preview-setting-file-name">
                {{ param.value }}
              </span>
            </div>
          </template>
          <template v-else>
            <el-input
              v-model="param.value"
              placeholder="请输入"
              size="small"
              :type="param.dataType === 'Number' ? 'number' : 'text'"
            />
          </template>
          <div v-if="param.description" class="preview-setting-desc">
            {{ param.description }}
          </div>
        </div>
        <div v-if="params.length === 0" class="preview-setting-empty">
          暂无参数
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'

export type PreviewParam = {
  name: string
  value: any
  dataType?: string
  required?: boolean
  description?: string
}

const props = defineProps<{
  visible: boolean
  params: PreviewParam[]
  teleportTarget?: HTMLElement | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const handleToggle = () => {
  emit('update:visible', !props.visible)
}

const previewFileRefs: Record<string, HTMLInputElement | null> = {}

const triggerPreviewFilePick = (name: string) => {
  previewFileRefs[name]?.click()
}

const handlePreviewFileChange = (event: Event, param: PreviewParam) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  param.value = file?.name || ''
  if (target) target.value = ''
}
</script>

<style scoped>
.setting-btn-active {
  background-color: #ecf5ff;
  border-color: #a0cfff;
  color: #409eff;
  border-radius: 4px;
}

.preview-setting-wrapper {
  position: absolute;
  top: 8px;
  width: 100%;
  z-index: 10;
}

.preview-setting-arrow {
  position: absolute;
  top: -6px;
  right: 49px;
  width: 12px;
  height: 12px;
  background: white;
  border-left: 1px solid #e5e7eb;
  border-top: 1px solid #e5e7eb;
  transform: rotate(45deg);
  z-index: 1;
}

.preview-setting-panel {
  padding: 16px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.preview-setting-item {
  margin-bottom: 16px;
}

.preview-setting-item:last-child {
  margin-bottom: 0;
}

.preview-setting-label {
  display: block;
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  font-weight: 500;
}

.preview-setting-required {
  margin-left: 4px;
  font-size: 12px;
  color: #ef4444;
}

.preview-setting-desc {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.preview-setting-file {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-setting-file-input {
  display: none;
}

.preview-setting-file-name {
  font-size: 12px;
  color: #909399;
}

.preview-setting-empty {
  text-align: center;
  color: #909399;
  font-size: 13px;
  padding: 40px 0;
}
</style>

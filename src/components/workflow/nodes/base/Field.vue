<template>
  <div class="wf-field" :class="className">
    <div class="wf-field__head">
      <div class="wf-field__title">
        <span class="wf-field__label">
          {{ title }}
          <span v-if="required" class="wf-field__required">*</span>
        </span>
        <el-tooltip v-if="tooltip" :content="tooltip" placement="top">
          <el-icon class="wf-field__hint">
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </div>
      <div class="wf-field__ops">
        <slot name="operations" />
      </div>
    </div>
    <div class="wf-field__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { QuestionFilled } from '@element-plus/icons-vue'

defineProps<{
  title: string
  tooltip?: string
  required?: boolean
  className?: string
  supportFold?: boolean
}>()
</script>

<style scoped>
.wf-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wf-field__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.wf-field__title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.wf-field__label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.wf-field__required {
  color: #ef4444;
  margin-left: 4px;
}

.wf-field__hint {
  font-size: 14px;
  color: #9ca3af;
  cursor: help;
}

.wf-field__ops {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>

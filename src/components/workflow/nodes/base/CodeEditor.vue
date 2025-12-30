<template>
  <div class="wf-code-editor">
    <div v-if="title" class="wf-code-editor__title">
      <slot name="title">{{ title }}</slot>
    </div>
    <div class="wf-code-editor__body">
      <el-input
        :model-value="value"
        type="textarea"
        :rows="rows"
        :readonly="readonly"
        :placeholder="placeholder"
        class="wf-code-editor__input"
        @input="handleInput"
      />
      <div class="wf-code-editor__lang">{{ language }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: string
  title?: string
  language?: string
  readonly?: boolean
  placeholder?: string
  minHeight?: number
}>()

const emit = defineEmits<{
  (e: 'change', value: string): void
}>()

const rows = computed(() => {
  const height = props.minHeight || 200
  return Math.max(6, Math.round(height / 22))
})

const handleInput = (value: string) => {
  emit('change', value)
}
</script>

<style scoped>
.wf-code-editor {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.wf-code-editor__title {
  padding: 8px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.wf-code-editor__body {
  position: relative;
}

.wf-code-editor__input :deep(.el-textarea__inner) {
  background: #111827;
  color: #f9fafb;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 13px;
  border: none;
  resize: none;
  padding: 12px 16px 28px;
}

.wf-code-editor__input :deep(.el-textarea__inner)::placeholder {
  color: #9ca3af;
}

.wf-code-editor__lang {
  position: absolute;
  bottom: 8px;
  right: 10px;
  font-size: 11px;
  color: #9ca3af;
  background: rgba(17, 24, 39, 0.8);
  padding: 2px 6px;
  border-radius: 6px;
}
</style>

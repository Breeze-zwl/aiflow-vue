<template>
  <div class="wf-actions">
    <el-button type="primary" plain @click="emit('preview')">预览</el-button>
    <el-button type="primary" @click="emit('save')">保存</el-button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'preview'): void
  (e: 'save'): void
}>()
</script>

<style scoped>
.wf-actions {
  display: flex;
  gap: 8px;
}
</style>

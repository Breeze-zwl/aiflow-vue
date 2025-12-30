<template>
  <el-button
    circle
    size="small"
    :disabled="disabled"
    class="wf-icon-btn"
    @click="onClick"
  >
    <el-icon><Plus /></el-icon>
  </el-button>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const onClick = () => {
  emit('click')
}
</script>

<style scoped>
.wf-icon-btn {
  color: #6b7280;
}
</style>

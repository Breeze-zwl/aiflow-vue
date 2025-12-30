<template>
  <el-button
    circle
    size="small"
    type="danger"
    plain
    :disabled="disabled"
    class="wf-icon-btn"
    @click="onClick"
  >
    <el-icon><Delete /></el-icon>
  </el-button>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'

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
  padding: 0;
}
</style>

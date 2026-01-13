<template>
  <el-collapse v-model="activeNames" class="wf-output-vars">
    <el-collapse-item :name="panelName">
      <template #title>
        <span class="wf-output-vars__title">{{ title }}</span>
      </template>
      <div class="wf-output-vars__content">
        <slot />
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title?: string
}>()

const panelName = 'vars'
const activeNames = ref<string[]>([panelName])

const title = props.title || '输出变量'
</script>

<style scoped>
.wf-output-vars {
  border-top: 1px solid #f3f4f6;
}

.wf-output-vars :deep(.el-collapse-item__header) {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  padding-left: 16px;
  padding-right: 16px;
}

.wf-output-vars :deep(.el-collapse-item__wrap) {
  padding: 0 16px;
}

.wf-output-vars__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 12px;
}
</style>

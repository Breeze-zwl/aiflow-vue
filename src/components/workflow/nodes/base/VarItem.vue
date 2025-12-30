<template>
  <div class="wf-var-chip">
    <div class="wf-var-chip__main">
      <el-tag size="small" type="primary" effect="light" class="wf-var-chip__name">
        {{ name }}
      </el-tag>
      <span class="wf-var-chip__type">{{ type }}</span>
    </div>
    <p v-if="description" class="wf-var-chip__desc">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  type: string
  description?: string
}>()
</script>

<style scoped>
.wf-var-chip {
  background: #f9fafb;
  border-radius: 8px;
  padding: 8px 10px;
}

.wf-var-chip__main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wf-var-chip__type {
  font-size: 12px;
  color: #9ca3af;
}

.wf-var-chip__desc {
  margin: 6px 0 0;
  font-size: 12px;
  color: #6b7280;
}
</style>

<template>
  <el-select
    :model-value="value"
    size="small"
    :disabled="readonly"
    class="wf-type-selector"
    @change="handleChange"
  >
    <el-option
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    />
  </el-select>
</template>

<script setup lang="ts">
type Option = {
  label: string
  value: string
}

const props = defineProps<{
  options: Option[]
  value: string
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'change', value: string): void
}>()

const handleChange = (value: string) => {
  emit('change', value)
}
</script>

<style scoped>
.wf-type-selector {
  min-width: 120px;
}
</style>

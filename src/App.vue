<template>
  <div class="app">
    <header class="app-header">
      <div class="app-header__left">
        <h1>Workflow Editor</h1>
        <span>可视化工作流编辑器</span>
      </div>
      <div class="app-header__center">
        <span class="app-header__label">示例:</span>
        <el-button
          size="small"
          :type="activeDemo === 'simple' ? 'primary' : 'default'"
          @click="activeDemo = 'simple'"
        >
          简单流程
        </el-button>
        <el-button
          size="small"
          :type="activeDemo === 'complex' ? 'primary' : 'default'"
          @click="activeDemo = 'complex'"
        >
          复杂流程
        </el-button>
        <el-button
          size="small"
          :type="activeDemo === 'blank' ? 'primary' : 'default'"
          @click="activeDemo = 'blank'"
        >
          新增流程
        </el-button>
      </div>
      <div class="app-header__right">
      </div>
    </header>

    <main class="app-main">
      <Workflow
        :key="activeDemo"
        :initial-nodes="nodes"
        :initial-edges="edges"
        :preview-messages="previewMessages"
        :preview-loading="previewLoading"
        @save="handleSave"
        @preview="handlePreview"
        @preview-send="handlePreviewSend"
        @preview-reset="handlePreviewReset"
      />
    </main>

    <footer class="app-footer">
      <div class="app-footer__left">
        <span>节点: {{ nodes.length }}</span>
        <span>连接: {{ edges.length }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Workflow from './components/workflow/Workflow.vue'
import type { Edge, Node } from './types/workflow'
import { mockEdges, mockNodes } from './mocks/workflow-data'

const activeDemo = ref<'simple' | 'complex' | 'blank'>('simple')

const nodes = computed<Node[]>(() => {
  if (activeDemo.value === 'blank') return []
  return mockNodes
})

const edges = computed<Edge[]>(() => {
  if (activeDemo.value === 'blank') return []
  return mockEdges
})

const previewMessages = ref<Array<{ role: 'user' | 'bot'; content: string; model?: string; workflow?: string }>>([])
const previewLoading = ref(false)

const handleSave = (data: { nodes: Node[]; edges: Edge[] }) => {
  console.log('Save workflow:', data)
}

const handlePreview = (data: { nodes: Node[]; edges: Edge[] }) => {
  console.log('Preview workflow:', data)
}

const handlePreviewSend = async (payload: { message: string; params: Record<string, any>; data: { nodes: Node[]; edges: Edge[] } }) => {
  previewLoading.value = true
  previewMessages.value = [
    ...previewMessages.value,
    { role: 'user', content: payload.message },
  ]
  // 简化版：模拟返回
  previewMessages.value = [
    ...previewMessages.value,
    { role: 'bot', content: '收到请求，接口逻辑请在业务中实现。' },
  ]
  previewLoading.value = false
}

const handlePreviewReset = () => {
  previewMessages.value = []
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: #f9fafb;
  color: #111827;
}

.app-header {
  height: 56px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.app-header__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-header__left h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.app-header__left span {
  font-size: 13px;
  color: #6b7280;
}

.app-header__center {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-header__label {
  font-size: 13px;
  color: #6b7280;
}

.app-header__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-main {
  flex: 1;
  overflow: hidden;
}

.app-footer {
  height: 32px;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  font-size: 12px;
  color: #6b7280;
  flex-shrink: 0;
}

.app-footer__left,
.app-footer__right {
  display: flex;
  gap: 16px;
}
</style>

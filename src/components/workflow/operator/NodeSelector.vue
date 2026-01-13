<template>
  <div
    class="wf-node-selector"
    :class="{ 'wf-node-selector--collapsed': isCollapsed }"
  >
    <div class="wf-node-selector__header">
      <h3 v-if="!isCollapsed" class="wf-node-selector__title">节点库</h3>
      <el-button
        circle
        size="small"
        class="wf-node-selector__toggle"
        @click="toggleCollapse"
      >
        <el-icon><Menu /></el-icon>
      </el-button>
    </div>

    <el-scrollbar v-if="!isCollapsed" class="wf-node-selector__body">
      <div
        class="wf-node-selector__section"
        v-for="category in visibleNodeCategories"
        :key="category.title"
      >
        <div class="wf-node-selector__section-title">{{ category.title }}</div>
        <div class="wf-node-selector__list">
          <div
            v-for="type in category.nodes"
            :key="type"
            class="wf-node-selector__item"
            draggable="true"
            @dragstart="(event) => handleDragStart(event, type)"
            @click="() => emitAdd(type)"
          >
            <div
              class="wf-node-selector__icon"
              :style="{ backgroundColor: BLOCK_CLASSIFICATIONS[type].color }"
            >
              <el-icon>
                <component :is="iconMap[type]" />
              </el-icon>
            </div>
            <span class="wf-node-selector__label">{{
              BLOCK_CLASSIFICATIONS[type].title
            }}</span>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import {
  Menu,
  VideoPlay,
  VideoPause,
  Cpu,
  Search,
  Connection,
  EditPen,
  Link,
  ChatDotSquare,
  Tools,
  Document,
  List,
  Grid,
  Refresh,
  User,
  Filter,
  Files,
} from '@element-plus/icons-vue'
import { BlockEnum, BLOCK_CLASSIFICATIONS } from '../../../types/workflow'
import { nodeCategories } from '../node-categories'

defineProps<{
  isCollapsed?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-collapse'): void
  (e: 'add-node', type: BlockEnum): void
}>()

const handleDragStart = (event: DragEvent, type: BlockEnum) => {
  if (!event.dataTransfer) return
  event.dataTransfer.setData('application/vueflow', type)
  event.dataTransfer.effectAllowed = 'move'
}

const toggleCollapse = () => {
  emit('toggle-collapse')
}

const emitAdd = (type: BlockEnum) => {
  emit('add-node', type)
}

const iconMap: Record<string, any> = {
  [BlockEnum.Start]: VideoPlay,
  [BlockEnum.End]: VideoPause,
  [BlockEnum.LLM]: Cpu,
  [BlockEnum.KnowledgeRetrieval]: Search,
  [BlockEnum.IfElse]: Connection,
  [BlockEnum.Code]: EditPen,
  [BlockEnum.HttpRequest]: Link,
  [BlockEnum.Answer]: ChatDotSquare,
  [BlockEnum.Tool]: Tools,
  [BlockEnum.TemplateTransform]: Document,
  [BlockEnum.VariableAssigner]: List,
  [BlockEnum.QuestionClassifier]: Grid,
  [BlockEnum.Iteration]: Refresh,
  [BlockEnum.ParameterExtractor]: Filter,
  [BlockEnum.DocExtractor]: Files,
  [BlockEnum.ListFilter]: List,
  [BlockEnum.Agent]: User,
  [BlockEnum.Loop]: Refresh,
}

const visibleNodeCategories = nodeCategories
</script>

<style scoped>
.wf-node-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 240px;
  background: rgba(249, 250, 251, 0.95);
  border-right: 1px solid #e5e7eb;
  transition: width 0.3s ease;
}

.wf-node-selector--collapsed {
  width: 54px;
}

.wf-node-selector__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid #e5e7eb;
}

.wf-node-selector__title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.wf-node-selector__toggle {
  color: #6b7280;
}

.wf-node-selector__body {
  padding: 12px 10px;
}

.wf-node-selector__section {
  margin-bottom: 16px;
}

.wf-node-selector__section-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
}

.wf-node-selector__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wf-node-selector__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: #ffffff;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  cursor: grab;
  transition: all 0.2s ease;
}

.wf-node-selector__item:hover {
  border-color: #bfdbfe;
  background: rgba(239, 246, 255, 0.6);
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.12);
}

.wf-node-selector__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.wf-node-selector__label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}
</style>

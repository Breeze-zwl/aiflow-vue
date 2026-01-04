<template>
  <div class="node-selector-popup" @wheel.stop.passive>
    <div class="node-selector-popup__header">
      <el-tabs v-model="activeTab" class="node-selector-popup__tabs">
        <el-tab-pane label="节点" name="nodes" />
        <el-tab-pane label="工具" name="tools" />
      </el-tabs>
    </div>

    <div class="node-selector-popup__search">
      <el-input
        v-model="searchText"
        placeholder="搜索节点"
        :prefix-icon="Search"
        clearable
        size="small"
      />
    </div>

    <div class="node-selector-popup__body" @wheel.stop.passive>
      <template v-if="activeTab === 'nodes'">
        <div
          v-for="category in filteredNodeCategories"
          :key="category.title"
          class="node-selector-popup__section"
        >
          <div v-if="category.title" class="node-selector-popup__section-title">{{ category.title }}</div>
          <div class="node-selector-popup__list">
            <div
              v-for="type in category.nodes"
              :key="type"
              class="node-selector-popup__item"
              @click="handleSelect(type)"
            >
              <div
                class="node-selector-popup__icon"
                :style="{ backgroundColor: BLOCK_CLASSIFICATIONS[type].color }"
              >
                <el-icon>
                  <component :is="iconMap[type]" />
                </el-icon>
              </div>
              <span class="node-selector-popup__label">{{ BLOCK_CLASSIFICATIONS[type].title }}</span>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div
          v-for="category in filteredToolCategories"
          :key="category.title"
          class="node-selector-popup__section"
        >
          <div v-if="category.title" class="node-selector-popup__section-title">{{ category.title }}</div>
          <div class="node-selector-popup__list">
            <div
              v-for="type in category.nodes"
              :key="type"
              class="node-selector-popup__item"
              @click="handleSelect(type)"
            >
              <div
                class="node-selector-popup__icon"
                :style="{ backgroundColor: BLOCK_CLASSIFICATIONS[type].color }"
              >
                <el-icon>
                  <component :is="iconMap[type]" />
                </el-icon>
              </div>
              <span class="node-selector-popup__label">{{ BLOCK_CLASSIFICATIONS[type].title }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Search,
  VideoPlay,
  VideoPause,
  Cpu,
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
import { BlockEnum, BLOCK_CLASSIFICATIONS } from '@/types/workflow'

const emit = defineEmits<{
  (e: 'select', type: BlockEnum): void
  (e: 'close'): void
}>()

const activeTab = ref('nodes')
const searchText = ref('')

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

// 节点分类
const nodeCategories = [
  {
    title: '',
    nodes: [
      BlockEnum.LLM,
      BlockEnum.KnowledgeRetrieval,
      BlockEnum.End,
    ],
  },
  {
    title: '逻辑',
    nodes: [
      BlockEnum.IfElse,
      BlockEnum.Iteration,
    ],
  },
  {
    title: '转换',
    nodes: [
      BlockEnum.Code,
      BlockEnum.TemplateTransform,
      BlockEnum.VariableAssigner,
    ],
  },
]

// 工具分类
const toolCategories = [
  {
    title: '',
    nodes: [
      BlockEnum.Tool,
      BlockEnum.Agent,
      BlockEnum.HttpRequest,
    ],
  },
]

const filteredNodeCategories = computed(() => {
  if (!searchText.value) return nodeCategories

  const keyword = searchText.value.toLowerCase()
  return nodeCategories
    .map((category) => ({
      ...category,
      nodes: category.nodes.filter((type) => {
        const classification = BLOCK_CLASSIFICATIONS[type]
        return (
          classification.title.toLowerCase().includes(keyword) ||
          (classification.description || '').toLowerCase().includes(keyword)
        )
      }),
    }))
    .filter((category) => category.nodes.length > 0)
})

const filteredToolCategories = computed(() => {
  if (!searchText.value) return toolCategories

  const keyword = searchText.value.toLowerCase()
  return toolCategories
    .map((category) => ({
      ...category,
      nodes: category.nodes.filter((type) => {
        const classification = BLOCK_CLASSIFICATIONS[type]
        return (
          classification.title.toLowerCase().includes(keyword) ||
          (classification.description || '').toLowerCase().includes(keyword)
        )
      }),
    }))
    .filter((category) => category.nodes.length > 0)
})

const handleSelect = (type: BlockEnum) => {
  emit('select', type)
  emit('close')
}
</script>

<style scoped>
.node-selector-popup {
  width: 220px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.node-selector-popup__header {
  padding: 4px 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.node-selector-popup__tabs :deep(.el-tabs__header) {
  margin: 0;
}

.node-selector-popup__tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.node-selector-popup__tabs :deep(.el-tabs__item) {
  font-size: 13px;
  font-weight: 500;
  padding: 0 12px;
  height: 32px;
  line-height: 32px;
}

.node-selector-popup__search {
  padding: 8px;
}

.node-selector-popup__search :deep(.el-input__wrapper) {
  padding: 0 8px;
}

.node-selector-popup__search :deep(.el-input__inner) {
  font-size: 12px;
}

.node-selector-popup__body {
  max-height: 280px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 8px 8px;
}

.node-selector-popup__section {
  margin-bottom: 8px;
}

.node-selector-popup__section:last-child {
  margin-bottom: 0;
}

.node-selector-popup__section-title {
  font-size: 11px;
  font-weight: 500;
  color: #9ca3af;
  margin-bottom: 4px;
  padding-left: 4px;
}

.node-selector-popup__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.node-selector-popup__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.node-selector-popup__item:hover {
  background: #f3f4f6;
}

.node-selector-popup__icon {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 12px;
}

.node-selector-popup__label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.node-selector-popup__empty {
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
}
</style>

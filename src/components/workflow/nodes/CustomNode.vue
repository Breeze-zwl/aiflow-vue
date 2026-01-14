<template>
  <div
    ref="nodeRef"
    class="wf-node"
    :class="{ 'wf-node--selected': selected }"
    :style="{ minWidth: '200px', minHeight: nodeMinHeight }"
  >
    <Handle
      v-if="!isStartNode"
      type="target"
      :position="Position.Left"
      :style="handleStyle('left')"
      class="wf-handle"
    />

    <div class="wf-node__header">
      <div
        class="wf-node__icon"
        :style="{ backgroundColor: classification.color }"
      >
        <el-icon>
          <component :is="iconComponent" />
        </el-icon>
      </div>
      <div class="wf-node__meta">
        <div class="wf-node__title">
          {{ data.title || classification.title }}
        </div>
        <div v-if="data.desc" class="wf-node__desc">{{ data.desc }}</div>
      </div>
    </div>

    <div
      v-if="!isIfElseNode && !data.desc && classification.description"
      class="wf-node__hint"
    >
      {{ classification.description }}
    </div>

    <!-- 右侧连接点区域 -->
    <div
      v-if="!isEndNode && !isIfElseNode && !isQuestionClassifierNode"
      class="wf-node__source-area"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- Handle 用于拖拽连线 - 始终存在，hover时变成加号样式 -->
      <Handle
        type="source"
        :position="Position.Right"
        class="wf-handle wf-handle--source"
        :class="{ 'wf-handle--as-plus': isHovering && !showNodeSelector }"
        @click="handleAddClick"
      />
      <!-- Tooltip -->
      <Transition name="fade">
        <div v-if="isHovering && !showNodeSelector" class="wf-node__tooltip">
          <div>点击添加节点</div>
          <div>拖拽连接节点</div>
        </div>
      </Transition>
    </div>

    <div v-else-if="isIfElseNode" class="wf-node__branch-area wf-node__branch-area--classifier">
      <div class="wf-node__branch wf-node__branch--classifier">
        <div class="wf-node__branch-card">
          <div class="wf-node__branch-title">IF</div>
        </div>
        <Handle
          id="if"
          type="source"
          :position="Position.Right"
          class="wf-handle wf-handle--branch wf-handle--branch-classifier wf-handle--as-plus"
          :style="branchHandleStyle"
          @click="(event) => handleAddClick(event, 'if')"
        />
      </div>
      <div class="wf-node__branch wf-node__branch--classifier">
        <div class="wf-node__branch-card">
          <div class="wf-node__branch-title">ELSE</div>
        </div>
        <Handle
          id="else"
          type="source"
          :position="Position.Right"
          class="wf-handle wf-handle--branch wf-handle--branch-classifier wf-handle--as-plus"
          :style="branchHandleStyle"
          @click="(event) => handleAddClick(event, 'else')"
        />
      </div>
    </div>
    <div
      v-else-if="isQuestionClassifierNode"
      class="wf-node__branch-area wf-node__branch-area--classifier"
    >
      <div
        v-for="(item, index) in classifierBranches"
        :key="item.id || index"
        class="wf-node__branch wf-node__branch--classifier"
      >
        <div class="wf-node__branch-card">
          <div class="wf-node__branch-title">分类{{ index + 1 }}</div>
        </div>
        <Handle
          :id="String(item.id || index)"
          type="source"
          :position="Position.Right"
          class="wf-handle wf-handle--branch wf-handle--branch-classifier wf-handle--as-plus"
          :style="branchHandleStyle"
          @click="(event) => handleAddClick(event)"
        />
      </div>
    </div>

    <!-- 节点选择器弹窗 - 使用 Teleport 渲染到 body -->
    <Teleport to="body">
      <Transition name="popup">
        <div
          v-if="showNodeSelector"
          class="wf-node-selector-popup"
          :style="popupPosition"
          @click.stop
        >
          <NodeSelectorPopup
            @select="handleSelectNode"
            @close="closeNodeSelector"
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject, onMounted, onUnmounted } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
import type { CommonNodeType } from '../../../types/workflow'
import { BLOCK_CLASSIFICATIONS, BlockEnum } from '../../../types/workflow'
import {
  addNodeFromSourceKey,
  type AddNodeFromSource,
} from '../../../composables/useNodeData'
import NodeSelectorPopup from './NodeSelectorPopup.vue'
import {
  VideoPlay,
  VideoPause,
  Cpu,
  Search,
  Connection,
  EditPen,
  Link,
  ChatDotSquare,
  Tools,
  List,
  Grid,
  Document,
  Files,
  Filter,
  Refresh,
  User,
} from '@element-plus/icons-vue'

const props = defineProps<NodeProps<CommonNodeType>>()

// 注入从 Workflow 提供的添加节点方法
const addNodeFromSource = inject<AddNodeFromSource | null>(
  addNodeFromSourceKey,
  null
)

// 获取 VueFlow 实例来监听连线事件
const { onConnectStart, onConnectEnd } = useVueFlow()

const nodeRef = ref<HTMLElement | null>(null)
const isHovering = ref(false)
const showNodeSelector = ref(false)
const popupPosition = ref({ top: '0px', left: '0px' })
const isDraggingConnection = ref(false)

// 监听连线开始和结束
onConnectStart(() => {
  isDraggingConnection.value = true
})

onConnectEnd(() => {
  isDraggingConnection.value = false
})

const classification = computed(() => {
  return (
    BLOCK_CLASSIFICATIONS[props.data.type] || {
      title: props.data.type,
      description: '',
      color: '#6B7280',
      icon: 'cpu',
    }
  )
})

const isStartNode = computed(() => props.data.type === BlockEnum.Start)
const isEndNode = computed(() => props.data.type === BlockEnum.End)
const isIfElseNode = computed(() => props.data.type === BlockEnum.IfElse)
const isQuestionClassifierNode = computed(
  () => props.data.type === BlockEnum.QuestionClassifier
)

const iconComponent = computed(() => {
  const icon = classification.value.icon
  const map: Record<string, any> = {
    play: VideoPlay,
    stop: VideoPause,
    cpu: Cpu,
    search: Search,
    'git-branch': Connection,
    code: EditPen,
    globe: Link,
    'message-circle': ChatDotSquare,
    tool: Tools,
    variable: List,
    layers: Grid,
    'file-text': Document,
    extract: Filter,
    repeat: Refresh,
    file: Files,
    list: List,
    bot: User,
    refresh: Refresh,
  }

  return map[icon] || Cpu
})

const classifierBranches = computed(() => {
  const list = (props.data as Record<string, any>)?.classes
  return Array.isArray(list) ? list : []
})

const nodeMinHeight = computed(() => 'auto')

const handleStyle = (
  position: 'left' | 'right' | 'top' | 'bottom',
  top?: string
) => {
  const baseStyle = {
    width: '10px',
    height: '10px',
    background: '#3b82f6',
    border: '2px solid #ffffff',
  }

  if (position === 'left') return { ...baseStyle, left: '-5px' }
  if (position === 'right')
    return { ...baseStyle, right: '-5px', top: top || '50%' }
  if (position === 'top') return { ...baseStyle, top: '-5px' }
  if (position === 'bottom') return { ...baseStyle, bottom: '-5px' }
  return baseStyle
}

const branchHandleStyle = {
  width: '10px',
  height: '10px',
  background: '#3b82f6',
  border: '2px solid #ffffff',
}

const handleMouseEnter = () => {
  if (!isDraggingConnection.value) {
    isHovering.value = true
  }
}

const handleMouseLeave = () => {
  // 如果节点选择器打开，不关闭 hover 状态
  if (!showNodeSelector.value) {
    isHovering.value = false
  }
}

const updatePopupPosition = () => {
  if (!nodeRef.value) return
  const rect = nodeRef.value.getBoundingClientRect()
  popupPosition.value = {
    top: `${rect.top + rect.height / 2}px`,
    left: `${rect.right + 20}px`,
  }
}

const handleAddClick = (event: MouseEvent, _sourceHandle?: string) => {
  // 阻止事件冒泡，避免触发节点点击事件
  event.stopPropagation()
  // 如果正在拖拽连线，不弹出选择器
  if (isDraggingConnection.value) return
  // 计算弹窗位置
  updatePopupPosition()
  // 点击加号按钮，在旁边弹出节点选择器
  showNodeSelector.value = true
}

const closeNodeSelector = () => {
  showNodeSelector.value = false
  isHovering.value = false
}

const handleSelectNode = (type: BlockEnum) => {
  closeNodeSelector()
  // 调用添加节点方法
  if (addNodeFromSource) {
    addNodeFromSource(props.id, type)
  }
}

// 点击其他地方关闭节点选择器
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (
    !target.closest('.wf-node-selector-popup') &&
    !target.closest('.wf-node__add-btn')
  ) {
    closeNodeSelector()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.wf-node {
  position: relative;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.wf-node:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
}

.wf-node--selected {
  border-color: #3b82f6;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.2);
}

.wf-node__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wf-node__icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.wf-node__meta {
  flex: 1;
  min-width: 0;
}

.wf-node__title {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wf-node__desc {
  margin-top: 2px;
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wf-node__hint {
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.wf-handle {
  background: #3b82f6;
}

/* 右侧 hover 检测区域 */
.wf-node__source-area {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.wf-node__branch-area {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 18px;
  z-index: 10;
  align-items: flex-end;
  width: calc(100% + 22px);
}

.wf-node__branch {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
}

.wf-node__branch-label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 600;
}

.wf-node__branch :deep(.vue-flow__handle) {
  margin-left: 4px;
}

.wf-node__branch-area--classifier {
  position: relative;
  left: auto;
  right: auto;
  top: auto;
  transform: none;
  margin-top: 10px;
  gap: 8px;
  align-items: stretch;
}

.wf-node__branch--classifier {
  width: 100%;
  justify-content: space-between;
  position: relative;
}

.wf-node__branch-card {
  flex: 1;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 6px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.wf-node__branch-title {
  font-size: 12px;
  font-weight: 600;
  color: #111827;
}

.wf-handle--branch-classifier {
  position: absolute !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin-left: 0 !important;
}

.wf-handle--branch {
  position: relative !important;
  top: auto !important;
  transform: none !important;
}

/* 右侧连接点 Handle */
.wf-handle--source {
  width: 10px !important;
  height: 10px !important;
  background: #3b82f6 !important;
  border: 2px solid #ffffff !important;
  border-radius: 50% !important;
  transition: all 0.2s ease !important;
  cursor: crosshair !important;
  position: relative !important;
  right: auto !important;
  top: auto !important;
  transform: none !important;
}

/* hover 时蓝点变成加号 */
.wf-handle--as-plus {
  width: 20px !important;
  height: 20px !important;
  background: #3b82f6 !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
  cursor: pointer !important;
}

.wf-handle--as-plus::before {
  content: '+';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-51%, -51%);
  color: #ffffff;
  font-size: 18px;
  font-weight: 400;
  line-height: 1;
  font-family: Arial, sans-serif;
}

.wf-handle--as-plus:hover {
  background: #2563eb !important;
  transform: scale(1.1) !important;
}

/* Tooltip */
.wf-node__tooltip {
  position: absolute;
  left: 32px;
  top: 50%;
  transform: translateY(-50%);
  background: #1f2937;
  color: #ffffff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  line-height: 1.5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  pointer-events: none;
}

.wf-node__tooltip::after {
  content: '';
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: #1f2937;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<!-- 全局样式，用于 Teleport 渲染的弹窗 -->
<style>
/* 节点选择器弹窗 - Teleport 到 body */
.wf-node-selector-popup {
  position: fixed;
  transform: translateY(-50%);
  z-index: 9999;
}

/* 弹窗过渡动画 */
.popup-enter-active,
.popup-leave-active {
  transition: all 0.2s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(-10px);
}
</style>

<template>
  <div class="wf-container">
    <NodeSelector
      v-if="!readOnly"
      :is-collapsed="nodeSelectorCollapsed"
      @toggle-collapse="toggleNodeSelector"
      @add-node="handleAddNode"
    />

    <div class="wf-canvas" @dragover.prevent="onDragOver" @drop="onDrop">
      <div class="wf-actions-wrap">
        <WorkflowActions @preview="handlePreview" @save="handleSave" />
      </div>
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :node-types="nodeTypes"
        :edge-types="edgeTypes"
        :default-viewport="{ x: 100, y: 100, zoom: 0.8 }"
        :fit-view-on-init="false"
        :pan-on-scroll="true"
        :pan-on-drag="controlMode === ControlMode.Hand ? true : [1, 2]"
        :zoom-on-scroll="true"
        :zoom-on-pinch="true"
        :zoom-on-double-click="true"
        :min-zoom="0.25"
        :max-zoom="2"
        :nodes-draggable="!readOnly"
        :nodes-connectable="!readOnly"
        :nodes-focusable="!readOnly"
        :edges-focusable="!readOnly"
        :select-nodes-on-drag="controlMode === ControlMode.Pointer"
        :selection-mode="SelectionMode.Partial"
        :delete-key-code="null"
        :multi-selection-key-code="null"
        :connect-on-click="false"
        :is-valid-connection="isValidConnection"
        @before-delete="handleBeforeDelete"
        @init="onInit"
        @connect="handleConnect"
        @connect-start="() => (isConnecting = true)"
        @connect-end="() => (isConnecting = false)"
        @node-click="handleNodeClick"
        @pane-click="handlePaneClick"
        @edge-mouse-enter="handleEdgeHover(true)"
        @edge-mouse-leave="handleEdgeHover(false)"
        @viewport-change="handleViewportChange"
      >
        <Background
          v-if="showGrid"
          :gap="14"
          :size="2"
          class="wf-canvas-bg"
          color="#e5e7eb"
        />
        <MiniMap
          v-if="showMinimap"
          class="wf-minimap"
          :zoomable="true"
          :pannable="true"
          :node-stroke-width="3"
        />
      </VueFlow>

      <div class="wf-toolbar-wrap">
        <WorkflowToolbar
          :control-mode="controlMode"
          :show-minimap="showMinimap"
          :show-grid="showGrid"
          :is-running="isRunning"
          :zoom="viewportZoom"
          :read-only="readOnly"
          @control-change="handleControlChange as any"
          @zoom-in="handleZoomIn"
          @zoom-out="handleZoomOut"
          @fit-view="handleFitView"
          @zoom-to="handleZoomTo as any"
          @toggle-grid="() => (showGrid = !showGrid)"
          @toggle-minimap="() => (showMinimap = !showMinimap)"
          @run="() => (isRunning = true)"
          @stop="() => (isRunning = false)"
          @save="handleSave"
        />
      </div>
    </div>

    <NodePanel
      v-if="selectedNode"
      :node="selectedNode"
      @close="closePanel"
      @run-step="handleRunStep"
      @locate-node="handleLocateNode"
      @action="handlePanelAction"
    >
      <component
        v-if="panelComponent"
        :is="panelComponent"
        :id="selectedNode.id"
        :data="selectedNodeData"
      />
      <div v-else class="wf-panel-empty">该节点类型暂不支持配置</div>
    </NodePanel>

    <!-- 预览窗口 -->
    <el-drawer
      v-model="showPreviewDrawer"
      :modal="false"
      :size="400"
      :with-header="false"
      @close="handlePreviewClose"
      modal-class="aiflow-preview-drawer"
    >
      <div class="preview-header">
        <span class="preview-header-title">预览</span>
        <div class="preview-header-actions">
          <el-tooltip content="重置对话" placement="bottom">
            <el-button :icon="RefreshLeft" text size="small" @click="handleResetChat" />
          </el-tooltip>
          <PreviewSetting
            v-model:visible="showSettingPopover"
            :params="previewParams"
            :teleport-target="previewContainerRef"
            @update:visible="handleSettingVisibleChange"
          />
          <el-divider direction="vertical" />
          <el-button :icon="Close" text size="small" @click="showPreviewDrawer = false" />
        </div>
      </div>
      <div class="preview-container" ref="previewContainerRef">
        <PreviewChat
          ref="chatRef"
          :params="chatParams"
          :messages="previewMessages"
          :loading="previewLoading"
          :before-send="handlePreviewSendCheck"
          @send="handlePreviewSend"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref, unref, watch, nextTick } from 'vue'
import {
  VueFlow,
  useVueFlow,
  MarkerType,
  SelectionMode,
  type Connection,
  type NodeMouseEvent,
} from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { v4 as uuid } from 'uuid'
import { RefreshLeft, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import NodeSelector from './operator/NodeSelector.vue'
import WorkflowToolbar from './operator/WorkflowToolbar.vue'
import WorkflowActions from './operator/WorkflowActions.vue'
import NodePanel from './panel/NodePanel.vue'
import CustomNode from './nodes/CustomNode.vue'
import CustomEdge from './edges/CustomEdge.vue'
import {
  BLOCK_CLASSIFICATIONS,
  BlockEnum,
  ControlMode,
  CUSTOM_NODE,
  CUSTOM_EDGE,
  type Edge,
  type Node,
} from '../../types/workflow'
import {
  updateNodeDataKey,
  addNodeFromSourceKey,
} from '../../composables/useNodeData'
import StartPanel from './nodes/panels/StartPanel.vue'
import EndPanel from './nodes/panels/EndPanel.vue'
import LLMPanel from './nodes/panels/LLMPanel.vue'
import CodePanel from './nodes/panels/CodePanel.vue'
import HttpPanel from './nodes/panels/HttpPanel.vue'
import ToolPanel from './nodes/panels/ToolPanel.vue'
import IfElsePanel from './nodes/panels/IfElsePanel.vue'
import AnswerPanel from './nodes/panels/AnswerPanel.vue'
import KnowledgeRetrievalPanel from './nodes/panels/KnowledgeRetrievalPanel.vue'
import QuestionClassifierPanel from './nodes/panels/QuestionClassifierPanel.vue'
import VariableAssignerPanel from './nodes/panels/VariableAssignerPanel.vue'
import TemplateTransformPanel from './nodes/panels/TemplateTransformPanel.vue'
import PreviewSetting, { type PreviewParam } from './preview/PreviewSetting.vue'
import PreviewChat, { type ChatMessage } from './preview/PreviewChat.vue'

const props = withDefaults(
  defineProps<{
    initialNodes?: Node[]
    initialEdges?: Edge[]
    readOnly?: boolean
    previewMessages?: ChatMessage[]
    previewLoading?: boolean
  }>(),
  {
    initialNodes: () => [],
    initialEdges: () => [],
    readOnly: false,
    previewMessages: () => [],
    previewLoading: false,
  }
)

const emit = defineEmits<{
  (e: 'save', data: { nodes: Node[]; edges: Edge[] }): void
  (e: 'preview', data: { nodes: Node[]; edges: Edge[] }): void
  (e: 'preview-send', payload: { message: string; params: Record<string, any>; data: { nodes: Node[]; edges: Edge[] } }): void
  (e: 'preview-reset'): void
}>()

const nodes = ref<any[]>([])
const edges = ref<any[]>([])
const isConnecting = ref(false)
const nodeSelectorCollapsed = ref(false)
const controlMode = ref<ControlMode>(ControlMode.Pointer)
const showMinimap = ref(false)
const showGrid = ref(true)
const isRunning = ref(false)
const selectedNodeId = ref<string | null>(null)
const viewportZoom = ref(1)
const showPreviewDrawer = ref(false)
const showSettingPopover = ref(false)
const previewParams = ref<PreviewParam[]>([])
const previewContainerRef = ref<HTMLElement | null>(null)
const chatRef = ref()
const message = ElMessage

const {
  project,
  zoomIn,
  zoomOut,
  fitView,
  setViewport,
  getViewport,
  addEdges,
  addNodes,
  getNodes,
  getEdges,
  setNodes,
  setEdges,
  removeNodes,
} = useVueFlow()

const nodeTypes = { [CUSTOM_NODE]: CustomNode }
const edgeTypes = { [CUSTOM_EDGE]: CustomEdge }

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

const previewMessages = computed(() => props.previewMessages || [])
const previewLoading = computed(() => props.previewLoading || false)

const applyInitialData = async (
  nextNodes: Node[] = [],
  nextEdges: Edge[] = []
) => {
  const clonedNodes = clone(nextNodes)
  const clonedEdges = clone(nextEdges).map((edge: Edge) => ({
    ...edge,
    type: CUSTOM_EDGE,
  }))
  nodes.value = clonedNodes
  edges.value = clonedEdges
  setNodes(clonedNodes)
  await nextTick()
  setEdges(clonedEdges)
}

watch(
  () => [props.initialNodes, props.initialEdges],
  ([nextNodes, nextEdges]) => {
    applyInitialData(
      (nextNodes || []) as Node[],
      (nextEdges || []) as Edge[]
    )
  },
  { immediate: true, deep: true }
)

// // 初始化节点数据
// const initNodes = clone(props.initialNodes || [])
// nodes.value = initNodes

// // 初始化边数据，确保所有边都使用自定义边类型
// const initEdges = clone(props.initialEdges || [])
// edges.value = initEdges.map((edge: Edge) => ({
//   ...edge,
//   type: CUSTOM_EDGE,
// }))

const selectedNode = computed(
  () =>
    (nodes.value.find((node) => node.id === selectedNodeId.value) as
      | Node
      | undefined) || null
)
const selectedNodeData = computed(() => (selectedNode.value?.data || {}) as any)

const chatParams = computed(() => {
  const params: Record<string, any> = {}
  previewParams.value.forEach((p) => {
    const rawValue = p.value
    if (rawValue === '' || rawValue === null || rawValue === undefined) {
      return
    }
    if (p.dataType === 'Number') {
      const num = Number(rawValue)
      if (!isNaN(num)) {
        params[p.name] = num
      }
      return
    }
    if (p.dataType === 'Boolean') {
      params[p.name] = Boolean(rawValue)
      return
    }
    params[p.name] = rawValue
  })
  return params
})

const isPreviewParamEmpty = (param: { value: any }) => {
  const value = param.value
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  return false
}

const handlePreviewSendCheck = (_messageText: string) => {
  if (previewParams.value.length === 0) {
    loadPreviewParams()
  }
  const missingParams = previewParams.value
    .filter((param) => param.required)
    .filter((param) => isPreviewParamEmpty(param))
    .map((param) => param.description || param.name)
  if (missingParams.length > 0) {
    message.warning(`请填写必填参数: ${missingParams.join('、')}`)
    showSettingPopover.value = true
    return false
  }
  return true
}

const handlePreviewSend = (messageText: string) => {
  emit('preview-send', {
    message: messageText,
    params: chatParams.value,
    data: getData(),
  })
}

const handleResetChat = () => {
  chatRef.value?.reset?.()
  emit('preview-reset')
}

const handleSettingVisibleChange = (visible: boolean) => {
  if (visible) {
    loadPreviewParams()
  }
}

const loadPreviewParams = () => {
  const startNode = getStartNode()
  if (!startNode) {
    previewParams.value = []
    return
  }
  const parameters = (startNode.data as any)?.parameters || []
  previewParams.value = parameters
    .filter((p: any) => p.name !== 'sys.query')
    .map((p: any) => {
      const existing = previewParams.value.find((item) => item.name === p.name)
      const dataType = p.dataType || 'String'
      const fallbackValue = p.defaultValue ?? ''
      let value = existing?.value
      if (value === undefined) {
        if (dataType === 'Boolean') {
          value = fallbackValue === true || fallbackValue === 'true'
        } else {
          value = fallbackValue
        }
      } else if (dataType === 'Boolean') {
        value = value === true || value === 'true'
      }
      return {
        name: p.name,
        value,
        dataType,
        required: !!p.required,
        description: p.description || '',
      }
    })
}

const getStartNode = () => {
  return nodes.value.find((node) => node.data?.type === BlockEnum.Start)
}

const panelComponent = computed(() => {
  if (!selectedNode.value?.data) return null
  switch (selectedNode.value.data.type) {
    case BlockEnum.Start:
      return StartPanel
    case BlockEnum.End:
      return EndPanel
    case BlockEnum.LLM:
      return LLMPanel
    case BlockEnum.Code:
      return CodePanel
    case BlockEnum.HttpRequest:
      return HttpPanel
    case BlockEnum.Tool:
      return ToolPanel
    case BlockEnum.IfElse:
      return IfElsePanel
    case BlockEnum.Answer:
      return AnswerPanel
    case BlockEnum.KnowledgeRetrieval:
      return KnowledgeRetrievalPanel
    case BlockEnum.QuestionClassifier:
      return QuestionClassifierPanel
    case BlockEnum.VariableAssigner:
      return VariableAssignerPanel
    case BlockEnum.TemplateTransform:
      return TemplateTransformPanel
    default:
      return null
  }
})

const updateNodeData = (nodeId: string, data: Record<string, unknown>) => {
  // 只更新指定节点的 data，保持其他属性（包括 position）不变
  nodes.value = nodes.value.map((node) => {
    if (node.id === nodeId) {
      return {
        ...node,
        data: {
          ...(node.data || {}),
          ...data,
        },
      }
    }
    return node
  })
}

provide(updateNodeDataKey, updateNodeData)

// 提供节点和边数据给子组件（如 EndPanel）使用
provide('workflowNodes', nodes)
provide('workflowEdges', edges)

// 从源节点添加新节点（点击节点右侧加号按钮时触发）
const handleAddNodeFromSource = (sourceNodeId: string, nodeType: BlockEnum) => {
  const classification = BLOCK_CLASSIFICATIONS[nodeType]
  if (!classification) return

  // 找到源节点
  const sourceNode = nodes.value.find((node) => node.id === sourceNodeId)
  if (!sourceNode) return

  // 计算新节点位置：在源节点右侧
  const newPosition = {
    x: sourceNode.position.x + 280,
    y: sourceNode.position.y,
  }

  const newNodeId = uuid()
  const newNode: Node = {
    id: newNodeId,
    type: CUSTOM_NODE,
    position: newPosition,
    data: {
      type: nodeType,
      title: classification.title,
      desc: '',
    },
  }

  // 使用 VueFlow 的 addNodes API 添加节点
  addNodes([newNode])

  // 关闭配置面板
  closePanel()
}

provide(addNodeFromSourceKey, handleAddNodeFromSource)

const handleConnect = (connection: Connection) => {
  if (!connection.source || !connection.target) return
  const sourceNode = nodes.value.find(
    (node) => node.id === connection.source
  ) as Node | undefined
  const targetNode = nodes.value.find(
    (node) => node.id === connection.target
  ) as Node | undefined

  const newEdge: Edge = {
    id: `${connection.source}-${connection.sourceHandle || 'default'}-${
      connection.target
    }-${connection.targetHandle || 'default'}`,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle || undefined,
    targetHandle: connection.targetHandle || undefined,
    type: CUSTOM_EDGE,
    data: {
      sourceType: sourceNode?.data?.type || BlockEnum.Start,
      targetType: targetNode?.data?.type || BlockEnum.End,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#9ca3af',
    },
  }

  addEdges([newEdge])
}

const handleNodeClick = ({ event, node }: NodeMouseEvent) => {
  event.stopPropagation()
  selectedNodeId.value = node.id
  console.log('workflow nodes:', nodes)
  console.log('workflow edges:', edges)
}

const handlePaneClick = () => {
  // 点击画布空白区域时关闭配置面板
  closePanel()
}

const closePanel = () => {
  selectedNodeId.value = null
}

/**
 * 阻止 VueFlow 的默认删除行为
 * 返回 false 表示不允许删除，由我们自己的逻辑处理
 */
const handleBeforeDelete = () => {
  return false
}

const handleRunStep = () => {
  // TODO: 实现单步运行功能
}

const handleSave = () => {
  emit('save', getData())
}

const handleLocateNode = () => {
  if (!selectedNode.value) return
  const viewport = getViewport()
  const canvas = document.querySelector(
    '.wf-canvas .vue-flow'
  ) as HTMLElement | null
  const canvasWidth = canvas?.clientWidth || window.innerWidth
  const canvasHeight = canvas?.clientHeight || window.innerHeight
  const nodeWidth =
    (selectedNode.value as any).dimensions?.width ||
    selectedNode.value.data?.width ||
    0
  const nodeHeight =
    (selectedNode.value as any).dimensions?.height ||
    selectedNode.value.data?.height ||
    0
  const target = {
    x:
      -selectedNode.value.position.x * viewport.zoom +
      (canvasWidth - nodeWidth * viewport.zoom) / 2,
    y:
      -selectedNode.value.position.y * viewport.zoom +
      (canvasHeight - nodeHeight * viewport.zoom) / 2,
    zoom: viewport.zoom,
  }
  ;(
    setViewport as unknown as (
      v: typeof target,
      o?: { duration?: number }
    ) => void
  )(target, { duration: 320 })
}

const handlePanelAction = (command: string) => {
  if (!selectedNode.value) return
  switch (command) {
    case 'run-step':
      handleRunStep()
      break
    case 'locate-node':
      handleLocateNode()
      break
    case 'copy': {
      const payload = JSON.stringify(selectedNode.value.data || {}, null, 2)
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(payload).catch(() => {})
      }
      break
    }
    case 'duplicate': {
      const source = selectedNode.value
      const duplicated: Node = {
        ...source,
        id: uuid(),
        position: {
          x: source.position.x + 40,
          y: source.position.y + 40,
        },
        data: {
          ...source.data,
          title: `${source.data?.title || '节点'}_copy`,
        } as Node['data'],
      }
      nodes.value = [...nodes.value, duplicated]
      closePanel()
      break
    }
    case 'delete': {
      const targetId = selectedNode.value.id
      removeNodes([targetId], true)
      closePanel()
      break
    }
    default:
      break
  }
}

const handleEdgeHover = (hovering: boolean) => (event: { edge: Edge }) => {
  const edgeId = event.edge.id
  edges.value = edges.value.map((edge) => {
    if (edge.id === edgeId) {
      const baseData = edge.data || {
        sourceType: BlockEnum.Start,
        targetType: BlockEnum.End,
      }
      return {
        ...edge,
        data: {
          ...baseData,
          _hovering: hovering,
        },
      }
    }
    return edge
  })
}

const isValidConnection = (connection: Connection) => {
  if (connection.source === connection.target) return false
  const existingEdge = edges.value.find(
    (edge) =>
      edge.source === connection.source && edge.target === connection.target
  )
  return !existingEdge
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  if (!event.dataTransfer) return
  const type = event.dataTransfer.getData('application/vueflow') as BlockEnum
  if (!type) return
  const classification = BLOCK_CLASSIFICATIONS[type]
  if (!classification) return

  // 获取画布容器的位置
  const canvas = document.querySelector('.wf-canvas') as HTMLElement | null
  const canvasRect = canvas?.getBoundingClientRect()

  // 计算相对于画布的坐标
  const x = event.clientX - (canvasRect?.left || 0)
  const y = event.clientY - (canvasRect?.top || 0)

  // 转换为流程图坐标
  const position = project({ x, y })

  const newNode: Node = {
    id: uuid(),
    type: CUSTOM_NODE,
    position: { x: position.x - 100, y: position.y - 30 },
    data: {
      type,
      title: classification.title,
      desc: '',
    },
  }
  addNodes([newNode])
  closePanel()
}

const handleAddNode = (type: BlockEnum) => {
  const classification = BLOCK_CLASSIFICATIONS[type]
  if (!classification) return

  // 计算新节点位置
  let newPosition: { x: number; y: number }

  if (nodes.value.length === 0) {
    // 如果没有节点，放在画布中心
    const position = project({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    })
    newPosition = { x: position.x - 100, y: position.y - 30 }
  } else {
    // 找到最右边的节点，新节点放在其右侧
    const rightmostNode = nodes.value.reduce((prev, curr) =>
      curr.position.x > prev.position.x ? curr : prev
    )
    newPosition = {
      x: rightmostNode.position.x + 250,
      y: rightmostNode.position.y,
    }
  }

  const newNodeId = uuid()
  const newNode: Node = {
    id: newNodeId,
    type: CUSTOM_NODE,
    position: newPosition,
    data: {
      type,
      title: classification.title,
      desc: '',
    },
  }
  addNodes([newNode])
  closePanel()
}

const toggleNodeSelector = () => {
  nodeSelectorCollapsed.value = !nodeSelectorCollapsed.value
}

const handlePreview = () => {
  if (!showPreviewDrawer.value) {
    closePanel()
    showSettingPopover.value = true
    loadPreviewParams()
  } else {
    showSettingPopover.value = false
  }
  showPreviewDrawer.value = !showPreviewDrawer.value
  emit('preview', getData())
}

const handlePreviewClose = () => {
  showSettingPopover.value = false
}

const onInit = () => {
  applyInitialData(
    (props.initialNodes || []) as Node[],
    (props.initialEdges || []) as Edge[]
  )
  fitView({ padding: 0.2, maxZoom: 0.8 })
}

const handleViewportChange = (viewport: { zoom: number }) => {
  viewportZoom.value = viewport.zoom
}

const handleControlChange = (mode: ControlMode) => {
  controlMode.value = mode
}

const handleZoomIn = () => {
  zoomIn()
}

const handleZoomOut = () => {
  zoomOut()
}

const handleFitView = () => {
  fitView({ maxZoom: 0.8 })
}

const handleZoomTo = (zoomPercent: number) => {
  const viewport = getViewport()
  setViewport({ ...viewport, zoom: zoomPercent / 100 })
}

/**
 * 获取当前工作流数据
 */
const getData = () => {
  return {
    nodes: unref(getNodes),
    edges: unref(getEdges),
  }
}

// 暴露给父组件的方法和数据
defineExpose({
  nodes,
  edges,
  getData,
  closePanel,
})
</script>

<style scoped>
.wf-container {
  display: flex;
  height: 100%;
  width: 100%;
  background: #f3f4f6;
  position: relative;
}

.wf-canvas {
  position: relative;
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.wf-actions-wrap {
  position: absolute;
  top: 12px;
  right: 16px;
  z-index: 12;
}

.wf-canvas-bg {
  background-color: #f9fafb;
}

.wf-toolbar-wrap {
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  z-index: 10;
}

.wf-minimap {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.12);
  background: #ffffff;
}

.wf-panel-empty {
  padding: 16px;
  font-size: 13px;
  color: #9ca3af;
}

/* 预览窗口样式 */
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0px;
  background: white;
  flex-shrink: 0;
}

.preview-header-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.preview-header-actions {
  display: flex;
  align-items: center;
  gap: 0;

  :deep(.el-button) {
    font-size: 18px;
    padding: 4px;
  }
}

.preview-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #f5f7fa;
  height: calc(100% - 49px);
  position: relative;
}
</style>

<style lang="scss">
.aiflow-preview-drawer {
  position: absolute !important;
  height: 100% !important;
  top: 0 !important;
  bottom: 0 !important;
}

.el-drawer.aiflow-preview-drawer {
  position: absolute !important;
  height: 100% !important;
  top: 0 !important;
  bottom: 0 !important;

  .el-drawer__body {
    display: flex;
    flex-direction: column;
    padding: 0;
    height: 100%;
    overflow: hidden;
  }
}
</style>

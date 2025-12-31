<template>
  <div class="wf-container">
    <NodeSelector
      v-if="!readOnly"
      :is-collapsed="nodeSelectorCollapsed"
      @toggle-collapse="toggleNodeSelector"
      @add-node="handleAddNode"
    />

    <div class="wf-canvas" @dragover.prevent="onDragOver" @drop="onDrop">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        :node-types="nodeTypes"
        :default-viewport="{ x: 100, y: 100, zoom: 1 }"
        :fit-view-on-init="true"
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
        :delete-key-code="'Backspace'"
        :multi-selection-key-code="null"
        :is-valid-connection="isValidConnection"
        @init="() => fitView({ padding: 0.2 })"
        @nodes-change="handleNodesChange"
        @edges-change="handleEdgesChange"
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
          @control-change="(mode) => (controlMode = mode)"
          @zoom-in="zoomIn"
          @zoom-out="zoomOut"
          @fit-view="fitView"
          @zoom-to="handleZoomTo"
          @toggle-grid="() => (showGrid = !showGrid)"
          @toggle-minimap="() => (showMinimap = !showMinimap)"
          @run="() => (isRunning = true)"
          @stop="() => (isRunning = false)"
          @save="() => console.log('Save workflow')"
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
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import {
  VueFlow,
  useVueFlow,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  SelectionMode,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type NodeMouseEvent,
} from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { v4 as uuid } from 'uuid'
import NodeSelector from './operator/NodeSelector.vue'
import WorkflowToolbar from './operator/WorkflowToolbar.vue'
import NodePanel from './panel/NodePanel.vue'
import CustomNode from './nodes/CustomNode.vue'
import {
  BLOCK_CLASSIFICATIONS,
  BlockEnum,
  ControlMode,
  CUSTOM_NODE,
  type Edge,
  type Node,
} from '@/types/workflow'
import { updateNodeDataKey } from '@/composables/useNodeData'
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

const props = withDefaults(
  defineProps<{
    initialNodes?: Node[]
    initialEdges?: Edge[]
    readOnly?: boolean
  }>(),
  {
    initialNodes: () => [],
    initialEdges: () => [],
    readOnly: false,
  }
)

const emit = defineEmits<{
  (e: 'nodes-change', nodes: Node[]): void
  (e: 'edges-change', edges: Edge[]): void
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

const {
  project,
  zoomIn,
  zoomOut,
  fitView,
  setViewport,
  getViewport,
  addEdges,
  addNodes,
} = useVueFlow()

const nodeTypes = { [CUSTOM_NODE]: CustomNode }

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

watch(
  () => props.initialNodes,
  (value) => {
    nodes.value = clone(value || [])
  },
  { immediate: true }
)

watch(
  () => props.initialEdges,
  (value) => {
    edges.value = clone(value || [])
  },
  { immediate: true }
)

const selectedNode = computed(
  () =>
    (nodes.value.find((node) => node.id === selectedNodeId.value) as
      | Node
      | undefined) || null
)
const selectedNodeData = computed(() => (selectedNode.value?.data || {}) as any)

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
  emit('nodes-change', nodes.value)
}

provide(updateNodeDataKey, updateNodeData)

const handleNodesChange = (changes: NodeChange[]) => {
  const next = applyNodeChanges(changes, nodes.value) as unknown as Node[]
  nodes.value = next
  emit('nodes-change', next)
}

const handleEdgesChange = (changes: EdgeChange[]) => {
  console.log('handleEdgesChange called with:', changes)
  // 过滤掉 add 类型的变更，因为我们在 handleConnect 中手动添加边
  const filteredChanges = changes.filter((change) => change.type !== 'add')
  if (filteredChanges.length === 0) return

  console.log('Applying edge changes:', filteredChanges)
  const next = applyEdgeChanges(
    filteredChanges,
    edges.value
  ) as unknown as Edge[]
  edges.value = next
  emit('edges-change', next)
}

const handleConnect = (connection: Connection) => {
  console.log('handleConnect called with:', connection)
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
    type: 'default',
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

  console.log('Adding new edge:', newEdge)
  console.log('Current edges before add:', edges.value.length)
  // 使用 addEdges 方法添加边，这会自动触发内部状态更新
  addEdges([newEdge])
  // 同时更新本地状态
  edges.value = [...edges.value, newEdge]
  console.log('Current edges after add:', edges.value.length)
  emit('edges-change', edges.value)
}

const handleNodeClick = ({ event, node }: NodeMouseEvent) => {
  event.stopPropagation()
  selectedNodeId.value = node.id
}

const handlePaneClick = () => {
  // 点击画布空白区域时关闭配置面板
  closePanel()
}

const closePanel = () => {
  selectedNodeId.value = null
}

const handleRunStep = () => {
  console.log('Run step', selectedNodeId.value)
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
    selectedNode.value.dimensions?.width || selectedNode.value.width || 0
  const nodeHeight =
    selectedNode.value.dimensions?.height || selectedNode.value.height || 0
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
          ...(source.data || {}),
          title: `${source.data?.title || '节点'}_copy`,
        },
      }
      nodes.value = [...nodes.value, duplicated]
      break
    }
    case 'delete': {
      const targetId = selectedNode.value.id
      nodes.value = nodes.value.filter((node) => node.id !== targetId)
      edges.value = edges.value.filter(
        (edge) => edge.source !== targetId && edge.target !== targetId
      )
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
  // 只使用 addNodes，让 handleNodesChange 来同步 nodes.value
  addNodes([newNode])
  // 关闭配置面板
  closePanel()
}

const handleAddNode = (type: BlockEnum) => {
  const classification = BLOCK_CLASSIFICATIONS[type]
  if (!classification) return

  // 计算新节点位置：基于现有节点位置偏移，避免重叠
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

  const newNode: Node = {
    id: uuid(),
    type: CUSTOM_NODE,
    position: newPosition,
    data: {
      type,
      title: classification.title,
      desc: '',
    },
  }
  // 只使用 addNodes，让 handleNodesChange 来同步 nodes.value
  addNodes([newNode])
  // 关闭配置面板
  closePanel()
}

const toggleNodeSelector = () => {
  nodeSelectorCollapsed.value = !nodeSelectorCollapsed.value
}

const handleViewportChange = (viewport: { zoom: number }) => {
  viewportZoom.value = viewport.zoom
}

const handleZoomTo = (zoomPercent: number) => {
  const viewport = getViewport()
  setViewport({ ...viewport, zoom: zoomPercent / 100 })
}
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
</style>

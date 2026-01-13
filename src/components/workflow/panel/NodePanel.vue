<template>
  <aside class="wf-panel">
    <div class="wf-panel__header">
      <div class="wf-panel__title">
        <div
          class="wf-panel__icon"
          :style="{ backgroundColor: classification.color }"
        >
          <el-icon><component :is="iconComponent" /></el-icon>
        </div>
        <div>
          <h3 class="wf-panel__name">{{ classification.title }}</h3>
          <p class="wf-panel__subtitle">节点配置</p>
        </div>
      </div>
      <div class="wf-panel__actions">
        <el-tooltip v-if="canRun" content="运行此步骤" placement="bottom">
          <el-button circle text @click="emit('run-step')">
            <el-icon><VideoPlay /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="定位节点" placement="bottom">
          <el-button circle text @click="emit('locate-node')">
            <el-icon><Aim /></el-icon>
          </el-button>
        </el-tooltip>
        <el-dropdown
          trigger="click"
          @command="(command: string) => emit('action', command)"
        >
          <el-button circle text>
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="duplicate">复制</el-dropdown-item>
              <el-dropdown-item divided command="delete">删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button circle text @click="emit('close')">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="wf-panel__content">
      <div class="wf-panel__section">
        <div class="wf-panel__field">
          <label class="wf-panel__label">节点名称</label>
          <el-input
            :model-value="title"
            placeholder="输入节点名称"
            @input="(value: string) => updateField('title', value)"
          />
        </div>
        <div class="wf-panel__field">
          <label class="wf-panel__label">描述</label>
          <el-input
            :model-value="desc"
            type="textarea"
            :rows="2"
            placeholder="输入节点描述（可选）"
            @input="(value: string) => updateField('desc', value)"
          />
        </div>
      </div>

      <div class="wf-panel__divider" />

      <div class="wf-panel__tabs">
        <el-tabs v-model="activeTab" class="wf-panel__tabs-inner">
          <el-tab-pane label="设置" name="settings">
            <div class="wf-panel__slot">
              <slot />
            </div>
          </el-tab-pane>
          <el-tab-pane label="上次运行" name="last-run">
            <div class="wf-last-run">
              <div v-if="!lastRun" class="wf-last-run__empty">暂无运行记录</div>
              <template v-else>
                <div class="wf-last-run__summary" :class="statusClass">
                  <div class="wf-last-run__status">
                    <span class="wf-last-run__dot"></span>
                    <span class="wf-last-run__status-text">{{
                      statusLabel
                    }}</span>
                  </div>
                  <div class="wf-last-run__metric">
                    <span class="wf-last-run__metric-label">运行时间</span>
                    <span class="wf-last-run__metric-value">
                      {{ formatDuration(lastRun.duration) }}
                    </span>
                  </div>
                  <div class="wf-last-run__metric">
                    <span class="wf-last-run__metric-label">执行人</span>
                    <span class="wf-last-run__metric-value">
                      {{ formatTokens(lastRun.tokens) }}
                    </span>
                  </div>
                </div>

                <div class="wf-last-run__block">
                  <div class="wf-last-run__block-header">
                    <span>输入</span>
                    <div class="wf-last-run__actions">
                      <el-button
                        circle
                        text
                        size="small"
                        @click="copyText(lastRunInput)"
                      >
                        <el-icon><CopyDocument /></el-icon>
                      </el-button>
                      <el-button
                        circle
                        text
                        size="small"
                        @click="openDialog('输入', lastRunInput)"
                      >
                        <el-icon><FullScreen /></el-icon>
                      </el-button>
                    </div>
                  </div>
                  <pre class="wf-last-run__code">{{
                    lastRunInput || '暂无数据'
                  }}</pre>
                </div>

                <div class="wf-last-run__block">
                  <div class="wf-last-run__block-header">
                    <span>输出</span>
                    <div class="wf-last-run__actions">
                      <el-button
                        circle
                        text
                        size="small"
                        @click="copyText(lastRunOutput)"
                      >
                        <el-icon><CopyDocument /></el-icon>
                      </el-button>
                      <el-button
                        circle
                        text
                        size="small"
                        @click="openDialog('输出', lastRunOutput)"
                      >
                        <el-icon><FullScreen /></el-icon>
                      </el-button>
                    </div>
                  </div>
                  <pre class="wf-last-run__code">{{
                    lastRunOutput || '暂无数据'
                  }}</pre>
                </div>
              </template>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="720px">
      <pre class="wf-last-run__dialog">{{ dialogContent || '暂无数据' }}</pre>
    </el-dialog>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Aim,
  Close,
  MoreFilled,
  VideoPause,
  VideoPlay,
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
  CopyDocument,
  FullScreen,
} from '@element-plus/icons-vue'
import type { LastRunInfo, Node } from '../../../types/workflow'
import {
  BLOCK_CLASSIFICATIONS,
  BlockEnum,
  NO_RUN_NODE_TYPES,
  NodeRunningStatus,
} from '../../../types/workflow'
import { useNodeData } from '../../../composables/useNodeData'

const props = defineProps<{
  node: Node
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'run-step'): void
  (e: 'locate-node'): void
  (e: 'action', command: string): void
}>()

const { setInputs } = useNodeData(
  props.node.id,
  (props.node.data || {}) as Record<string, unknown>
)

const title = computed(() => props.node.data?.title || '')
const desc = computed(() => props.node.data?.desc || '')

const classification = computed(() => {
  const nodeType = props.node.data?.type || BlockEnum.Start
  return (
    BLOCK_CLASSIFICATIONS[nodeType] || {
      title: nodeType,
      color: '#6b7280',
      icon: 'cpu',
    }
  )
})

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

const canRun = computed(() => {
  const nodeType = props.node.data?.type || BlockEnum.Start
  return !NO_RUN_NODE_TYPES.includes(nodeType)
})

const activeTab = ref('settings')
const lastRun = computed<LastRunInfo | null>(() => {
  return (props.node.data?.lastRun || null) as LastRunInfo | null
})
const statusLabel = computed(() => {
  const status = lastRun.value?.status
  switch (status) {
    case NodeRunningStatus.Succeeded:
      return 'SUCCESS'
    case NodeRunningStatus.Failed:
      return 'FAILED'
    case NodeRunningStatus.Exception:
      return 'EXCEPTION'
    case NodeRunningStatus.Running:
      return 'RUNNING'
    case NodeRunningStatus.Waiting:
      return 'WAITING'
    default:
      return 'UNKNOWN'
  }
})
const statusClass = computed(() => {
  const status = lastRun.value?.status
  if (status === NodeRunningStatus.Succeeded)
    return 'wf-last-run__summary--success'
  if (status === NodeRunningStatus.Running)
    return 'wf-last-run__summary--running'
  if (status === NodeRunningStatus.Waiting)
    return 'wf-last-run__summary--waiting'
  return 'wf-last-run__summary--failed'
})

const formatDuration = (value?: number) => {
  if (value === null || value === undefined) return '-'
  const numeric = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(numeric)) return '-'
  return `${numeric.toFixed(3)}s`
}

const formatTokens = (value?: number) => {
  if (value === null || value === undefined) return '-'
  const numeric = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(numeric)) return '-'
  return `${numeric} Tokens`
}

const formatJson = (value: unknown) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return value
    }
  }
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

const lastRunInput = computed(() => formatJson(lastRun.value?.input))
const lastRunOutput = computed(() => formatJson(lastRun.value?.output))

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogContent = ref('')

const openDialog = (title: string, content: string) => {
  dialogTitle.value = title
  dialogContent.value = content
  dialogVisible.value = true
}

const copyText = (content: string) => {
  if (!content) return
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(content).catch(() => {})
  }
}

watch(
  () => props.node.id,
  () => {
    activeTab.value = 'settings'
  }
)

const updateField = (key: 'title' | 'desc', value: string) => {
  setInputs({ [key]: value } as Record<string, string>)
}
</script>

<style scoped>
.wf-panel {
  width: 380px;
  height: 100%;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  box-shadow: -12px 0 24px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
}

.wf-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  gap: 8px;
  flex-wrap: nowrap;
}

.wf-panel__title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wf-panel__icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.wf-panel__name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.wf-panel__subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: #9ca3af;
}

.wf-panel__content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.wf-panel__section {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wf-panel__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wf-panel__label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.wf-panel__divider {
  height: 1px;
  background: #f3f4f6;
}

.wf-panel__slot {
  flex: 1;
  overflow-y: auto;
}

.wf-panel__tabs {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.wf-panel__tabs-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.wf-panel__tabs-inner :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
}

.wf-panel__tabs-inner :deep(.el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.wf-panel__tabs-inner :deep(.el-tabs__header) {
  padding: 0 12px;
}

.wf-panel__tabs-inner :deep(.el-tabs__nav-wrap::after) {
  background-color: #f3f4f6;
}

.wf-panel__actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto;
  flex-shrink: 0;
}

.wf-panel__actions :deep(.el-button) {
  margin-left: 0;
  width: 18px;
  height: 18px;
  padding: 0;
  font-size: 18px;
}

.wf-panel__actions :deep(.el-button:hover) {
  background: transparent;
}

.wf-panel__actions :deep(.el-button .el-icon) {
  font-size: 18px;
}

.wf-last-run {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow-y: auto;
}

.wf-last-run__empty {
  text-align: center;
  color: #9ca3af;
  padding: 40px 0;
}

.wf-last-run__summary {
  display: grid;
  grid-template-columns: 1.1fr 1fr 1fr;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
}

.wf-last-run__summary--success {
  border-color: #86efac;
  background: #ecfdf3;
}

.wf-last-run__summary--running {
  border-color: #93c5fd;
  background: #eff6ff;
}

.wf-last-run__summary--waiting {
  border-color: #fde68a;
  background: #fffbeb;
}

.wf-last-run__summary--failed {
  border-color: #fecaca;
  background: #fef2f2;
}

.wf-last-run__summary--success .wf-last-run__status {
  color: #059669;
}

.wf-last-run__summary--running .wf-last-run__status {
  color: #2563eb;
}

.wf-last-run__summary--waiting .wf-last-run__status {
  color: #b45309;
}

.wf-last-run__summary--failed .wf-last-run__status {
  color: #dc2626;
}

.wf-last-run__status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #111827;
}

.wf-last-run__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: currentColor;
}

.wf-last-run__metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wf-last-run__metric-label {
  font-size: 12px;
  color: #6b7280;
}

.wf-last-run__metric-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.wf-last-run__block {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.wf-last-run__block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #f3f4f6;
  font-weight: 600;
  color: #111827;
  background: #f9fafb;
}

.wf-last-run__actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.wf-last-run__code {
  margin: 0;
  padding: 12px 14px;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #111827;
  white-space: pre-wrap;
  word-break: break-word;
  height: 200px;
  overflow: auto;
  background: #ffffff;
}

.wf-last-run__dialog {
  margin: 0;
  padding: 12px;
  max-height: 60vh;
  overflow: auto;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>

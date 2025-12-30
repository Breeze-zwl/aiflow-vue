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
        <el-tooltip content="运行此步骤" placement="bottom">
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

      <div class="wf-panel__slot">
        <slot />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
} from '@element-plus/icons-vue'
import type { Node } from '@/types/workflow'
import { BLOCK_CLASSIFICATIONS, BlockEnum } from '@/types/workflow'
import { useNodeData } from '@/composables/useNodeData'

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
</style>
.wf-panel__actions { display: flex; align-items: center; gap: 4px; margin-left:
auto; flex-shrink: 0; } .wf-panel__divider-v { width: 1px; height: 22px;
background: #e5e7eb; margin: 0 6px; } .wf-panel__actions :deep(.el-button) {
margin-left: 0; } .wf-panel__actions :deep(.el-button:last-child) { margin-left:
4px; }

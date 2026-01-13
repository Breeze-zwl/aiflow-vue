<template>
  <div class="wf-toolbar">
    <div class="wf-toolbar__group">
      <el-button
        circle
        size="small"
        :type="controlMode === ControlMode.Pointer ? 'primary' : 'default'"
        @click="() => emit('control-change', ControlMode.Pointer)"
      >
        <el-icon><Pointer /></el-icon>
      </el-button>
      <el-button
        circle
        size="small"
        :type="controlMode === ControlMode.Hand ? 'primary' : 'default'"
        @click="() => emit('control-change', ControlMode.Hand)"
      >
        <el-icon><Rank /></el-icon>
      </el-button>
    </div>

    <div class="wf-toolbar__divider" />

    <div class="wf-toolbar__group">
      <el-button circle size="small" @click="() => emit('zoom-out')">
        <el-icon><ZoomOut /></el-icon>
      </el-button>
      <el-dropdown @command="handleZoomSelect">
        <span class="wf-toolbar__zoom">{{ zoomLabel }}</span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="preset in zoomPresets"
              :key="preset"
              :command="preset"
            >
              {{ preset }}%
            </el-dropdown-item>
            <el-dropdown-item command="fit">适应画布</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button circle size="small" @click="() => emit('zoom-in')">
        <el-icon><ZoomIn /></el-icon>
      </el-button>
      <el-button circle size="small" @click="() => emit('fit-view')">
        <el-icon><FullScreen /></el-icon>
      </el-button>
    </div>

    <div class="wf-toolbar__divider" />

    <div v-if="!readOnly" class="wf-toolbar__group">
      <el-button circle size="small" :disabled="!canUndo" @click="() => emit('undo')">
        <el-icon><RefreshLeft /></el-icon>
      </el-button>
      <el-button circle size="small" :disabled="!canRedo" @click="() => emit('redo')">
        <el-icon><RefreshRight /></el-icon>
      </el-button>
    </div>

    <div v-if="!readOnly" class="wf-toolbar__divider" />

    <div v-if="!readOnly" class="wf-toolbar__group">
      <el-button circle size="small" @click="() => emit('copy')">
        <el-icon><CopyDocument /></el-icon>
      </el-button>
      <el-button circle size="small" type="danger" plain @click="() => emit('delete')">
        <el-icon><Delete /></el-icon>
      </el-button>
    </div>

    <div class="wf-toolbar__divider" />

    <div class="wf-toolbar__group">
      <el-button circle size="small" @click="() => emit('toggle-grid')" :type="showGrid ? 'primary' : 'default'">
        <el-icon><Grid /></el-icon>
      </el-button>
      <el-button
        circle
        size="small"
        @click="() => emit('toggle-minimap')"
        :type="showMinimap ? 'primary' : 'default'"
      >
        <el-icon>
          <component :is="showMinimap ? View : Hide" />
        </el-icon>
      </el-button>
    </div>

    <div class="wf-toolbar__divider" />

    <div class="wf-toolbar__group">
      <el-button
        v-if="!isRunning"
        circle
        size="small"
        type="primary"
        @click="() => emit('run')"
      >
        <el-icon><VideoPlay /></el-icon>
      </el-button>
      <el-button
        v-else
        circle
        size="small"
        type="danger"
        @click="() => emit('stop')"
      >
        <el-icon><VideoPause /></el-icon>
      </el-button>
      <el-button circle size="small" @click="() => emit('save')">
        <el-icon><Document /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Pointer,
  Rank,
  ZoomIn,
  ZoomOut,
  FullScreen,
  RefreshLeft,
  RefreshRight,
  Delete,
  CopyDocument,
  Grid,
  View,
  Hide,
  VideoPlay,
  VideoPause,
  Document,
} from '@element-plus/icons-vue'
import { computed } from 'vue'
import { ControlMode } from '../../../types/workflow'

const props = defineProps<{
  controlMode: ControlMode
  zoom: number
  showMinimap?: boolean
  showGrid?: boolean
  isRunning?: boolean
  readOnly?: boolean
  canUndo?: boolean
  canRedo?: boolean
}>()

const emit = defineEmits<{
  (e: 'control-change', value: ControlMode): void
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'fit-view'): void
  (e: 'zoom-to', value: number): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'delete'): void
  (e: 'copy'): void
  (e: 'toggle-grid'): void
  (e: 'toggle-minimap'): void
  (e: 'run'): void
  (e: 'stop'): void
  (e: 'save'): void
}>()

const zoomPresets = [50, 75, 100, 125, 150, 200]

const zoomLabel = computed(() => `${Math.round(props.zoom * 100)}%`)

const handleZoomSelect = (command: number | string) => {
  if (command === 'fit') {
    emit('fit-view')
    return
  }
  emit('zoom-to', Number(command))
}
</script>

<style scoped>
.wf-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

.wf-toolbar__group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.wf-toolbar__divider {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
}

.wf-toolbar__zoom {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  padding: 4px 8px;
  font-size: 12px;
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
}
</style>

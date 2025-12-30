<template>
  <div>
    <div class="wf-panel-block">
      <Field title="查询变量" required tooltip="选择用于检索的查询内容">
        <VarReferencePicker
          :node-id="id"
          :model-value="queryVariable"
          placeholder="选择查询变量"
          @change="(value: string[] | string) => handleQueryVariableChange(value as string[])"
        />
      </Field>

      <Field title="知识库" required>
        <div class="wf-panel-block__stack">
          <el-select
            :model-value="retrievalMode"
            @change="(value: 'single' | 'multiple') => handleRetrievalModeChange(value)"
          >
            <el-option v-for="option in retrievalModeOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
          <div class="wf-dataset-list">
            <el-radio-group
              v-if="retrievalMode === 'single'"
              :model-value="datasetIds[0]"
              @change="(value: string | number) => handleDatasetIdsChange([value as string])"
            >
              <el-radio
                v-for="dataset in mockDatasets"
                :key="dataset.value"
                :label="dataset.value"
                class="wf-dataset-item"
              >
                {{ dataset.label }}
              </el-radio>
            </el-radio-group>
            <el-checkbox-group
              v-else
              :model-value="datasetIds"
              @change="(value: string[]) => handleDatasetIdsChange(value)"
            >
              <el-checkbox
                v-for="dataset in mockDatasets"
                :key="dataset.value"
                :label="dataset.value"
                class="wf-dataset-item"
              >
                {{ dataset.label }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </Field>

      <Split />

      <Field title="检索设置">
        <div class="wf-grid">
          <div>
            <label class="wf-field-label">Top K</label>
            <el-input
              type="number"
              min="1"
              max="20"
              :model-value="topK"
              @input="(value: string) => handleTopKChange(Number(value))"
            />
          </div>
          <div>
            <label class="wf-field-label">相似度阈值</label>
            <el-input
              type="number"
              min="0"
              max="1"
              step="0.1"
              :model-value="scoreThreshold"
              @input="(value: string) => handleScoreThresholdChange(Number(value))"
            />
          </div>
        </div>
        <div class="wf-toggle-row">
          <div>
            <p class="wf-toggle-title">启用重排序</p>
            <p class="wf-muted">使用 Rerank 模型优化结果</p>
          </div>
          <el-switch :model-value="rerankEnabled" @change="(value: boolean) => handleRerankChange(value)" />
        </div>
      </Field>
    </div>

    <Split />

    <OutputVars>
      <VarItem name="result" type="array" description="检索到的文档片段列表" />
      <VarItem name="context" type="string" description="合并后的上下文文本" />
    </OutputVars>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Field from '../base/Field.vue'
import Split from '../base/Split.vue'
import VarReferencePicker from '../base/VarReferencePicker.vue'
import OutputVars from '../base/OutputVars.vue'
import VarItem from '../base/VarItem.vue'
import { useNodeData } from '@/composables/useNodeData'
import type { KnowledgeRetrievalNodeType } from '@/types/node-config'

const props = defineProps<{
  id: string
  data: KnowledgeRetrievalNodeType
}>()

const { inputs, setInputs } = useNodeData<KnowledgeRetrievalNodeType>(props.id, props.data)

const retrievalModeOptions = [
  { label: '单知识库', value: 'single' },
  { label: '多知识库', value: 'multiple' },
]

const mockDatasets = [
  { label: '产品文档', value: 'dataset_1' },
  { label: '用户手册', value: 'dataset_2' },
  { label: '常见问题', value: 'dataset_3' },
  { label: '技术文档', value: 'dataset_4' },
]

const queryVariable = computed(() => inputs.value.query_variable_selector || [])
const datasetIds = computed(() => inputs.value.dataset_ids || [])
const retrievalMode = computed(() => inputs.value.retrieval_mode || 'single')
const topK = computed(() => inputs.value.top_k || 3)
const scoreThreshold = computed(() => inputs.value.score_threshold || 0.5)
const rerankEnabled = computed(() => inputs.value.rerank_enabled || false)

const handleQueryVariableChange = (value: string[]) => setInputs({ query_variable_selector: value })
const handleDatasetIdsChange = (value: string[]) => setInputs({ dataset_ids: value })
const handleRetrievalModeChange = (value: 'single' | 'multiple') => setInputs({ retrieval_mode: value })
const handleTopKChange = (value: number) => setInputs({ top_k: value })
const handleScoreThresholdChange = (value: number) => setInputs({ score_threshold: value })
const handleRerankChange = (value: boolean) => setInputs({ rerank_enabled: value })

</script>

<style scoped>
.wf-panel-block {
  padding: 12px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wf-panel-block__stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wf-dataset-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
}

.wf-dataset-item {
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
}

.wf-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.wf-field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #6b7280;
}

.wf-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.wf-toggle-title {
  margin: 0;
  font-size: 13px;
  color: #374151;
}

.wf-muted {
  margin: 4px 0 0;
  font-size: 12px;
  color: #9ca3af;
}
</style>

# aiflow-vue

基于 Vue 3 + VueFlow 构建的可视化工作流编辑器组件，支持 AI 工作流场景下的节点编排与配置。

## 特性

- 🎨 **可视化编辑**: 拖拽式节点创建、连线、布局
- 🔧 **丰富节点类型**: 支持 LLM、代码执行、HTTP 请求、条件分支等 12+ 种节点
- 🎯 **响应式设计**: 基于 Vue 3 Composition API
- 🛠 **高度可定制**: 支持只读模式、自定义节点配置

## 安装

```bash
npm install aiflow-vue
```

### 依赖要求

```json
{
  "peerDependencies": {
    "vue": "^3.5.0",
    "@vue-flow/core": "^1.48.0",
    "@vue-flow/background": "^1.3.0",
    "@vue-flow/minimap": "^1.5.0",
    "element-plus": "^2.13.0",
    "pinia": "^3.0.0"
  }
}
```

## 快速开始

```vue
<template>
  <div style="width: 100%; height: 600px;">
    <Workflow
      :initial-nodes="nodes"
      :initial-edges="edges"
      @nodes-change="handleNodesChange"
      @edges-change="handleEdgesChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Workflow } from 'aiflow-vue'
import type { Node, Edge } from 'aiflow-vue'

const nodes = ref<Node[]>([
  {
    id: 'start-1',
    type: 'custom',
    position: { x: 100, y: 100 },
    data: {
      type: 'start',
      title: '开始',
      desc: '工作流起点',
      variables: []
    }
  },
  {
    id: 'llm-1',
    type: 'custom',
    position: { x: 350, y: 100 },
    data: {
      type: 'llm',
      title: 'LLM 节点',
      desc: '调用大语言模型',
      model: {
        provider: 'openai',
        name: 'gpt-4',
        completion_params: { temperature: 0.7 }
      },
      prompt_template: [
        { role: 'system', text: '你是一个有帮助的助手' },
        { role: 'user', text: '{{query}}' }
      ]
    }
  }
])

const edges = ref<Edge[]>([
  {
    id: 'edge-1',
    source: 'start-1',
    target: 'llm-1',
    type: 'default'
  }
])

const handleNodesChange = (newNodes: Node[]) => {
  nodes.value = newNodes
}

const handleEdgesChange = (newEdges: Edge[]) => {
  edges.value = newEdges
}
</script>
```

## API 文档

### Workflow 组件

主要的工作流编辑器组件。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `initialNodes` | `Node[]` | `[]` | 初始节点数组 |
| `initialEdges` | `Edge[]` | `[]` | 初始连线数组 |
| `readOnly` | `boolean` | `false` | 是否为只读模式，禁用编辑功能 |

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `nodes-change` | `(nodes: Node[]) => void` | 节点变更时触发（位置、数据、增删） |
| `edges-change` | `(edges: Edge[]) => void` | 连线变更时触发（新增、删除） |

---

## 数据结构

### Node 节点

```typescript
type Node<T = object> = {
  id: string                    // 节点唯一标识
  type: 'custom'                // 节点类型，固定为 'custom'
  position: {                   // 节点位置
    x: number
    y: number
  }
  data: CommonNodeType<T>       // 节点数据
}

type CommonNodeType<T = object> = {
  type: BlockEnum               // 节点业务类型
  title?: string                // 节点标题
  desc?: string                 // 节点描述
  width?: number                // 节点宽度
  height?: number               // 节点高度
  _runningStatus?: NodeRunningStatus  // 运行状态
} & T
```

### Edge 连线

```typescript
type Edge = {
  id: string                    // 连线唯一标识
  source: string                // 源节点 ID
  target: string                // 目标节点 ID
  sourceHandle?: string         // 源节点连接点（用于条件分支）
  targetHandle?: string         // 目标节点连接点
  type?: string                 // 连线类型
  data?: {                      // 连线数据
    sourceType?: BlockEnum
    targetType?: BlockEnum
  }
}
```

### BlockEnum 节点类型枚举

```typescript
enum BlockEnum {
  Start = 'start',                        // 开始节点
  End = 'end',                            // 结束节点
  Answer = 'answer',                      // 直接回复
  LLM = 'llm',                            // 大语言模型
  KnowledgeRetrieval = 'knowledge-retrieval',  // 知识检索
  QuestionClassifier = 'question-classifier',  // 问题分类
  IfElse = 'if-else',                     // 条件分支
  Code = 'code',                          // 代码执行
  TemplateTransform = 'template-transform',    // 模板转换
  HttpRequest = 'http-request',           // HTTP 请求
  VariableAssigner = 'variable-assigner', // 变量赋值
  Tool = 'tool',                          // 工具调用
  ParameterExtractor = 'parameter-extractor',  // 参数提取
  Iteration = 'iteration',                // 迭代
  DocExtractor = 'document-extractor',    // 文档提取
  ListFilter = 'list-operator',           // 列表操作
  Agent = 'agent',                        // 智能代理
  Loop = 'loop',                          // 循环
}
```

---

## 节点配置详解

### Start 开始节点

```typescript
type StartNodeType = {
  type: 'start'
  title: string
  variables: InputVar[]         // 输入变量定义
}

type InputVar = {
  variable: string              // 变量名
  label: string                 // 显示名称
  type: 'string' | 'paragraph' | 'number' | 'select' | 'file' | 'file-list'
  required: boolean             // 是否必填
  default?: string | number     // 默认值
  options?: string[]            // 下拉选项（type 为 select 时）
  max_length?: number           // 最大长度
}
```

**示例：**

```typescript
{
  id: 'start-1',
  type: 'custom',
  position: { x: 100, y: 100 },
  data: {
    type: 'start',
    title: '开始',
    variables: [
      { variable: 'query', label: '用户问题', type: 'string', required: true },
      { variable: 'language', label: '语言', type: 'select', required: false, options: ['中文', 'English'] }
    ]
  }
}
```

### End 结束节点

```typescript
type EndNodeType = {
  type: 'end'
  title: string
  outputs: Variable[]           // 输出变量映射
}

type Variable = {
  variable: string              // 变量名
  label?: string                // 显示名称
  value_selector?: string[]     // 值来源选择器 [节点ID, 变量名]
  required?: boolean
}
```

**示例：**

```typescript
{
  id: 'end-1',
  type: 'custom',
  position: { x: 600, y: 100 },
  data: {
    type: 'end',
    title: '结束',
    outputs: [
      { variable: 'result', label: '结果', value_selector: ['llm-1', 'text'] }
    ]
  }
}
```

### LLM 大语言模型节点

```typescript
type LLMNodeType = {
  type: 'llm'
  title: string
  model: ModelConfig
  prompt_template: PromptItem[] | PromptItem
  memory?: Memory
  context?: {
    enabled: boolean
    variable_selector: string[]
  }
  vision?: {
    enabled: boolean
    configs?: { detail?: 'low' | 'high' | 'auto' }
  }
}

type ModelConfig = {
  provider: string              // 模型提供商: openai, anthropic, qwen, deepseek
  name: string                  // 模型名称: gpt-4, claude-3-sonnet, etc.
  mode?: string                 // 模式: chat, completion
  completion_params: {
    temperature?: number        // 温度 0-2
    max_tokens?: number         // 最大 token 数
    top_p?: number
  }
}

type PromptItem = {
  role: 'system' | 'user' | 'assistant'
  text: string                  // 支持 {{变量名}} 插值
}

type Memory = {
  window: {
    enabled: boolean
    size: number                // 记忆窗口大小
  }
}
```

**输出变量：**

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `text` | string | 模型生成的文本内容 |
| `reasoning_content` | string | 推理过程内容（如支持） |
| `usage` | object | Token 使用量统计 |

### Code 代码执行节点

```typescript
type CodeNodeType = {
  type: 'code'
  title: string
  code_language: 'python3' | 'javascript' | 'json'
  code: string                  // 代码内容
  variables: Variable[]         // 输入变量
  outputs: Record<string, { type: VarType; children: null }>
}
```

### HttpRequest HTTP 请求节点

```typescript
type HttpNodeType = {
  type: 'http-request'
  title: string
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head'
  url: string
  headers: string               // 格式: "Header-Name: value\nAnother: value"
  params: string                // 查询参数
  body: {
    type: 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw-text' | 'binary'
    data: string
  }
  authorization: {
    type: 'no-auth' | 'api-key' | 'bearer'
    config?: { api_key?: string; header?: string }
  }
  timeout: {
    connect?: number
    read?: number
    write?: number
  }
  variables: Variable[]
}
```

### IfElse 条件分支节点

```typescript
type IfElseNodeType = {
  type: 'if-else'
  title: string
  cases: ConditionCase[]
  _targetBranches?: Branch[]    // 分支定义（自动生成）
}

type ConditionCase = {
  case_id: string
  logical_operator: 'and' | 'or'
  conditions: Condition[]
}

type Condition = {
  id: string
  variable_selector: string[]   // 变量选择器 [节点ID, 变量名]
  comparison_operator: ComparisonOperator
  value: string
}

enum ComparisonOperator {
  contains = 'contains',
  notContains = 'not contains',
  startWith = 'start with',
  endWith = 'end with',
  is = 'is',
  isNot = 'is not',
  isEmpty = 'is empty',
  isNotEmpty = 'is not empty',
  equal = '=',
  notEqual = '!=',
  greaterThan = '>',
  lessThan = '<',
  greaterThanOrEqual = '>=',
  lessThanOrEqual = '<=',
  isNull = 'is null',
  isNotNull = 'is not null'
}
```

### KnowledgeRetrieval 知识检索节点

```typescript
type KnowledgeRetrievalNodeType = {
  type: 'knowledge-retrieval'
  title: string
  query_variable_selector: string[]  // 查询变量选择器
  dataset_ids: string[]              // 知识库 ID 列表
  retrieval_mode: 'single' | 'multiple'
  top_k: number                      // 返回结果数量
  score_threshold: number            // 相似度阈值 0-1
  rerank_enabled?: boolean           // 是否启用重排序
  rerank_model?: string              // 重排序模型
}
```

### QuestionClassifier 问题分类节点

```typescript
type QuestionClassifierNodeType = {
  type: 'question-classifier'
  title: string
  query_variable_selector: string[]
  classes: ClassItem[]
  model?: { provider: string; name: string }
  instruction?: string
}

type ClassItem = {
  id: string
  name: string
  description?: string
}
```

### Answer 直接回复节点

```typescript
type AnswerNodeType = {
  type: 'answer'
  title: string
  answer: string                // 回复内容，支持 {{变量}} 插值
}
```

### Tool 工具调用节点

```typescript
type ToolNodeType = {
  type: 'tool'
  title: string
  provider_id: string
  provider_name: string
  tool_name: string
  tool_label: string
  tool_parameters: ToolParameter[]
  tool_configurations?: Record<string, any>
}

type ToolParameter = {
  name: string
  type: string
  description?: string
  required?: boolean
  value?: string
  variable_selector?: string[]
}
```

### VariableAssigner 变量赋值节点

```typescript
type VariableAssignerNodeType = {
  type: 'variable-assigner'
  title: string
  variables: Variable[]
  output_type: 'object' | 'array' | 'string'
}
```

### TemplateTransform 模板转换节点

```typescript
type TemplateTransformNodeType = {
  type: 'template-transform'
  title: string
  variables: Variable[]
  template: string              // Jinja2 模板
}
```

---

## 导出内容

```typescript
// 组件
export { default as Workflow } from './components/workflow/Workflow.vue'

// 类型
export type { Node, Edge, CommonNodeType, CommonEdgeType } from './types/workflow'
export type {
  StartNodeType,
  EndNodeType,
  LLMNodeType,
  CodeNodeType,
  HttpNodeType,
  IfElseNodeType,
  KnowledgeRetrievalNodeType,
  QuestionClassifierNodeType,
  AnswerNodeType,
  ToolNodeType,
  VariableAssignerNodeType,
  TemplateTransformNodeType
} from './types/node-config'

// 枚举
export { BlockEnum, ControlMode, NodeRunningStatus, VarType } from './types/workflow'
export { CodeLanguage, Method, BodyType, AuthorizationType, LogicalOperator, ComparisonOperator } from './types/node-config'

// 常量
export { BLOCK_CLASSIFICATIONS, CUSTOM_NODE } from './types/workflow'
```

---

## 项目结构

```
src/
├── components/
│   └── workflow/
│       ├── Workflow.vue              # 主工作流组件
│       ├── nodes/
│       │   ├── CustomNode.vue        # 自定义节点渲染
│       │   ├── base/                 # 基础 UI 组件
│       │   └── panels/               # 节点配置面板
│       ├── operator/
│       │   ├── NodeSelector.vue      # 节点选择器
│       │   └── WorkflowToolbar.vue   # 工具栏
│       └── panel/
│           └── NodePanel.vue         # 节点配置面板容器
├── composables/
│   └── useNodeData.ts               # 节点数据管理 hook
├── types/
│   ├── workflow.ts                  # 工作流类型定义
│   └── node-config.ts               # 节点配置类型
└── mocks/
    └── workflow-data.ts             # 示例数据
```

---

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build

# 类型检查
vue-tsc -b
```

---

## 许可证

MIT

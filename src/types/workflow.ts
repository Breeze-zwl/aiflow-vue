import type {
  Edge as VueFlowEdge,
  Node as VueFlowNode,
  ViewportTransform,
  XYPosition,
} from '@vue-flow/core'

export enum BlockEnum {
  Start = 'start',
  End = 'end',
  Answer = 'answer',
  LLM = 'llm',
  KnowledgeRetrieval = 'knowledge-retrieval',
  QuestionClassifier = 'question-classifier',
  IfElse = 'if-else',
  Code = 'code',
  TemplateTransform = 'template-transform',
  HttpRequest = 'http-request',
  VariableAssigner = 'variable-assigner',
  Tool = 'tool',
  ParameterExtractor = 'parameter-extractor',
  Iteration = 'iteration',
  DocExtractor = 'document-extractor',
  ListFilter = 'list-operator',
  Agent = 'agent',
  Loop = 'loop',
}

export enum ControlMode {
  Pointer = 'pointer',
  Hand = 'hand',
}

export enum NodeRunningStatus {
  NotStart = 'not-start',
  Waiting = 'waiting',
  Running = 'running',
  Succeeded = 'succeeded',
  Failed = 'failed',
  Exception = 'exception',
}

export enum VarType {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  object = 'object',
  array = 'array',
  any = 'any',
}

export type Branch = {
  id: string
  name: string
}

export type CommonNodeType<T = object> = {
  _connectedSourceHandleIds?: string[]
  _connectedTargetHandleIds?: string[]
  _targetBranches?: Branch[]
  _isSingleRun?: boolean
  _runningStatus?: NodeRunningStatus
  _isCandidate?: boolean
  _isBundled?: boolean
  _isEntering?: boolean
  selected?: boolean
  title?: string
  desc?: string
  type: BlockEnum
  width?: number
  height?: number
  position?: XYPosition
} & T

export type CommonEdgeType = {
  _hovering?: boolean
  _connectedNodeIsHovering?: boolean
  _connectedNodeIsSelected?: boolean
  _isBundled?: boolean
  _sourceRunningStatus?: NodeRunningStatus
  _targetRunningStatus?: NodeRunningStatus
  sourceType?: BlockEnum
  targetType?: BlockEnum
}

export type Node<T = object> = VueFlowNode<CommonNodeType<T>>
export type Edge = VueFlowEdge<CommonEdgeType>

export type ValueSelector = string[]

export type Variable = {
  variable: string
  label?: string
  value_selector?: ValueSelector
  value_type?: VarType
  value?: string
  options?: string[]
  required?: boolean
}

export type InputVar = {
  type: string
  label: string
  variable: string
  max_length?: number
  default?: string | number
  required: boolean
  options?: string[]
}

export type Var = {
  variable: string
  type: VarType
  children?: Var[]
  isParagraph?: boolean
  isSelect?: boolean
  options?: string[]
  required?: boolean
}

export type WorkflowDataUpdater = {
  nodes: Node[]
  edges: Edge[]
  viewport: ViewportTransform
}

export const BLOCK_CLASSIFICATIONS = {
  [BlockEnum.Start]: {
    title: '开始',
    description: '工作流的起点',
    color: '#10B981',
    icon: 'play',
  },
  [BlockEnum.End]: {
    title: '结束',
    description: '工作流的终点',
    color: '#6B7280',
    icon: 'stop',
  },
  [BlockEnum.LLM]: {
    title: 'LLM',
    description: '调用大语言模型',
    color: '#8B5CF6',
    icon: 'cpu',
  },
  [BlockEnum.KnowledgeRetrieval]: {
    title: '知识检索',
    description: '从知识库检索信息',
    color: '#F59E0B',
    icon: 'search',
  },
  [BlockEnum.IfElse]: {
    title: '条件分支',
    description: '根据条件分流',
    color: '#3B82F6',
    icon: 'git-branch',
  },
  [BlockEnum.Code]: {
    title: '代码执行',
    description: '执行自定义代码',
    color: '#EC4899',
    icon: 'code',
  },
  [BlockEnum.HttpRequest]: {
    title: 'HTTP 请求',
    description: '发送 HTTP 请求',
    color: '#14B8A6',
    icon: 'globe',
  },
  [BlockEnum.Answer]: {
    title: '直接回复',
    description: '直接回复用户',
    color: '#F97316',
    icon: 'message-circle',
  },
  [BlockEnum.Tool]: {
    title: '工具',
    description: '调用外部工具',
    color: '#06B6D4',
    icon: 'tool',
  },
  [BlockEnum.VariableAssigner]: {
    title: '变量赋值',
    description: '设置变量值',
    color: '#84CC16',
    icon: 'variable',
  },
  [BlockEnum.QuestionClassifier]: {
    title: '问题分类',
    description: '对问题进行分类',
    color: '#A855F7',
    icon: 'layers',
  },
  [BlockEnum.TemplateTransform]: {
    title: '模板转换',
    description: '使用模板转换数据',
    color: '#EF4444',
    icon: 'file-text',
  },
  [BlockEnum.ParameterExtractor]: {
    title: '参数提取',
    description: '从文本中提取参数',
    color: '#0EA5E9',
    icon: 'extract',
  },
  [BlockEnum.Iteration]: {
    title: '迭代',
    description: '循环处理数据',
    color: '#D946EF',
    icon: 'repeat',
  },
  [BlockEnum.DocExtractor]: {
    title: '文档提取',
    description: '从文档中提取内容',
    color: '#78716C',
    icon: 'file',
  },
  [BlockEnum.ListFilter]: {
    title: '列表操作',
    description: '操作列表数据',
    color: '#FB923C',
    icon: 'list',
  },
  [BlockEnum.Agent]: {
    title: 'Agent',
    description: '智能代理节点',
    color: '#4F46E5',
    icon: 'bot',
  },
  [BlockEnum.Loop]: {
    title: '循环',
    description: '循环执行',
    color: '#C026D3',
    icon: 'refresh',
  },
}

export const CUSTOM_NODE = 'custom'
export const CUSTOM_EDGE = 'custom'

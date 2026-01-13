import type { Edge, Node } from '../types/workflow'
import { BlockEnum, CUSTOM_NODE, NodeRunningStatus } from '../types/workflow'
import { MarkerType } from '@vue-flow/core'

export const mockNodes: Node[] = [
  {
    id: 'start-1',
    type: CUSTOM_NODE,
    position: { x: 100, y: 200 },
    data: {
      type: BlockEnum.Start,
      title: '开始',
      desc: '工作流入口',
      lastRun: {
        status: NodeRunningStatus.Succeeded,
        duration: 0.0,
        tokens: 0,
        input: {
          'sys.app_id': '9d0cf4a3-f934-46c8-802e-8883c4244110',
          'sys.files': [],
          'sys.user_id': '3b692667-b15b-443e-8185-575b223495ff',
          'sys.workflow_id': 'ebca7eac-6309-4129-9144-ba8e6bcebe9b',
          'sys.workflow_run_id': '1e9ddf66-03f8-4a4c-99d7-6a4a1a90c0f1',
        },
        output: {
          status: 'ok',
          message: 'workflow started',
        },
      },
    },
  },
  {
    id: 'llm-1',
    type: CUSTOM_NODE,
    position: { x: 400, y: 100 },
    data: {
      type: BlockEnum.LLM,
      title: 'AI 对话',
      desc: '使用 GPT-4 处理用户输入',
      lastRun: {
        status: NodeRunningStatus.Failed,
        duration: 1.237,
        tokens: 248,
        input: {
          prompt: '用户问：如何退款？',
          model: 'gpt-4o-mini',
        },
        output: {
          error: 'rate_limit_exceeded',
        },
      },
    },
  },
  {
    id: 'knowledge-1',
    type: CUSTOM_NODE,
    position: { x: 400, y: 300 },
    data: {
      type: BlockEnum.KnowledgeRetrieval,
      title: '知识库检索',
      desc: '从产品文档中检索相关信息',
      lastRun: {
        status: NodeRunningStatus.Running,
        duration: 0.652,
        tokens: 64,
        input: {
          query: '退款规则',
          top_k: 4,
        },
        output: null,
      },
    },
  },
  {
    id: 'ifelse-1',
    type: CUSTOM_NODE,
    position: { x: 700, y: 200 },
    data: {
      type: BlockEnum.IfElse,
      title: '条件判断',
      desc: '根据检索结果判断',
      _targetBranches: [
        { id: 'branch-yes', name: '是' },
        { id: 'branch-no', name: '否' },
      ],
    },
  },
  {
    id: 'code-1',
    type: CUSTOM_NODE,
    position: { x: 1000, y: 100 },
    data: {
      type: BlockEnum.Code,
      title: '数据处理',
      desc: '格式化输出结果',
    },
  },
  {
    id: 'http-1',
    type: CUSTOM_NODE,
    position: { x: 1000, y: 300 },
    data: {
      type: BlockEnum.HttpRequest,
      title: 'API 调用',
      desc: '调用外部服务获取数据',
    },
  },
  {
    id: 'answer-1',
    type: CUSTOM_NODE,
    position: { x: 1300, y: 200 },
    data: {
      type: BlockEnum.Answer,
      title: '回复用户',
      desc: '生成最终回复内容',
    },
  },
  {
    id: 'end-1',
    type: CUSTOM_NODE,
    position: { x: 1600, y: 200 },
    data: {
      type: BlockEnum.End,
      title: '结束',
      desc: '工作流完成',
    },
  },
]

export const mockEdges: Edge[] = [
  {
    id: 'e-start-llm',
    source: 'start-1',
    target: 'llm-1',
    type: 'default',
    data: {
      sourceType: BlockEnum.Start,
      targetType: BlockEnum.LLM,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#9ca3af',
    },
  },
  {
    id: 'e-start-knowledge',
    source: 'start-1',
    target: 'knowledge-1',
    type: 'default',
    data: {
      sourceType: BlockEnum.Start,
      targetType: BlockEnum.KnowledgeRetrieval,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#9ca3af',
    },
  },
  {
    id: 'e-llm-ifelse',
    source: 'llm-1',
    target: 'ifelse-1',
    type: 'default',
    data: {
      sourceType: BlockEnum.LLM,
      targetType: BlockEnum.IfElse,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#9ca3af',
    },
  },
  {
    id: 'e-knowledge-ifelse',
    source: 'knowledge-1',
    target: 'ifelse-1',
    type: 'default',
    data: {
      sourceType: BlockEnum.KnowledgeRetrieval,
      targetType: BlockEnum.IfElse,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#9ca3af',
    },
  },
  {
    id: 'e-ifelse-code',
    source: 'ifelse-1',
    target: 'code-1',
    sourceHandle: 'branch-yes',
    type: 'default',
    data: {
      sourceType: BlockEnum.IfElse,
      targetType: BlockEnum.Code,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#9ca3af',
    },
  },
  {
    id: 'e-ifelse-http',
    source: 'ifelse-1',
    target: 'http-1',
    sourceHandle: 'branch-no',
    type: 'default',
    data: {
      sourceType: BlockEnum.IfElse,
      targetType: BlockEnum.HttpRequest,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#9ca3af',
    },
  },
  {
    id: 'e-code-answer',
    source: 'code-1',
    target: 'answer-1',
    type: 'default',
    data: {
      sourceType: BlockEnum.Code,
      targetType: BlockEnum.Answer,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#9ca3af',
    },
  },
  {
    id: 'e-http-answer',
    source: 'http-1',
    target: 'answer-1',
    type: 'default',
    data: {
      sourceType: BlockEnum.HttpRequest,
      targetType: BlockEnum.Answer,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#9ca3af',
    },
  },
  {
    id: 'e-answer-end',
    source: 'answer-1',
    target: 'end-1',
    type: 'default',
    data: {
      sourceType: BlockEnum.Answer,
      targetType: BlockEnum.End,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#9ca3af',
    },
  },
]

export const simpleWorkflowNodes: Node[] = [
  {
    id: 'start-1',
    type: CUSTOM_NODE,
    position: { x: 100, y: 200 },
    data: {
      type: BlockEnum.Start,
      title: '开始',
      desc: '',
    },
  },
  {
    id: 'llm-1',
    type: CUSTOM_NODE,
    position: { x: 400, y: 200 },
    data: {
      type: BlockEnum.LLM,
      title: 'LLM 处理',
      desc: '调用大语言模型',
    },
  },
  {
    id: 'end-1',
    type: CUSTOM_NODE,
    position: { x: 700, y: 200 },
    data: {
      type: BlockEnum.End,
      title: '结束',
      desc: '',
    },
  },
]

export const simpleWorkflowEdges: Edge[] = [
  {
    id: 'e-start-llm',
    source: 'start-1',
    target: 'llm-1',
    type: 'default',
    data: {
      sourceType: BlockEnum.Start,
      targetType: BlockEnum.LLM,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#9ca3af',
    },
  },
  {
    id: 'e-llm-end',
    source: 'llm-1',
    target: 'end-1',
    type: 'default',
    data: {
      sourceType: BlockEnum.LLM,
      targetType: BlockEnum.End,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#9ca3af',
    },
  },
]

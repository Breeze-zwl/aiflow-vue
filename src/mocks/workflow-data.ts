import type { Edge, Node } from '@/types/workflow'
import { BlockEnum, CUSTOM_NODE } from '@/types/workflow'
import { MarkerType } from '@vue-flow/core'

/**
 * 简单工作流示例
 * 开始 -> LLM -> 结束
 */
export const simpleWorkflowNodes: Node[] = [
  {
    id: 'start-1',
    type: CUSTOM_NODE,
    position: { x: 100, y: 200 },
    data: {
      type: BlockEnum.Start,
      title: '开始',
      desc: '工作流入口',
      variables: [
        {
          variable: 'query',
          label: '用户问题',
          type: 'string',
          required: true,
        },
      ],
    },
  },
  {
    id: 'llm-1',
    type: CUSTOM_NODE,
    position: { x: 400, y: 200 },
    data: {
      type: BlockEnum.LLM,
      title: 'AI 对话',
      desc: '调用大语言模型处理用户输入',
      model: {
        provider: 'openai',
        name: 'gpt-4',
        completion_params: {
          temperature: 0.7,
          max_tokens: 2048,
        },
      },
      prompt_template: [
        { role: 'system', text: '你是一个有帮助的 AI 助手。' },
        { role: 'user', text: '问题：{{query}}' },
      ],
    },
  },
  {
    id: 'end-1',
    type: CUSTOM_NODE,
    position: { x: 700, y: 200 },
    data: {
      type: BlockEnum.End,
      title: '结束',
      desc: '输出最终结果',
      outputs: [
        {
          variable: 'answer',
          label: '回答',
          value_selector: ['llm-1', 'text'],
        },
      ],
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

/**
 * 复杂工作流示例
 * 包含：开始、知识检索、LLM、条件分支、代码执行、HTTP请求、回复、结束
 */
export const complexWorkflowNodes: Node[] = [
  {
    id: 'start-1',
    type: CUSTOM_NODE,
    position: { x: 100, y: 200 },
    data: {
      type: BlockEnum.Start,
      title: '开始',
      desc: '工作流入口',
      variables: [
        {
          variable: 'query',
          label: '用户问题',
          type: 'string',
          required: true,
        },
        {
          variable: 'language',
          label: '语言',
          type: 'select',
          required: false,
          options: ['中文', 'English'],
        },
      ],
    },
  },
  {
    id: 'knowledge-1',
    type: CUSTOM_NODE,
    position: { x: 400, y: 320 },
    data: {
      type: BlockEnum.KnowledgeRetrieval,
      title: '知识检索',
      desc: '从知识库检索相关信息',
      query_variable_selector: ['start-1', 'query'],
      dataset_ids: ['dataset-001', 'dataset-002'],
      retrieval_mode: 'multiple',
      top_k: 5,
      score_threshold: 0.6,
      rerank_enabled: true,
    },
  },
  {
    id: 'llm-1',
    type: CUSTOM_NODE,
    position: { x: 400, y: 100 },
    data: {
      type: BlockEnum.LLM,
      title: 'AI 分析',
      desc: '分析用户意图',
      model: {
        provider: 'openai',
        name: 'gpt-4',
        completion_params: {
          temperature: 0.6,
          max_tokens: 2048,
        },
      },
      prompt_template: [
        { role: 'system', text: '你是一个智能问答助手，请根据上下文回答用户问题。' },
        { role: 'user', text: '上下文：{{context}}\n\n问题：{{query}}' },
      ],
      context: {
        enabled: true,
        variable_selector: ['knowledge-1', 'result'],
      },
      memory: {
        window: {
          enabled: true,
          size: 10,
        },
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
      desc: '根据检索结果判断处理方式',
      cases: [
        {
          case_id: 'has-result',
          logical_operator: 'and',
          conditions: [
            {
              id: 'cond-1',
              variable_selector: ['knowledge-1', 'result'],
              comparison_operator: 'is not empty',
              value: '',
            },
          ],
        },
      ],
      _targetBranches: [
        { id: 'has-result', name: '有结果' },
        { id: 'else', name: '无结果' },
      ],
    },
  },
  {
    id: 'code-1',
    type: CUSTOM_NODE,
    position: { x: 1000, y: 100 },
    data: {
      type: BlockEnum.Code,
      title: '结果处理',
      desc: '格式化输出结果',
      code_language: 'javascript',
      code: `function main(params) {
  const { text, language } = params;
  if (language === 'English') {
    return { result: text };
  }
  return { result: text };
}`,
      variables: [
        { variable: 'text', value_selector: ['llm-1', 'text'] },
        { variable: 'language', value_selector: ['start-1', 'language'] },
      ],
      outputs: {
        result: { type: 'string', children: null },
      },
    },
  },
  {
    id: 'http-1',
    type: CUSTOM_NODE,
    position: { x: 1000, y: 300 },
    data: {
      type: BlockEnum.HttpRequest,
      title: '外部查询',
      desc: '调用外部 API 获取补充信息',
      method: 'post',
      url: 'https://api.example.com/search',
      headers: 'Content-Type: application/json',
      params: '',
      body: {
        type: 'json',
        data: '{"query": "{{query}}"}',
      },
      authorization: {
        type: 'no-auth',
      },
      timeout: {
        connect: 30,
        read: 60,
        write: 30,
      },
      variables: [],
    },
  },
  {
    id: 'answer-1',
    type: CUSTOM_NODE,
    position: { x: 1300, y: 200 },
    data: {
      type: BlockEnum.Answer,
      title: '回复用户',
      desc: '生成最终回复',
      answer: '根据您的问题，我找到了以下答案：\n\n{{result}}',
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
      outputs: [
        {
          variable: 'final_answer',
          label: '最终回答',
          value_selector: ['answer-1', 'answer'],
        },
      ],
    },
  },
]

export const complexWorkflowEdges: Edge[] = [
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
    sourceHandle: 'has-result',
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
    sourceHandle: 'else',
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

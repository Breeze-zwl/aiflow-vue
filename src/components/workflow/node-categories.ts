import { BlockEnum } from '../../types/workflow'
import { isNodeHidden } from './node-visibility'

export type NodeCategory = {
  title: string
  nodes: BlockEnum[]
}

const baseCategories: NodeCategory[] = [
  {
    title: '基础节点',
    nodes: [
      BlockEnum.Start,
      BlockEnum.DocExtractor,
      BlockEnum.LLM,
      BlockEnum.Code,
      BlockEnum.KnowledgeRetrieval,
      BlockEnum.QuestionClassifier,
      BlockEnum.Answer,
      BlockEnum.End,
    ],
  },
  {
    title: '逻辑控制',
    nodes: [
      BlockEnum.IfElse,
      BlockEnum.Iteration,
      BlockEnum.Loop,
      BlockEnum.VariableAssigner,
    ],
  },
  {
    title: '数据处理',
    nodes: [
      BlockEnum.TemplateTransform,
      BlockEnum.ParameterExtractor,
      BlockEnum.HttpRequest,
    ],
  },
  {
    title: '工具',
    nodes: [BlockEnum.Tool, BlockEnum.Agent],
  },
]

const applyHiddenFilter = (categories: NodeCategory[]) =>
  categories
    .map((category) => ({
      ...category,
      nodes: category.nodes.filter((type) => !isNodeHidden(type)),
    }))
    .filter((category) => category.nodes.length > 0)

export const nodeCategories = applyHiddenFilter(baseCategories)

export const nodeCategoriesForPopup = () =>
  nodeCategories.filter((category) => category.title !== '工具')

export const toolCategoriesForPopup = () =>
  nodeCategories.filter((category) => category.title === '工具')

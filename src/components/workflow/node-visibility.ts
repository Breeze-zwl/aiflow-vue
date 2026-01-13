import { BlockEnum } from '../../types/workflow'
// 若果想要不展示某个节点在这里增加即可
export const hiddenNodeTypes = new Set<BlockEnum>([
  BlockEnum.VariableAssigner,
])

export const isNodeHidden = (type: BlockEnum) => hiddenNodeTypes.has(type)

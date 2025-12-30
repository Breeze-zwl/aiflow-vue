import type { TinyFlowWorkflow } from '@/types/tinyflow'
import { tinyflowComplex, tinyflowSimple } from '@/mocks/tinyflow-data'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchTinyflowWorkflow(
  demo: 'simple' | 'complex' = 'complex'
): Promise<TinyFlowWorkflow> {
  await delay(300)
  return demo === 'simple' ? tinyflowSimple : tinyflowComplex
}

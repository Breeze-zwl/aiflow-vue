import type { CommonNodeType, ValueSelector, Variable, VarType } from './workflow'

export type StartNodeType = CommonNodeType & {
  parameters: Parameter[]
}

export type Parameter = {
  id?: string
  name?: string
  nameDisabled?: boolean
  dataType?: string
  dataTypeDisabled?: boolean
  contentType?: string
  ref?: string
  refType?: string
  value?: string
  description?: string
  required?: boolean
  defaultValue?: string
  deleteDisabled?: boolean
  addChildDisabled?: boolean
  children?: Parameter[]
  enums?: string[]
  formType?: string
  formLabel?: string
  formDescription?: string
  formPlaceholder?: string
  formAttrs?: string
}

type NodeWithParameters = CommonNodeType & {
  parameters?: Parameter[]
}

export type AnswerNodeType = NodeWithParameters & {
  answer: string
}

export type EndNodeType = NodeWithParameters & {
  outputs: Variable[]
}

export interface ModelConfig {
  provider: string
  name: string
  mode?: string
  completion_params: Record<string, any>
}

export interface PromptItem {
  role: string
  text: string
}

export interface Memory {
  role_prefix?: {
    user: string
    assistant: string
  }
  window: {
    enabled: boolean
    size: number
  }
  query_prompt_template?: string
}

export interface VisionSetting {
  detail?: 'low' | 'high' | 'auto'
}

export type LLMNodeType = NodeWithParameters & {
  model: ModelConfig
  prompt_template: PromptItem[] | PromptItem
  prompt_config?: {
    jinja2_variables?: Variable[]
  }
  output_type?: 'text' | 'json'
  output_variable?: {
    name?: string
    dataType?: string
    description?: string
    defaultValue?: string
    children?: Array<{
      id: string
      name?: string
      dataType?: string
      description?: string
      defaultValue?: string
      children?: Array<{
        id: string
        name?: string
        dataType?: string
        description?: string
        defaultValue?: string
      }>
    }>
  }
  memory?: Memory
  context?: {
    enabled: boolean
    variable_selector: ValueSelector
  }
  vision?: {
    enabled: boolean
    configs?: VisionSetting
  }
  structured_output_enabled?: boolean
}

export enum CodeLanguage {
  python3 = 'python3',
  javascript = 'javascript',
  json = 'json',
}

export type CodeNodeType = NodeWithParameters & {
  variables: Variable[]
  code_language: CodeLanguage
  code: string
  outputs: Record<string, { type: VarType; children: null }>
}

export enum Method {
  get = 'get',
  post = 'post',
  head = 'head',
  patch = 'patch',
  put = 'put',
  delete = 'delete',
}

export enum BodyType {
  none = 'none',
  formData = 'form-data',
  xWwwFormUrlencoded = 'x-www-form-urlencoded',
  rawText = 'raw-text',
  json = 'json',
  binary = 'binary',
}

export enum AuthorizationType {
  none = 'no-auth',
  apiKey = 'api-key',
  bearer = 'bearer',
}

export type Body = {
  type: BodyType
  data: string
}

export type Authorization = {
  type: AuthorizationType
  config?: {
    api_key?: string
    header?: string
  } | null
}

export type Timeout = {
  connect?: number
  read?: number
  write?: number
}

export type HttpNodeType = NodeWithParameters & {
  variables: Variable[]
  method: Method
  url: string
  headers: string
  params: string
  body: Body
  authorization: Authorization
  timeout: Timeout
}

export type KnowledgeRetrievalNodeType = NodeWithParameters & {
  query_variable_selector: ValueSelector
  dataset_ids: string[]
  retrieval_mode: 'single' | 'multiple'
  top_k: number
  score_threshold: number
  rerank_enabled?: boolean
  rerank_model?: string
}

export enum LogicalOperator {
  and = 'and',
  or = 'or',
}

export enum ComparisonOperator {
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
  isNotNull = 'is not null',
}

export type Condition = {
  id: string
  variable_selector: ValueSelector
  comparison_operator: ComparisonOperator
  value: string
}

export type ConditionCase = {
  case_id: string
  logical_operator: LogicalOperator
  conditions: Condition[]
}

export type IfElseNodeType = NodeWithParameters & {
  cases: ConditionCase[]
}

export type ClassItem = {
  id: string
  name: string
  description?: string
}

export type QuestionClassifierNodeType = NodeWithParameters & {
  query_variable_selector: ValueSelector
  classes: ClassItem[]
  model?: {
    provider: string
    name: string
  }
  instruction?: string
  outputDefs?: Array<{
    name: string
    dataType: string
    description?: string
    defaultValue?: string
  }>
}

export type VariableAssignerNodeType = NodeWithParameters & {
  variables: Variable[]
  output_type: 'object' | 'array' | 'string'
}

export type TemplateTransformNodeType = NodeWithParameters & {
  variables: Variable[]
  template: string
}

export type ToolParameter = {
  name: string
  type: string
  description?: string
  required?: boolean
  value?: string
  variable_selector?: string[]
}

export type ToolNodeType = NodeWithParameters & {
  provider_id: string
  provider_name: string
  tool_name: string
  tool_label: string
  tool_parameters: ToolParameter[]
  tool_configurations?: Record<string, any>
}

// 业务枚举常量（与后端枚举取值保持一致）

// 题目难度（后端 QuestionDifficulty）
export const DIFFICULTY_OPTIONS = [
  { value: 1, label: '简单', tagClass: 'difficulty-easy' },
  { value: 2, label: '中等', tagClass: 'difficulty-medium' },
  { value: 3, label: '困难', tagClass: 'difficulty-hard' }
]

// C 端用户状态（后端 UserStatus）
export const USER_STATUS = {
  BANNED: 0,
  NORMAL: 1
}

// C 端用户性别（后端 UserSex）
export const USER_SEX_OPTIONS = [
  { value: 1, label: '男' },
  { value: 2, label: '女' },
  { value: 0, label: '保密' }
]

// 竞赛发布状态（后端 ExamStatus）
export const EXAM_STATUS = {
  UNPUBLISHED: 0,
  PUBLISHED: 1
}

// 题目用例类型（后端 QuestionCaseType）
export const CASE_TYPE = {
  HIDDEN: 0,
  SAMPLE: 1
}

// AI 单次最多生成的用例组数（后端 QuestionAiCaseDTO.count 上限）
export const AI_CASE_MAX_PER_BATCH = 10

// AI 接口请求超时（模型生成与标程运行耗时较长）
export const AI_REQUEST_TIMEOUT_MS = 120000

// 列表固定每页条数（后端 PageQuery 默认值）
export const PAGE_SIZE = 10

// 业务成功码（后端 ResultCode.SUCCESS）
export const SUCCESS_CODE = 1000

// 未登录或令牌失效（后端 ResultCode.FAILED_UNAUTHORIZED）
export const UNAUTHORIZED_CODE = 3001

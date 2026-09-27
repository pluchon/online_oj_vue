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

// 题目用途（后端 QuestionPurpose）：刷题题出现在学员端题库，竞赛题只能从竞赛进入
export const QUESTION_PURPOSE = {
  PRACTICE: 1,
  CONTEST: 2
}

// 题目用途选项
export const QUESTION_PURPOSE_OPTIONS = [
  { value: QUESTION_PURPOSE.PRACTICE, label: '刷题' },
  { value: QUESTION_PURPOSE.CONTEST, label: '竞赛' }
]

// 标签分类（后端 TagCategory）
export const TAG_CATEGORY_OPTIONS = [
  { value: 1, label: '数据结构' },
  { value: 2, label: '算法' },
  { value: 3, label: '数学' },
  { value: 4, label: '其他' }
]

// 每道题最多标签数（与后端 QuestionAddDTO 校验一致）
export const MAX_QUESTION_TAGS = 5

// 标签名称最大长度（与后端 TagSaveDTO 校验一致）
export const MAX_TAG_NAME_LENGTH = 10

// 题目用例类型（后端 QuestionCaseType）
export const CASE_TYPE = {
  HIDDEN: 0,
  SAMPLE: 1
}

// 判题结论（后端 JudgeStatusEnum），tone 决定列表里的颜色
export const JUDGE_STATUS_OPTIONS = [
  { value: 1, label: '运行通过', tone: 'pass' },
  { value: 2, label: '答案错误', tone: 'fail' },
  { value: 3, label: '运行超时', tone: 'warn' },
  { value: 4, label: '内存超限', tone: 'warn' },
  { value: 5, label: '编译错误', tone: 'muted' },
  { value: 6, label: '运行异常', tone: 'fail' },
  { value: 7, label: '输出超限', tone: 'warn' },
  { value: 8, label: '系统错误', tone: 'muted' }
]

// 申诉状态（后端 AppealStatusEnum），tone 决定颜色；通过、不通过为终态
export const APPEAL_STATUS = {
  PENDING: 0,
  DOUBTFUL: 1,
  UPHELD: 2,
  REJECTED: 3
}

// 申诉状态选项
export const APPEAL_STATUS_OPTIONS = [
  { value: APPEAL_STATUS.PENDING, label: '待处理', tone: 'pending' },
  { value: APPEAL_STATUS.DOUBTFUL, label: '存疑', tone: 'warn' },
  { value: APPEAL_STATUS.UPHELD, label: '通过', tone: 'pass' },
  { value: APPEAL_STATUS.REJECTED, label: '不通过', tone: 'fail' }
]

// 申诉时间筛选（最近天数）
export const APPEAL_DAYS_OPTIONS = [
  { value: 3, label: '近三天' },
  { value: 7, label: '近七天' },
  { value: 15, label: '近十五天' },
  { value: 30, label: '近三十天' },
  { value: 180, label: '近半年' },
  { value: 365, label: '近一年' }
]

// 数据概览趋势图的时间范围（后端 OverviewTrendRange：前三项按天，近半年按周，近一年按半月）
export const OVERVIEW_TREND_RANGE_OPTIONS = [
  { value: 'WEEK', label: '近七天' },
  { value: 'TWO_WEEKS', label: '近十四天' },
  { value: 'MONTH', label: '近一个月' },
  { value: 'HALF_YEAR', label: '近半年' },
  { value: 'YEAR', label: '近一年' }
]

// 数据概览最近竞赛的时间段（天，含今日）
export const OVERVIEW_EXAM_DAYS_OPTIONS = [
  { value: 1, label: '今日' },
  { value: 3, label: '近三天' },
  { value: 7, label: '近七天' },
  { value: 14, label: '近十四天' },
  { value: 30, label: '近三十天' }
]

// 数据概览最近竞赛每页场数（与难题榜 5 道等高）
export const OVERVIEW_EXAM_PAGE_SIZE = 5

// AI 接口请求超时（模型生成与标程运行耗时较长）
export const AI_REQUEST_TIMEOUT_MS = 120000

// AI 帮建竞赛：难度倾向选项（value 与后端 ExamAiTendency 一致）
export const EXAM_AI_TENDENCY_OPTIONS = [
  { value: 1, label: '新手友好' },
  { value: 2, label: '一般大众' },
  { value: 3, label: '高手过招' }
]

// AI 帮建竞赛：题目数量档位选项（value 与后端 ExamAiCountLevel 一致）
export const EXAM_AI_COUNT_OPTIONS = [
  { value: 1, label: '少量（1~5 题）' },
  { value: 2, label: '适中（6~10 题）' },
  { value: 3, label: '偏多（11~15 题）' },
  { value: 4, label: '超多（16~30 题）' }
]

// 列表固定每页条数（后端 PageQuery 默认值）
export const PAGE_SIZE = 10

// 业务成功码（后端 ResultCode.SUCCESS）
export const SUCCESS_CODE = 1000

// 未登录或令牌失效（后端 ResultCode.FAILED_UNAUTHORIZED）
export const UNAUTHORIZED_CODE = 3001

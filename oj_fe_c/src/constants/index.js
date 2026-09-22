// 业务枚举常量（与后端枚举取值保持一致）

// 题目难度（后端 QuestionDifficultyEnum）
export const DIFFICULTY_OPTIONS = [
  { value: 1, label: '简单', tagClass: 'diff-easy' },
  { value: 2, label: '中等', tagClass: 'diff-medium' },
  { value: 3, label: '困难', tagClass: 'diff-hard' }
]

// 用户做题状态（后端 UserQuestionStatusEnum）
export const USER_QUESTION_STATUS = {
  UNTOUCHED: 0,
  SOLVED: 1,
  IN_PROGRESS: 2
}

// 提交是否通过（后端 SubmitPassEnum）
export const SUBMIT_PASS = {
  NOT_PASS: 0,
  PASS: 1,
  JUDGING: 2
}

// 判题结论文案（后端 JudgeStatusEnum）
export const JUDGE_STATUS_TEXT = {
  1: '通过',
  2: '解答错误',
  3: '超出时间限制',
  4: '超出内存限制',
  5: '编译错误',
  6: '运行错误',
  7: '输出超限',
  8: '系统错误'
}

// 判题通过状态码（后端 JudgeStatusEnum.AC）
export const JUDGE_STATUS_AC = 1

// 答案错误状态码（后端 JudgeStatusEnum.WA，运行结果有逐用例输出）
export const JUDGE_STATUS_WA = 2

// 编程语言（后端 ProgramTypeEnum，目前仅支持 Java）
export const PROGRAM_TYPE_JAVA = 0

// 竞赛动态状态（后端 ExamContestStatusEnum）
export const EXAM_CONTEST_STATUS = {
  NOT_STARTED: 0,
  ONGOING: 1,
  FINISHED: 2
}

// 竞赛列表类型（后端 ExamListTypeEnum）
export const EXAM_LIST_TYPE = {
  UNFINISHED: 0,
  HISTORY: 1
}

// 消息已读状态（后端 MessageReadStatusEnum）
export const MESSAGE_READ_STATUS = {
  UNREAD: 0,
  READ: 1
}

// 消息类型（后端 MessageTypeEnum）
export const MESSAGE_TYPE = {
  SYSTEM: 1,
  EXAM: 2
}

// 用户性别（后端 UserSexEnum）
export const USER_SEX = {
  SECRET: 0,
  MALE: 1,
  FEMALE: 2
}

// 性别选项
export const USER_SEX_OPTIONS = [
  { value: USER_SEX.MALE, label: '男' },
  { value: USER_SEX.FEMALE, label: '女' },
  { value: USER_SEX.SECRET, label: '保密' }
]

// 免登录可访问的页面
export const PUBLIC_PATHS = ['/login', '/exam', '/question', '/question/do']

// 判题状态：编译错误（后端 JudgeStatusEnum.CE）
export const JUDGE_STATUS_CE = 5

// AI 辅导提问类型（后端 AiTutorActionEnum）
export const AI_TUTOR_ACTION = {
  CHAT: 0,
  HINT: 1,
  ANALYZE_SUBMIT: 2,
  EXPLAIN_COMPILE: 3,
  REVIEW_CODE: 4
}

// AI 辅导流式事件名（后端 AiInternalPaths.EVENT_*）
export const AI_STREAM_EVENT = {
  DELTA: 'delta',
  DONE: 'done',
  ERROR: 'error'
}

// 业务成功码（后端 ResultCode.SUCCESS）
export const SUCCESS_CODE = 1000

// 未登录或令牌失效（后端 ResultCode.FAILED_UNAUTHORIZED）
export const UNAUTHORIZED_CODE = 3001

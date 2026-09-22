# 墨衡在线 OJ · 前端工程仓库 (online_oj_vue)

> 本仓库包含“墨衡 OJ”系统的多端前端工程：**B 端后台管理系统 (`oj_fe_b`)** 与 **C 端学员前台 (`oj_fe_c`)**。后端微服务位于独立仓库，本文只描述前端。

```mermaid
graph TD
    Repo["online_oj_vue 根仓库"]
    Repo --> B_End["oj_fe_b: 管理端前端"]
    Repo --> C_End["oj_fe_c: 学员端前台"]

    B_End --> Design["墨衡古籍画卷 / Claude Editorial 视觉系统"]
    C_End --> Design
    B_End --> Modules["用户管理 / 题目管理 / 竞赛管理 / 登录画卷"]
    C_End --> CModules["题库 / 做题工作台 / 竞赛与排名 / 消息 / 个人中心"]
```

---

## 一、 管理端 (oj_fe_b) 架构与路由流转

```mermaid
flowchart TD
    App["App.vue 根挂载点"] --> Router["Vue Router 路由控制"]
    
    Router --> Login["/login 登录入口"]
    Login --> Form["左侧：管理员登录凭证表单"]
    Login --> Masonry["右侧：三通道独立专属算法画卷瀑布流（零重复）"]

    Router --> AuthGuard{"Token 鉴权守卫"}
    AuthGuard --"未登录"--> Login
    AuthGuard --"已鉴权"--> Layout["/system 主工作台布局"]

    Layout --> Header["顶栏：品牌标识 / 管理员昵称 / 退出登录"]
    Layout --> Sidebar["侧边栏：竖向墨线标尺导航"]
    Layout --> Workspace["核心业务视窗 (Router-View)"]

    Workspace --> UserView["/user 用户管理"]
    UserView --> UserDialog["UserEditDialog 用户资料弹窗"]
    
    Workspace --> QuestionView["/question 题目管理"]
    QuestionView --> QuestionDrawer["QuestionDrawer 题目抽屉"]
    QuestionDrawer --> MdEditor["Markdown 实时分栏编辑器"]
    QuestionDrawer --> MonacoEditor["Monaco 代码模板编辑器"]
    QuestionDrawer --> CaseBuilder["题目测试用例结构化构建器"]

    Workspace --> ExamView["/exam 竞赛管理"]
    ExamView --> ExamDrawer["ExamDrawer 竞赛抽屉"]
    ExamDrawer --> ExamQDialog["ExamQuestionDialog 题目勾选弹窗"]
```

---

## 二、 管理端界面展示与视觉空间

### 1. 登录页与算法画卷瀑布流

![image-20260920131015391](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260920131015578.png)

### 2. 用户管理主界面

![image-20260920131043278](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260920131043325.png)

### 3. 题目管理主界面

![image-20260920131117055](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260920131117106.png)

### 4. 题目编辑抽屉与双栏工作区

![image-20260920131503672](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260920131503737.png)

![image-20260920131540208](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260920131540251.png)

### 5. 竞赛管理主界面与状态操作

![image-20260920131601438](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260920131601494.png)

### 6. 关联竞赛题目弹窗

![image-20260920131636304](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260920131636387.png)

---

## 三、 管理端核心业务流转闭环

### 1. 竞赛与题目关联闭环

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 管理员
    participant ExamView as 竞赛管理
    participant ExamDrawer as 竞赛抽屉
    participant QDialog as 选择题目弹窗
    participant QuestionStore as 题目数据池

    Admin->>ExamView: 点击 "+ 添加竞赛" 或 "编辑"
    ExamView->>ExamDrawer: 打开抽屉并加载基础信息
    Admin->>ExamDrawer: 保存竞赛基础信息
    Admin->>ExamDrawer: 点击 "+ 添加题目"
    ExamDrawer->>QDialog: 打开选题弹窗 (透传已有绑定题目ID)
    QDialog->>QuestionStore: 条件检索可选题目列表
    QDialog-->>Admin: 表格渲染 (已绑定题目禁用复选框)
    Admin->>QDialog: 勾选目标题目并点击 "确认"
    QDialog-->>ExamDrawer: 批量同步选中的题目对象
    Admin->>ExamDrawer: 点击 "保存题目"
    ExamDrawer->>ExamView: 提交关联关系，关闭抽屉并刷新列表
```

### 2. 题目编辑与测试用例录入闭环

```mermaid
flowchart LR
    Start["打开题目抽屉"] --> Base["录入标题、难度、时空限制"]
    Base --> MD["编辑 Markdown 题目描述 (左写右看)"]
    MD --> Code["选择编程语言与编写默认代码模板 (Monaco)"]
    Code --> Cases["添加题目测试用例 (输入/输出/删除)"]
    Cases --> Save["点击保存题目"]
    Save --> Verify{"前置表单项校验"}
    Verify --"未通过"--> Highlight["标红提示并描边高亮失败控件"]
    Verify --"通过"--> Submit["触发保存并刷新题目管理列表"]
```

### 3. AI 辅助出题

题目抽屉顶部的「AI 生成题面」与用例区的「AI 生成用例」只回填表单，保存仍走原有流程。

```mermaid
flowchart LR
    Desc["一句话描述"] --> Draft["AI 生成题面草稿"]
    Draft --> Fill["回填标题、难度、限制、描述、代码模板与 Main 函数"]
    Fill --> Std["填写标程"]
    Std --> Gen["AI 生成用例输入"]
    Gen --> Run["标程在判题沙箱中运行得到预期输出"]
    Run --> Preview["预览并勾选"]
    Preview --> Append["加入用例列表（默认隐藏用例）"]
    Append --> Save["检查后保存题目"]
```

---

## 四、 学员端 (oj_fe_c) 架构与路由流转

### 1. 路由与页面

```mermaid
flowchart TD
    App["App.vue 根挂载点"] --> Router["Vue Router 路由控制"]
    Router --> Guard{"Token 路由守卫"}
    Router --> Title["afterEach：同步标签页标题<br/>「页面名 · 墨衡 OJ」"]

    Guard --"白名单（免登录）"--> Public
    Guard --"需登录"--> Private
    Guard --"未登录访问受保护页"--> Login["/login 登录"]

    subgraph Public["免登录可访问"]
        QList["/question 题库"]
        QDo["/question/do 做题工作台"]
        EList["/exam 竞赛"]
    end

    subgraph Private["登录后可访问"]
        MyExam["/my-exam 我的竞赛（与竞赛页共用 ExamList，mine 模式）"]
        Msg["/message 消息"]
        Profile["/user/profile 个人中心"]
    end

    Login --> LoginForm["左：手机号 + 验证码表单"]
    Login --> LoginArt["右：博物学插画"]
    QList --"开始做题"--> QDo
    EList --"开始答题（计入排名） / 竞赛练习（赛后）"--> QDo
    MyExam --"开始答题 / 竞赛练习"--> QDo
    EList --> ERank["ExamRankDialog 排名弹窗"]
    MyExam --> ERank
```

### 2. 工程分层

```mermaid
flowchart LR
    subgraph View["views（.vue / .js / .scss 三文件分离）"]
        Pages["页面组件"]
    end
    subgraph Comp["components"]
        AppNavbar["AppNavbar<br/>全局导航栏 · 用户资料同步 · 退出登录"]
        CodeEditor["CodeEditor<br/>Monaco 编辑器封装"]
        OjDialog["OjDialog<br/>统一确认/详情弹窗"]
        RankDialog["ExamRankDialog<br/>赛后排名弹窗（基于 OjDialog）"]
    end
    subgraph Data["数据层"]
        Store["store/user<br/>登录态与用户信息"]
        Api["api/*<br/>question / exam / message / user"]
        Request["utils/request<br/>Token 注入 · 统一错误提示 · 响应脱壳"]
        Consts["constants<br/>与后端枚举对齐的业务常量"]
    end

    Pages --> Comp
    Pages --"Actions"--> Store
    Pages --> Api
    Api --> Request
    Request --"Vite 代理 /friend/**"--> Gateway["网关 :19090"]
```

### 3. 做题工作台布局

```mermaid
flowchart LR
    subgraph Left["左侧：题目卡片"]
        Nav["返回 / AI 辅导（星星）/ 上一题 / 下一题"]
        Desc["标题 · 难度 · 时空限制<br/>题目描述"]
        Samples["公开示例卡片（长内容自动独占整行）"]
    end
    subgraph Right["右侧工作区"]
        Editor["编辑器卡片<br/>Java · 重置 · 格式化 · 主题 · 全屏 · 运行 · 提交"]
        subgraph Console["控制台卡片"]
            TabCase["测试用例"]
            TabResult["执行结果<br/>通过时绿色描边 + 庆祝插画"]
            TabHistory["提交记录（提交后出现，后端分页）"]
        end
    end
    subgraph Tutor["最右侧：AI 辅导卡片（点击星星展开，需登录，赛中不显示）"]
        Quick["快捷操作：思路 / 分析最近一次提交 / 解释编译错误 / 点评代码"]
        Chat["对话区：SSE 流式渲染 Markdown，可停止；今日剩余次数"]
    end
    Editor --> Console
```

题库关键词无匹配时，后端返回语义推荐结果（`semantic` 标记），列表顶部提示"以下为相关推荐"；做题页题目卡片在登录且非竞赛模式时展示"你可能还想做"。

AI 辅导走 `src/utils/sse.js`（fetch 读取 SSE，携带令牌；校验失败时后端直接返回 JSON 错误）。快捷操作按本题最近一次提交的判题状态出现，提交完成后自动刷新。

---

## 五、 学员端界面展示与视觉空间

### 1. 登录页

![image-20260921153901581](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260921153901740.png)

### 2. 题库

![image-20260921153940274](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260921153940372.png)

### 3. 做题工作台

![image-20260921154025760](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260921154025892.png)

### 4. 运行结果（逐用例对比）

![image-20260921154039274](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260921154039368.png)

![image-20260921154113865](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260921154113951.png)

### 5. 提交结果与全部通过

![image-20260921154140270](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260921154140372.png)

### 6. 提交记录

![image-20260921154153203](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260921154153285.png)

### 7. 竞赛列表

![image-20260921154219321](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260921154219404.png)

### 8. 竞赛排名弹窗

![image-20260921171620332](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260921171620451.png)

### 9. 我的竞赛

![image-20260921171628869](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260921171628938.png)

### 10. 消息

![image-20260921171638616](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260921171638674.png)

### 11. 个人中心

![image-20260921171648586](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260921171648637.png)

---

## 六、 学员端核心业务流转闭环

### 1. 手机号验证码登录

```mermaid
sequenceDiagram
    autonumber
    actor U as 学员
    participant Login as 登录页
    participant Store as 用户 Store
    participant API as 网关 /friend

    U->>Login: 输入手机号，点击获取验证码
    Login->>API: POST /user/send-code
    API-->>Login: 发送成功，按钮进入倒计时
    U->>Login: 输入验证码并登录
    Login->>API: POST /user/login（未注册手机号自动建号）
    API-->>Login: 返回 Token
    Login->>Store: 保存 Token 与用户信息
    Login-->>U: 跳回 redirect 页面，默认进入题库
```

### 2. 运行与提交

```mermaid
sequenceDiagram
    autonumber
    actor U as 学员
    participant Do as 做题工作台
    participant API as 网关 /friend

    U->>Do: 点击 运行 / 提交
    Do->>Do: 前置校验：题目已加载、代码非空、已登录（未登录弹 OjDialog）

    alt 运行（仅公开示例，不计分）
        Do->>API: POST /question/run
        API-->>Do: 结论 + 逐用例 输入 / 输出 / 预期
        Do-->>U: 执行结果页：用例标签圆点标记通过与否，错误输出标红
    else 提交（全部用例）
        Do->>API: POST /question/submit
        API-->>Do: submitId（评测中）
        loop 每 500ms 轮询，直到出结论
            Do->>API: GET /question/submit/result
        end
        API-->>Do: 结论 · 通过数 · 得分 · 逐用例状态 · 首个未通过用例
        Do-->>U: 结论行右侧用例色块，下方展示首个未通过用例
        Do->>API: GET /question/submit/history（第 1 页）
        Do-->>U: 出现「提交记录」页签
    end
```

### 3. 执行结果状态

```mermaid
stateDiagram-v2
    [*] --> 暂无结果
    暂无结果 --> 评测中: 运行 / 提交
    评测中 --> 通过: 全部用例通过
    评测中 --> 未通过: 解答错误 / 超时 / 超内存 / 运行错误
    评测中 --> 编译错误
    评测中 --> 系统错误
    通过 --> 评测中: 再次运行 / 提交
    未通过 --> 评测中
    编译错误 --> 评测中
    系统错误 --> 评测中

    note right of 通过: 控制台绿色描边 + 居中庆祝插画
    note right of 未通过: 用例色块红格定位 + 首个未通过用例对比
```

### 4. 提交记录与载回代码

```mermaid
flowchart LR
    Tab["提交记录页签"] --> Load["GET /question/submit/history<br/>pageNum · pageSize=6"]
    Load --> List["列表区可滚动<br/>结论 · 通过数 · 耗时 · 时间"]
    Load --> Pager["翻页器固定在卡片底部"]
    Pager --"翻页"--> Load
    List --"点击某条"--> Confirm{"OjDialog 确认覆盖当前代码"}
    Confirm --"载入"--> Editor["代码写回编辑器"]
```

### 5. 竞赛报名、参赛与赛后练习

```mermaid
flowchart TD
    List["竞赛列表 / 我的竞赛"] --> Phase{"竞赛阶段"}

    Phase --"未开赛"--> Enroll{"报名"}
    Enroll --"未登录"--> Login["OjDialog 引导登录"]
    Enroll --"已登录"--> Confirm["OjDialog 确认报名"] --> Enrolled["已报名"]

    Phase --"进行中且已报名"--> Contest["做题工作台 · 赛中模式<br/>题目卡片底部：竞赛名 + 倒计时（赛中不公布排名）<br/>提交携带竞赛 ID，计入排名"]
    Phase --"已结束"--> Practice["做题工作台 · 练习模式<br/>与普通做题界面一致<br/>提交不带竞赛 ID，不影响排名"]
    Phase --"已结束"--> Rank["ExamRankDialog<br/>名次 · 昵称 · 得分，分页榜单"]

    Contest --"倒计时归零"--> Practice
```

---

## 七、 本地运行指南

```bash
# 管理端（默认端口 5173）
cd oj_fe_b
npm install
npm run dev

# 学员端（默认端口 5174，/friend 请求代理到网关 127.0.0.1:19090）
cd oj_fe_c
npm install
npm run dev

# 生产环境打包（两端相同）
npm run build
```

服务启动后访问：管理端 `http://localhost:5173`，学员端 `http://localhost:5174`。

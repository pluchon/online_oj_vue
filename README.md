# 墨衡在线 OJ · 前端工程仓库 (online_oj_vue)

> 本仓库包含“墨衡 OJ”系统的多端前端工程。当前阶段重点交付 **B 端后台管理系统 (`oj_fe_b`)**，C 端竞赛学员前台 (`oj_fe_c`) 将在后续阶段完善。

```mermaid
graph TD
    Repo["online_oj_vue 根仓库"]
    Repo --> B_End["oj_fe_b: 管理端前端 (当前已完成)"]
    Repo --> C_End["oj_fe_c: 学员端前台 (后续规划)"]
    
    B_End --> Design["墨衡古籍画卷 / Claude Editorial 视觉系统"]
    B_End --> Modules["用户管理 / 题目管理 / 竞赛管理 / 登录画卷"]
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

## 二、 界面展示与视觉空间 (Screenshots)

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

## 三、 核心业务流转闭环

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

---

## 四、 本地运行指南

```bash
# 1. 进入 B 端管理端工程
cd oj_fe_b

# 2. 安装依赖
npm install

# 3. 启动开发服务
npm run dev

# 4. 生产环境打包
npm run build
```
服务启动后访问：`http://localhost:5173`。

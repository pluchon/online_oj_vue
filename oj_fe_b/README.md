# 墨衡 OJ · 管理端前端工程 (oj_fe_b)

> 基于 Vue 3 + Vite 构建的算法竞赛与代码评测后台管理系统。遵循“墨衡古籍画卷 / Claude Editorial”设计语言，采用沉稳羊皮纸底色、古典松烟深墨与矿物印泥色彩体系。

---

## 一、 系统架构与路由流转

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

## 二、 界面展示与视觉空间

### 1. 登录与画卷瀑布流
![登录页面与画卷瀑布流展示](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260920131015578.png)

### 2. 用户管理与资料编辑
![用户管理主界面](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260920131043325.png)

### 3. 题目管理与综合检索
![题目管理主界面](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260920131117106.png)

### 4. 题目编辑抽屉与代码/用例工作台
![题目编辑抽屉与全功能工作区](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260920131503737.png)

![代码与用例编辑区](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260920131540251.png)

### 5. 竞赛管理与状态流转
![竞赛管理主界面](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260920131601494.png)

### 6. 选择竞赛题目多选弹窗
![关联竞赛题目弹窗](https://zlhimage.oss-cn-guangzhou.aliyuncs.com/20260920131636387.png)

---

## 三、 核心业务流转流程

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

## 四、 前端设计系统规范（墨衡古籍画卷）

```mermaid
graph LR
    subgraph 色彩系统
        Parchment["羊皮纸底色: #FBF8F2 / #FAF6EF"]
        PineInk["松烟古墨: #272F26 / #24201C"]
        Cinnabar["朱砂茜红: #A3382D / #8B352A (删除/拉黑)"]
        Indigo["霁蓝靛青: #24546d (发布操作)"]
        Bronze["古铜金赭: #875824 (撤销发布)"]
        Jade["青石翠绿: #286b58 (解禁/正常)"]
    end

    subgraph 组件工程规范
        Files["单组件严格拆分三文件: .vue / .js / .scss"]
        NoInline["禁止行内样式与 inline-script"]
        Buttons["操作列按钮规格: 固定 66px × 26px，文案严格居中"]
        Dialogs["公共弹窗 OjDialog: 居中加粗标题，去除冗余取消按钮"]
    end
```

---

## 五、 本地开发与构建指南

### 1. 环境准备
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. 依赖安装与启动
```bash
# 进入管理端工程目录
cd oj_fe_b

# 安装依赖
npm install

# 启动本地开发服务 (支持 HMR 热重载)
npm run dev
```
启动成功后，浏览器访问 `http://localhost:5173` 即可进入登录页。

### 3. 生产打包
```bash
# 构建生产环境高压缩静态资源
npm run build
```
编译产物输出至 `oj_fe_b/dist/`，可直接通过 Nginx 等静态 Web 服务器托管。

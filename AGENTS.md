# AGENTS.md

> 本文件放在项目根目录，Claude Code / Codex / Antigravity 等 agent 进入项目时会自动读取。
> 上半部分是项目约定（按项目填写），下半部分「协作规则」是通用的，不要删。

## 项目是什么

墨衡 OJ：微服务在线判题平台。学员在 C 端刷题、参加竞赛、用 AI 辅导，管理员在 B 端管理题目、竞赛和用户，并用 AI 辅助出题。

本仓库（`online_oj_vue`）只放前端；后端是同级目录下的另一个仓库 `../online_oj`。`.agents/` 里的计划同时覆盖前后端，任务里写了改哪个仓库。

## 技术栈与约定

- 前端：Vue 3 + Vite + Element Plus + Pinia + Monaco。`oj_fe_b` 是管理端（5173 端口），`oj_fe_c` 是学员端（5174 端口），都通过 Vite 代理访问网关 `127.0.0.1:19090`。
  - 组件拆成 `.vue` / `.js` / `.scss` 三个文件；页面通过 `src/api/` 发请求，不直接调 Axios；与后端对齐的业务枚举放在 `constants`。
  - C 端确认框统一用 `OjDialog`，不用 Element 原生 MessageBox。
- 后端（`../online_oj`）：Spring Boot 3.5 + Spring Cloud Alibaba 2025，服务有 gateway / friend（C 端）/ system（B 端）/ judge / job / ai。
  - 分层固定为 Controller → Service → Mapper；跨服务调用走 `/{domain}/internal/**` 契约，由调用方在自己的 client 包里实现。
  - oj_ai 只负责计算，不写库。
- 建表与测试数据：`../online_oj/deploy/db_sql/oj_init.sql`。
- 构建：前端在 `oj_fe_b` 和 `oj_fe_c` 下各跑一次 `npm run build`；后端用 IDEA 自带的 Maven（`C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.1\plugins\maven-plugin\lib\maven3\bin\mvn.cmd`，本机 PATH 上没有 mvn），用 pwsh 调用。
- 测试：编译或构建通过就汇报；重启服务和联调由用户来做。
- 本地运行：见 README 的「本地运行指南」。

## 不要碰的东西

- `src/assets` 是图片素材库，没被引用的图片也不要删。
- 主键有意使用雪花 ID，不要改成自增。
- 不维护 Postman 集合。
- 不要自行 commit，提交由用户决定。认领和收工的提交也要先问用户。
- `.agents/PLAN.md`「明确不做」里列出的功能不要做。

---

## 协作规则（多 agent 通用，不要删）

本项目可能同时有多个 agent 在干活。项目的进度、分工、决策都在 `.agents/` 里，
**那里是唯一的真相来源**。

### 开工前

1. 先读 `.agents/STATUS.md`（现在谁在做什么）和 `.agents/PLAN.md`（要做什么）。
2. 读最近的交接记录，知道上一个 agent 停在哪、留了什么话。

### 认领任务

1. 只做状态为「待认领」的任务。**已被别人认领的任务不要碰**，哪怕看起来很简单。
2. 动手前先改 `STATUS.md`：把状态改成「进行中」，负责人写上自己的名字，填上认领时间。
3. **认领这一改动单独提交**，提交完再开始写代码。这样别的 agent 读到的就是最新的认领状态。
4. 名字用固定格式：`工具名` 或 `工具名-用途`，例如 `claude-code`、`antigravity`、`codex-review`。

### 干活时

- 发现任务比预想的大，拆成子任务追加到 `PLAN.md` 和 `STATUS.md`，不要一个人闷头做完一大坨。
- 做了影响其他任务的决定（改接口、换库、改目录结构），追加到 `.agents/DECISIONS.md`。
- 卡住了就把任务改成「阻塞」并在阻塞区写清卡在哪，**不要静默放弃，也不要悄悄换个任务做**。

### 收工时

1. 更新 `STATUS.md`：状态改成「待验证」或「已完成」，在交接记录**顶部**追加一条。
2. **状态更新和代码改动放在同一个提交里**，保证进度和代码永远一致。
3. 交接记录要写到下一个 agent 不用问你就能接着干：做了什么、没做什么、下一步是什么、要注意什么。

### 冲突

- `STATUS.md` 和 `PLAN.md` 冲突时，先拉最新的再改，以 git 最新提交为准。
- 两个 agent 同时认领了同一个任务：认领提交时间早的那个继续，晚的那个退回「待认领」并换一个。

### 和长期记忆库的边界

- 项目进度、待办、「现在做到哪了」**只写在 `.agents/` 里**，绝不写进长期记忆库。
- 做项目时踩到的、**换个项目也用得上**的坑或决策，用 `/mem` 提炼进长期记忆库。
- 日期一律写绝对日期（2026-09-24），不写「昨天」「上周」。

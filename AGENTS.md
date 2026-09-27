# AGENTS.md

> 本文件放在项目根目录，Claude Code / Codex / Antigravity 等 agent 进入项目时会自动读取，记录项目约定。

## 项目是什么

墨衡 OJ：微服务在线判题平台。学员在 C 端刷题、参加竞赛、用 AI 辅导和赛后复盘，管理员在 B 端管理题目、竞赛、用户与申诉，用 AI 辅助出题并分析难题。

本仓库（`online_oj_vue`）只放前端；后端是同级目录下的另一个仓库 `../online_oj`。

## 技术栈与约定

- 前端：Vue 3 + Vite + Element Plus + Pinia + Monaco。`oj_fe_b` 是管理端（5173 端口），`oj_fe_c` 是学员端（5174 端口），都通过 Vite 代理访问网关 `127.0.0.1:19090`。
  - 组件拆成 `.vue` / `.js` / `.scss` 三个文件；页面通过 `src/api/` 发请求，不直接调 Axios；与后端对齐的业务枚举放在 `constants`。
  - C 端确认框统一用 `OjDialog`，不用 Element 原生 MessageBox。
- 后端（`../online_oj`）：Spring Boot 3.5 + Spring Cloud Alibaba 2025，服务有 gateway / friend（C 端）/ system（B 端）/ judge / job / ai。
  - 分层固定为 Controller → Service → Mapper；跨服务调用走 `/{domain}/internal/**` 契约，由调用方在自己的 client 包里实现。
  - 对象转换用 Hutool `BeanUtil`，只手写名称或类型不同的字段；计数类默认值写在字段初始化里；多路计数在 SQL 里合并，不在 Java 里拼 Map。写完用 `rg -e '\.set(\w+)\(\w+\.get\1\(\)\)' --pcre2` 自查同名手抄。
  - oj_ai 只负责计算，不写库。
- 建表与演示数据：`../online_oj/deploy/db_sql/oj_init.sql`；已有库的增量脚本在同目录的 `upgrade/`。
- 构建：前端在 `oj_fe_b` 和 `oj_fe_c` 下各跑一次 `npm run build`；后端用 IDEA 自带的 Maven（`C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.1\plugins\maven-plugin\lib\maven3\bin\mvn.cmd`，本机 PATH 上没有 mvn），用 pwsh 调用。
- 测试：编译或构建通过后，自己把能测的都测完（重启受影响的服务、脚本调接口并与数据库对照、内置浏览器验证页面交互），只把必须人工确认的部分留给用户；测试数据带标记并在测完后清理，登录只用 `oj_init.sql` 里的本地测试账号。
- 本地运行：见 README 的「本地运行」。

## 不要碰的东西

- `src/assets` 是图片素材库，没被引用的图片也不要删。
- 主键有意使用雪花 ID，不要改成自增。
- 不维护 Postman 集合。
- 不要自行 commit，提交由用户决定。

## 明确不做的功能

- 多语言判题（C++ / Python）：每道题的 main 函数和代码模板都按 Java 写，支持多语言需要为每题维护多套，出题和 AI 生成用例也要跟着改。
- 讨论区 / 评论：要连带做内容审核、通知、举报和 @，维护成本高。
- Rating 积分、全站排行榜、题单。
- 题目批量导入导出。
- 数据概览「最近竞赛」的 AI 分析：能说的结论在人数与通过率上一眼可见，深入分析又与赛后复盘重叠。

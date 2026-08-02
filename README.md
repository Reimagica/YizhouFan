# Yizhou Fan Personal Website

范逸洲老师的独立中英文个人学术网站。公开站点使用 Next.js，内容管理使用独立 Sanity Studio；普通访客主要访问静态生成页面，AI 仅用于公开问答。

项目约束、公开边界和迭代记录以 `AGENTS.md` 为唯一依据。

## Architecture

```text
Sanity Studio ── 内容、草稿、富文本、公开图片与附件
       │
       ├── 添加成果工具 ──> Next.js/Vercel API ──> Crossref / OpenAlex / Semantic Scholar / DBLP
       │                  └──> 选择候选或手动录入后创建 Sanity 草稿
       │
       └── published content ──> Next.js 静态/ISR页面

Sanity Asset CDN ──> 已确认公开的正文图片、论文 PDF、报告 PDF/PPTX
```

论文事实首先来自 Crossref、OpenAlex、Semantic Scholar 和 DBLP。检索结果只用于生成草稿，必须由导师人工核对后发布；DeepSeek 不参与论文事实补全或学术报告起草。

## Public routes

- `/en`、`/zh`：个人信息、研究、履历、荣誉、公开项目、教学与服务
- `/[lang]/publications`：检索、年份/类型筛选、来源、PDF、BibTeX和摘要
- `/[lang]/talks`：检索、年份/类型筛选、报告简介和公开课件；`/[lang]/talks/[id]` 展示富文本详情
- `/[lang]/people`：博士后、在读学生和毕业生概览
- `/[lang]/ask`：仅基于已发布公开内容的AI问答

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

未配置Sanity时，公开页面自动使用当前经过核对的本地静态数据，便于开发和构建；配置Sanity后，个人信息、成果、报告和成员改从已发布文档读取。

## Sanity Studio

Sanity作为独立子项目运行，避免后台依赖进入公开网站的浏览器包：

- 已部署后台：`https://yizhoufan.sanity.studio/`
- Sanity project ID：`mb3w1o0y`
- Dataset：`production`

```bash
cd studio
npm install
cp .env.example .env.local
npm run dev
```

首次迁移受控静态公开内容时，可生成临时 NDJSON 后使用 Sanity CLI 的 `--missing` 模式导入；该模式不会覆盖已有文档：

```bash
npm run sanity:seed
cd studio
npx sanity dataset import /private/tmp/yizhoufan-initial-content.ndjson production --missing
```

当前内容模型包括：

- `profile`：个人信息、研究、履历、荣誉、公开项目白名单、教学与服务
- `publication`：书目信息、摘要、BibTeX、Sanity 原生公开 PDF 与审核状态
- `talk`：报告信息、双语 Portable Text 正文、配图、注释、Sanity 原生公开附件与审核状态；不设封面图
- `person`：个人站三类静态成员概览

Studio 顶部“添加学术成果”工具提供两条路径：题名/DOI/作者组合检索多个来源并选择候选，或在无匹配时手动录入。两条路径都只创建草稿。学术报告完全由人工编辑，可使用二/三级标题、正文图片、引用、外链、脚注和提示框。

公开 Asset 上传规则：正文图片限 JPEG/PNG/WebP、8 MB；论文附件限 PDF、40 MB；报告附件限 PDF/PPTX、80 MB。本地文件选择时先拦截，媒体库既有文件还会接受 Schema 二次校验。只有勾选“已确认版权与公开范围”的文件才会进入前台查询结果。Sanity 不保存原始文件名，上传前仍应使用不含个人信息的简洁名称。

## Sanity content revalidation webhook

只保留内容刷新 Webhook；旧的内容自动化 Webhook 应从 Sanity 管理后台停用或删除。刷新 Webhook 的 Secret 与服务端 `SANITY_WEBHOOK_SECRET` 一致：

- 当前 URL：`https://yizhoufan.vercel.app/api/cms/revalidate`（`yizhoufan.com` 完成 DNS 绑定后也可使用同一路径）
- Trigger on：Create、Update、Delete
- Filter：

```groq
_type in ["profile", "publication", "talk", "person"]
```

该接口使Vercel上的静态/ISR页面在内容发布后失效并读取新内容。

论文候选检索由 Studio 浏览器调用 Vercel 的只读 `/api/cms/publications/lookup`，该接口仅允许 `SANITY_STUDIO_ORIGIN`，不会持有 Sanity 写入令牌；草稿由当前已登录的 Studio 用户直接创建。

## Environment boundaries

可以公开：Sanity project ID、dataset、站点地址。

只能存在服务端：Sanity webhook secret、DeepSeek 密钥与限流密钥。Sanity 原生 Asset 仅用于已确认公开的文件；未公开论文、原始 CV 和内部资料不能进入 Sanity Asset CDN 或公开 Git 仓库。

公开 AI 问答使用 Upstash Redis REST 实现跨 Vercel 实例的分层原子限流：匿名浏览器标识每日 8 次、匿名网络每日 32 次、全站每日 120 次，并增加浏览器与网络的分钟级突发保护。浏览器标识保存在 HttpOnly、SameSite=Lax 的第一方 Cookie 中；网络地址经 `RATE_LIMIT_SALT` 做 HMAC 后才参与计数，不把原始 IP 写入 Redis。开发环境未配置时使用内存计数；生产环境缺少 Redis、盐值或限流服务异常时拒绝模型请求。部署前必须配置 `UPSTASH_REDIS_REST_URL`、`UPSTASH_REDIS_REST_TOKEN` 和 `RATE_LIMIT_SALT`。

模型只返回结构化短条目，服务端会再次限制条目数量和长度、清除 Markdown 标记及固定套话，并根据回答主题附上个人信息、学术成果、学术报告或团队成员页面。若回答点名论文，模型只能返回站内成果 ID，服务端再从已发布成果数据读取 `sourceUrl` 或 DOI，禁止直接采用模型生成的链接。问答不保存对话历史，也不会把前一轮内容重新发送给模型。

## Validation

```bash
npm run lint
npm run build
npm test
npm run studio:build
```

GitHub、Sanity Studio、Vercel Sanity 环境变量和内容刷新 Webhook 已配置；代码更新后还需重新部署 Studio 与 Vercel，并在 Sanity 后台停用旧自动化 Webhook。`yizhoufan.com` 域名切换、DeepSeek 新密钥和 Upstash Redis 仍需完成。

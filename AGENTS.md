# Yizhou Fan Personal Website - 项目唯一记忆文件

> 本文件是范逸洲老师个人学术主页的唯一项目记忆。任何后续开发 Agent 必须先完整阅读本文件，再修改代码。
> 每次完成一轮内容、设计、功能或部署迭代，都必须同步更新本文件的“迭代记录”和受影响的决策；不要另建平行记忆文件。

---

## 项目概况

| 字段 | 内容 |
|---|---|
| 项目名称 | Yizhou Fan Personal Website / 范逸洲个人学术主页 |
| 代码位置 | 当前仓库根目录 |
| 目标域名 | `yizhoufan.com`（导师已购买，DNS 与正式托管待后续确认） |
| 当前阶段 | 2026-08-18 功能提交 `d84bc7d` 已推送 GitHub `main`；新版 Sanity Studio 与 Vercel Production 均已上线。Profile、5 门课程、92 项成果和 11 场报告已写入并复核；People 年份排序为下一轮工作 |
| 技术栈 | 标准 Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS v4；Sanity Studio 独立子项目 |
| 包管理 | npm |
| 当前数据形态 | Sanity `production` 是正式数据源；2026-08-18 只读实查为 118 份业务文档（1 Profile、5 Course、92 Publication、11 Talk、9 Person）与 90 个 Asset（89 file、1 image）。Publication 92 published、0 draft；Talk 11 published、0 draft；未配置 Sanity 时回退到受控双语静态数据；后台无访客登录 |
| 默认语言 | 英文 `/en`；中文 `/zh`；根路径 `/` 跳转英文；双语入口直接展示个人信息，不再设独立首页 |

---

## 背景与双站拆分决策

2026-07-23 交流后，原先融合“导师个人主页 + 课题组网站”的 `fanlearn-lab` 方案被明确拆分为两个独立应用：

1. **本项目：个人学术主页**。轻量、公开、双语，以个人学术身份、成果与可下载资源为中心；更新频率约每月一次，初期由开发者直接维护结构化数据与文件，不建设复杂权限或成员后台。
2. **`fanlearn-lab`：课题组/基地综合网站**。保留成员协作、审核、动态运营和 AI 深度集成方向；待 9 月开学后，结合国家智能社会治理教育特色实验基地的内容迁移与新需求继续迭代。

两个站点必须在代码、内容范围、权限、数据和部署节奏上解耦。个人站不得直接复用课题组站的 Mock 登录、审核队列、成员编辑和管理员逻辑。

---

## 导师确认的个人网站需求

### 核心使用场景（按优先级）

1. 他人搜索姓名后，能快速了解导师的基本身份、研究方向、Bio、任职和代表性工作。
2. 读者无需机构订阅权限，也能从个人主页找到获准公开的论文 PDF。
3. 报告听众能在会后从个人主页找到获准公开的 PPT/PDF，不再逐人索取。
4. 国内外访问者分别看到核心信息一致的中文和英文版本；英文是国际访问的主要入口。
5. 每月或有新论文/报告时，开发者可以低成本更新；成员变化通常按学年更新。

### 必备信息模块

- 默认个人信息页：取消独立首页；左侧固定展示公开头像、身份、机构和联系方式，右侧首先显示 Bio，再展示带日期的 Scholar 指标快照、本站成果总数、研究方向、任职、奖励荣誉、公开科研项目与学术服务。
- 学术成果：中英文成果列表，Google Scholar 作为引用信息的重要外部入口；93 份已确认公开的 PDF 将按正文抽取元数据、去重并补齐到 Sanity，首页只统计全部已发布成果总数，不拆分语言。
- 学术报告：最终只保留导师指定的 11 场，前台不区分 Keynote/Invited talk；可为确认公开的场次附 PDF/PPTX，并保留人工富文本详情。
- 教学：作为独立导航与 `/{lang}/teaching` 页面维护；当前只展示学习分析、信息技术与高校管理、智能时代的英文学术写作、人机交互设计、面向学术的 AI 素养五门课程，每门包含课程性质和一段克制的双语简介。
- 团队成员概览：最终取消博士后、在读学生、毕业生分类，所有成员按入学年份排列；待本人材料到齐后显示公开照片、姓名、状态和 2–3 句简介，不做成员详情页，不承担课题组站的成果关联或编辑功能。
- AI 问答：导航名称固定为“AI 问答”；接入服务端大模型，回答导师或课题组的公开信息问题，并落实公开知识库、答案来源、无证据时拒答、按 IP/每日总量限流、费用上限和异常停用。

### 2026-07-27 第二轮页面与功能要求

- 字号层级收敛：页面主标题不得再使用超大海报字号，主标题与正文之间保持清晰但克制的层级。
- 配色保留浅米色、白色和北大红；全局米色背景进一步变浅。
- 圆角白色卡片、细边框、粘性侧栏、筛选侧栏、标签与成员网格等视觉语言适度靠近 `fanlearn-lab`，但个人站继续保持独立双语和轻量静态内容架构。
- 学术成果页必须具备全文检索、年份筛选、类型筛选、结果计数、来源检索、BibTeX 复制、摘要展开和 PDF 下载/待补状态；不复制课题组站的登录、添加、编辑、删除和审核功能。
- 学术报告页此前具备关键词、年份、类型筛选和结果计数；导师 2026-08 最新意见覆盖旧要求：保留关键词、年份、结果计数和附件，移除报告类型筛选与类型标签。
- AI 问答的浏览器端只调用本站 `/api/ask`；密钥仅放服务端环境变量，问题限 800 字。生产环境使用 Upstash 持久化分层限流，并必须配置费用告警与总额上限；开发环境的内存计数只用于本地验证。

### 2026-07-28 AI 问答 Harness（当前硬约束）

- 无登录状态不能可靠识别“同一位自然人”。公开口径必须写“本浏览器每天最多提问 8 次”，不得声称精确识别访客。
- 限流采用三层匿名标识：HttpOnly、SameSite=Lax 第一方 Cookie 保存随机浏览器 ID；网络地址经服务端 `RATE_LIMIT_SALT` 做 HMAC 后计数；另设全站总量。禁止把原始 IP、问题正文或模型答案写入限流键。
- 每分钟上限为浏览器 3 次、匿名网络 12 次；每日上限为浏览器 8 次、匿名网络 32 次、全站 120 次。Redis Lua 在同一层内先检查全部额度再原子递增，避免部分计数污染。
- 生产环境缺少 Upstash 或 `RATE_LIMIT_SALT`、限流服务异常时必须拒绝付费模型请求；清 Cookie 或更换网络不能保证识别同一人，因此网络层和全站层不可省略。
- 模型只允许输出 `status + items + optional note + topics + publicationIds` JSON：1–4 条，中文每条最多 300 字、英文每条最多 150 词；说明最多中文 90 字/英文 36 词。服务端必须再次截断，不得只依赖提示词。
- 服务端清除 `**`、反引号、列表前缀、控制字符和固定结尾套话；“更多详情可访问课题组相关公开页面或联系 fyz@pku.edu.cn”不得默认附加，只有访客明确询问联系方式时才能回答公开工作邮箱。
- 直接回答置前；资料不足返回 `insufficient`，不得猜测。回答涉及个人信息、教学、学术成果、学术报告或团队成员时，按 `topics` 返回对应站内页面，最多 4 个，不再把所有页面固定附在每次回答后。
- 回答点名或推荐论文时，模型只能返回 PUBLICATIONS 中的精确 `publicationIds`，服务端再从 Sanity/受控回退成果数据读取 `sourceUrl` 或 DOI；禁止采用模型生成的 URL。每次最多展示 4 个已核实原文链接，没有公开原文地址的成果不生成假链接。
- 回答论文或著作时必须先写出 PUBLICATIONS 中的完整题名，再做介绍，不得用“2025 年的一篇论文”“一本生成式 AI 著作”等泛称替代。服务端会按 `publicationIds` 补齐模型遗漏的完整题名，并再次执行长度上限。
- 每次请求均为独立单轮，不向模型发送浏览器内的历史问答；公开知识上下文最多 28,000 字符、模型输出上限 1,100 tokens、18 秒超时、低温度生成。访客问题和 CMS 已发布文本均按数据而非指令处理。

### 双语要求

- 英文与中文使用独立可索引 URL：`/en/*`、`/zh/*`。
- 双语核心事实必须一致；不能只对 UI 做翻译而让事实内容漂移。
- Publication 与 Talk 均以一条 Sanity 文档作为唯一信源，不为同一成果或同一报告复制中英文文档。原始题名、作者、载体、日期和附件是权威事实；可在同一文档中补充人工确认的译名或译文，但译文缺失时另一语言页面必须回退显示原始内容，不得为了版面完整自动编造翻译。
- 可先用机器翻译形成草稿，但涉及职务、项目、论文、奖项、人员状态的内容必须人工核对。
- 更新一条成果、报告、项目或成员信息时，同一提交必须检查两种语言。

### 文件与托管

- 论文 PDF 和报告 PPT/PDF 是个人站的核心价值，不是装饰性功能。
- 导师确认目录中的 93 份文件均可在个人网站公开；独立审计确认其中实际为 92 份 PDF + 1 份 PSD。PSD 被标为非成果，92 份 PDF 中 3 份预印本/海报被已发表版本取代，最终对应 89 条带 PDF 的成果。后续不必再次逐份确认公开权限，但仍须保证版本关系和书目信息可追溯。
- 私人账本位于 `private/课题组网站记录/网站资料/论文PDF处理/`（不入库），含 93 个输入文件的 SHA-256、页数、扫描状态与抽取正文。Sanity 现有 92 条成果，已全部发布；89 条成果带已确认公开的原生 PDF。摘要、venue、文章号、扫描件 OCR 与最终发布已于 2026-08-18 完成审计和复核。
- 报告附件、课程材料和成员照片仍需逐项确认公开范围；未知授权状态继续显示真实待补状态，禁止伪造下载或上传内部材料。
- 已确认公开的正文图片、论文 PDF 与报告 PDF/PPTX 统一使用 Sanity 原生 `image/file` 和 Asset CDN，不再规划 OSS/COS 双存储；大文件禁止进入 Git 仓库。
- 当前头像使用 `public/yizhou-fan.jpg`；替换头像时需保持公开授权、合理裁切和跨断点显示一致。
- `yizhoufan.com` 的 DNS、HTTPS 和正式域名切换尚未完成，当前公开部署仍使用 `https://yizhoufan.vercel.app`。

### 已确认的内容管理、AI 与文件架构（2026-07-27）

后续正式版本采用以下职责分离方案，作为开发硬约束：

```text
Sanity Studio
├── 导师浏览器端可视化内容管理
├── 双语个人信息、成果、报告、教学与成员数据
├── 草稿、人工复核与发布状态
├── 论文候选检索与手动录入工具
└── 已确认公开的图片与下载文件

Vercel / Next.js 服务端
├── 站点静态生成与内容更新
├── 只读学术数据库检索与候选合并
├── Sanity 内容刷新 webhook 接收与鉴权
└── 公开 AI 问答、限流、费用控制与审计

DeepSeek
└── 公开 AI 问答；不得作为论文事实来源，也不生成学术报告草稿

Sanity Asset CDN
└── 只保存已确认公开的正文图片、论文 PDF 和报告 PDF/PPTX
```

实现原则：

- Sanity 是内容管理后台，不承载公开网站的自定义业务接口；普通访客仍以静态页面为主。
- 论文补全先查询 Crossref、OpenAlex、Semantic Scholar、DBLP 等可验证来源，再由导师选择候选；DeepSeek 不参与论文事实补全，禁止凭空补造书目信息。
- 学术报告不使用 AI 生成草稿，也不解析 PPT；由导师直接编辑双语富文本和上传已确认公开的附件。
- 学术检索不得直接发布内容。候选选择与手动录入都只创建草稿，并经过导师人工确认。
- DeepSeek 密钥、webhook secret 与限流密钥只存在服务端环境变量，禁止进入浏览器包、Git 仓库或 Sanity 公共字段。
- Sanity 原生 image/file 只允许公开文件：正文图片 JPEG/PNG/WebP ≤ 8 MB，论文 PDF ≤ 40 MB，报告 PDF/PPTX ≤ 80 MB；前台只读取勾选版权确认的附件。
- 论文检索接口只读、限制 Studio Origin，不持有 Sanity 写令牌；当前登录的 Studio 用户负责创建草稿。
- 双语内容仍遵循“同一提交检查两种语言”；职务、项目、论文、奖项和人员状态必须人工核对，任何机器生成文本都只能作为待复核草稿。

### 当前部署与数据状态（2026-08-18）

已完成：

1. 标准 Next.js 16 公开站、独立 Sanity Studio、GitHub `Reimagica/YizhouFan` 与 Vercel 项目 `ma-j/yizhoufan` 已建立。
2. Sanity 项目 `mb3w1o0y`、`production` 数据集、公开读取、Studio 托管、Vercel 读取参数与内容刷新 Webhook 已配置。
3. DeepSeek 问答、Upstash Redis REST 分层限流及 `RATE_LIMIT_SALT` 已接入 Vercel；生产环境缺配置或限流异常时会 fail closed。
4. Profile、Publication、Talk、Person 的线上 Schema 和既有内容已发布；论文原生 PDF、报告多附件/富文本及成果候选录入工具已存在于线上基线。Sanity 只读实查为 11 个 Talk 文档（已收敛到导师白名单），不是旧记录中的 5 或 6 个。
5. 2026-08-17 在 Sanity 写入 Profile 校正、Scholar 快照和 5 个已发布 Course 文档；迁移前完整备份位于 `private/课题组网站记录/网站资料/Sanity备份/yizhoufan-production-before-0817.tar.gz`。
6. 成果批量迁移与最终发布完成：92 份 `publication` 全部 published，89 份原生 PDF 已上传并通过一致性、可达性和元数据审计；Talks 已收敛到导师指定的 11 场并上线。
7. 2026-08-18 功能提交 `d84bc7d` 已推送 GitHub `main`；新版 Studio 与 Vercel Production 已发布，首页 Scholar 指标、独立 Teaching 页面和 Talks 新结构已完成线上浏览器验收。

尚未完成：

1. 线上内容刷新 Webhook 的过滤器需确认包含 `course`；新版 Teaching 页面已上线，Profile 内遗留的旧 `courses` 数组可在备份后另行清理。
2. People 尚未取消分类并改为按入学年份排列。
3. 自定义域名、浏览器端真实 AI 问答验收、费用告警/硬上限核对，以及对曾暴露凭据的轮换仍待完成。

未经用户明确指示，不得代为 Git commit/push、部署 Vercel/Studio、修改域名或发布尚未人工核对的批量成果草稿。成果模块的 8 条最终发布已由用户明确指示完成。

### 公开与保密边界（硬约束）

- 简历中存在导师明确标注为非公开的科研项目。**任何未通过公开白名单确认的项目，不得写入页面、结构化数据、下载文件、SEO 元数据、公开仓库文档或 AI 知识库。**
- 项目页采用“公开白名单”而非“黑名单删除”：只录入已明确允许公开的项目。
- 原始中英文简历不可直接放入 `public/` 供下载，因为原文件包含不应公开的完整信息；若未来需要 CV 下载，必须先由导师提供或确认脱敏版。
- 不公开私人手机号；首版仅使用公开工作邮箱 `fyz@pku.edu.cn` 和公开学术链接。
- AI 问答只能检索已发布公开内容，不能读取原始简历、会议转录或开发记忆。

---

## 内容来源与事实优先级

出现冲突时按下列顺序处理，并记录日期：

1. 导师在 2026-07-23 交流中的明确要求与之后的书面确认。
2. 导师提供的最新中英文简历；同类字段优先采用更新日期更晚、信息更完整的一份，但双语差异必须人工核对。
3. 北京大学官方教师主页与实验室官方页面。
4. Google Scholar、ORCID 等公开学术主页。
5. 其他聚合平台只能作为线索，不能单独成为关键事实来源。

当前公开链接：

- Google Scholar: `https://scholar.google.com/citations?user=EBZdbGwAAAAJ&hl=en`
- 北京大学教育学院英文主页: `https://english.gse.pku.edu.cn/faculty/technology/1062jyxyyw164100.htm`
- ORCID: `https://orcid.org/0000-0003-2777-1705`

引用数、h-index 等 Scholar 指标必须注明数据日期；当前采用截至 2026-06-20 的 Sanity 可维护快照（3,301 / 27 / 45），不得伪装成实时值。成果数量不区分中英文，直接统计 Sanity 中全部已发布成果，并随内容发布和 revalidation 自动更新。

---

## 当前信息架构

| 路由 | 职责 |
|---|---|
| `/` | 跳转 `/en` |
| `/en`、`/zh` | 默认个人信息页：左侧粘性头像/身份/联系，右侧 Bio、学术数据、研究、任职、荣誉、项目与服务 |
| `/[lang]/profile` | 兼容旧链接，重定向至 `/[lang]` |
| `/[lang]/publications` | 可检索、按年份/类型筛选的论文与著作；来源、PDF、BibTeX、摘要操作 |
| `/[lang]/talks` | 可检索、按年份筛选的报告列表；详情页展示富文本正文与公开附件（已移除类型筛选与标签） |
| `/[lang]/talks/[id]` | 学术报告详情；支持配图、分级标题、引用、链接、脚注、提示框与多附件 |
| `/[lang]/teaching` | 独立双语课程栏目；五门课程的性质与简介从 Sanity `course` 文档读取 |
| `/[lang]/people` | 博士后/在读学生/毕业生三类静态概览，不提供详情页 |
| `/[lang]/ask` | AI 问答客户端；调用 `/api/ask` |
| `/api/ask` | DeepSeek 服务端问答、结构化输出守卫、相关来源选择、浏览器/匿名网络/全站分层持久化限流 |
| `/api/cms/publications/lookup` | 仅允许 Sanity Studio Origin 的只读论文多源候选检索；不写入内容 |
| `/api/cms/automation` | 已停用的旧自动化入口；签名请求返回 410，待线上旧 Webhook 删除后可移除 |
| `/api/cms/revalidate` | 验证 Sanity webhook；发布内容变更后使公开页面缓存失效 |

主要实现文件：

```text
app/
├── layout.tsx
├── page.tsx
├── globals.css
├── [lang]/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── profile/page.tsx
│   ├── publications/page.tsx
│   ├── talks/page.tsx
│   ├── talks/[id]/page.tsx
│   ├── teaching/page.tsx
│   ├── people/page.tsx
│   └── ask/page.tsx
└── api/
    ├── ask/route.ts
    └── cms/
        ├── publications/lookup/route.ts
        ├── revalidate/route.ts
        └── automation/route.ts
components/
├── SiteShell.tsx
├── PublicationExplorer.tsx
├── TalkExplorer.tsx
├── PeopleDirectory.tsx
├── PortableContent.tsx
└── AskInterface.tsx
lib/
├── content.ts                    ← 受控静态回退内容
├── public-knowledge.ts           ← 仅从公开 CMS/回退内容组装问答知识
├── cms/
│   ├── content.ts                ← Sanity 查询与静态回退入口
│   ├── sanity.ts                 ← 只读请求、缓存与重新验证标签
│   └── types.ts
└── server/
    ├── academic-search.ts        ← Crossref/OpenAlex/S2/DBLP 候选合并
    ├── answer-guard.ts           ← AI 结构化输出清洗、长度与主题守卫
    ├── answer-links.ts           ← 站内页面和论文原文链接选择
    ├── cms-auth.ts               ← Sanity 官方 webhook 签名验证
    ├── rate-limit.ts             ← Upstash 持久化费用边界
    └── sanity-write.ts           ← 旧自动化兼容；当前成果录入由 Studio 用户直接写草稿
studio/
├── sanity.config.ts
├── components/RestrictedAssetInputs.tsx
├── tools/PublicationCreateTool.tsx
├── schemaTypes/                 ← profile/course/publication/talk/person 及共享字段
└── scripts/migrate-0817-profile-courses.mjs
scripts/
└── generate-sanity-seed.mjs
tests/
├── answer-guard.test.mjs
└── rendered-html.test.mjs
```

---

## 设计原则

- 视觉气质：克制、编辑感、学术但不陈旧；以暖纸色、墨色、北大红和深绿构成，不复制参考网站风格。
- 默认页直接回答“导师是谁、研究什么、如何联系”，使用类似课题组成员详情的左固定、右滚动结构；不再设置营销式首页。
- 英文标题采用高对比 serif，正文用清晰 sans；中文使用系统中文字体回退，避免线上字体下载阻塞。
- 不依赖装饰性图片完成首屏；当前使用公开头像 `public/yizhou-fan.jpg`，左栏照片、身份和联系方式在桌面端保持粘性，右栏第一个内容必须是 Biography。
- 响应式支持桌面、平板和移动端；键盘焦点、可点击区域、颜色对比与减少动画偏好均需考虑。
- 禁止假链接、假下载、假 AI 回答和没有来源的指标。

---

## 数据维护约定

- 正式内容通过 `studio/` 中的 Sanity 后台维护；`lib/content.ts` 只作为未配置 Sanity 时的受控回退，不应在正式上线后形成第二套长期数据源。
- 新增论文：核对题名、作者顺序、年份、载体、DOI/公开链接与 PDF 授权；同时检查中英文展示、筛选类型、搜索字段、BibTeX 输出和下载状态。
- 新增报告：核对日期、主办方、地点、题名、双语正文和公开附件；不需要封面图，也不使用 AI 生成正文。导师最新要求不再区分 Keynote/Invited talk；11 场白名单迁移已完成（2026-08-18），`type` 已置为 `hidden` 旧数据兼容字段，前台、查询与 AI 知识均不依赖或展示。
- 新增课程：通过独立 `course` 文档维护双语名称、性质、简介、排序和发布状态；Profile 内旧课程数组只为线上兼容暂时保留，不得继续编辑。
- 成员：当前仍是三类静态概览；下一轮改为所有成员按入学年份排列，并在收到本人材料后维护公开照片及 2–3 句双语简介，不得编造缺失内容。
- 所有公开项目必须由人工白名单录入，不允许从简历整段自动导入。
- 内容更新完成后至少运行 `npm run lint`、`npm run build`，并检查 `/en`、`/zh` 与受影响子页面。

---

## 后续优先事项

1. **发布当前本地迭代**：先复核 diff，再按用户明确指示 commit/push；部署新版 Sanity Studio 与 Vercel，确认导航和五门课程正常，并把 revalidation Webhook 过滤器更新为包含 `course`。稳定后清理 Profile 旧 `courses` 数组。Git 仍未 commit，不声称已建立 Git checkpoint。
2. **学术成果（Prompt 1）— 已完成**：009→011 映射修正、一次性 repair 脚本删除、英文原始摘要逐字重提（含扫描型 PDF 的 Vision OCR）、`venue`/卷期页码/文章号规范化、Book chapter `@incollection`/`articleno` BibTeX、绝对私人路径参数化、`tsconfig.tsbuildinfo` 忽略、ESLint 0 warning 均已落地；3 条扫描型 PDF 元数据逐字校正；8 条 custom-status draft 全部发布。当前 92 published、0 draft、89 PDF。
3. **学术报告收敛（Prompt 2，已完成）**：Talks 已收敛为导师指定的 11 场，移除类型筛选/标签，保留年份、搜索、详情富文本和公开附件能力。详见本文件“2026-08-18 - Talks module convergence (Prompt 2)”。Git 仍未 commit，发布前需与成果、Profile、教学等本地迭代一并 commit/push 并部署 Vercel/Studio。
4. **团队成员重构**：待收齐入学年份、公开照片及本人确认的双语简介后，取消三类前台分组并按入学年份稳定排列。
5. **生产运维收尾**：在浏览器完成 AI 问答和 Upstash 键验证；核对费用告警/硬上限；轮换任何曾在对话中暴露的 DeepSeek/Redis 凭据；完成 `yizhoufan.com` DNS、HTTPS 与正式域名切换。
6. **依赖维护**：Sanity CLI 依赖树仍有传递依赖告警；禁止执行 `npm audit fix --force`，等待兼容版本并在独立分支完成 Studio 构建与功能回归。

---

## 当前工作区交接（2026-08-17）

- 当前分支最新已提交基线为 `06889b4 Document production Redis rate limiting`；其后首页、教学、中文信息、AI 主题、Schema、迁移脚本、测试及本文件的修改都仍在工作区中。
- 主要未提交文件包括 `app/[lang]/page.tsx`、`app/[lang]/teaching/page.tsx`、`components/SiteShell.tsx`、`lib/cms/*`、AI answer/knowledge 文件、`studio/schemaTypes/course.ts`、Profile Schema、Sanity 迁移脚本和测试。**这些修改属于同一轮完整迭代，不得丢弃、回退或拆散覆盖。**
- Sanity Production 已实际迁移：Profile 使用最新中文信息与完整公开项目名，Scholar 快照为 2026-06-20 的 3,301 / 27 / 45，另有 5 个已发布 Course 文档。迁移保留了 Profile 旧 `courses` 字段，以免尚未部署的新前端之前出现兼容问题。
- 迁移前备份：`private/课题组网站记录/网站资料/Sanity备份/yizhoufan-production-before-0817.tar.gz`；备份包含迁移前 28 份文档和 1 个 Asset。
- 2026-08-17 独立复跑结果：Next.js 16.2.12 Production build 通过并生成 22 个页面；25/25 测试通过；Sanity Studio build 通过；`git diff --check` 无错误。ESLint 为 0 error、2 warnings（均为 accessibility 脚本未使用的 catch 参数），不是“0 警告”；未跟踪的 `tsconfig.tsbuildinfo` 属于构建产物，提交前应删除并加入忽略规则。
- 本轮没有 Git commit/push，没有部署新版 Vercel/Studio。线上 Vercel 仍运行 `06889b4` 对应代码；Sanity 数据变更可能经既有 revalidation 提前反映到旧页面，但独立 Teaching 页面和导航只有发布新代码后才会上线。
- 详细确认清单：`private/课题组网站记录/0816导师修改需求TODO.md`。后续成果/报告 Agent Prompt：`private/课题组网站记录/0817后续Agent执行Prompt.md`。

---

## 本地开发

```bash
npm install
npm run dev
npm run lint
npm run build
npm test
npm run studio:build
```

---

## 迭代记录

### 2026-07-27 - Initial architecture

- 基于 2026-07-23 交流转录（重点核对 22:39 之后原话）、中英文简历与公开学术页面，建立个人站与课题组站的独立边界。
- 初始化独立双语个人站，建立首页、个人信息、成果、报告、教学、成员与问答边界七个页面层级。
- 采用静态结构化内容方案，不引入登录、数据库或课题组审核流程。
- 首版填入可公开的基本身份、研究议程、代表成果、报告、教学与成员概览；所有论文和报告下载均保持真实“待补充”状态。
- 建立公开项目白名单和原始 CV 禁止直接发布的隐私约束。
- 生成并接入与站点视觉一致的双语无关社交分享图 `public/og.png`，用于 Open Graph 与 X 链接预览。
- 完成 `npm run lint`、生产构建与 3 项渲染测试；`/en`、`/zh`、`/en/publications` 本地开发路由均返回 200，并通过保密关键词与模板残留扫描。

### 2026-07-27 - Profile-first restructure

- 取消独立首页，`/en` 与 `/zh` 直接改为个人信息页；左侧使用北大学习科学实验室公开头像、职位与联系方式，并在桌面端保持粘性，右侧承载可滚动的个人介绍与履历。
- 教学内容并入个人信息页；导航精简为个人信息、学术成果、学术报告、团队成员、AI 问答。
- 收敛页面大标题字号，背景米色调整为更浅的 `#fbf9f4`，保留白色卡片和北大红，卡片、边框、筛选栏和成员网格适度对齐 `fanlearn-lab`。
- 学术成果新增关键词检索、年份/类型筛选、结果计数、Google Scholar 来源检索、PDF 下载状态、BibTeX 复制和摘要展开。
- 学术报告新增关键词检索、年份/类型筛选、结果计数和 PPT/PDF 下载状态。
- 团队成员改为博士后、在读学生、毕业生三类静态切换，不提供可点击详情。
- AI 问答接入 `/api/ask` 与 DeepSeek：只使用公开知识、限制输入、20 秒超时、无证据拒答、公开来源回传，并实现本地原型级每日/单 IP 限流；正式上线前仍须换成持久化限流和费用上限。
- 完成最终 ESLint、生产构建、5 项页面/API 渲染测试和 5 个关键路由本地 200 检查；保密关键词与旧模板残留扫描通过。当前目录没有 `.env.local`，因此 AI 页面和接口已接好但会安全提示“未配置模型密钥”，不会在缺少密钥时伪造回答。

### 2026-07-27 - Sanity / Vercel / DeepSeek / OSS-COS pre-deployment foundation

- 正式确认并记录职责分离架构：Sanity 负责可视化内容与草稿，Vercel/Next.js 负责 AI、学术检索和 webhook 中枢，DeepSeek 只生成可编辑摘要/翻译草稿，OSS/COS 对私有处理文件与公开下载文件分层。
- 移除 vinext、Sites、Cloudflare Worker、D1/Drizzle 等非目标部署骨架，迁移为标准 Next.js 16.2.12 App Router；加入基础安全响应头。
- 建立 Sanity 读取层和安全静态回退。个人信息、论文、报告、成员页面及 AI 公开知识库都从同一内容入口读取；Sanity 未配置或读取失败时仍可构建和浏览。
- 建立独立 `studio/`：提供 profile、publication、talk、person 双语 Schema，区分 `publicFile` 与仅保存对象键的 `privateSource`；增加发起自动化、查看候选并应用到草稿的文档操作。
- 建立带 Sanity 官方签名验证的 `/api/cms/automation` 与 `/api/cms/revalidate`。论文任务并行查询 Crossref、OpenAlex、Semantic Scholar、DBLP，合并去重后回写候选；任何自动化只写草稿，不发布。
- 建立 25 MB、仅 HTTPS、来源主机白名单、禁止重定向的 PPTX 下载边界，以及 PPTX 文本提取、提示注入隔离和 DeepSeek 双语结构化摘要。对象存储供应商未选定前，`objectKey` 签名 URL 适配器保持显式未实现状态。
- AI 问答限流升级为 Upstash Redis REST 原子日计数，覆盖单 IP 每日 8 次与全站每日 120 次；开发环境无配置时使用内存计数，生产环境缺少配置或限流服务异常时拒绝调用付费模型。
- 增加根目录和 Studio 环境变量模板、架构/Schema/webhook/安全边界说明与未签名自动化接口测试。根公开站生产依赖通过 `npm audit --omit=dev`（0 漏洞），Next.js 构建、ESLint、6 项页面/API 测试及 Sanity Studio 构建全部通过。
- Sanity Studio 官方 CLI 工具链仍报告 20 个传递依赖告警（3 moderate、17 high）；自动审计只提供跨主版本强制修复，故本轮不做高风险覆盖，登记为部署 Studio 前的依赖复核项。
- 按用户要求停在 GitHub/Vercel 之前：未初始化/推送 Git、未创建 Sanity 或对象存储资源、未配置线上密钥、未部署 Vercel、未修改域名 DNS。

### 2026-07-27 - Local DeepSeek integration verification

- 已在 Git 忽略的 `.env.local` 中配置 DeepSeek 服务端密钥与 `deepseek-chat` 模型；密钥值不得复制到源码、文档、日志或提交记录。
- 本地开发服务器在 `http://127.0.0.1:3000` 启动，`/en` 返回 200；通过 `/api/ask` 完成一次真实问答验证，模型回答与公开来源列表均正常返回。

### 2026-07-27 - Readability, profile content, and direct-source links

- 全站正文、联系方式、履历、筛选器、成果元数据、问答与页脚等细节字号整体提高 1-3px；标题层级保持克制，未重新放大页面主标题。
- 清理公开页面和 AI 公开知识中的内部产品说明，包括“静态概览、不提供编辑交互、公开白名单、审核后展示”等措辞；这些约束只保留在本文件和开发文档中。
- 个人信息页将荣誉奖励与科研项目拆为上下独立区块；荣誉补齐 2026-2013 年共 11 项记录，并与最新中英文简历逐项核对。
- “教学与人才培养”改为“开设课程 / Courses taught”，删除解释性段落；课程数据升级为“课程名称 + 课程性质”结构，按简历标注北京大学本科生、研究生、EdD 课程及 MOOC 角色。
- “公开科研项目 / Public projects”对外标题改为“科研项目 / Research projects”，移除页面公开白名单说明；数据层仍坚持 `publiclyConfirmed == true` 的安全过滤。
- 学术成果检索框移至结果区域顶部；论文动作从 Google Scholar 题名检索改为 DOI、出版社、ScienceDirect 或 arXiv 的直接原文页。12 项成果中 11 项已核实直接链接，《英文学术写作实战》因未找到稳定出版社官方页暂不显示按钮。
- Sanity `publication` 新增 `sourceUrl`，自动检索候选应用时同步写入候选 URL 或 DOI 链接；前台在缺少 `sourceUrl` 时可由 DOI 生成原文链接。
- 团队列表改为弹性居中布局，单人和人数不足一行时均居中；同时支持 Sanity 成员头像 URL，未提供头像时继续显示姓名首字母占位。
- 视觉与架构复核修正了嵌套 `<main>`、移动端成果容器收缩、长刊名换行、390px 水平溢出、平滑滚动标记和 favicon 404。真实 390px 视口下 `innerWidth` 与 `scrollWidth` 均为 390px。
- 最新 Next.js 生产构建、ESLint、6 项页面/API 回归测试及 Sanity Studio 构建均通过；公开站生产依赖审计保持 0 漏洞。

### 2026-07-27 - GitHub initial publication

- 初始化 `main` 分支并将个人站首次推送至 `https://github.com/Reimagica/YizhouFan`；远端分支由本地 `main` 跟踪。
- 推送前已确认工作树干净，并验证 `.env.local`、DeepSeek 密钥、原始 CV、构建缓存及依赖目录均未进入提交。
- 本轮只完成 GitHub 代码托管，尚未连接 Vercel、配置线上环境变量或修改 `yizhoufan.com` DNS。

### 2026-07-28 - Talk search placement and AI Q&A harness

- 学术报告检索框从左侧筛选卡移至页面内容顶部，与学术成果页保持相同的“先检索、后筛选与结果”结构。
- 修正无登录场景下“每位访客”的不准确口径，改为匿名浏览器 ID、HMAC 匿名网络和全站三层日限额，并加入分钟级突发限制；前端明确显示“本浏览器每天最多 8 次”。
- DeepSeek 回答升级为 `status/items/note` 结构，服务端强制最多 4 条、逐条长度上限、Markdown 与固定套话清洗，避免模型未遵循格式时直接污染页面。
- 问答界面以原生列表展示短条目，对证据不足单独标记；来源改为根据问题主题返回最多 3 个相关公开页面，不再固定附加全部来源。
- 知识上下文增加成果与报告的中英文题名，回答保持单轮、低温度、18 秒超时和有限输出；公开资料不足时明确拒答，只有访客主动询问联系方法时才使用公开工作邮箱。

### 2026-07-28 - Expanded AI answers and verified navigation links

- 在保持最多 4 条结构化答案的前提下，将单条上限提高到中文 150 字、英文 65 词，说明上限提高到中文 90 字、英文 36 词；服务端硬截断和 Markdown 清理继续生效。
- AI 协议新增 `topics` 与 `publicationIds`。涉及个人信息、学术成果、学术报告或团队成员时，问答卡片附上对应站内页面，方便访客继续浏览。
- 回答包含论文或著作时，服务端使用模型返回的站内成果 ID 与实际成果数据核对，并只输出已配置 `sourceUrl` 或 DOI 的原文链接；模型返回的任意 URL 不被接受。
- 完成真实 DeepSeek 论文问答验证：回答两项生成式 AI 相关成果时，正确返回对应 Wiley DOI、Routledge DOI 和 `/zh/publications` 页面链接；生产构建、ESLint 与 13 项回归测试通过。

### 2026-07-28 - Honor cleanup and full publication titles

- 从个人信息页荣誉列表及 AI 公开知识中移除 2019 年国家级精品在线开放课程、2019 年优秀学位论文奖、2017 年研究生国家奖学金和 2013 年北京公益先锋四项；课程列表中的“教师如何做研究”课程经历保留。
- AI 单条答案硬上限提高为中文 300 字、英文 150 词；最多 4 条与说明字段上限保持不变，模型输出上限同步提高以容纳完整题名和解释。
- 论文/著作回答必须使用成果数据中的完整题名。若模型返回了有效成果 ID 却只做概述，服务端会在对应答案条目前补入中英文完整题名，同时继续只使用站内核实的原文 URL。
- 真实 DeepSeek 验证已返回两项成果的完整英文题名、对应 Wiley/Routledge DOI 以及中文学术成果页；生产构建、ESLint 与 13 项回归测试通过，双语首页均验证不再渲染已删除的四项荣誉。

### 2026-07-28 - GitHub sync

- 将学术报告检索布局、AI 问答分层限流、结构化输出守卫、论文原文与站内页面链接、荣誉删减及完整题名规则作为同一轮稳定更新同步至 GitHub `main`。
- 推送内容不包含 `.env.local`、DeepSeek 密钥、原始 CV、构建缓存或依赖目录；Vercel、Sanity、对象存储与域名配置仍未执行。

### 2026-08-01 - Profile header and compact sidebar

- 个人信息页右侧首屏标题由研究宣言改为中英文姓名“范逸洲 · Yizhou Fan”，删除标题下方“我的研究关注……”说明段落；详细研究信息继续由个人简介与研究方向区块承载。
- 桌面端左侧人物卡压缩照片高度、身份区内边距、联系方式区内边距与链接间距，使头像和全部公开联系入口更容易在单个常见桌面视口内完整显示。
- 平板与移动端显式恢复自适应图片高度，避免桌面端紧凑高度影响原有横向卡片与移动端宽幅头像布局。

### 2026-08-01 - Development indicator

- 在 `next.config.ts` 设置 `devIndicators: false`，隐藏本地开发环境左下角的 Next.js 调试按钮；错误输出、开发服务和生产构建行为保持不变。

### 2026-08-01 - Vercel TypeScript build boundary

- 修复 Vercel 根项目构建误检查 `studio/actions/automationActions.tsx`、但根安装未包含 `@sanity/ui` 的失败：根 `tsconfig.json` 明确排除 `studio/`。
- Next.js 公开站与 Sanity Studio 继续使用各自的 TypeScript 配置和依赖；Studio 由 `studio/tsconfig.json` 与 `studio/package.json` 独立构建，禁止为掩盖边界问题把 `@sanity/ui` 安装到根项目。

### 2026-08-01 - Sanity production project and initial content

- 使用 Google 账号完成 Sanity CLI 授权，核验项目 `yizhoufan`（project ID `mb3w1o0y`）及 `production` 数据集；项目初始内容为空，仅包含 Sanity 系统文档。
- 根站和独立 Studio 的 Git 忽略环境文件已绑定项目 ID 与数据集；公开站不配置 Sanity 时仍保留受控静态回退，线上密钥继续禁止进入 Git。
- Sanity Studio 已构建并部署至 `https://yizhoufan.sanity.studio/`，发布 profile、publication、talk、person 四类 Schema；CLI 固定 Studio hostname 与 deployment app ID，后续可重复无交互部署。
- 首次部署遇到 `@emotion/is-prop-valid@1.4.0` 发布包缺少其声明的 CommonJS 文件，导致 Manifest 提取失败；Studio 使用 npm override 固定到文件完整的 `1.3.1` 后构建、Schema 发布与托管部署均通过。
- 新增可重复执行的 `sanity:seed` 迁移脚本，从受控公开数据生成 28 条文档：1 个个人档案、12 项成果、6 场报告、9 位成员。导入前完成保密关键词扫描，明确不含海外引进博士后内部项目；使用 `--missing` 模式导入，不覆盖已有内容。
- 配置 Sanity 后的 Next.js 生产构建、ESLint 与 13 项回归测试全部通过，证明中英文页面可从 Content Lake 静态生成；公开站生产依赖审计为 0 漏洞。
- Studio 执行非破坏性安全更新后仍有 7 个官方 CLI 传递依赖告警（3 moderate、4 high）；剩余建议需要跨 Sanity 主版本，因此不执行强制修复。
- Vercel 已登录账号 `reimagica-2258` 并绑定团队项目 `ma-j/yizhoufan`。Production、Preview、Development 均配置公开 Sanity 项目参数；Production 另配置加密的 `SANITY_API_WRITE_TOKEN` 与 `SANITY_WEBHOOK_SECRET`。
- Sanity 只保留一枚标签为 `YizhouFan Vercel automation` 的 Editor Token，足以回写自动化草稿但不具备项目级 Webhook 管理权限；创建 Webhook 时使用一次性的已登录管理会话，运行时不保存高权限管理令牌。
- 已创建 `YizhouFan content automation` 与 `YizhouFan content revalidation` 两个签名 Webhook，当前目标分别为 `https://yizhoufan.vercel.app/api/cms/automation` 和 `/api/cms/revalidate`；前者包含草稿并使用窄过滤器，后者只监听已发布四类内容。自定义域名尚未解析，因此暂不使用 `yizhoufan.com` 作为回调域名。
- 配置后重新部署 Vercel Production，部署状态为 Ready，稳定别名为 `https://yizhoufan.vercel.app`。当前执行环境访问 `*.vercel.app` 被上游重置，未能完成外部 HTTP 抓取验收；本地读取真实 Sanity 的生产构建、Vercel 构建与部署均已通过。
- 初次真实投递测试发现通过标准输入写入的 Sensitive Secret 与 Sanity 签名不匹配，内容刷新返回 401；随后轮换随机 Secret，改用 Vercel `--value` 显式写入，精确替换两个 Webhook 并再次部署。幂等更新测试确认 revalidation Webhook 返回 200。
- 论文自动化完成端到端验收：为 `publication-001` 创建临时草稿并设置 `automation.status=requested` 后，Vercel 成功执行多源检索并回写 `candidates-ready` 与 3 条候选；测试草稿随后删除，已发布论文未修改。这同时验证了 Webhook 签名、Production Editor Token 和 Sanity 草稿回写链路。
- DeepSeek 正式密钥与 Upstash Redis 尚未写入 Vercel。此前在对话中出现过的 DeepSeek 密钥必须先轮换，禁止直接用于生产；完成前 AI 问答按生产安全边界拒绝付费调用。

### 2026-08-02 - UI clarity and responsive polish

- 桌面端个人信息卡的头像容器改为与 300px 侧栏同宽，移除固定纵横比与紧凑高度同时生效造成的右侧留白；平板与手机断点继续显式使用适合各自布局的图片比例。
- 移动端导航压缩链接横向内边距与间距，并隐藏浏览器原生水平滚动条；极窄屏仍保留触摸横向滚动能力，常见手机宽度下优先完整呈现五个入口。
- 个人信息页七个区块移除无语义的 `01`—`07` 圆形编号，统一使用北大红短竖线强化标题层级，不把纯装饰编号暴露给读屏器。
- 中文站的成果类型与报告类型改为本地化展示，后台枚举值继续保持英文；任职和项目时间范围统一使用连接号，中文 `present` 显示为“至今”。报告日期兼容 Sanity ISO 日期和静态回退的点分格式，年份筛选不再依赖单一格式。
- 提高联系方式、检索/筛选标签、问答角色标签和状态徽标的字号与弱文本对比度；成果、报告和成员分类按钮增加 `aria-pressed`，成员分类从不完整的 ARIA Tab 模式改为与真实交互一致的筛选按钮语义，头像占位增加图片角色。
- 新增双语渲染回归断言，覆盖无编号标题、“至今”、成果/报告类型本地化和筛选状态语义。本轮 ESLint、TypeScript `noEmit` 与 6 项 AI 输出守卫单测通过；自动化生产构建因当前执行环境拒绝写入 `.next`、浏览器视觉回归因本地地址安全偏好被阻止，需在下一次本地/Vercel 构建时完成最终截图与全量渲染测试。

### 2026-08-02 - GitHub sync pending

- 已准备将 Sanity 正式项目配置、Studio 托管部署参数、首次公开内容迁移脚本、Vercel/Webhook 文档、Studio 依赖兼容修复与本轮 UI 优化合并为同一轮稳定更新；当前执行环境的 Git 写入授权服务连接失败，尚未创建提交或同步至 GitHub `main`。
- 待推送范围不包含 `.env.local`、`studio/.env.local`、DeepSeek/Sanity/Webhook 密钥、原始 CV、构建缓存、Studio 构建产物或依赖目录；线上 Sanity 与 Vercel 中的加密环境变量不得写入仓库。

### 2026-08-02 - Favicon initials

- 网站小图标继续使用北大红圆角方形与白色衬线字母，将姓名缩写由 `YF` 调整为 `YZ`；Next.js 继续通过 `app/icon.svg` 自动生成站点 favicon。

### 2026-08-02 - Sanity document action context fix

- 修复 Sanity Studio 编辑成果或报告时出现的 `useFormValue must be used within a FormValueProvider`：自定义 `DocumentActionComponent` 不再调用仅限表单字段上下文的 `useFormValue`，改用动作参数自带的 `draft / published` 文档快照读取英文题名、私有 PPTX 对象键和论文候选。
- 自动化按钮的启用条件、请求写入、候选弹窗和草稿回写行为保持不变；该修复需重新构建并部署 Sanity Studio 后才会在 `yizhoufan.sanity.studio` 生效。

### 2026-08-02 - Publication intake and native Sanity assets

- 按导师最终决定，公开论文 PDF、学术报告 PDF/PPTX 和报告正文图片统一改用 Sanity 原生 `file` / `image` 与 Asset CDN，不再等待 OSS/COS；该选择仅适用于已确认公开的文件，原始 CV、内部项目和未授权文件仍禁止上传。
- Studio 新增独立“添加学术成果”工具：支持题名、DOI 与最多三位作者组合检索 Crossref、OpenAlex、Semantic Scholar、DBLP，返回多个带置信度和核对提示的候选；选中候选或手动填写均只创建 Sanity 草稿，并先按 DOI/规范化题名查重。
- 删除成果文档中的“检索任务”字段和成果/报告自定义自动化动作。旧 `/api/cms/automation` 降级为签名后返回 410 的停用入口，线上旧自动化 Webhook 待部署时删除；论文候选改由只允许 `SANITY_STUDIO_ORIGIN` 的只读接口提供。
- 学术报告取消 PPT 解析与 AI 草稿，改为人工维护“基本信息—双语 Portable Text 正文—公开附件”。正文支持二/三级标题、图片、引用、外部链接、脚注和提示框，不设置封面图片；前台新增 `/{lang}/talks/{id}` 详情页。
- 上传限制采用本地选择预检与 Sanity Asset 元数据二次校验：正文图仅 JPEG/PNG/WebP 且 ≤8 MB，论文仅 PDF 且 ≤40 MB，报告仅 PDF/PPTX 且 ≤80 MB；关闭原始文件名存储，前台只查询 `copyrightCleared == true` 的文件。
- 删除旧 PPTX 解析模块、DeepSeek 报告摘要模块及 `jszip` 依赖。最终 Next.js 与 Sanity Studio 生产构建、两套 TypeScript、ESLint、6 项 AI 守卫测试、11 项页面/API 回归均通过；公开站 `npm audit --omit=dev` 为 0 漏洞。
- 功能提交及部署记录均已推送 GitHub `main`。Sanity Studio 已重新部署至 `https://yizhoufan.sanity.studio/`；手动部署与 GitHub 集成触发的 Vercel Production 构建均为 Ready，稳定别名 `https://yizhoufan.vercel.app` 已指向最新 `main`。当前执行环境直连 `*.vercel.app` 会被上游重置，因此线上验收以 Vercel 控制面 Ready 状态、完整成功构建日志和本地生产回归共同确认。

### 2026-08-03 - Production Redis rate limiting

- Vercel Marketplace 的 Upstash Redis 集成已连接到 `ma-j/yizhoufan`，并向 Production、Preview、Development 注入带 `yizhoufan_` 前缀的连接变量。
- Production 与 Preview 已配置服务端 Sensitive 变量 `RATE_LIMIT_SALT`；代码所读取的 `UPSTASH_REDIS_REST_URL` 与 `UPSTASH_REDIS_REST_TOKEN` 已切换到新连接的 Upstash 实例。只读 Token、TCP `REDIS_URL` 与 `KV_URL` 不用于当前 REST/Lua 限流实现。
- 使用新环境变量重新部署 Vercel Production，完整 Next.js 构建、TypeScript 检查与 22 个静态页面生成均通过；部署状态为 Ready，稳定别名继续为 `https://yizhoufan.vercel.app`。
- 当前执行环境连接 `*.vercel.app` 仍持续超时，因此未能从本机完成真实 `/api/ask` 响应验收；需在普通浏览器中提交一次问答，并在 Upstash 控制台确认出现 `yizhoufan:quota:*` 键。任何曾暴露在对话中的 Redis Token 都应在验收后轮换，并同步更新 Vercel 标准变量。

### 2026-08-17 - Profile, Scholar metrics, and standalone teaching

- 导师确认 `private/课题组网站记录/网站资料/论文PDF/` 已完整下载，共 93 份文件，且全部可在个人网站公开；后续成果整理仍须按 PDF 正文核对元数据、去重并先生成 Sanity 草稿，但无需再次逐份询问公开权限。
- 首页右栏删除 Biography 之前的研究方向横幅和中英文姓名标题，进入后直接显示个人简介；左上角站点标识改为“个人网站 / Personal Website”，避免与人物卡中的姓名和职务重复。
- Biography 后新增紧凑学术数据卡：Scholar 总引用、h-index、i10-index 使用截至 2026-06-20 的快照并显示日期；成果数量不区分中英文，直接从全部已发布成果数组计算并链接成果页。待 93 份 PDF 对应成果完成发布后，该数字自动补齐。
- 教学从 Profile 拆为独立导航和 `/{lang}/teaching` 页面。新增 Sanity `course` 文档、双语查询/类型/回退/初始数据与响应式课程卡；当前只录入学习分析、信息技术与高校管理、智能时代的英文学术写作、人机交互设计、面向学术的 AI 素养五门课程。
- 五门课程简介以导师材料为依据，只概括课程定位、内容与能力目标，不公开周次、考核比例或办公室时间；“信息技术与高校管理”因只有简历记录，采用不扩写具体教学安排的保守说明。本轮不展示 MOOC 或其链接。
- 中文 Bio、研究方向、爱丁堡大学任职表述与四项公开科研项目按最新中文简历校正；三项中文项目使用完整正式题名，SoLAR ECR 项目保留官方英文题名，不制造中文官方译名。既有公开白名单与保密排除规则不变。
- AI 公开知识改从独立课程数据读取，结构化 `topics` 增加 `teaching`，课程问题链接到教学页；Scholar 回答只能引用带日期的缓存值，不得声称实时爬取。
- 执行 Sanity 增量迁移前已将 28 份文档和 1 个 Asset 完整备份至 `private/课题组网站记录/网站资料/Sanity备份/yizhoufan-production-before-0817.tar.gz`；随后只 patch 已确认的 Profile 字段，并创建/更新 5 个已发布 `course` 文档，保留旧 Profile 课程数组以兼容当前线上前端。Sanity 只读核验确认完整项目名、更新后 Bio 和 5 门课程已写入。
- 本轮未推送 GitHub，也未部署 Vercel/Studio。上线时需统一发布代码和 Studio，再确认课程页、导航与内容刷新 Webhook；旧 Profile 课程数组可在新前端稳定后另行清理。
- 2026-08-17 再次系统校对本记忆文件：清除“未收到 PDF”“教学仍在 Profile”“待配置 Upstash”“计划使用 OSS/COS”等过时状态，补全当前 33 份 Sanity 文档、未提交工作区、验证结果和后续三项内容改造顺序。

### 2026-08-17 - Publications module full整理 (metadata import, PDF upload, publish complete)

- 按 `private/课题组网站记录/0817后续Agent执行Prompt.md` Prompt 1 完成学术成果全量整理：Schema 扩展 → 幂等迁移 → 一致性校验 → 10 份抽样审计 → 发布，全流程已落地。
- `publication` Schema 新增结构化引用字段 `volume`/`issue`/`pages`/`articleNumber`、`language`（`en`/`zh`，仅用于成果页语言筛选）和后台 `reviewNote`（记录草稿待复核原因，前台不读取）。首页成果总数仍只统计全部已发布成果，不按语言拆分。
- `lib/cms/types.ts`、`lib/cms/content.ts` 查询、`lib/public-knowledge.ts` 与 `lib/server/answer-links.ts`（新增 `pdfUrl` 兜底）同步更新；AI 公开知识按 ID/年份/语言/类型/题名/作者/载体格式化，论文原文链接优先 `sourceUrl` → DOI → 公开 `pdfUrl`，禁止模型自造链接。
- `PublicationExplorer` 新增语言筛选（仅在成果含 >1 种语言时出现，不削弱既有检索/年份/类型/来源/PDF/BibTeX/摘要能力）。BibTeX 生成抽到独立纯函数 `lib/bibtex.ts`，支持卷/期/页码/文章号/DOI；新增 `tests/bibtex.test.mjs` 覆盖 article/book/inproceedings/articleno/DOI/显式 bibtex/作者 `and` 分隔，`answer-guard.test.mjs` 新增 `pdfUrl` 兜底断言。
- 写入幂等迁移脚本 `studio/scripts/migrate-publications.mjs`（`createIfNotExists` + `patch.set`，既有 12 项保留 `published` 状态、新项先建 `draft`、附件已挂载则跳过上传、`copyrightCleared=true`、不确定项写 `reviewNote` 保持草稿）与只读一致性脚本 `check-publications-consistency.mjs`（重复 DOI/题名、禁止 Google Scholar sourceUrl、附件 MIME 与 40 MB 上限、版权勾选核对）。
- 批量写入前已导出全新 Production 备份 `private/课题组网站记录/网站资料/Sanity备份/yizhoufan-production-before-publications-0817.tar.gz`（33 份文档 + 1 个 Asset）。
- 93 个输入文件的私人盘点账本与抽取正文存放于 `private/课题组网站记录/网站资料/论文PDF处理/`（含 SHA-256、页数、扫描标记、文本字符数），不进入 Git 或公开仓库；实际格式为 92 PDF + 1 PSD，不应继续写成“93 份 PDF”。
- **迁移结果（2026-08-17）**：Sanity 现有 92 份 `publication` 文档——84 `published` + 8 `draft`（自定义 `status`，均带 `reviewNote`）。本轮迁移结果文件记录新建 80 项、更新既有 9 项、上传 89 份 PDF file 资源，0 上传失败；线上当前 009=English Academic Writing（无 PDF），011=Towards a fuller picture（含正确 JCAL PDF）。
- 一致性脚本复检为 92 文档 0 问题；发布态链接检查的准确口径是：81/81 PDF CDN 2xx + `application/pdf`，42/70 sourceUrl 自动请求成功，28/70 被出版商反自动化拦截，0 判定 broken。89 是全体成果附件数，其中 81 属于 published、8 属于待复核 draft；不能把 89 写成“已发布 PDF 可达数”。本轮仍**未 Git commit/push，未部署 Vercel/Studio**。

### 2026-08-17 - Publications independent audit（未最终验收 → 已于 2026-08-18 修复，见下条）

- 只读核对私人账本：输入目录共 93 个文件，实际为 92 PDF + 1 PSD；92 份 PDF 中 3 份被已发表版本取代，形成 89 条最终带 PDF 成果。存在两个版本组，不是一个：`grp-mooc-survey`（2014 中文正式版取代英文 preprint）和 `grp-mooc-retakers`（6 个材料中保留 4 条独立成果，2016 preprint 与 2017 poster 被 2020 PLOS ONE 取代）。
- 只读核对 Sanity Production：92 Publication、84 published、8 draft、89 file assets；69 条 DOI、71 条 sourceUrl；语言 en 65 / zh 24 / unset 3；类型 Journal 57 / Conference 29 / Book 4 / Book chapter 2。8 条草稿及其 `reviewNote`、009/011 当前线上状态均与迁移报告一致。
- 备份文件存在且可读；压缩包中的 `data.ndjson` 为 33 行，另含迁移前 1 个图片 Asset。Next Production build、25/25 测试、Studio build、`git diff --check` 通过；ESLint 实际为 0 error、2 warnings。
- 独立查看 3 份代表性 PDF 首页并对照 Sanity：JCAL 2023、2014 中文 MOOCs 论文、JMIR 2026 的题名、作者顺序、年份、载体和 DOI 正确；中文论文摘要完整。JCAL 与 JMIR 的 Sanity 英文摘要只保留原摘要前半/部分句段，未满足 Prompt 1 的“原始摘要”要求，原先“10/10 CLEAN”不能证明全部摘要已经完整核对。
- **阻断 1：迁移不是真正幂等。** 私人 `publications-verified.json` 仍把 Towards a fuller picture 的 `existingId` 写成 `publication-009`；再次运行 `migrate-publications.mjs` 会重新覆盖 009。`repair-009-011.mjs` 也不是注释所称的幂等：第二次执行会把已恢复的 009 再复制到 011。修正源映射和脚本保护前，禁止重跑这两个写脚本。
- **阻断 2：引用字段尚未规范。** 迁移清洗未去除大量 `venue` 中重复的卷期/页码；私人数据中有 12 条同时把同一文章号写入 `pages` 与 `articleNumber`，当前 BibTeX 会优先输出错误的 `pages`；Book chapter 仍输出 `@inproceedings`。应清洗并补测试后再作最终验收。
- **提交卫生问题：** `migrate-publications.mjs` 含本机绝对私人路径；一次性 repair 脚本依赖 `/tmp` 备份路径；`tsconfig.tsbuildinfo` 未被忽略；accessibility 脚本有 2 个 lint warnings。提交前必须参数化/移除一次性路径、处理构建产物和警告。
- **阶段结论：** 数据迁移主体、文件上传、状态划分、可达性与基础代码构建完成，但 Prompt 1 暂判为“有条件未通过”。先完成上述修复和英文摘要复核，建立干净 checkpoint 后，方可启动 Talks Agent，避免在同一未提交工作区叠加第二批 Sanity 写入与代码修改。

### 2026-08-18 - Publications audit fix（验收通过）

承接 0817 独立审计的 3 个阻断与提交卫生项，全部修复并复核。未执行 Git commit/push/deploy，未写入 Talks 数据。

**修复明细（计数）**
- 源映射：私人 `publications-verified.json` 中 Towards a fuller picture 的 `existingId` 从 `publication-009` 修正为 `publication-011`（1 处）。009（English Academic Writing in Practice，Book、无 PDF）不在迁移源中，永不被覆盖；011 带 PDF、已发布、JCAL 2023。89 个迁移目标 ID 均为稳定 ASCII，0 个映射到 009，fuller picture 映射到 011，`migrate-publications.mjs` 重复执行安全。
- 删除一次性脚本 `studio/scripts/repair-009-011.mjs`（非幂等：第二次会把已恢复的 009 复制到 011）；JSON 源映射修正已使其冗余。
- 英文摘要：对 58 份英文文本型 PDF 逐字重新提取 Abstract 区（6 个并行 subagent + 1 个 fixup subagent 补齐遗漏），去重后 52 条唯一摘要 + 1 条 null。两份 DL4D 短文（`publication-t-2018-667f64520ec2` Learning Analytics、`publication-t-2018-b604668db740` Caselet: China）经 `pdftotext` 核实 PDF 无 Abstract 段落，原 Sanity 摘要实为正文首段误标，已 `unset abstract.en`（2 处）。中文 `abstract.zh` 全程不动。
- 引用字段：私人源 `venue` 清洗 51 条（剥离尾随卷期/页码）；迁移后再 patch 36 条 venue；12 条文章号同时写入 `pages` 与 `articleNumber` 的，清空 `pages` 仅保留 `articleNumber`（`unset pages`）。
- BibTeX：`lib/bibtex.ts` 为 Book chapter 输出 `@incollection`（`booktitle`）、Book 输出 `@book`（`publisher`）、Journal 输出 `@article`、Conference 输出 `@inproceedings`；`articleNumber` 始终输出 `articleno`（不再与 `pages` 互斥）。新增/重命名测试至 8 项。
- 提交卫生：`migrate-publications.mjs` 与 `patch-publications-audit.mjs` 输入路径改为 `MIGRATION_INPUT` 环境变量，移除本机绝对私人路径；`.gitignore` 增加 `*.tsbuildinfo` 并删除已入库的 `tsconfig.tsbuildinfo`；accessibility 脚本两个 `catch (error)` 改为 `catch`，ESLint 0 warning。

**写入前备份与幂等性**
- 写入前备份：`课题组网站记录/网站资料/Sanity备份/publications-pre-audit-fix-0818.ndjson.gz`（92 条 publication，41.7 KB gzipped NDJSON，自定义 fetch 全量脚本产出）。
- 幂等 patcher：`studio/scripts/patch-publications-audit.mjs` 先 fetch 当前 Sanity、计算 diff、仅 patch 变化字段（abstract.en 走点路径保留 zh；venue/volume/issue/articleNumber `set`；文章号-only 条目 `unset pages`）。首次 apply：69 docs、55 abstracts 替换、36 venues 清洗、12 pages unset、0 citation patches。重跑：0 planned，确认幂等。
- DL4D 两份误标摘要的 unset 脚本单独 apply（2 处），重跑 no-op。

**复核结果**
- 一致性：92 docs、0 problems、84 published、8 draft、89 file assets、69 DOI、71 sourceUrl、en 65 / zh 24 / unset 3。
- 可达性：sourceUrl 42/70 ok + 28 publisher-bot-protected（registry-valid，非 broken）+ 0 broken；PDF CDN 81/81 ok。
- 构建/测试：Next Production build 通过；Sanity Studio build 通过；`node --test` 27/27 通过；ESLint 0 error 0 warning；`git diff --check` 干净。
- 10 篇抽查（含 009、011、JMIR、中文×2、Book chapter、文章号×2、DL4D Book、featured-001）：5 份有 PDF 的英文摘要逐字 MATCH（011 1894 字 / JMIR 2463 字 / CAEAI 1830 字 / BJET 2251 字 / DL4D Book 1766 字）；Book chapter 正确为空；009/001 不在迁移源、无摘要符合预期；中文两篇 `abstract.en` 为空符合预期（zh 摘要不动）。

**剩余 8 条 draft（保持草稿，不猜测）**
- 2 份扫描 PDF：`publication-t-2018-99f078403983`（MOOC 重复注册者）、`publication-t-2024-8b6e07303498`（系统综述）——待 OCR 或导师人工补齐。
- 5 份 workshop/poster/short：`publication-t-2020-39890e888c2d`、`-594dbf986dad`、`-9cf3944a3c2e`、`-8cff52f735f0`、`publication-t-2023-a6b1a1861df2`——非完整研究论文，按导师判断是否发布。
- 1 份 edited book 章节未验证作者：`publication-doi-10-3726-978-3-631-69873-0`（New Ways to Teach and Learn in China and Finland）——PDF 作者列表中未发现 Fan Yizhou，待导师确认署名后处理。

**阶段结论：** Prompt 1 审计修复通过。备份、幂等 patcher 与全量复核已到位（Git 仍未 commit，未部署 Vercel/Studio）。剩余 8 条 custom-status draft 待最终发布（见下条）。

### 2026-08-18 - Publications final publish（Prompt 1 全部完成）

承接同日审计修复，完成最后 3 条元数据校正与 8 条草稿发布。未 Git commit/push、未部署 Vercel/Studio、未写 Talks 数据。

**3 条元数据校正（逐字摘要，OCR 校正）**
- `publication-t-2024-8b6e07303498`（系统综述）：venue 由“Frontiers in Education (inferred from filename)”修正为 `Frontiers of Digital Education`；补 authors、vol 1、issue 3、pages 223-245、DOI `10.1007/s44366-024-0028-5`、sourceUrl、逐字英文摘要（Vision OCR 300 DPI，校正 GenAI/连字符）、4 个关键词。`articleNumber` 保持 unset。
- `publication-t-2018-99f078403983`（MOOC 重复注册者中文论文）：题名从误存于 `title.en` 的“他们为什么回来——MOOC中重复注册者行为与动机分析”移至 `title.zh` 并按 PDF 首页校正为“他们为什么回来？——MOOCs中重复注册者行为与动机分析”；`title.en` unset（不制造英文官方题名）；补 authors、vol 24、issue 2、pages 89-96、DOI `10.13966/j.cnki.kfjyyj.2018.02.010`、sourceUrl、逐字中文摘要、5 个关键词。
- `publication-doi-10-3726-978-3-631-69873-0`（2016 Peter Lang）：由 `Book` 改为 `Book chapter`；题名由整本书名“New Ways to Teach and Learn…”修正为章节题名“Teachers as Researchers: Current Trends and Hot Topics”；authors 由编辑“Hannele Niemi, Jiyou Jia (eds.)”修正为章节作者“Shelly Zong, Jingjing Jiang, Yizhou Fan”；venue 由“Peter Lang”修正为整本书名；补 pages 229-253、逐字英文摘要、4 个关键词、显式 BibTeX `@incollection`（含 editor、publisher、url）；`doi` unset（整本书 DOI 非章节 DOI），`sourceUrl` 保留整本书 DOI URL。

**8 条统一发布**
- 5 条 workshop/poster/short（题名、作者、材料性质已逐页核验）：`publication-t-2023-a6b1a1861df2`、`-2021-8cff52f735f0`、`-2020-39890e888c2d`、`-2020-594dbf986dad`、`-2020-9cf3944a3c2e`。
- 上述 3 条校正记录。统一 `status=published`、`unset reviewNote`。未重新上传 PDF、未创建重复 Asset、未改 `copyrightCleared`。

**写入前备份与幂等性**
- 备份 `课题组网站记录/网站资料/Sanity备份/publications-pre-final-publish-0818.ndjson.gz`：92 条 publication 全字段，54.2 KB gzipped NDJSON，解压 92 行，SHA-256 `3dd7a6c10015a6015a13173d6d8eafc901cd71cd66f648f8881285051fa5d634`。0817/0818 历史备份均保留未覆盖。
- 摘要审计输入持久化到 `课题组网站记录/网站资料/论文PDF处理/摘要审计0818/`：9 份 EN 批量审计 JSON + `finalization-input.json` + `MANIFEST.md`（含全部 SHA-256 与 OCR 方法），项目不再依赖 `/tmp` 复现审计。
- 幂等 finalization patcher `studio/scripts/patch-publications-finalize.mjs`：默认 dry-run、`PATCH_APPLY=1` 提交、只允许指定 8 个 ID、写入前校验 8 个 PDF Asset 存在且 MIME `application/pdf` 且 `copyrightCleared=true`、3 条校正须满足 authors/title/venue/doi-or-sourceUrl 才允许提交、单事务。首次 apply 3 corrections + 8 status flips（transaction `hgO203pHJHUivX10GfSkJr`）；重跑 0 planned，确认幂等。输入路径经 `FINALIZATION_INPUT` 环境变量，不硬编码私人路径。

**前台渲染修正**
- `components/PublicationExplorer.tsx`：`localizedTitle` 增加 en↔zh 双向回退（中文论文在英文页显示原始中文题名，反之亦然）；摘要同样双向回退；React key、expanded/copy 状态改用稳定 `publication.id`（原用 `title` 在中文论文 `title.en` 为空时不稳定）。

**全量验收**
- Sanity：92 total、92 published、0 draft、89 file assets、89 published with PDF、0 published authors 为空、0 pages+articleNumber 同时存在、0 draft with reviewNote；Book 3 + Book chapter 3（2016 已为 Book chapter）。
- 一致性：0 problems（DOI 重复 0、规范化题名重复 0、Scholar sourceUrl 0、PDF MIME/copyright 0 问题）。
- 可达性：89/89 published PDF CDN 2xx + `application/pdf`；sourceUrl 45/73 ok + 28 publisher-bot-protected（registry-valid）+ 0 broken。
- 页面/AI：成果页显示 92（en “92 results” / zh “92 项成果”）；首页成果数 92；2016 显示为 Book chapter 且题名“Teachers as Researchers”；2018 中文题名在英文页正确回退显示；AI 公开知识读取已发布内容，无假 DOI/假摘要/假英文译名。
- 工程：`npm run lint` 0 error 0 warning；`npm test` 27/27；`npm run build` 通过；`npm run studio:build` 通过；`git diff --check` 干净。

**阶段结论：** Prompt 1 全部完成。成果 92 published、0 draft、89 PDF。Git 仍未 commit、未部署 Vercel/Studio；不声称已建立 Git checkpoint。下一优先级为 Talks（Prompt 2）。

### 2026-08-18 - Talks module convergence (Prompt 2)

承接 Prompt 1（成果 92 published），按导师指定的 11 场白名单收敛学术报告模块，移除报告类型 UI。未 Git commit/push、未部署 Vercel/Studio、未触碰成果数据、未处理 People 模块。

**写入前备份**
- 备份 `课题组网站记录/网站资料/Sanity备份/talks-pre-whitelist-0818.ndjson.gz`：迁移前全量 5 个 talk 文档（每行一条，解压 5 行），617 B gzipped NDJSON，SHA-256 `e720a34d03e8cadea0311c4e5891f4ea7670b1ea89a07656ef7672924feaea26`。0817/0818 历史备份保留未覆盖；备份不进 Git。

**Schema 与代码**
- `studio/schemaTypes/talk.ts`：`date` 增加 `options.dateFormat: "YYYY-MM"`（只精确到年月，不填具体日）；新增 `displayOrder`（同年月手动排序，白名单 1–11 预填）；`type` 改 `hidden: true` 并标注为旧数据兼容字段。
- `lib/cms/types.ts`：`PublicTalk.type` 改可选，新增 `displayOrder?`。
- `lib/cms/content.ts`：talkQuery 排序改 `order(date desc, displayOrder asc)`、投影新增 `displayOrder`、移除 `type`；回退 `fallbackTalkRows` 使用稳定 `item.id`、补 `displayOrder`、移除 `type`。
- `lib/content.ts`：回退 talks 改为 11 条白名单（id + displayOrder 1–11 + 点分日期 "2026.07"，无 type），题名逐字保留（含 "selfregulated"、"The University College of London"）。
- `scripts/generate-sanity-seed.mjs`：talkDocuments 用 `item.id`、`item.date.replace(".", "-")`（不加 "-01"）、`displayOrder`，移除 `type`。
- `components/TalkExplorer.tsx`：移除 typeLabels/localizedType/type 状态/类型筛选组/卡片 type-pill；搜索占位改为 "Enter a title or host" / "输入报告题目或主办方"；卡片 key 改用稳定 `talk.id`；无 slidesUrl 时不渲染禁用占位（只显示 View details）。
- `app/[lang]/talks/page.tsx`：lead 移除"与报告类型/and talk type"，"slides"→"materials"；标题/eyebrow 不变（Talks/学术报告）。
- `app/[lang]/talks/[id]/page.tsx`：移除 header type-pill；日期显示 "2026-04"→"2026.04"；无正文/附件时不渲染 Public downloads 区块（不编造假链接）。
- `lib/public-knowledge.ts`：talkText 移除 `${item.type}`，AI 知识只含 11 条已发布报告的完整英文题名 + 主办方。

**幂等白名单迁移**
- 输入 `talk-whitelist-input.json`（11 条，{id, date "YYYY-MM", displayOrder 1–11, title, host}）经 `TALK_WHITELIST_INPUT` 环境变量传入，不硬编码私人路径。
- `studio/scripts/migrate-talks-whitelist.mjs`：校验 11 条、id 唯一、displayOrder 唯一、规范化(date+title)唯一；按 `${norm(title)}|${YYYY-MM}` 匹配既有 talk；命中只 patch 变化字段（title.en/host.en/date/displayOrder/status=published，不触碰 body/attachments/type）；未命中 `createIfNotExists`（稳定 id）；白名单外既有 talk 置 `status=draft`（归档可恢复，非删除）。默认 dry-run，`PATCH_APPLY=1` 提交，单事务。

**迁移结果（2026-08-18）**
- 原始报告条数：5（Sanity 迁移前既有 talk 文档）。命中 5、更新 5、新建 6、归档 0。全部 5 条既有 talk 命中白名单（talk-002/003/004/005/006），新建 6 条（talk-2026-07-bavaria、talk-2025-12-new-liberal-arts、talk-2025-04-oulu、talk-2024-03-lak24、talk-2023-09-earli23、talk-2022-09-sig27）。
- 最终 11 条全部 `published`、0 `draft`、0 archived；日期存储为 "YYYY-MM"（未胁迫为 YYYY-MM-DD）；displayOrder 1–11 与白名单一致；同年月并列稳定（2026-04 → order 2,3；2025-11 → order 6,7）。
- 最终 11 个 ID + 顺序：
  1. talk-2026-07-bavaria — 2026-07 — A Metacognitive Approach to Learning and Performance in Human-AI Interaction — Bavarian Learning Analytics Network and University of Hagen, Germany
  2. talk-002 — 2026-04 — Shifting From Product-Oriented to Process-Oriented Assessment with Learning Analytics — The 6th Workshop on Learning Analytics and Assessment (LAK26), Norway
  3. talk-003 — 2026-04 — Beware of Metacognitive Laziness in Learning with GenAI — The University of California, Riverside, USA
  4. talk-004 — 2026-02 — Revealing and Avoiding Metacognitive Laziness while Learning with GenAI — The University College of London, UK
  5. talk-2025-12-new-liberal-arts — 2025-12 — Learning with GenAI to solve real-world and high-challenge tasks — 1st International Conference on New Liberal Arts, Hong Kong, China
  6. talk-005 — 2025-11 — Designing, scaffolding, and coding complex human-AI interactions and collaboration processes — The University of Hong Kong, Hong Kong, China
  7. talk-006 — 2025-11 — Learning with GenAI: Beware the Trap of Metacognitive Laziness — International Conference on Intelligent Education and Research, Wuhan, China
  8. talk-2025-04-oulu — 2025-04 — Beware of Metacognitive Laziness in Learning with GenAI — University of Oulu, Finland
  9. talk-2024-03-lak24 — 2024-03 — Learning and Regulating with ChatGPT: What Experimental Study Tells Us? — LAK24 Conference, Japan
  10. talk-2023-09-earli23 — 2023-09 — When and why learners benefit from personalized scaffoldings for self-regulated learning — EARLI-23 Conference, Greece
  11. talk-2022-09-sig27 — 2022-09 — Improving the measurement of selfregulated learning using multichannel data: A FLoRA Case Study — SIG-27 Workshop, UK
- 正文/附件：有正文+附件 0 条；无正文+附件 11 条（全部 11 条当前仅有日期+英文题名+主办方，正文与附件待导师通过 Studio 补充）。

**二次 dry-run 与 Sanity 复核**
- apply 后重跑 `migrate-talks-whitelist.mjs`（dry-run）：0 planned，确认幂等。
- `*[_type == "talk"]`：11 total、11 published、0 draft；日期均为 "YYYY-MM"；displayOrder 1–11 唯一且与白名单一致；同年月组合（2026-04、2025-11）各 2 条，顺序与白名单一致；11 条 (date+displayOrder) 组合唯一。

**测试与构建**
- `tests/rendered-html.test.mjs`：更新 talk 测试为 4 项——搜索在筛选与结果之前且无 type 筛选；11 talks 白名单顺序无类型标签（en）；中文 11 场报告无类型标签；详情页无 cover/type-pill/假内容。28/28 通过。
- `npm run lint` 0 error 0 warning；`npm test`（含 next build）28/28 通过；`npm run studio:build` 通过；`git diff --check` 干净。
- 本地页面：/en/talks 与 /zh/talks 返回 200，"11 talks"/"11 场报告"，搜索在年份之前，无 `>Type<`/Keynote/Invited talk/主旨演讲/受邀报告，首条在末条之前；/en/talks/talk-2026-07-bavaria 返回 200，含 Back to talks + 题名 + 主办方 + 日期 2026.07，无 cover/类型标签/Public downloads/Download attachment；移动端 UA 同 HTML（响应式 CSS 处理布局）。

**阶段结论：** Talks 模块收敛完成。11 published、0 draft、0 archived（既有 5 全部命中白名单，未删除任何文档）。Git 仍未 commit/push、未部署 Vercel/Studio。全部 11 条报告尚无正文与附件，待导师通过 Studio 补充人工富文本与已确认公开的 PDF/PPTX。下一优先级为 People（§7）。

### 2026-08-18 - Talks 发布前修正与线上旧版本核对

- 独立复核发现 Sanity 原生 `date` 字段底层仍按 `YYYY-MM-DD` 反序列化和保存，`options.dateFormat: "YYYY-MM"` 只控制输入显示，无法可靠保存月份精度。`studio/schemaTypes/talk.ts` 已将报告年月改为 `string`，并以正则强制 `YYYY-MM`；现有 11 条 Production 数据本身已是正确字符串，因此无需数据迁移。
- Talks 列表标题统一为“学术报告 / Talks”，说明统一为“可按题目、主办方或年份检索学术报告 / Search talks by title, host, or year.”；清除“shared decks”“部分报告附有课件”等与当前 0 附件状态不符的文案。
- Talk 查询、搜索、筛选、卡片、详情和 AI 公开知识均不读取 `type`。旧字段只在 Studio 中隐藏兼容，前台只有年份筛选，没有类型筛选或类型标签。
- 详情入口改为内容感知：只有同一 Talk 文档存在 summary、任一语言正文或已确认公开附件时，题名和“查看详情”才链接详情页；当前 11 条均无上述内容，因此列表不显示 11 个重复空详情入口，但直接详情路由仍可安全访问。
- Publication 与 Talk 明确采用“一项内容一条 Sanity 文档”的双语策略；原始内容为事实信源，可选译名/译文保存在同一文档，缺译文时另一语言页面显示原始内容，不创建重复翻译记录，也不自动编造译名。
- 只读核对 Sanity：Profile 已含 Scholar 快照（2026-06-20：citations 3301、h-index 27、i10-index 45）；5 门 Course 全部 published 且均有中英文简介。当前所选 5 门课均 `mooc=false`、无官方 MOOC URL，因此前台不显示 MOOC 按钮是数据口径，不是渲染故障。
- 浏览器确认 `https://yizhoufan.vercel.app/en` 仍运行旧 GitHub `06889b4`：缺 Teaching 导航、Scholar 指标卡和新版课程页。本地生产版本已正确显示 Scholar 3301/27/45、本站成果 92、Teaching 导航、5 门课程简介和 11 场 Talks；桌面与 390px 页面无横向溢出。
- 验证：`npm run lint` 0 error/0 warning；`npm test` 含 Next production build，30/30 通过；`npm run studio:build` 通过；Talk 白名单迁移二次 dry-run 0 create/0 update/0 archive；`git diff --check` 干净。用户已明确授权发布本轮完整工作区，People 留到下一轮。
- 发布：完整功能提交 `d84bc7d` 已推送 `Reimagica/YizhouFan` 的 `main`。Sanity Studio 已成功部署至 `https://yizhoufan.sanity.studio/`，浏览器实查 Talk 表单显示“报告年月”字符串输入框与 `2026-07`。本地 Vercel CLI 59.1.4 的旧授权已失效，但 GitHub 集成自动完成 Production 发布；浏览器实查 `https://yizhoufan.vercel.app` 已显示 Scholar 3301/27/45、本站成果 92、Teaching 导航、5 门课程简介，以及无类型/无空详情入口的 11 场 Talks。

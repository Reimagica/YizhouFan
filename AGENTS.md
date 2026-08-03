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
| 当前阶段 | GitHub `main`、Sanity Studio、首批公开内容、Vercel、DeepSeek 与 Upstash 限流已配置；等待浏览器端 AI 验收、自定义域名及公开内容文件补齐 |
| 技术栈 | 标准 Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS v4；Sanity Studio 独立子项目 |
| 包管理 | npm |
| 当前数据形态 | Sanity 已发布内容为正式数据源；未配置 Sanity 时回退到受控双语静态数据；后台无访客登录 |
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

- 默认个人信息页：取消独立首页；左侧固定展示公开头像、身份、机构和联系方式，右侧滚动展示 Bio、研究方向、任职、奖励荣誉、公开科研项目、教学与学术服务。
- 学术成果：中英文成果列表，Google Scholar 作为英文论文与引用信息的重要外部入口，中文成果手动补全。
- 学术报告：受邀报告/主旨演讲记录，未来附公开 PPT 或 PDF。
- 教学：课程、MOOC、教学理念及人才培养信息并入默认个人信息页，不再单列导航栏目。
- 团队成员概览：按博士后、在读学生、毕业生三类切换；只显示照片位、姓名和状态，不做成员详情页，不承担课题组站的成果关联或编辑功能。
- AI 问答：导航名称固定为“AI 问答”；接入服务端大模型，回答导师或课题组的公开信息问题，并落实公开知识库、答案来源、无证据时拒答、按 IP/每日总量限流、费用上限和异常停用。

### 2026-07-27 第二轮页面与功能要求

- 字号层级收敛：页面主标题不得再使用超大海报字号，主标题与正文之间保持清晰但克制的层级。
- 配色保留浅米色、白色和北大红；全局米色背景进一步变浅。
- 圆角白色卡片、细边框、粘性侧栏、筛选侧栏、标签与成员网格等视觉语言适度靠近 `fanlearn-lab`，但个人站继续保持独立双语和轻量静态内容架构。
- 学术成果页必须具备全文检索、年份筛选、类型筛选、结果计数、来源检索、BibTeX 复制、摘要展开和 PDF 下载/待补状态；不复制课题组站的登录、添加、编辑、删除和审核功能。
- 学术报告页必须具备关键词检索、年份筛选、报告类型筛选、结果计数以及 PPT/PDF 下载/待补状态。
- AI 问答的浏览器端只调用本站 `/api/ask`；密钥仅放服务端环境变量，问题限 800 字。生产环境使用 Upstash 持久化分层限流，并必须配置费用告警与总额上限；开发环境的内存计数只用于本地验证。

### 2026-07-28 AI 问答 Harness（当前硬约束）

- 无登录状态不能可靠识别“同一位自然人”。公开口径必须写“本浏览器每天最多提问 8 次”，不得声称精确识别访客。
- 限流采用三层匿名标识：HttpOnly、SameSite=Lax 第一方 Cookie 保存随机浏览器 ID；网络地址经服务端 `RATE_LIMIT_SALT` 做 HMAC 后计数；另设全站总量。禁止把原始 IP、问题正文或模型答案写入限流键。
- 每分钟上限为浏览器 3 次、匿名网络 12 次；每日上限为浏览器 8 次、匿名网络 32 次、全站 120 次。Redis Lua 在同一层内先检查全部额度再原子递增，避免部分计数污染。
- 生产环境缺少 Upstash 或 `RATE_LIMIT_SALT`、限流服务异常时必须拒绝付费模型请求；清 Cookie 或更换网络不能保证识别同一人，因此网络层和全站层不可省略。
- 模型只允许输出 `status + items + optional note + topics + publicationIds` JSON：1–4 条，中文每条最多 300 字、英文每条最多 150 词；说明最多中文 90 字/英文 36 词。服务端必须再次截断，不得只依赖提示词。
- 服务端清除 `**`、反引号、列表前缀、控制字符和固定结尾套话；“更多详情可访问课题组相关公开页面或联系 fyz@pku.edu.cn”不得默认附加，只有访客明确询问联系方式时才能回答公开工作邮箱。
- 直接回答置前；资料不足返回 `insufficient`，不得猜测。回答涉及个人信息、学术成果、学术报告或团队成员时，按 `topics` 返回对应站内页面，最多 4 个，不再把所有页面固定附在每次回答后。
- 回答点名或推荐论文时，模型只能返回 PUBLICATIONS 中的精确 `publicationIds`，服务端再从 Sanity/受控回退成果数据读取 `sourceUrl` 或 DOI；禁止采用模型生成的 URL。每次最多展示 4 个已核实原文链接，没有公开原文地址的成果不生成假链接。
- 回答论文或著作时必须先写出 PUBLICATIONS 中的完整题名，再做介绍，不得用“2025 年的一篇论文”“一本生成式 AI 著作”等泛称替代。服务端会按 `publicationIds` 补齐模型遗漏的完整题名，并再次执行长度上限。
- 每次请求均为独立单轮，不向模型发送浏览器内的历史问答；公开知识上下文最多 28,000 字符、输出最多 420 tokens、18 秒超时、低温度生成。访客问题和 CMS 已发布文本均按数据而非指令处理。

### 双语要求

- 英文与中文使用独立可索引 URL：`/en/*`、`/zh/*`。
- 双语核心事实必须一致；不能只对 UI 做翻译而让事实内容漂移。
- 可先用机器翻译形成草稿，但涉及职务、项目、论文、奖项、人员状态的内容必须人工核对。
- 更新一条成果、报告、项目或成员信息时，同一提交必须检查两种语言。

### 文件与托管

- 论文 PDF 和报告 PPT/PDF 是个人站的核心价值，不是装饰性功能。
- 只有作者/版权允许公开的版本才能上传；未知授权状态显示“待补充”，禁止伪造或链接到未确认文件。
- 当前首版没有收到论文 PDF、报告 PPT 或已公开头像，因此只实现稳定的文件字段与清晰的待补状态，不创建假下载。
- 正式文件较多时优先使用国内对象存储/CDN或国内服务器，不把大文件长期直接塞进前端 Git 仓库。
- 域名、DNS、HTTPS、国内托管和文件存储在内容架构确认后单独实施。

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
├── 学术数据库检索和候选合并
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
- 论文补全先查询 Crossref、OpenAlex、Semantic Scholar、DBLP 等可验证来源，再由导师选择候选；DeepSeek 只做规范化、摘要和翻译，禁止凭空补造书目信息。
- 学术报告不使用 AI 生成草稿，也不解析 PPT；由导师直接编辑双语富文本和上传已确认公开的附件。
- 学术检索不得直接发布内容。候选选择与手动录入都只创建草稿，并经过导师人工确认。
- DeepSeek 密钥、webhook secret 与限流密钥只存在服务端环境变量，禁止进入浏览器包、Git 仓库或 Sanity 公共字段。
- Sanity 原生 image/file 只允许公开文件：正文图片 JPEG/PNG/WebP ≤ 8 MB，论文 PDF ≤ 40 MB，报告 PDF/PPTX ≤ 80 MB；前台只读取勾选版权确认的附件。
- 论文检索接口只读、限制 Studio Origin，不持有 Sanity 写令牌；当前登录的 Studio 用户负责创建草稿。
- 双语内容仍遵循“同一提交检查两种语言”；AI 翻译只是草稿，职务、项目、论文、奖项和人员状态必须人工核对。

### 上线前开发阶段计划

在推送 GitHub 和接入 Vercel 前完成：

1. 将现有 Sites/vinext 本地骨架整理为标准 Next.js 项目，保留当前页面与视觉效果。
2. 建立独立 Sanity Studio 配置和个人信息、成果、报告、成员等内容模型。
3. 前台增加 Sanity 读取层；未配置 Sanity 时继续使用当前受控静态数据，保证本地构建和测试可运行。
4. 建立只读论文多源候选检索与 Studio 草稿创建工具；学术报告保持人工富文本编辑，不接入 AI 草稿。
5. 使用 Sanity 原生 image/file 管理已确认公开的图片和附件，并实现格式、大小与版权确认校验。
6. 补充环境变量模板、安全说明、内容发布检查和自动化测试。

推送和部署阶段另行执行：创建/核对 Git 仓库，配置 Sanity 项目、webhook 和服务端令牌，选择 OSS 或 COS，配置 Vercel 环境变量、域名与持续部署。未经用户明确指示，本地准备阶段不得代为推送或发布。

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

引用数、h-index、论文数量等会变化的指标必须注明数据日期；除非实现可靠同步，否则首页优先使用较稳定的概括或跳转 Scholar，不把旧数字伪装成实时数据。

---

## 当前信息架构

| 路由 | 职责 |
|---|---|
| `/` | 跳转 `/en` |
| `/en`、`/zh` | 默认个人信息页：左侧粘性头像/身份/联系，右侧 Bio、研究、任职、荣誉、项目、教学与服务 |
| `/[lang]/profile` | 兼容旧链接，重定向至 `/[lang]` |
| `/[lang]/publications` | 可检索、按年份/类型筛选的论文与著作；来源、PDF、BibTeX、摘要操作 |
| `/[lang]/talks` | 可检索、按年份/类型筛选的报告列表；详情页展示富文本正文与公开附件 |
| `/[lang]/talks/[id]` | 学术报告详情；支持配图、分级标题、引用、链接、脚注、提示框与多附件 |
| `/[lang]/teaching` | 兼容旧链接，重定向至 `/[lang]#teaching` |
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
└── [lang]/
    ├── layout.tsx
    ├── page.tsx
    ├── profile/page.tsx
    ├── publications/page.tsx
    ├── talks/page.tsx
    ├── teaching/page.tsx
    ├── people/page.tsx
    └── ask/page.tsx
components/
├── SiteShell.tsx
├── PublicationExplorer.tsx
├── TalkExplorer.tsx
├── PeopleDirectory.tsx
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
    ├── cms-auth.ts               ← Sanity 官方 webhook 签名验证
    ├── deepseek.ts               ← 双语摘要/关键词草稿
    ├── pptx.ts                   ← PPTX 文本提取
    ├── rate-limit.ts             ← Upstash 持久化费用边界
    └── sanity-write.ts           ← 仅服务端草稿回写
studio/
├── sanity.config.ts
├── actions/automationActions.tsx
└── schemas/                      ← profile/publication/talk/person 及共享字段
```

---

## 设计原则

- 视觉气质：克制、编辑感、学术但不陈旧；以暖纸色、墨色、北大红和深绿构成，不复制参考网站风格。
- 默认页直接回答“导师是谁、研究什么、如何联系”，使用类似课题组成员详情的左固定、右滚动结构；不再设置营销式首页。
- 英文标题采用高对比 serif，正文用清晰 sans；中文使用系统中文字体回退，避免线上字体下载阻塞。
- 不依赖装饰性图片完成首屏。获得导师正式头像后，再替换目前的字母/照片位。
- 响应式支持桌面、平板和移动端；键盘焦点、可点击区域、颜色对比与减少动画偏好均需考虑。
- 禁止假链接、假下载、假 AI 回答和没有来源的指标。

---

## 数据维护约定

- 正式内容通过 `studio/` 中的 Sanity 后台维护；`lib/content.ts` 只作为未配置 Sanity 时的受控回退，不应在正式上线后形成第二套长期数据源。
- 新增论文：核对题名、作者顺序、年份、载体、DOI/公开链接与 PDF 授权；同时检查中英文展示、筛选类型、搜索字段、BibTeX 输出和下载状态。
- 新增报告：核对日期、类型、主办方、地点、题名、双语正文和公开附件；不需要封面图，也不使用 AI 生成正文。
- 成员：只维护公开姓名、照片、状态；状态变化需双方确认。
- 所有公开项目必须由人工白名单录入，不允许从简历整段自动导入。
- 内容更新完成后至少运行 `npm run lint`、`npm run build`，并检查 `/en`、`/zh` 与受影响子页面。

---

## 后续优先事项

1. 重新部署 Sanity Studio 与 Vercel，使论文录入工具、富文本报告 Schema、原生 Asset 字段和详情页上线；随后停用旧自动化 Webhook，只保留内容刷新 Webhook。
2. Sanity 项目 `mb3w1o0y`、`production` 数据集、公开读取、Studio 和首批内容均已完成；后续只在内容刷新接口权限变化时轮换 Secret。
3. 收集导师正式头像、成员授权头像、可公开论文 PDF 和报告 PDF/PPTX，逐项确认版权与文件命名后上传 Sanity Asset CDN。
4. 配置 DeepSeek 与 Upstash Redis REST；在服务商控制台设置费用告警/硬上限并验证限流失败时拒绝调用。
5. Vercel 已绑定 `ma-j/yizhoufan` 并配置 Sanity 项目 ID、服务端写令牌与 webhook secret；下一步配置轮换后的 DeepSeek 密钥、Upstash 环境变量，以及 `yizhoufan.com` DNS、HTTPS 与 CDN。
6. Sanity Studio 已部署至 `https://yizhoufan.sanity.studio/`。非破坏性 `npm audit fix` 后官方 CLI 依赖树仍有 7 个传递依赖告警（3 moderate、4 high），剩余自动修复会跨 Sanity 主版本；禁止执行 `npm audit fix --force`，等待官方兼容修复并在升级后重新构建部署。

---

## 本地开发

```bash
npm install
npm run dev
npm run lint
npm run build
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

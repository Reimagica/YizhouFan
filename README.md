# Yizhou Fan Personal Website

范逸洲老师的独立中英文个人学术网站。公开站点使用 Next.js，内容管理使用独立 Sanity Studio；普通访客主要访问静态生成页面，AI 问答与内容自动化由服务端接口处理。

项目约束、公开边界和迭代记录以 `AGENTS.md` 为唯一依据。

## Architecture

```text
Sanity Studio ── 内容、草稿、人工复核、自动化任务
       │
       ├── webhook ──> Next.js/Vercel API ──> 学术数据库 / DeepSeek
       │                                  └──> 结果回写 Sanity 草稿
       │
       └── published content ──> Next.js 静态/ISR页面

OSS/COS private ──> PPTX处理 ──> AI草稿
OSS/COS public  ──> 已确认公开的PDF/PPT下载
```

论文事实首先来自 Crossref、OpenAlex、Semantic Scholar 和 DBLP。DeepSeek仅用于摘要、改写、关键词与翻译，所有自动化结果都必须由导师人工确认，接口不会直接发布内容。

## Public routes

- `/en`、`/zh`：个人信息、研究、履历、荣誉、公开项目、教学与服务
- `/[lang]/publications`：检索、年份/类型筛选、来源、PDF、BibTeX和摘要
- `/[lang]/talks`：检索、年份/类型筛选、报告简介和公开课件
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

```bash
cd studio
npm install
cp .env.example .env.local
npm run dev
```

当前内容模型包括：

- `profile`：个人信息、研究、履历、荣誉、公开项目白名单、教学与服务
- `publication`：书目信息、摘要、BibTeX、公开PDF、检索候选与审核状态
- `talk`：报告信息、私有PPT对象键、AI草稿、公开文件与审核状态
- `person`：个人站三类静态成员概览

后台文档操作包含“检索并补全论文信息”“查看并应用检索候选”和“解析PPT并生成双语简介”。按钮只把任务标记为待处理，由签名webhook触发服务端任务。

## Sanity webhooks

创建两个带Secret的GROQ Webhook，Secret与服务端`SANITY_WEBHOOK_SECRET`一致。服务端使用Sanity官方签名校验，不能改为浏览器可见令牌。

### Automation webhook

- URL：`https://yizhoufan.com/api/cms/automation`
- Trigger on：Create、Update
- Include drafts：开启
- Filter：

```groq
(_type == "publication" || _type == "talk") && automation.status == "requested"
```

- Projection：

```groq
{
  "operation": select(
    _type == "publication" => "publication.lookup",
    _type == "talk" => "talk.summarize"
  ),
  "documentId": _id,
  "requestId": automation.requestId,
  "title": title.en,
  doi,
  "source": {
    "objectKey": privateSource.objectKey,
    "fileName": privateSource.originalName,
    "mimeType": privateSource.mimeType
  }
}
```

论文流程已完成多源检索和Sanity草稿回写。PPTX解析和DeepSeek结构化摘要已完成；在选择阿里云OSS或腾讯云COS后，只需在私有存储适配层补上“对象键换取短时签名下载URL”，不改变Studio或内容模型。

### Content revalidation webhook

- URL：`https://yizhoufan.com/api/cms/revalidate`
- Trigger on：Create、Update、Delete
- Filter：

```groq
_type in ["profile", "publication", "talk", "person"]
```

该接口使Vercel上的静态/ISR页面在内容发布后失效并读取新内容。

## Environment boundaries

可以公开：Sanity project ID、dataset、站点地址。

只能存在服务端：Sanity写入令牌、webhook secret、DeepSeek密钥、OSS/COS密钥。原始PPT、未公开论文、原始CV和内部资料不能进入Sanity公共资产库或公开Git仓库。

公开 AI 问答使用 Upstash Redis REST 实现跨 Vercel 实例的分层原子限流：匿名浏览器标识每日 8 次、匿名网络每日 32 次、全站每日 120 次，并增加浏览器与网络的分钟级突发保护。浏览器标识保存在 HttpOnly、SameSite=Lax 的第一方 Cookie 中；网络地址经 `RATE_LIMIT_SALT` 做 HMAC 后才参与计数，不把原始 IP 写入 Redis。开发环境未配置时使用内存计数；生产环境缺少 Redis、盐值或限流服务异常时拒绝模型请求。部署前必须配置 `UPSTASH_REDIS_REST_URL`、`UPSTASH_REDIS_REST_TOKEN` 和 `RATE_LIMIT_SALT`。

模型只返回结构化短条目，服务端会再次限制条目数量和长度、清除 Markdown 标记及固定套话，并根据回答主题附上个人信息、学术成果、学术报告或团队成员页面。若回答点名论文，模型只能返回站内成果 ID，服务端再从已发布成果数据读取 `sourceUrl` 或 DOI，禁止直接采用模型生成的链接。问答不保存对话历史，也不会把前一轮内容重新发送给模型。

## Validation

```bash
npm run lint
npm run build
npm test
npm run studio:build
```

本阶段不包含GitHub推送、Sanity项目创建、Vercel发布、域名切换或OSS/COS账号配置。

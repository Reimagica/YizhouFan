import {useState} from "react";
import {Badge, Box, Button, Card, Container, Flex, Grid, Heading, Select, Stack, Text, TextArea, TextInput} from "@sanity/ui";
import {useClient} from "sanity";
import {useRouter} from "sanity/router";

type Candidate = {
  source: string;
  sourceId: string;
  confidence: number;
  title: string;
  authors: string[];
  year?: number;
  venue?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  kind?: string;
  matchedFields?: string[];
  warnings?: string[];
};

type ManualForm = {
  titleEn: string;
  titleZh: string;
  authors: string;
  year: string;
  venue: string;
  kind: string;
  doi: string;
  sourceUrl: string;
  abstractEn: string;
  abstractZh: string;
  keywords: string;
};

const emptyManual: ManualForm = {titleEn: "", titleZh: "", authors: "", year: "", venue: "", kind: "Journal article", doi: "", sourceUrl: "", abstractEn: "", abstractZh: "", keywords: ""};
const apiOrigin = (process.env.SANITY_STUDIO_API_ORIGIN ?? "https://yizhoufan.vercel.app").replace(/\/$/, "");

function normalize(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function containsHan(value: string) {
  return /\p{Script=Han}/u.test(value);
}

export function PublicationCreateTool() {
  const client = useClient({apiVersion: "2026-08-01"});
  const router = useRouter();
  const [mode, setMode] = useState<"lookup" | "manual">("lookup");
  const [title, setTitle] = useState("");
  const [doi, setDoi] = useState("");
  const [authors, setAuthors] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [manual, setManual] = useState<ManualForm>(emptyManual);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function findDuplicate(nextTitle: string, nextDoi?: string) {
    const rows = await client.fetch<Array<{_id: string; title?: {en?: string; zh?: string}; doi?: string}>>(`*[_type == "publication"]{_id,title,doi}`);
    const normalizedTitle = normalize(nextTitle);
    const normalizedDoi = normalize((nextDoi ?? "").replace(/^https?:\/\/(dx\.)?doi\.org\//i, ""));
    return rows.find((row) => (normalizedDoi && normalize(row.doi ?? "") === normalizedDoi) || [row.title?.en, row.title?.zh].some((value) => value && normalize(value) === normalizedTitle));
  }

  async function createDraft(values: ManualForm) {
    const selectedTitle = values.titleEn.trim() || values.titleZh.trim();
    if (!selectedTitle || !values.authors.trim()) {
      setMessage("请至少填写一种语言的题名和作者。");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const duplicate = await findDuplicate(selectedTitle, values.doi);
      if (duplicate) {
        setMessage("检测到相同 DOI 或题名的已有成果，请先在内容列表中核对，未新建草稿。");
        return;
      }
      const baseId = `publication-${crypto.randomUUID()}`;
      await client.create({
        _id: `drafts.${baseId}`,
        _type: "publication",
        title: {en: values.titleEn.trim() || undefined, zh: values.titleZh.trim() || undefined},
        authors: values.authors.trim(),
        year: values.year ? Number(values.year) : undefined,
        venue: values.venue.trim() || undefined,
        kind: values.kind,
        doi: values.doi.trim() || undefined,
        sourceUrl: values.sourceUrl.trim() || undefined,
        abstract: {en: values.abstractEn.trim() || undefined, zh: values.abstractZh.trim() || undefined},
        keywords: values.keywords.split(/[，,;；]/).map((item) => item.trim()).filter(Boolean),
        featured: false,
        status: "draft",
      });
      router.navigateIntent("edit", {id: baseId, type: "publication"});
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建草稿失败，请稍后重试。");
    } finally {
      setBusy(false);
    }
  }

  async function search() {
    if (!title.trim() && !doi.trim()) {
      setMessage("请输入题名或 DOI，二者也可以组合检索。");
      return;
    }
    setBusy(true);
    setMessage("");
    setCandidates([]);
    try {
      const params = new URLSearchParams();
      if (title.trim()) params.set("title", title.trim());
      if (doi.trim()) params.set("doi", doi.trim());
      authors.split(/[，,;；]/).map((item) => item.trim()).filter(Boolean).slice(0, 3).forEach((author) => params.append("author", author));
      const response = await fetch(`${apiOrigin}/api/cms/publications/lookup?${params.toString()}`);
      const payload = await response.json() as {candidates?: Candidate[]; error?: string};
      if (!response.ok) throw new Error(payload.error ?? "检索失败");
      setCandidates(payload.candidates ?? []);
      if (!payload.candidates?.length) setMessage("未找到可靠匹配。可调整检索条件，或切换到手动录入。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "检索暂时不可用。");
    } finally {
      setBusy(false);
    }
  }

  function createFromCandidate(candidate: Candidate) {
    const localizedTitle = containsHan(candidate.title) ? {titleZh: candidate.title, titleEn: ""} : {titleEn: candidate.title, titleZh: ""};
    void createDraft({
      ...emptyManual,
      ...localizedTitle,
      authors: candidate.authors.join(", "),
      year: candidate.year?.toString() ?? "",
      venue: candidate.venue ?? "",
      kind: candidate.kind ?? "Journal article",
      doi: candidate.doi ?? "",
      sourceUrl: candidate.url ?? (candidate.doi ? `https://doi.org/${candidate.doi}` : ""),
      abstractEn: candidate.abstract ?? "",
    });
  }

  function carryToManual() {
    setManual({...emptyManual, titleEn: containsHan(title) ? "" : title, titleZh: containsHan(title) ? title : "", doi, authors});
    setMode("manual");
    setMessage("");
  }

  return <Box padding={[3, 4, 5]}><Container width={2}><Stack space={5}>
    <Stack space={2}><Heading size={2}>添加学术成果</Heading><Text muted>先检索并核对候选；数据库无匹配时再手动录入。生成的内容始终是草稿，发布前仍需人工检查。</Text></Stack>
    <Flex gap={2}><Button mode={mode === "lookup" ? "default" : "ghost"} tone="primary" text="检索并导入" onClick={() => setMode("lookup")} /><Button mode={mode === "manual" ? "default" : "ghost"} text="手动录入" onClick={() => setMode("manual")} /></Flex>
    {mode === "lookup" ? <Stack space={4}>
      <Card border padding={4} radius={2}><Stack space={4}>
        <label><Stack space={2}><Text weight="semibold">文章题名</Text><TextInput value={title} onChange={(event) => setTitle(event.currentTarget.value)} placeholder="可填写完整或较完整题名" /></Stack></label>
        <Grid columns={[1, 1, 2]} gap={3}>
          <label><Stack space={2}><Text weight="semibold">DOI</Text><TextInput value={doi} onChange={(event) => setDoi(event.currentTarget.value)} placeholder="例如 10.1145/…" /></Stack></label>
          <label><Stack space={2}><Text weight="semibold">作者（可选，最多 3 位）</Text><TextInput value={authors} onChange={(event) => setAuthors(event.currentTarget.value)} placeholder="用逗号分隔" /></Stack></label>
        </Grid>
        <Flex gap={2} wrap="wrap"><Button tone="primary" text={busy ? "检索中…" : "检索多个来源"} disabled={busy} onClick={search} /><Button mode="ghost" text="未找到？转手动录入" onClick={carryToManual} /></Flex>
      </Stack></Card>
      {candidates.map((candidate) => <Card border padding={4} radius={2} key={`${candidate.source}-${candidate.sourceId}`}><Stack space={3}>
        <Flex align="center" gap={2} wrap="wrap"><Badge tone={candidate.confidence >= .8 ? "positive" : "caution"}>{Math.round(candidate.confidence * 100)}% 匹配</Badge><Badge mode="outline">{candidate.source}</Badge>{candidate.matchedFields?.map((field, index) => <Badge mode="outline" key={`${field}-${index}`}>匹配 {field}</Badge>)}</Flex>
        <Heading size={1}>{candidate.title}</Heading>
        <Text>{candidate.authors.join(", ")}</Text>
        <Text muted>{[candidate.year, candidate.venue, candidate.doi].filter(Boolean).join(" · ")}</Text>
        {candidate.warnings?.map((warning) => <Text size={1} muted key={warning}>{warning}</Text>)}
        <Box><Button tone="primary" mode="ghost" text="以此候选创建草稿" disabled={busy} onClick={() => createFromCandidate(candidate)} /></Box>
      </Stack></Card>)}
    </Stack> : <Card border padding={4} radius={2}><Stack space={4}>
      <Grid columns={[1, 1, 2]} gap={3}>
        <label><Stack space={2}><Text weight="semibold">English title</Text><TextInput value={manual.titleEn} onChange={(event) => setManual({...manual, titleEn: event.currentTarget.value})} /></Stack></label>
        <label><Stack space={2}><Text weight="semibold">中文题名</Text><TextInput value={manual.titleZh} onChange={(event) => setManual({...manual, titleZh: event.currentTarget.value})} /></Stack></label>
      </Grid>
      <label><Stack space={2}><Text weight="semibold">作者（必填，按发表顺序）</Text><TextInput value={manual.authors} onChange={(event) => setManual({...manual, authors: event.currentTarget.value})} /></Stack></label>
      <Grid columns={[1, 1, 3]} gap={3}>
        <label><Stack space={2}><Text weight="semibold">年份</Text><TextInput type="number" value={manual.year} onChange={(event) => setManual({...manual, year: event.currentTarget.value})} /></Stack></label>
        <label><Stack space={2}><Text weight="semibold">期刊 / 会议 / 出版社</Text><TextInput value={manual.venue} onChange={(event) => setManual({...manual, venue: event.currentTarget.value})} /></Stack></label>
        <label><Stack space={2}><Text weight="semibold">成果类型</Text><Select value={manual.kind} onChange={(event) => setManual({...manual, kind: event.currentTarget.value})}>{["Journal article", "Conference paper", "Book", "Book chapter", "Preprint", "Thesis"].map((kind) => <option key={kind}>{kind}</option>)}</Select></Stack></label>
      </Grid>
      <Grid columns={[1, 1, 2]} gap={3}>
        <label><Stack space={2}><Text weight="semibold">DOI</Text><TextInput value={manual.doi} onChange={(event) => setManual({...manual, doi: event.currentTarget.value})} /></Stack></label>
        <label><Stack space={2}><Text weight="semibold">原文页面</Text><TextInput type="url" value={manual.sourceUrl} onChange={(event) => setManual({...manual, sourceUrl: event.currentTarget.value})} /></Stack></label>
      </Grid>
      <Grid columns={[1, 1, 2]} gap={3}>
        <label><Stack space={2}><Text weight="semibold">English abstract</Text><TextArea rows={5} value={manual.abstractEn} onChange={(event) => setManual({...manual, abstractEn: event.currentTarget.value})} /></Stack></label>
        <label><Stack space={2}><Text weight="semibold">中文摘要</Text><TextArea rows={5} value={manual.abstractZh} onChange={(event) => setManual({...manual, abstractZh: event.currentTarget.value})} /></Stack></label>
      </Grid>
      <label><Stack space={2}><Text weight="semibold">关键词</Text><TextInput value={manual.keywords} onChange={(event) => setManual({...manual, keywords: event.currentTarget.value})} placeholder="用逗号分隔" /></Stack></label>
      <Box><Button tone="primary" text={busy ? "创建中…" : "创建草稿"} disabled={busy} onClick={() => createDraft(manual)} /></Box>
    </Stack></Card>}
    {message && <Card padding={3} radius={2} tone="caution"><Text>{message}</Text></Card>}
  </Stack></Container></Box>;
}

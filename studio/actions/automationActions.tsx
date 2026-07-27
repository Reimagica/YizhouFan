import {useState} from "react";
import {Box, Button, Card, Dialog, Flex, Stack, Text} from "@sanity/ui";
import {type DocumentActionComponent, useClient, useFormValue} from "sanity";

type Candidate = {
  _key?: string;
  source?: string;
  confidence?: number;
  title?: string;
  authors?: string[];
  year?: number;
  venue?: string;
  doi?: string;
  url?: string;
  abstract?: string;
};

function draftId(id: string) {
  return id.startsWith("drafts.") ? id : `drafts.${id}`;
}

export const RequestAutomationAction: DocumentActionComponent = (props) => {
  const client = useClient({apiVersion: "2026-07-27"});
  const [busy, setBusy] = useState(false);
  const title = useFormValue(["title", "en"]);
  const privateObjectKey = useFormValue(["privateSource", "objectKey"]);
  const isPublication = props.type === "publication";
  const disabled = busy || typeof title !== "string" || title.trim().length < 3 || (!isPublication && !privateObjectKey);

  return {
    label: isPublication ? "检索并补全论文信息" : "解析PPT并生成双语简介",
    tone: "primary",
    disabled,
    onHandle: async () => {
      setBusy(true);
      try {
        await client.patch(draftId(props.id)).set({
          automation: {
            status: "requested",
            requestId: crypto.randomUUID(),
            requestedAt: new Date().toISOString(),
          },
        }).commit();
        props.onComplete();
      } finally {
        setBusy(false);
      }
    },
  };
};

export const ApplyPublicationCandidateAction: DocumentActionComponent = (props) => {
  const client = useClient({apiVersion: "2026-07-27"});
  const candidates = (useFormValue(["automation", "candidates"]) ?? []) as Candidate[];
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const apply = async (candidate: Candidate) => {
    setBusy(true);
    try {
      const values: Record<string, unknown> = {
        "title.en": candidate.title,
        authors: candidate.authors?.join(", "),
        year: candidate.year,
        venue: candidate.venue,
        doi: candidate.doi,
        sourceUrl: candidate.url ?? (candidate.doi ? `https://doi.org/${candidate.doi}` : undefined),
        "automation.status": "candidate-applied",
        "automation.completedAt": new Date().toISOString(),
      };
      for (const [key, value] of Object.entries(values)) if (value === undefined || value === "") delete values[key];
      await client.patch(draftId(props.id)).set(values).commit();
      setOpen(false);
      props.onComplete();
    } finally {
      setBusy(false);
    }
  };

  return {
    label: "查看并应用检索候选",
    disabled: candidates.length === 0,
    onHandle: () => setOpen(true),
    dialog: open ? {
      type: "custom",
      component: (
        <Dialog id="publication-candidates" header="请选择核对无误的论文记录" width={2} onClose={() => setOpen(false)}>
          <Stack padding={4} space={3}>
            {candidates.map((candidate, index) => (
              <Card key={candidate._key ?? `${candidate.source}-${index}`} border padding={4} radius={2}>
                <Stack space={3}>
                  <Text weight="semibold">{candidate.title}</Text>
                  <Text size={1} muted>{candidate.authors?.join(", ")}</Text>
                  <Flex gap={3} wrap="wrap"><Text size={1}>{candidate.year}</Text><Text size={1}>{candidate.venue}</Text><Text size={1}>{candidate.source} · {Math.round((candidate.confidence ?? 0) * 100)}%</Text></Flex>
                  <Box><Button text={busy ? "处理中…" : "应用此候选到草稿"} tone="primary" disabled={busy} onClick={() => apply(candidate)} /></Box>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Dialog>
      ),
    } : undefined,
  };
};

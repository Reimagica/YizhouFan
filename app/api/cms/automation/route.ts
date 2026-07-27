import { NextResponse } from "next/server";
import { isAuthorizedCmsRequest } from "../../../../lib/server/cms-auth";
import { lookupAcademicWork } from "../../../../lib/server/academic-search";
import { summarizeTalkSlides } from "../../../../lib/server/deepseek";
import { extractPptxText } from "../../../../lib/server/pptx";
import { patchSanityDraft } from "../../../../lib/server/sanity-write";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PPTX_BYTES = 25 * 1024 * 1024;

type AutomationBody = {
  operation?: unknown;
  documentId?: unknown;
  requestId?: unknown;
  title?: unknown;
  doi?: unknown;
  source?: { objectKey?: unknown; downloadUrl?: unknown; fileName?: unknown; mimeType?: unknown };
};

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function allowedPrivateFileUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:") throw new Error("Private file URL must use HTTPS");
  const allowedHosts = (process.env.CMS_ALLOWED_PRIVATE_FILE_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  if (!allowedHosts.includes(url.hostname.toLowerCase())) throw new Error("Private file host is not allowed");
  return url;
}

async function downloadPptx(rawUrl: string) {
  const url = allowedPrivateFileUrl(rawUrl);
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`Private file download failed with ${response.status}`);
  const declaredSize = Number(response.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_PPTX_BYTES) throw new Error("PPTX exceeds the 25 MB processing limit");
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > MAX_PPTX_BYTES) throw new Error("PPTX exceeds the 25 MB processing limit");
  return bytes;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!(await isAuthorizedCmsRequest(request, rawBody))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: AutomationBody;
  try {
    body = JSON.parse(rawBody) as AutomationBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const operation = text(body.operation, 80);
  const documentId = text(body.documentId, 200);
  const requestId = text(body.requestId, 100);
  const title = text(body.title, 600);
  if (!documentId || !requestId || !title) {
    return NextResponse.json({ error: "documentId, requestId, and title are required" }, { status: 400 });
  }

  try {
    if (operation === "publication.lookup") {
      const candidates = (await lookupAcademicWork(title, text(body.doi, 200) || undefined)).map((candidate, index) => ({
        _key: `candidate-${index + 1}`,
        ...candidate,
      }));
      await patchSanityDraft(documentId, {
        automation: {
          status: "candidates-ready",
          requestId,
          completedAt: new Date().toISOString(),
          candidates,
          error: null,
        },
      });
      return NextResponse.json({ ok: true, candidateCount: candidates.length });
    }

    if (operation === "talk.summarize") {
      const downloadUrl = text(body.source?.downloadUrl, 3000);
      const objectKey = text(body.source?.objectKey, 1000);
      const fileName = text(body.source?.fileName, 300);
      if (!fileName.toLowerCase().endsWith(".pptx")) {
        return NextResponse.json({ error: "A PPTX source is required" }, { status: 400 });
      }
      if (!downloadUrl) {
        return NextResponse.json({
          error: objectKey
            ? "Private storage adapter is not configured for this object key"
            : "A private object key is required",
        }, { status: 501 });
      }
      const bytes = await downloadPptx(downloadUrl);
      const slideText = await extractPptxText(bytes);
      const draft = await summarizeTalkSlides(title, slideText);
      await patchSanityDraft(documentId, {
        automation: {
          status: "draft-ready",
          requestId,
          completedAt: new Date().toISOString(),
          sourceCharacterCount: slideText.length,
          error: null,
        },
        aiDraft: draft,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unsupported operation" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Automation failed";
    try {
      await patchSanityDraft(documentId, {
        automation: { status: "failed", requestId, completedAt: new Date().toISOString(), error: message.slice(0, 500) },
      });
    } catch {
      // Preserve the original processing error when Sanity is also unavailable.
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

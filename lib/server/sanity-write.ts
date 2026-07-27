const DOCUMENT_ID = /^(drafts\.)?[A-Za-z0-9_.-]+$/;

function config() {
  const projectId = process.env.SANITY_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) throw new Error("Sanity write access is not configured");
  return { projectId, dataset, token };
}

export function asDraftId(documentId: string) {
  if (!DOCUMENT_ID.test(documentId)) throw new Error("Invalid Sanity document ID");
  return documentId.startsWith("drafts.") ? documentId : `drafts.${documentId}`;
}

export async function patchSanityDraft(documentId: string, values: Record<string, unknown>) {
  const { projectId, dataset, token } = config();
  const id = asDraftId(documentId);
  const response = await fetch(
    `https://${projectId}.api.sanity.io/v2026-07-27/data/mutate/${dataset}?returnIds=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mutations: [{ patch: { id, set: values } }] }),
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (!response.ok) throw new Error(`Sanity mutation failed with ${response.status}`);
}

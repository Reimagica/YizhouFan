const apiVersion = process.env.SANITY_API_VERSION ?? "2026-07-27";

function getConfig() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? process.env.SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? process.env.SANITY_DATASET ?? "production";
  if (!projectId) return null;
  return { projectId, dataset };
}

export function isSanityConfigured() {
  return getConfig() !== null;
}

export async function sanityQuery<T>(query: string, params: Record<string, unknown> = {}): Promise<T | undefined> {
  const config = getConfig();
  if (!config) return undefined;

  const url = new URL(`https://${config.projectId}.api.sanity.io/v${apiVersion}/data/query/${config.dataset}`);
  url.searchParams.set("query", query);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(`$${key}`, JSON.stringify(value));
  }

  const headers: HeadersInit = {};
  if (process.env.SANITY_API_READ_TOKEN) {
    headers.Authorization = `Bearer ${process.env.SANITY_API_READ_TOKEN}`;
  }

  try {
    const response = await fetch(url, {
      headers,
      next: { revalidate: 300, tags: ["sanity-content"] },
    });
    if (!response.ok) {
      console.error("Sanity query failed", response.status);
      return undefined;
    }
    const payload = (await response.json()) as { result?: T };
    return payload.result;
  } catch (error) {
    console.error("Sanity query failed", error instanceof Error ? error.message : "unknown error");
    return undefined;
  }
}

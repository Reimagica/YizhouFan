import {NextRequest, NextResponse} from "next/server";
import {lookupAcademicWork} from "../../../../../lib/server/academic-search";

const DEFAULT_STUDIO_ORIGIN = "https://yizhoufan.sanity.studio";

function allowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const configured = process.env.SANITY_STUDIO_ORIGIN ?? DEFAULT_STUDIO_ORIGIN;
  if (!origin || (origin !== configured && !/^https?:\/\/localhost:\d+$/.test(origin))) return null;
  return origin;
}

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export async function OPTIONS(request: NextRequest) {
  const origin = allowedOrigin(request);
  if (!origin) return new NextResponse(null, {status: 403});
  return new NextResponse(null, {status: 204, headers: corsHeaders(origin)});
}

export async function GET(request: NextRequest) {
  const origin = allowedOrigin(request);
  if (!origin) return NextResponse.json({error: "Forbidden origin"}, {status: 403});
  const title = (request.nextUrl.searchParams.get("title") ?? "").trim().slice(0, 500);
  const doi = (request.nextUrl.searchParams.get("doi") ?? "").trim().slice(0, 200) || undefined;
  const authors = request.nextUrl.searchParams.getAll("author").map((item) => item.trim().slice(0, 120)).filter(Boolean).slice(0, 3);
  if (!title && !doi) return NextResponse.json({error: "Title or DOI is required"}, {status: 400, headers: corsHeaders(origin)});
  try {
    const candidates = await lookupAcademicWork(title || doi || "", doi, authors);
    return NextResponse.json({candidates}, {headers: {...corsHeaders(origin), "Cache-Control": "private, max-age=60"}});
  } catch {
    return NextResponse.json({error: "Academic lookup is temporarily unavailable"}, {status: 502, headers: corsHeaders(origin)});
  }
}

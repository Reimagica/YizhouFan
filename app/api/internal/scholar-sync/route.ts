import {revalidateTag} from "next/cache";
import {NextResponse} from "next/server";
import {syncScholarMetrics} from "@/lib/server/scholar-sync";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({error: "Scholar sync is not configured"}, {status: 503});
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }
  try {
    const result = await syncScholarMetrics();
    if (result.status === "review_required") {
      console.warn("Scholar sync held for review", {
        reason: result.reason,
        citations: result.metrics.citations,
        hIndex: result.metrics.hIndex,
        i10Index: result.metrics.i10Index,
        asOf: result.metrics.asOf,
      });
      return NextResponse.json({status: result.status, reason: result.reason}, {status: 409});
    }
    revalidateTag("sanity-content", "max");
    return NextResponse.json({status: result.status, asOf: result.metrics.asOf});
  } catch (error) {
    console.error("Scholar sync failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({error: "Scholar sync failed"}, {status: 502});
  }
}

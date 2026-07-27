import {revalidateTag} from "next/cache";
import {NextResponse} from "next/server";
import {isAuthorizedCmsRequest} from "../../../../lib/server/cms-auth";

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!(await isAuthorizedCmsRequest(request, rawBody))) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }
  revalidateTag("sanity-content", "max");
  return NextResponse.json({ok: true});
}

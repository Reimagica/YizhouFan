import {NextResponse} from "next/server";
import {isAuthorizedCmsRequest} from "../../../../lib/server/cms-auth";

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!(await isAuthorizedCmsRequest(request, rawBody))) return NextResponse.json({error: "Unauthorized"}, {status: 401});
  return NextResponse.json({error: "Legacy CMS automation is disabled. Use the Studio publication import tool."}, {status: 410});
}

import {isValidSignature, SIGNATURE_HEADER_NAME} from "@sanity/webhook";

export async function isAuthorizedCmsRequest(request: Request, rawBody: string) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) return false;
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  if (!signature) return false;
  return isValidSignature(rawBody, signature, secret);
}

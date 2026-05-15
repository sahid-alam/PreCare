import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verify a Vapi webhook signature.
 * Header: x-vapi-signature
 * Algorithm: HMAC-SHA256 hex digest of the raw request body.
 * Returns true when secret is blank (dashboard not configured).
 */
export function verifyVapiSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!secret) return true;
  if (!signatureHeader) return false;

  try {
    const expected = createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("hex");

    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signatureHeader, "utf8");

    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

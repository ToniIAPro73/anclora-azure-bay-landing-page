export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createAltchaChallenge } from "@/lib/altcha";

const ALTCHA_SECRET = process.env.ALTCHA_SECRET;
const ALTCHA_CHALLENGE_TTL = Number(
  process.env.ALTCHA_CHALLENGE_TTL ?? 5 * 60,
);
const ALTCHA_MAX_NUMBER = Number(process.env.ALTCHA_MAX_NUMBER ?? 200_000);
const IS_PROD = process.env.NODE_ENV === "production";

if (!ALTCHA_SECRET) {
  console.warn(
    "[ALTCHA] ALTCHA_SECRET is not configured. Challenge endpoint will fail in production; using fallback in non-production.",
  );
}

export async function GET() {
  if (!ALTCHA_SECRET && IS_PROD) {
    return NextResponse.json(
      { error: "ALTCHA secret not configured" },
      { status: 500 },
    );
  }

  const hmacKey = ALTCHA_SECRET ?? "dev-altcha-secret";

  try {
    const challenge = createAltchaChallenge(hmacKey, {
      ttlSeconds: ALTCHA_CHALLENGE_TTL,
      maxNumber: ALTCHA_MAX_NUMBER,
    });

    // In non-production, expose a flag so clients can detect fallback behavior
    const payload = {
      ...challenge,
      isDevFallback: !ALTCHA_SECRET,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[ALTCHA] Failed to create challenge:", error);
    return NextResponse.json(
      { error: "Failed to create ALTCHA challenge" },
      { status: 500 },
    );
  }
}

/**
 * Edge + Node.js 양쪽에서 동작하는 HMAC 세션 토큰 유틸
 * Firebase Admin SDK 없이 proxy.ts(Edge)에서 검증 가능
 */

export const SESSION_COOKIE = "__session";
const EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000; // 5일

export interface SessionPayload {
  email: string;
  isAdmin: boolean;
  exp: number;
}

function getSecret(): string {
  return process.env.SESSION_SECRET ?? "dev-secret-fallback-key-change-in-prod";
}

async function getKey(usage: "sign" | "verify"): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage]
  );
}

// base64url (URL-safe, padding 없음)
function toB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function fromB64(str: string): Uint8Array<ArrayBuffer> {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return new Uint8Array(
    Array.from(atob(padded + pad), (c) => c.charCodeAt(0))
  );
}

/** 로그인 시 세션 토큰 생성 */
export async function createSessionToken(
  email: string,
  isAdmin: boolean
): Promise<string> {
  const payload: SessionPayload = {
    email,
    isAdmin,
    exp: Date.now() + EXPIRES_IN_MS,
  };
  const data = toB64(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await getKey("sign");
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return `${data}.${toB64(sig)}`;
}

/** proxy.ts에서 쿠키 검증 — Edge 환경 호환 */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const data = token.slice(0, dot);
  const sigStr = token.slice(dot + 1);

  try {
    const key = await getKey("verify");
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromB64(sigStr),
      new TextEncoder().encode(data)
    );
    if (!valid) return null;

    const payload: SessionPayload = JSON.parse(
      new TextDecoder().decode(fromB64(data))
    );
    if (payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

/** Set-Cookie 헤더 값 생성 */
export function buildSetCookieHeader(token: string): string {
  const isProduction = process.env.NODE_ENV === "production";
  return [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(EXPIRES_IN_MS / 1000)}`,
    ...(isProduction ? ["Secure"] : []),
  ].join("; ");
}

export function buildClearCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

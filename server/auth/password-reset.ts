import crypto from "node:crypto";
import { Temporal } from "@js-temporal/polyfill";
import bcrypt from "bcryptjs";
import { db } from "../db.js";

const RESET_TOKEN_LIFETIME_SECONDS = 30 * 60;
const DEVELOPMENT_SECRET = "recalldose-local-password-reset-only-change-before-deploy";

type ResetPayload = {
  sub: string;
  exp: number;
  nonce: string;
};

function resetSecret(): string {
  const configured = process.env.PASSWORD_RESET_SECRET?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV !== "production") return DEVELOPMENT_SECRET;
  throw new Error("Password recovery is not configured.");
}

function publicAppUrl(): URL {
  const configured = process.env.PUBLIC_APP_URL?.trim();
  const value = configured || (process.env.NODE_ENV === "production" ? "" : "http://localhost:5173");
  if (!value) throw new Error("Password recovery is not configured.");

  const url = new URL(value);
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("PUBLIC_APP_URL must be a trusted origin without credentials, query, or fragment.");
  }
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("PUBLIC_APP_URL must use HTTPS in production.");
  }
  return url;
}

export function isPasswordRecoveryConfigured(): boolean {
  try {
    resetSecret();
    publicAppUrl();
    if (process.env.NODE_ENV === "production") {
      return Boolean(
        process.env.RESEND_API_KEY?.trim() &&
        process.env.RESEND_FROM_EMAIL?.trim()
      );
    }
    return true;
  } catch {
    return false;
  }
}

function signatureFor(payload: string, userId: string, passwordHash: string): string {
  return crypto
    .createHmac("sha256", resetSecret())
    .update(userId)
    .update(":")
    .update(passwordHash)
    .update(":")
    .update(payload)
    .digest("base64url");
}

function createToken(userId: string, passwordHash: string): string {
  const payload: ResetPayload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + RESET_TOKEN_LIFETIME_SECONDS,
    nonce: crypto.randomBytes(32).toString("base64url"),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return encoded + "." + signatureFor(encoded, userId, passwordHash);
}

function verifyToken(token: string, userId: string, passwordHash: string): boolean {
  if (token.length > 2048) return false;
  const [encoded, suppliedSignature, extra] = token.split(".");
  if (!encoded || !suppliedSignature || extra !== undefined) return false;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as ResetPayload;
    if (
      payload.sub !== userId ||
      !Number.isInteger(payload.exp) ||
      payload.exp <= Math.floor(Date.now() / 1000) ||
      typeof payload.nonce !== "string" ||
      payload.nonce.length < 32
    ) {
      return false;
    }

    const expected = signatureFor(encoded, userId, passwordHash);
    const suppliedBuffer = Buffer.from(suppliedSignature);
    const expectedBuffer = Buffer.from(expected);
    return suppliedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(suppliedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

async function sendResetEmail(email: string, resetUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    throw new Error("Email provider is not configured.");
  }

  const safeUrl = escapeHtml(resetUrl);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
      "User-Agent": "RecallDose/1.0",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Reset your Recalldose password",
      html: [
        "<div style=\"font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#18233b\">",
        "<h1 style=\"color:#898AC4\">Reset your password</h1>",
        "<p>We received a request to reset your Recalldose password.</p>",
        "<p><a href=\"" + safeUrl + "\" style=\"display:inline-block;padding:12px 20px;background:#898AC4;color:#fff;border-radius:8px;text-decoration:none\">Choose a new password</a></p>",
        "<p>This link expires in 30 minutes and can only be used once.</p>",
        "<p>If you did not request this, you can safely ignore this email.</p>",
        "</div>",
      ].join(""),
      text: "Reset your Recalldose password using this link (expires in 30 minutes): " + resetUrl +
        "\n\nIf you did not request this, ignore this email.",
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    console.error("Password reset email provider returned status", response.status);
    throw new Error("Could not deliver the password reset email.");
  }
}

export async function requestPasswordReset(emailInput: string): Promise<string | null> {
  const email = emailInput.trim().toLowerCase();
  const user = await db.orm.public.User.where({ email, isActive: true }).first();
  if (!user) return null;

  const token = createToken(user.id, user.passwordHash);
  const link = new URL("/reset-password", publicAppUrl());
  link.searchParams.set("token", token);
  const resetUrl = link.toString();

  if (process.env.NODE_ENV !== "production" &&
      (!process.env.RESEND_API_KEY?.trim() || !process.env.RESEND_FROM_EMAIL?.trim())) {
    return resetUrl;
  }

  try {
    await sendResetEmail(email, resetUrl);
  } catch (error) {
    // Do not log the recipient, token, or reset URL.
    console.error("Password reset email delivery failed:", error instanceof Error ? error.message : "Unknown provider error");
    if (process.env.NODE_ENV !== "production") return resetUrl;
  }
  return null;
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  if (newPassword.length < 8 || Buffer.byteLength(newPassword, "utf8") > 72) {
    throw new Error("Password must be between 8 and 72 UTF-8 bytes.");
  }

  const [encoded] = token.split(".");
  if (!encoded || token.length > 2048) return false;

  let payload: ResetPayload;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as ResetPayload;
  } catch {
    return false;
  }

  if (typeof payload.sub !== "string" || !payload.sub) return false;
  const user = await db.orm.public.User.where({ id: payload.sub, isActive: true }).first();
  if (!user || !verifyToken(token, user.id, user.passwordHash)) return false;

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const updated = await db.orm.public.User.where({ id: user.id }).update({ passwordHash });
  if (!updated) return false;

  // Changing the password hash also invalidates this stateless reset token.
  // Revoke every previous session so a password change signs the account out everywhere.
  await db.orm.public.Session.where({ userId: user.id, revokedAt: null }).update({
    revokedAt: Temporal.Now.instant(),
  });
  return true;
}

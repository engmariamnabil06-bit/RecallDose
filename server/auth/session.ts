import { Temporal } from "@js-temporal/polyfill";
import crypto from "crypto";
import { db } from "../db";

const SESSION_DURATION_DAYS = 7;

function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashSessionToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function createSession(userId: string) {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);

const expiresAt = Temporal.Now.instant().add({
  hours: SESSION_DURATION_DAYS * 24,
});

  const session = await db.orm.public.Session.create({
    userId,
    tokenHash,
    expiresAt,
    createdAt: Temporal.Now.instant(),
  });

  return {
    sessionId: session.id,
    token,
    expiresAt: session.expiresAt,
  };
}
import { Temporal } from "@js-temporal/polyfill";
import crypto from "crypto";
import { db } from "../db";

function hashSessionToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function getSessionUser(token: string) {
  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);

  const session = await db.orm.public.Session
    .where({ tokenHash })
    .first();

  if (!session) {
    return null;
  }

  if (session.revokedAt) {
    return null;
  }

  if (Temporal.Instant.compare(
    session.expiresAt,
    Temporal.Now.instant()
  ) <= 0) {
    return null;
  }

  const user = await db.orm.public.User
    .where({ id: session.userId })
    .first();

  if (!user || !user.isActive) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    emailVerified: user.emailVerified,
    sessionId: session.id,
  };
}
import { Router } from "express";
import { Temporal } from "@js-temporal/polyfill";
import { db } from "../db.js";
import { getSessionUser } from "./sessionUser.js";
import { registerUser } from "./register.js";
import { loginUser } from "./login.js";
import { createSession } from "./session.js";
import { isPasswordRecoveryConfigured, requestPasswordReset, resetPassword } from "./password-reset.js";

function getSessionTokenFromCookie(cookieHeader?: string) {
  if (!cookieHeader) return null;

  const sessionCookie = cookieHeader
    .split(";")
    .find((cookie) => cookie.trim().startsWith("session="));

  if (!sessionCookie) return null;

  try {
    return decodeURIComponent(sessionCookie.trim().slice("session=".length));
  } catch {
    return null;
  }
}

function getCookieAttributes() {
  const sameSite =
    process.env.COOKIE_SAME_SITE?.toLowerCase() === "none"
      ? "None"
      : "Lax";
  const secure =
    process.env.NODE_ENV === "production" || sameSite === "None"
      ? "; Secure"
      : "";

  return { sameSite, secure };
}

function setSessionCookie(token: string) {
  const { sameSite, secure } = getCookieAttributes();
  return `session=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=${sameSite}${secure}`;
}

const router = Router();
const passwordResetRequests = new Map<string, { count: number; resetAt: number }>();
function allowPasswordResetRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = passwordResetRequests.get(key);
  if (!current || current.resetAt <= now) {
    passwordResetRequests.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  if (passwordResetRequests.size > 10000) {
    for (const [entry, value] of passwordResetRequests) {
      if (value.resetAt <= now) passwordResetRequests.delete(entry);
    }
  }
  return true;
}

const resetRequestMessage =
  "If an account exists for that email, a password reset link will be sent shortly.";


router.post("/register", async (req, res) => {
  try {
    const body = req.body ?? {};
    const user = await registerUser({
      email: typeof body.email === "string" ? body.email : "",
      password: typeof body.password === "string" ? body.password : "",
      firstName: typeof body.firstName === "string" ? body.firstName : "",
      lastName: typeof body.lastName === "string" ? body.lastName : "",
      university: typeof body.university === "string" ? body.university : undefined,
      faculty: typeof body.faculty === "string" ? body.faculty : undefined,
      year: typeof body.year === "string" ? body.year : undefined,
      specialization: typeof body.specialization === "string" ? body.specialization : undefined,
    });

    const session = await createSession(user.id);
    res.setHeader("Set-Cookie", setSessionCookie(session.token));
    return res.status(201).json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create account";
    const isExpectedValidation = [
      "Invalid email",
      "Password must be at least 8 characters",
      "First name and last name are required",
      "Email already registered",
    ].includes(message);

    if (!isExpectedValidation) {
      console.error("POST /api/auth/register error:", error);
    }

    return res.status(isExpectedValidation ? 400 : 500).json({
      message: isExpectedValidation ? message : "Could not create account. Please try again.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const body = req.body ?? {};
    const result = await loginUser({
      email: typeof body.email === "string" ? body.email : "",
      password: typeof body.password === "string" ? body.password : "",
    });

    res.setHeader("Set-Cookie", setSessionCookie(result.session.token));
    return res.json({ user: result.user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid email or password";
    const expected = ["Invalid email", "Password is required", "Invalid email or password", "Account is inactive"].includes(message);
    if (!expected) console.error("POST /api/auth/login error:", error);
    return res.status(expected ? 401 : 500).json({
      message: expected ? message : "Could not sign in. Please try again.",
    });
  }
});



router.post("/forgot-password", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const ipAllowed = allowPasswordResetRequest("ip:" + ip, 20, 60 * 60 * 1000);
  const emailAllowed = allowPasswordResetRequest("email:" + email, 4, 60 * 60 * 1000);
  if (!ipAllowed || !emailAllowed) {
    return res.json({ message: resetRequestMessage });
  }

  if (!isPasswordRecoveryConfigured()) {
    console.error("Password recovery is not configured. Set PASSWORD_RESET_SECRET, PUBLIC_APP_URL, RESEND_API_KEY, and RESEND_FROM_EMAIL.");
    return res.status(503).json({
      message: "Password recovery is temporarily unavailable. Please try again later.",
    });
  }

  try {
    const developmentResetUrl = await requestPasswordReset(email);
    return res.json({
      message: resetRequestMessage,
      ...(developmentResetUrl && process.env.NODE_ENV !== "production"
        ? { developmentResetUrl }
        : {}),
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password failed:", error instanceof Error ? error.message : "Unknown error");
    return res.status(500).json({
      message: "Could not process the request right now. Please try again later.",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const token = typeof req.body?.token === "string" ? req.body.token : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  if (!allowPasswordResetRequest("reset:" + ip, 30, 15 * 60 * 1000)) {
    return res.status(429).json({ message: "Too many attempts. Request a new reset link later." });
  }
  if (!token || token.length > 2048) {
    return res.status(400).json({ message: "This password reset link is invalid or has expired. Request a new one." });
  }
  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({ message: "Password must be between 8 and 72 UTF-8 bytes." });
  }

  try {
    const updated = await resetPassword(token, password);
    if (!updated) {
      return res.status(400).json({ message: "This password reset link is invalid or has expired. Request a new one." });
    }
    return res.json({ message: "Your password has been updated. Please sign in with your new password." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reset password.";
    if (message.startsWith("Password must be")) {
      return res.status(400).json({ message });
    }
    console.error("POST /api/auth/reset-password failed:", message);
    return res.status(500).json({ message: "Could not reset your password. Please try again." });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const token = getSessionTokenFromCookie(req.headers.cookie);

    if (token) {
      const user = await getSessionUser(token);
      if (user?.sessionId) {
        await db.orm.public.Session
          .where({ id: user.sessionId })
          .update({ revokedAt: Temporal.Now.instant() });
      }
    }

    const { sameSite, secure } = getCookieAttributes();
    res.setHeader(
      "Set-Cookie",
      `session=; HttpOnly; Path=/; Max-Age=0; SameSite=${sameSite}${secure}`
    );
    return res.status(204).end();
  } catch (error) {
    console.error("POST /api/auth/logout error:", error);
    return res.status(500).json({ message: "Could not sign out. Please try again." });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = getSessionTokenFromCookie(req.headers.cookie);
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const user = await getSessionUser(token);
    if (!user) return res.status(401).json({ message: "Invalid or expired session" });

    return res.json({ user });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

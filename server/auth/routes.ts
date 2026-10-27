import { Router } from "express";
import { Temporal } from "@js-temporal/polyfill";
import { db } from "../db";
import { getSessionUser } from "./sessionUser";
import { registerUser } from "./register";
import { loginUser } from "./login";
import { createSession } from "./session";

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

function setSessionCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `session=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${secure}`;
}

const router = Router();

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

    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.setHeader(
      "Set-Cookie",
      `session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`
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

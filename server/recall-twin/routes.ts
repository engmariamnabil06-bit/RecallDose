import { Router } from "express";
import { getSessionUser } from "../auth/sessionUser";
import { buildRecallTwin } from "./service";

function getSessionTokenFromCookie(cookieHeader?: string) {
  if (!cookieHeader) return null;

  const sessionCookie = cookieHeader
    .split(";")
    .find((cookie) => cookie.trim().startsWith("session="));

  if (!sessionCookie) return null;

  try {
    return decodeURIComponent(
      sessionCookie.trim().slice("session=".length)
    );
  } catch {
    return null;
  }
}

const router = Router();

router.get("/", async (req, res) => {
  try {
    const token = getSessionTokenFromCookie(req.headers.cookie);

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await getSessionUser(token);

    if (!user) {
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    const recallTwin = await buildRecallTwin({ userId: user.id });
    return res.json(recallTwin);
  } catch (error) {
    console.error("GET /api/recall-twin error:", error);
    return res.status(500).json({
      message: "Could not load Recall Twin data. Please try again.",
    });
  }
});

export default router;

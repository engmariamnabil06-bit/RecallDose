import { Router } from "express";
import { getSessionUser } from "../auth/sessionUser";
import { buildReviewSchedule, recordMistakeReview } from "./service";

function getSessionTokenFromCookie(cookieHeader?: string) {
  if (!cookieHeader) return null;
  const cookie = cookieHeader.split(";").find((part) => part.trim().startsWith("session="));
  if (!cookie) return null;
  try {
    return decodeURIComponent(cookie.trim().slice("session=".length));
  } catch {
    return null;
  }
}

const router = Router();

router.post("/:mistakeId/reviewed", async (req, res) => {
  try {
    const token = getSessionTokenFromCookie(req.headers.cookie);
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    const user = await getSessionUser(token);
    if (!user) return res.status(401).json({ message: "Invalid or expired session" });
    return res.json(await recordMistakeReview(user.id, req.params.mistakeId));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not record review.";
    return res.status(message === "Review item not found" ? 404 : 500).json({ message });
  }
});

router.get("/", async (req, res) => {
  try {
    const token = getSessionTokenFromCookie(req.headers.cookie);
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    const user = await getSessionUser(token);
    if (!user) return res.status(401).json({ message: "Invalid or expired session" });
    return res.json(await buildReviewSchedule(user.id));
  } catch (error) {
    console.error("GET /api/review-schedule error:", error);
    return res.status(500).json({ message: "Could not build your review schedule." });
  }
});

export default router;

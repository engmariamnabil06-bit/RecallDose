import { Router, type Request } from "express";
import { Temporal } from "@js-temporal/polyfill";
import { db } from "../db.js";
import { getSessionUser } from "../auth/sessionUser.js";

const router = Router();

function sessionToken(req: Request): string | null {
  const cookie = req.headers.cookie?.split(";").find((part) => part.trim().startsWith("session="));
  if (!cookie) return null;
  try { return decodeURIComponent(cookie.trim().slice("session=".length)); } catch { return null; }
}

router.get("/me", async (req, res) => {
  const token = sessionToken(req);
  const user = token ? await getSessionUser(token) : null;
  if (!user) return res.status(401).json({ message: "Please sign in to view your membership." });

  try {
    let subscription = await db.orm.public.Subscription.where({ userId: user.id }).first();
    // Existing accounts receive their trial when they first enter the membership area.
    if (!subscription) {
      const started = new Date();
      const ends = new Date(started.getTime() + 60 * 24 * 60 * 60 * 1000);
      subscription = await db.orm.public.Subscription.create({
        userId: user.id, plan: "FREE_TRIAL", status: "TRIALING",
        trialStartedAt: started, trialEndsAt: ends,
      });
    }

    const trialEndsAt = new Date(subscription.trialEndsAt as any);
    const trialActive = subscription.status === "TRIALING" && trialEndsAt.getTime() > Date.now();
    if (subscription.status === "TRIALING" && !trialActive) {
      subscription = await db.orm.public.Subscription.where({ id: subscription.id }).update({
        plan: "FREE", status: "EXPIRED", updatedAt: Temporal.Now.instant(),
      });
    }

    const activeTrialEnd = new Date(subscription.trialEndsAt as any);
    const daysRemaining = trialActive
      ? Math.max(0, Math.ceil((activeTrialEnd.getTime() - Date.now()) / 86400000))
      : 0;

    return res.json({
      plan: trialActive ? "FREE_TRIAL" : subscription.plan,
      status: trialActive ? "TRIALING" : subscription.status,
      trialStartedAt: subscription.trialStartedAt,
      trialEndsAt: subscription.trialEndsAt,
      trialDaysRemaining: daysRemaining,
      paymentEnabled: false,
      paymentMethods: ["FAWRY_PLUS", "ORANGE_WALLET"],
      message: trialActive
        ? "Your 60-day all-features trial is active."
        : "Your essential free access remains available. Paid plans are not active yet.",
    });
  } catch (error) {
    console.error("load membership status", error);
    return res.status(500).json({ message: "Could not load your membership status." });
  }
});

export default router;

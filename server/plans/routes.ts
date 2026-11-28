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

    if (!subscription) return res.status(500).json({ message: "Could not initialize your membership." });
    const currentSubscription = subscription;
    const trialEndsAt = new Date(currentSubscription.trialEndsAt as any);
    const trialActive = currentSubscription.status === "TRIALING" && trialEndsAt.getTime() > Date.now();
    let activeSubscription = currentSubscription;
    if (currentSubscription.status === "TRIALING" && !trialActive) {
      const expiredSubscription = await db.orm.public.Subscription.where({ id: currentSubscription.id }).update({
        plan: "FREE", status: "EXPIRED", updatedAt: Temporal.Now.instant(),
      });
      if (expiredSubscription) activeSubscription = expiredSubscription;
    }
    const activeTrialEnd = new Date(activeSubscription.trialEndsAt as any);
    const daysRemaining = trialActive
      ? Math.max(0, Math.ceil((activeTrialEnd.getTime() - Date.now()) / 86400000))
      : 0;

    return res.json({
      plan: trialActive ? "FREE_TRIAL" : activeSubscription.plan,
      status: trialActive ? "TRIALING" : activeSubscription.status,
      trialStartedAt: activeSubscription.trialStartedAt,
      trialEndsAt: activeSubscription.trialEndsAt,
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

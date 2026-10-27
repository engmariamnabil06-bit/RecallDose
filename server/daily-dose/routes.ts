import { Router } from "express";
import { getSessionUser } from "../auth/sessionUser";
import {
  buildDailyDose,
  startDailyDose,
  completeDailyDose,
} from "./service";

function getSessionTokenFromCookie(
  cookieHeader?: string
) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  const sessionCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("session=")
  );

  if (!sessionCookie) {
    return null;
  }

  return decodeURIComponent(
    sessionCookie.trim().slice("session=".length)
  );
}

async function getAuthenticatedUser(
  req: Parameters<Router["get"]>[1] extends (
    ...args: infer A
  ) => unknown
    ? A[0]
    : never
) {
  const token =
    getSessionTokenFromCookie(req.headers.cookie);

  if (!token) {
    throw new Error("Not authenticated");
  }

  const user = await getSessionUser(token);

  if (!user) {
    throw new Error("Invalid or expired session");
  }

  return user;
}

const router = Router();

router.get("/", async (req, res) => {
  try {
    const user =
      await getAuthenticatedUser(req);

    const dose =
      await buildDailyDose({
        userId: user.id,
      });

    return res.json({
      dose,
    });
  } catch (error) {
    console.error(
      "GET /api/daily-dose error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load Daily Dose";

    return res.status(
      message === "Not authenticated" ||
      message === "Invalid or expired session"
        ? 401
        : 500
    ).json({
      message,
    });
  }
});

router.post("/:doseId/start", async (req, res) => {
  try {
    const user =
      await getAuthenticatedUser(req);

    const dose =
      await startDailyDose({
        userId: user.id,
        doseId: req.params.doseId,
      });

    return res.json({
      dose,
    });
  } catch (error) {
    console.error(
      "POST /api/daily-dose/:doseId/start error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to start Daily Dose";

    return res.status(
      message === "Not authenticated" ||
      message === "Invalid or expired session"
        ? 401
        : message === "Daily Dose not found" ||
          message.includes(
            "not allowed"
          )
        ? 403
        : 400
    ).json({
      message,
    });
  }
});

router.post(
  "/:doseId/complete",
  async (req, res) => {
    try {
      const user =
        await getAuthenticatedUser(req);

      const completedCount =
        Number(req.body?.completedCount);

      if (
        !Number.isInteger(completedCount)
      ) {
        return res.status(400).json({
          message:
            "completedCount must be an integer",
        });
      }

      const dose =
        await completeDailyDose({
          userId: user.id,
          doseId: req.params.doseId,
          completedCount,
        });

      return res.json({
        dose,
      });
    } catch (error) {
      console.error(
        "POST /api/daily-dose/:doseId/complete error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to complete Daily Dose";

      return res.status(
        message === "Not authenticated" ||
        message === "Invalid or expired session"
          ? 401
          : message ===
              "Daily Dose not found"
            ? 404
            : message.includes(
                "not allowed"
              )
            ? 403
            : 400
      ).json({
        message,
      });
    }
  }
);

export default router;
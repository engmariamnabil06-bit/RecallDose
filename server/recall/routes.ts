import { Router } from "express";
import { getSessionUser } from "../auth/sessionUser";
import { createRecallSession } from "./service";
import { submitRecallAnswer } from "./answer";

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

const router = Router();

router.post("/session", async (req, res) => {
  try {
    const token =
      getSessionTokenFromCookie(
        req.headers.cookie
      );

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const user =
      await getSessionUser(token);

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid or expired session",
      });
    }

    const requestedCount =
      Number(req.body?.count);

    const dailyDoseId =
      typeof req.body?.dailyDoseId ===
      "string" &&
      req.body.dailyDoseId.trim().length > 0
        ? req.body.dailyDoseId.trim()
        : null;

    const session =
      await createRecallSession(
        user.id,
        Number.isFinite(requestedCount)
          ? requestedCount
          : 5,
        {
          dailyDoseId,
        }
      );

    return res.status(201).json(session);
  } catch (error) {
    console.error(
      "POST /api/recall/session error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Could not create recall session";

    const status =
      message ===
        "Not authenticated" ||
      message ===
        "Invalid or expired session"
        ? 401
        : message ===
              "Daily Dose not found"
          ? 404
          : message.includes(
                "not allowed"
              )
            ? 403
            : 400;

    return res.status(status).json({
      message,
    });
  }
});

router.post(
  "/session/:sessionId/answer",
  async (req, res) => {
    try {
      const token =
        getSessionTokenFromCookie(
          req.headers.cookie
        );

      if (!token) {
        return res.status(401).json({
          message: "Not authenticated",
        });
      }

      const user =
        await getSessionUser(token);

      if (!user) {
        return res.status(401).json({
          message:
            "Invalid or expired session",
        });
      }

      const {
        questionId,
        selectedOptionId,
      } = req.body;

      if (
        typeof questionId !==
          "string" ||
        typeof selectedOptionId !==
          "string" ||
        !questionId.trim() ||
        !selectedOptionId.trim()
      ) {
        return res.status(400).json({
          message:
            "questionId and selectedOptionId are required",
        });
      }

      const result =
        await submitRecallAnswer({
          userId: user.id,
          sessionId:
            req.params.sessionId,
          questionId:
            questionId.trim(),
          selectedOptionId:
            selectedOptionId.trim(),
        });

      return res.status(200).json(
        result
      );
    } catch (error) {
      console.error(
        "POST /api/recall/session/:sessionId/answer error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Could not submit answer";

      return res.status(400).json({
        message,
      });
    }
  }
);

export default router;

import { Router } from "express";
import { getSessionUser } from "../auth/sessionUser";
import { getDashboardData } from "./service";

function getSessionTokenFromCookie(
  cookieHeader?: string
) {
  if (!cookieHeader) {
    return null;
  }

  const sessionCookie = cookieHeader
    .split(";")
    .find((cookie) =>
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

router.get("/", async (req, res) => {
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

    const dashboard =
      await getDashboardData(user.id);

    return res.status(200).json(
      dashboard
    );
  } catch (error) {
    console.error(
      "GET /api/dashboard error:",
      error
    );

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Could not load dashboard data",
    });
  }
});

export default router;
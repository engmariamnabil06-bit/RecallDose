import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./db";
import authRoutes from "./auth/routes";
import recallRoutes from "./recall/routes";
import dashboardRoutes from "./dashboard/routes";
import dailyDoseRoutes from "./daily-dose/routes";
import recallTwinRoutes from "./recall-twin/routes";
import reviewScheduleRoutes from "./review-schedule/routes";
import aiRoutes from "./ai/routes";
import examRoutes from "./exams/routes";
import studyToolsRoutes from "./study-tools/routes";
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

const frontendOrigin =
  process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  })
);

// Cookie-authenticated state changes must originate from the configured frontend.
// This is a lightweight CSRF/origin guard; keep SameSite=Lax unless cross-site
// cookies are required and add a dedicated CSRF strategy before that deployment.
app.use((req, res, next) => {
  const isStateChangingMethod =
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);

  const requestOrigin = req.headers.origin;

  if (
    isStateChangingMethod &&
    requestOrigin &&
    requestOrigin !== frontendOrigin
  ) {
    return res.status(403).json({
      message: "Request origin is not allowed.",
    });
  }

  next();
});

app.use(express.json({ limit: "2mb" }));

if (process.env.NODE_ENV !== "production") {
  app.get("/api/db-test", async (_req, res) => {
    try {
      const users = await db.orm.public.User.all();

      res.json({
        success: true,
        database: "connected",
        usersCount: users.length,
      });
    } catch (error) {
      console.error("DATABASE TEST ERROR:", error);

      res.status(500).json({
        success: false,
        database: "error",
        message:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  });
}

app.use("/api/auth", authRoutes);
app.use("/api/recall", recallRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/daily-dose", dailyDoseRoutes);
app.use("/api/recall-twin", recallTwinRoutes);
app.use("/api/review-schedule", reviewScheduleRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/study-tools", studyToolsRoutes);

async function startServer() {
  try {
    await db.connect();

    app.listen(PORT, () => {
      console.log(
        `RECALLDOSE API running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("DATABASE CONNECTION ERROR:", error);
    process.exit(1);
  }
}

void startServer();

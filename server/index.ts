import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./db";
import authRoutes from "./auth/routes";
import recallRoutes from "./recall/routes";
import dashboardRoutes from "./dashboard/routes";
import dailyDoseRoutes from "./daily-dose/routes";
dotenv.config();

const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

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

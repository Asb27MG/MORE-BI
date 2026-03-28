import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import apiRouter from "./routes";

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN ?? "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin no permitido por CORS"));
    },
  }),
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "more-bi-backend",
    status: "ok",
    health: "/health",
    api: "/api",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", apiRouter);

export default app;

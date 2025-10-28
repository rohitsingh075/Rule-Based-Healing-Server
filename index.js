// server.js
import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import os from "os";
import { fileURLToPath } from "url";
import fs from "fs";

import logger from "./utils/logger.js";
import monitor from "./Monitor/SelfHealing.js";

// Import routes
import connectDB from "./config/db.js";
import userRouter from "./routes/user.router.js";
import eventRoutes from "./routes/event.route.js";
import noticeRoutes from "./routes/notice.route.js";
import studentRoutes from "./routes/student.route.js";
import galleryRoutes from "./routes/gallery.route.js";
import verifyUser from "./routes/verify.route.js";

// Prometheus
import { collectDefaultMetrics, Registry } from "prom-client";
const register = new Registry();
collectDefaultMetrics({ register });

// Load env
dotenv.config({ path: "./.env" });

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS
const clientUrl = process.env.CLIENT_URL;
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ncrcollegetdledu.org.in",
      "https://www.ncrcollegetdledu.org.in",
    ],
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/", userRouter);
app.use("/user", verifyUser);
app.use("/events", eventRoutes);
app.use("/notices", noticeRoutes);
app.use("/students", studentRoutes);
app.use("/gallery", galleryRoutes);

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Health endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    loadAverage: os.loadavg(),
    timestamp: Date.now(),
  });
});

app.get("/logs", (req, res) => {
  try {
    const logFilePath = path.join(__dirname, "logs", "combined.log");
    const logData = fs.readFileSync(logFilePath, "utf8");

    // split by line and get last 100 lines
    const lines = logData.trim().split("\n");
    const last100 = lines.slice(-100);

    res.status(200).json({
      status: "success",
      latestLogs: last100
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not read logs",
      error: error.message
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
    timestamp: Date.now(),
  });
});

app.get("/test-memory", (req, res) => {
  const leaky = [];
  for (let i = 0; i < 1e7; i++) {
    leaky.push(new Array(1000).fill("*"));
  }
  res.send("Memory leak simulation triggered!");
});

// route for high continuous CPU load for testing
app.get('/test-cpu', (req, res) => {
  for (let i = 0; i < 8; i++) {  // 8 workers = 8 CPU cores approx
    setTimeout(function busy() {
      while (true) Math.random() * Math.random();
    }, 0);
  }
  res.send("ALL cores overloaded!");
});

logger.info("🚀 Server started — Loki logging test entry", {
  module: "startup",
  level: "info",
});



// Connect DB & start server
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      logger.info(`Server Running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logger.error("DB connection Failed: " + error.message);
  });

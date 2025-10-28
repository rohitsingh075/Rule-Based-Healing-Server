// utils/logger.js
import os from "os";
import winston from "winston";
import { pushToLoki } from "./lokiClient.js";

const { combine, timestamp, errors, json } = winston.format;

const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    json() // Keep logs in JSON format
  ),
  defaultMeta: {
    service: "ncr-server",
    environment: process.env.NODE_ENV || "development",
    hostname: os.hostname(),
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
  ],
});

// Intercept logs to ALSO push to Loki
["info", "warn", "error"].forEach((level) => {
  const original = logger[level];
  logger[level] = (msg, meta = {}) => {
    const data = { message: msg, ...meta, ...logger.defaultMeta };

    // 1) Write to local transports first
    original.call(logger, msg, meta);

    // 2) Mirror to Loki (async)
    pushToLoki(level, data);
  };
});

export default logger;

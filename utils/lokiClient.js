// utils/lokiClient.js
import os from "os";
import fetch from "node-fetch";

const LOKI_URL = "http://127.0.0.1:3100/loki/api/v1/push";

export async function pushToLoki(level, data) {
  try {
    // Serialize metadata+message together
    const entry = {
      message: data.message || data.msg,
      service: data.service || "ncr-server",
      environment: data.environment || (process.env.NODE_ENV || "development"),
      host: os.hostname(),
      ...data, // keep metadata intact
      timestamp: new Date().toISOString(),
    };

    const payload = {
      streams: [
        {
          stream: {
            job: "ncr-server",
            host: os.hostname(),
            level: level,
            env: process.env.NODE_ENV || "development",
          },
          values: [[
            `${Date.now()}000000`, // nanoseconds
            JSON.stringify(entry),
          ]]
        }
      ]
    };

    await fetch(LOKI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

  } catch (error) {
    console.error("❌ Loki push error:", error.message);
  }
}

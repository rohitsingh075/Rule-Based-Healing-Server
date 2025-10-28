// monitor/selfHealing.js
import os from "os";
import { exec } from "child_process";
import logger from "../utils/logger.js";

let lastCPUUsage = process.cpuUsage();
logger.info({ event: "monitor_start", message: "Self-healing monitor started" });

function checkCPUUsage(intervalSeconds) {
  const currentUsage = process.cpuUsage(lastCPUUsage);
  lastCPUUsage = process.cpuUsage();
  const totalMicros = intervalSeconds * 1e6;
  return ((currentUsage.user + currentUsage.system) / totalMicros) * 100;
}

function getCPUPercentWindows() {
  const cpus = os.cpus();
  let idle = 0,
    total = 0;
  for (const core of cpus) {
    for (const type in core.times) total += core.times[type];
    idle += core.times.idle;
  }
  return { idle, total };
}

let lastTimes = getCPUPercentWindows();

function monitor() {
  const memUsedMB = process.memoryUsage().rss / 1024 / 1024;
  const cpuUsageDelta = checkCPUUsage(10);

  const now = getCPUPercentWindows();
  const idleDiff = now.idle - lastTimes.idle;
  const totalDiff = now.total - lastTimes.total;
  const cpuPercentAlt = 100 - (100 * idleDiff) / totalDiff;
  lastTimes = now;

  const cpuPercent = Math.max(cpuUsageDelta, cpuPercentAlt);

  // ✅ JSON STRUCTURED log
  logger.info({
    event: "resource_usage",
    cpu_percent: cpuPercent.toFixed(2),
    memory_mb: memUsedMB.toFixed(2),
  });

  if (memUsedMB > 500) {
    logger.warn({
      event: "high_memory",
      memory_mb: memUsedMB,
      action: "pm2_restart"
    });
    exec("pm2 restart ncr-server");
  }

  if (cpuPercent > 70) {
    logger.warn({
      event: "high_cpu",
      cpu_percent: cpuPercent.toFixed(2),
      action: "pm2_restart"
    });

    exec("pm2 restart ncr-server", (err) => {
      if (err)
        logger.error({
          event: "pm2_restart_failed",
          error: err.message,
        });
      else
        logger.warn({
          event: "pm2_restart_success",
          reason: "high_cpu",
        });
    });
  }
}

// Runs every 10 seconds
setInterval(monitor, 10_000);
export default monitor;

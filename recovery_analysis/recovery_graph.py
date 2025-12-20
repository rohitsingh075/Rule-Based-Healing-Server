import json
import matplotlib.pyplot as plt
from datetime import datetime

# 🔹 PM2 log file path
LOG_FILE = r"C:\Users\riyac\.pm2\logs\ncr-server-out.log"

times = []
cpu = []
memory = []

cpu_restart_times = []
cpu_restart_vals = []

mem_restart_times = []
mem_restart_vals = []

with open(LOG_FILE, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line.strip())

            # timestamp
            if "timestamp" not in data:
                continue
            t = datetime.strptime(data["timestamp"], "%Y-%m-%d %H:%M:%S")

            msg = data.get("message", {})

            # resource usage logs
            if msg.get("event") == "resource_usage":
                times.append(t)
                cpu.append(float(msg.get("cpu_percent", 0)))
                memory.append(float(msg.get("memory_mb", 0)))

            # CPU restart trigger
            if msg.get("event") in ["high_cpu", "pm2_restart"]:
                if times:
                    cpu_restart_times.append(times[-1])
                    cpu_restart_vals.append(cpu[-1])

            # Memory restart trigger
            if msg.get("event") == "high_memory":
                if times:
                    mem_restart_times.append(times[-1])
                    mem_restart_vals.append(memory[-1])

        except Exception:
            continue


#  SAFETY CHECK
print("CPU points:", len(cpu))
print("CPU restart points:", len(cpu_restart_vals))
print("Memory restart points:", len(mem_restart_vals))

# ================= CPU RECOVERY GRAPH =================
if cpu:
    plt.figure(figsize=(12, 5))
    plt.plot(times, cpu, label="CPU Usage (%)", color="blue", linewidth=2)

    if cpu_restart_times:
        plt.scatter(
            cpu_restart_times,
            cpu_restart_vals,
            color="red",
            s=80,
            label="CPU Restart Trigger",
            zorder=5
        )

    plt.axhline(70, color="orange", linestyle="--", label="CPU Threshold (70%)")

    plt.xlabel("Time")
    plt.ylabel("CPU %")
    plt.title("Self-Healing CPU Recovery Graph")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.show()
else:
    print("No CPU data found")

# ================= MEMORY RECOVERY GRAPH =================
if memory:
    plt.figure(figsize=(12, 5))
    plt.plot(times, memory, label="Memory Usage (MB)", color="purple", linewidth=2)

    if mem_restart_times:
        plt.scatter(
            mem_restart_times,
            mem_restart_vals,
            color="red",
            s=80,
            label="Memory Restart Trigger",
            zorder=5
        )

    plt.axhline(500, color="orange", linestyle="--", label="Memory Threshold (500 MB)")

    plt.xlabel("Time")
    plt.ylabel("Memory (MB)")
    plt.title("Self-Healing Memory Recovery Graph")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.show()
else:
    print("No Memory data found")

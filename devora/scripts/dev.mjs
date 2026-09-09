#!/usr/bin/env node
/**
 * Stable local dev starter.
 *
 * Fixes the recurring "unstyled HTML" issue by:
 * 1. killing stale dev servers on :3000
 * 2. auto-deleting a production `.next` cache before dev starts
 * 3. using webpack dev (not Turbopack) by default
 */
import { spawn } from "node:child_process";
import {
  clearDevLock,
  clearNextCache,
  defaultPort,
  isProductionNextCache,
  killNextDevProcesses,
  projectRoot,
  writeDevLock,
} from "./next-dev-utils.mjs";

const port = defaultPort;
const clean = process.argv.includes("--clean");
const turbo = process.argv.includes("--turbo");

killNextDevProcesses();

if (clean) {
  clearNextCache("Cleaning `.next` (dev:clean)…");
} else if (isProductionNextCache()) {
  clearNextCache(
    "Detected production `.next` cache — clearing it so dev does not serve broken HTML…",
  );
}

const args = ["next", "dev", "-p", port];
if (turbo) {
  args.splice(2, 0, "--turbo");
}

console.log(
  turbo
    ? `Starting Next.js dev (Turbopack) on :${port}${clean ? " [clean]" : ""}…`
    : `Starting Next.js dev (webpack) on :${port}${clean ? " [clean]" : ""}…`,
);

const child = spawn("npx", args, {
  cwd: projectRoot,
  stdio: "inherit",
});

writeDevLock(child.pid);

function shutdown(signal) {
  killNextDevProcesses(port);
  clearDevLock();
  child.kill(signal);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

child.on("exit", (code) => {
  clearDevLock();
  process.exit(code ?? 0);
});

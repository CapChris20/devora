#!/usr/bin/env node
/**
 * Production build — always stops dev first so `.next` is never written while dev is running.
 */
import { spawn } from "node:child_process";
import {
  clearDevLock,
  killNextDevProcesses,
  markProductionBuild,
  projectRoot,
  sleep,
} from "./next-dev-utils.mjs";

console.log("Stopping any local dev server before production build…");
killNextDevProcesses();
await sleep(600);

const child = spawn("npx", ["next", "build"], {
  cwd: projectRoot,
  stdio: "inherit",
});

child.on("exit", (code) => {
  if (code === 0) {
    markProductionBuild();
    console.log(
      "\nBuild complete. Run `npm run dev` — it will auto-reset the cache for development.",
    );
  }

  clearDevLock();
  process.exit(code ?? 1);
});

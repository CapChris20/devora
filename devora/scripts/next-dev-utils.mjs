/**
 * Shared helpers so `next dev` and `next build` never corrupt the same `.next` folder.
 *
 * Root cause of "unstyled HTML" / missing chunks / refresh loops:
 * - `next build` writes a production `.next` cache
 * - `next dev` reuses that cache → broken manifests and 404 JS chunks
 * - Multiple dev servers on :3000 make it worse
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
export const defaultPort = process.env.PORT ?? "3000";
export const productionMarker = join(projectRoot, ".next", ".production-build");
export const devLockFile = join(projectRoot, ".next-dev.lock");

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function killPort(port = defaultPort) {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null`, { stdio: "ignore" });
  } catch {
    // Port was free.
  }
}

export function killNextDevProcesses(port = defaultPort) {
  killPort(port);

  try {
    execSync(`pkill -f "next dev.*-p ${port}" 2>/dev/null`, { stdio: "ignore" });
  } catch {
    // No matching process.
  }

  if (existsSync(devLockFile)) {
    const pid = Number.parseInt(readFileSync(devLockFile, "utf8"), 10);
    if (Number.isFinite(pid)) {
      try {
        process.kill(pid, "SIGTERM");
      } catch {
        // Process already gone.
      }
    }
    rmSync(devLockFile, { force: true });
  }
}

export function isProductionNextCache() {
  const nextDir = join(projectRoot, ".next");
  if (!existsSync(nextDir)) return false;

  return (
    existsSync(productionMarker) ||
    existsSync(join(nextDir, "export-marker.json")) ||
    existsSync(join(nextDir, "prerender-manifest.json"))
  );
}

export function clearNextCache(reason) {
  const nextDir = join(projectRoot, ".next");
  if (!existsSync(nextDir)) return;

  console.log(reason);
  rmSync(nextDir, { recursive: true, force: true });
}

export function markProductionBuild() {
  const nextDir = join(projectRoot, ".next");
  if (!existsSync(nextDir)) return;
  writeFileSync(productionMarker, `built-at=${new Date().toISOString()}\n`, "utf8");
}

export function writeDevLock(pid) {
  writeFileSync(devLockFile, String(pid), "utf8");
}

export function clearDevLock() {
  rmSync(devLockFile, { force: true });
}

/**
 * Capture current Devora UI screenshots (requires dev server on :3000).
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, "../../assets");
const baseUrl = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3000";

const shots = [
  {
    name: "homepage-screenshot.png",
    url: "/home",
    fullPage: false,
    viewport: { width: 1440, height: 900 },
  },
  {
    name: "homepage-full.png",
    url: "/home",
    fullPage: true,
    viewport: { width: 1440, height: 900 },
  },
  {
    name: "homepage-features.png",
    url: "/home",
    fullPage: false,
    viewport: { width: 1440, height: 900 },
    scrollTo: "#more",
  },
  {
    name: "auth-login.png",
    url: "/auth/login",
    fullPage: false,
    viewport: { width: 1440, height: 900 },
  },
  {
    name: "auth-signup.png",
    url: "/auth/signup",
    fullPage: false,
    viewport: { width: 1440, height: 900 },
  },
  {
    name: "discovery-grid-shell.png",
    url: "/find-students",
    fullPage: false,
    viewport: { width: 1440, height: 900 },
  },
  {
    name: "settings-shell.png",
    url: "/settings",
    fullPage: false,
    viewport: { width: 1440, height: 900 },
  },
  {
    name: "faqs-shell.png",
    url: "/faqs-page",
    fullPage: false,
    viewport: { width: 1440, height: 900 },
  },
  {
    name: "activity-center-shell.png",
    url: "/messages-page",
    fullPage: false,
    viewport: { width: 1440, height: 900 },
  },
];

await mkdir(assetsDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();

for (const shot of shots) {
  await page.setViewportSize(shot.viewport);
  await page.goto(`${baseUrl}${shot.url}`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.waitForTimeout(1500);

  if (shot.scrollTo) {
    await page.locator(shot.scrollTo).scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
  }

  const out = path.join(assetsDir, shot.name);
  await page.screenshot({ path: out, fullPage: shot.fullPage });
  console.log(`Saved ${out}`);
}

await browser.close();

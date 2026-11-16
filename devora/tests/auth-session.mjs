import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sessionPath = path.resolve(__dirname, "session.json");

async function main() {
  console.log("Launching headed Chrome browser for Google sign-in...");
  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000/auth/login...");
  await page.goto("http://localhost:3000/auth/login");

  console.log("Please complete your Google sign-in in the opened browser window.");
  console.log("Waiting for redirection away from /auth/... (e.g. to /find-students or /onboarding)...");

  // Wait until user signs in and is redirected
  await page.waitForURL((url) => {
    const pathname = url.pathname;
    return pathname.includes("/find-students") || pathname.includes("/onboarding") || pathname.includes("/account-page");
  }, { timeout: 300000 }); // 5 minutes

  console.log("Login detected! Saving session state to:", sessionPath);
  await page.waitForTimeout(3000); // Wait for auth token to persist in storage
  await context.storageState({ path: sessionPath });

  console.log("Session saved successfully!");
  await browser.close();
}

main().catch((err) => {
  console.error("Auth session script error:", err);
  process.exit(1);
});


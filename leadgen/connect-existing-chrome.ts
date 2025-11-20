import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { constants } from "node:fs";
import { access, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";

import puppeteer, { type Browser } from "puppeteer";

type LaunchResult = {
  chromeProcess: ChildProcessWithoutNullStreams;
  userDataDir: string;
  wsEndpoint: string;
};

type ScriptOptions = {
  wsEndpoint?: string;
  targetUrl: string;
  chromePath?: string;
};

const DEVTOOLS_MATCHER = /DevTools listening on (ws:\/\/[^\s]+)/i;

async function findChromeExecutable(preferredPath?: string): Promise<string> {
  const candidates = [
    preferredPath,
    process.env.CHROME_EXECUTABLE_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta",
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error(
    "Unable to locate a Chrome executable. Set CHROME_EXECUTABLE_PATH or pass --chrome-path=<absolute-path>.",
  );
}

async function launchChromeForDebugging(chromePath?: string): Promise<LaunchResult> {
  const executablePath = await findChromeExecutable(chromePath);
  const userDataDir = await mkdtemp(path.join(os.tmpdir(), "leadgen-chrome-profile-"));

  const chromeProcess = spawn(
    executablePath,
    [
      "--remote-debugging-port=0",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-features=TranslateUI",
      "--disable-popup-blocking",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-sync",
      "--disable-component-update",
      "--metrics-recording-only",
      "--force-color-profile=srgb",
      `--user-data-dir=${userDataDir}`,
      "about:blank",
    ],
    {
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  return new Promise<LaunchResult>((resolve, reject) => {
    let resolved = false;
    let stderrBuffer = "";
    let stdoutBuffer = "";
    const timeout = setTimeout(() => {
      if (resolved) return;
      detachListeners();
      void cleanupChrome(chromeProcess, userDataDir);
      reject(new Error("Timed out waiting for Chrome to expose a DevTools endpoint."));
    }, 10000);

    timeout.unref();

    const handleOutput = (chunk: Buffer | string) => {
      const text = chunk.toString();
      const match = text.match(DEVTOOLS_MATCHER);
      if (match) {
        resolved = true;
        clearTimeout(timeout);
        detachListeners();
        pipeRemainingOutput(chromeProcess);
        resolve({
          chromeProcess,
          userDataDir,
          wsEndpoint: match[1],
        });
      }
    };

    const handleStdout = (data: Buffer) => {
      stdoutBuffer += data.toString();
      process.stdout.write(`[chrome] ${data}`);
      handleOutput(data);
    };

    const handleStderr = (data: Buffer) => {
      stderrBuffer += data.toString();
      process.stderr.write(`[chrome] ${data}`);
      handleOutput(data);
    };

    const handleExit = (code: number | null, signal: string | null) => {
      clearTimeout(timeout);
      detachListeners();
      const message = [
        `Chrome exited before providing a DevTools endpoint.`,
        `Exit code: ${code ?? "unknown"}, signal: ${signal ?? "none"}.`,
        stdoutBuffer && `stdout:\n${stdoutBuffer}`,
        stderrBuffer && `stderr:\n${stderrBuffer}`,
      ]
        .filter(Boolean)
        .join("\n");
      reject(new Error(message));
    };

    const handleError = (error: Error) => {
      clearTimeout(timeout);
      detachListeners();
      reject(error);
    };

    const detachListeners = () => {
      chromeProcess.stdout?.off("data", handleStdout);
      chromeProcess.stderr?.off("data", handleStderr);
      chromeProcess.off("exit", handleExit);
      chromeProcess.off("error", handleError);
    };

    chromeProcess.stdout?.on("data", handleStdout);
    chromeProcess.stderr?.on("data", handleStderr);
    chromeProcess.on("exit", handleExit);
    chromeProcess.on("error", handleError);
  });
}

async function cleanupChrome(chromeProcess: ChildProcessWithoutNullStreams, userDataDir: string) {
  if (!chromeProcess.killed) {
    chromeProcess.kill("SIGTERM");
  }
  try {
    await rm(userDataDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors.
  }
}

function pipeRemainingOutput(chromeProcess: ChildProcessWithoutNullStreams) {
  chromeProcess.stdout?.on("data", (data: Buffer) => {
    process.stdout.write(`[chrome] ${data.toString()}`);
  });
  chromeProcess.stderr?.on("data", (data: Buffer) => {
    process.stderr.write(`[chrome] ${data.toString()}`);
  });
}

function parseArgs(): ScriptOptions {
  const args = process.argv.slice(2);
  const options: ScriptOptions = {
    targetUrl: "https://google.com",
  };

  for (const arg of args) {
    if (arg.startsWith("--ws-endpoint=") || arg.startsWith("--wsEndpoint=")) {
      const [, value] = arg.split("=", 2);
      options.wsEndpoint = value;
      continue;
    }

    if (arg.startsWith("--chrome-path=")) {
      const [, value] = arg.split("=", 2);
      options.chromePath = value;
      continue;
    }

    if (!arg.startsWith("--") && !options.targetUrl) {
      options.targetUrl = normalizeUrl(arg);
    } else if (!arg.startsWith("--") && options.targetUrl === "https://google.com") {
      options.targetUrl = normalizeUrl(arg);
    }
  }

  options.targetUrl = normalizeUrl(options.targetUrl);

  return options;
}

function normalizeUrl(url: string): string {
  if (!url) {
    return "https://google.com";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `https://${url}`;
}

async function openTargetPage(browser: Browser, targetUrl: string) {
  const page = await browser.newPage();
  await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
  await page.bringToFront();
  console.log(`✅ Navigated to ${targetUrl}`);
}

async function main() {
  const options = parseArgs();
  let launchResult: LaunchResult | null = null;
  let browser: Browser | null = null;

  const teardown = async () => {
    if (browser) {
      await browser.disconnect();
      browser = null;
    }
    if (launchResult) {
      await cleanupChrome(launchResult.chromeProcess, launchResult.userDataDir);
      launchResult = null;
    }
  };

  process.on("SIGINT", async () => {
    console.log("\nReceived SIGINT, shutting down…");
    await teardown();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\nReceived SIGTERM, shutting down…");
    await teardown();
    process.exit(0);
  });

  try {
    let wsEndpoint = options.wsEndpoint;

    if (!wsEndpoint) {
      console.log("Launching Chrome with remote debugging enabled…");
      launchResult = await launchChromeForDebugging(options.chromePath);
      wsEndpoint = launchResult.wsEndpoint;
      console.log(`Chrome remote debugging endpoint: ${wsEndpoint}`);
    } else {
      console.log(`Connecting to existing Chrome at ${wsEndpoint}`);
    }

    browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint });
    await openTargetPage(browser, options.targetUrl);

    if (launchResult) {
      console.log("Press Ctrl+C to close the launched Chrome instance.");
    } else {
      console.log("Connected to existing browser. Disconnecting without closing Chrome.");
      await teardown();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to connect to Chrome: ${message}`);
    await teardown();
    process.exit(1);
  }
}

void main();


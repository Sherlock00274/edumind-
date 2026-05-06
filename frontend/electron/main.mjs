import { app, BrowserWindow, dialog } from "electron";
import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_PORT = 18450;
const HEALTH_URL = `http://127.0.0.1:${BACKEND_PORT}/health`;

let backendProcess = null;

function frontendEntryPath() {
  return path.join(__dirname, "..", "dist", "index.html");
}

function backendExecutablePath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "backend", "edumind-backend");
  }
  return path.join(__dirname, "..", ".desktop", "backend", "edumind-backend");
}

async function ensureBackendExists(executablePath) {
  await access(executablePath);
}

function backendEnvironment() {
  const userDataDir = app.getPath("userData");
  const databasePath = path.join(userDataDir, "edumind.db");
  return {
    ...process.env,
    ENVIRONMENT: "desktop",
    DATABASE_URL: `sqlite:///${databasePath}`,
    CORS_ORIGINS: JSON.stringify(["null", "http://localhost:3000", "http://127.0.0.1:3000"]),
    EDUMIND_BACKEND_HOST: "127.0.0.1",
    EDUMIND_BACKEND_PORT: String(BACKEND_PORT),
  };
}

async function waitForBackend(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(HEALTH_URL);
      if (response.ok) {
        return;
      }
    } catch (error) {
      // Ignore until timeout.
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`Backend did not become healthy within ${timeoutMs}ms.`);
}

async function startBackend() {
  const executablePath = backendExecutablePath();
  await ensureBackendExists(executablePath);

  backendProcess = spawn(executablePath, [], {
    env: backendEnvironment(),
    stdio: "inherit",
  });

  backendProcess.on("exit", code => {
    if (!app.isQuitting) {
      dialog.showErrorBox("EduMind backend stopped", `The local backend exited unexpectedly with code ${code ?? "unknown"}.`);
      app.quit();
    }
  });

  await waitForBackend();
}

async function createMainWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1200,
    minHeight: 820,
    title: "EduMind",
    backgroundColor: "#f8fafc",
    show: false,
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
    },
  });

  await window.loadFile(frontendEntryPath());
  window.once("ready-to-show", () => window.show());
}

app.on("before-quit", () => {
  app.isQuitting = true;
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill("SIGTERM");
  }
});

app.whenReady().then(async () => {
  try {
    await startBackend();
    await createMainWindow();
  } catch (error) {
    dialog.showErrorBox(
      "EduMind failed to start",
      error instanceof Error ? error.message : "Unknown startup failure.",
    );
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { autoUpdater } = require("electron-updater");

let mainWindow = null;
let serverProcess = null;

function getServerRoot() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "server");
  }
  return path.resolve(__dirname, "..", "cinesuper-upr2", "server");
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: "#05070d",
    icon: path.join(__dirname, "assets", "Logo_app.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "renderer", "loading.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function startServer() {
  const serverRoot = getServerRoot();
  const entry = path.join(serverRoot, "src", "index.js");

  serverProcess = spawn(process.execPath, [entry], {
    cwd: serverRoot,
    stdio: "ignore",
    windowsHide: true,
  });

  serverProcess.on("exit", () => {
    serverProcess = null;
  });
}

async function waitForServer() {
  const target = "http://localhost:5055/api/health";
  const maxTries = 60;

  for (let i = 0; i < maxTries; i++) {
    try {
      const res = await fetch(target);
      if (res.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function loadAppUi() {
  const ok = await waitForServer();
  if (!mainWindow) return;

  if (ok) {
    mainWindow.loadURL("http://localhost:5055");
  } else {
    mainWindow.loadFile(path.join(__dirname, "renderer", "error.html"));
  }
}

function setupAutoUpdate() {
  autoUpdater.autoDownload = true;
  autoUpdater.checkForUpdatesAndNotify();
}

app.whenReady().then(async () => {
  createWindow();
  startServer();
  await loadAppUi();
  setupAutoUpdate();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

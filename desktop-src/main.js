const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

/* ---------------------------------------------------------------------------
   SoloDev Studio — desktop shell

   PERFORMANCE
   This app is HTML and CSS, but it uses blur, translucency and animated
   layers. Rendered on the CPU those effects are slow, and on a high-refresh
   laptop screen the whole thing feels sticky. So the GPU is ON by default:
   hardware compositing, rasterisation, zero-copy and the 2D canvas are all
   enabled, and the driver blocklist is ignored (many laptops have perfectly
   capable drivers that Chromium has simply never seen).

   LIVENESS
   Some machines really do have broken graphics drivers, and an earlier build
   of this app disabled the GPU outright because of that. Rather than choose
   between "fast but crashes" and "safe but slow", this shell watches for GPU
   and renderer crashes and falls back on its own:

     - 1 crash in a session  -> logged, app carries on
     - 2 crashes in a session -> a flag file is written, and the NEXT launch
                                starts in software rendering

   You can also force software rendering at any time:
     - launch the app with  --software-rendering
     - or turn it on in Settings inside the app (it restarts itself)
   That writes the same flag file, so it sticks until you turn it off again.
   --------------------------------------------------------------------------- */

app.setName('SoloDev Studio');

let LOG_FILE = null;
let STATE_DIR = null;
let FLAG_FILE = null;

try {
  /* Windows forbids ':' in folder names, so never derive the data path from a
     display name that contains one. Use an explicit, safe directory. */
  const safeDir = path.join(app.getPath('appData'), 'SoloDevStudio');
  fs.mkdirSync(safeDir, { recursive: true });
  app.setPath('userData', safeDir);
  app.setPath('cache', path.join(safeDir, 'cache'));
  STATE_DIR = safeDir;
  FLAG_FILE = path.join(safeDir, 'software-rendering.flag');
  LOG_FILE = path.join(safeDir, 'startup.log');
} catch (e) {
  try { LOG_FILE = path.join(require('os').tmpdir(), 'solodev-startup.log'); } catch (e2) {}
}

function log(msg) {
  try {
    if (!LOG_FILE) return;
    fs.appendFileSync(LOG_FILE, '[' + new Date().toISOString() + '] ' + msg + '\n');
  } catch (e) {}
}

function readFlag() {
  try { return !!(FLAG_FILE && fs.existsSync(FLAG_FILE)); } catch (e) { return false; }
}
function writeFlag(on) {
  try {
    if (!FLAG_FILE) return false;
    if (on) fs.writeFileSync(FLAG_FILE, 'Set by Settings, or automatically after repeated graphics crashes.\nDelete this file to try hardware acceleration again.\n');
    else if (fs.existsSync(FLAG_FILE)) fs.unlinkSync(FLAG_FILE);
    return true;
  } catch (e) { log('could not write the flag file: ' + e.message); return false; }
}

/* --------------------------- rendering mode ------------------------------ */
const forcedByArg = process.argv.indexOf('--software-rendering') !== -1;
const software = forcedByArg || readFlag();

if (software) {
  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-gpu-compositing');
  app.commandLine.appendSwitch('in-process-gpu');
  app.commandLine.appendSwitch('disable-gpu-sandbox');
} else {
  app.commandLine.appendSwitch('ignore-gpu-blocklist');
  app.commandLine.appendSwitch('enable-gpu-rasterization');
  app.commandLine.appendSwitch('enable-zero-copy');
  app.commandLine.appendSwitch('enable-accelerated-2d-canvas');
  app.commandLine.appendSwitch('enable-accelerated-video-decode');
}

/* Some hardened / managed Windows images break Chromium's renderer sandbox
   (the renderer dies with STATUS_BREAKPOINT and the page never loads). This
   app loads only local files with contextIsolation on and no remote content,
   so running without the OS-level sandbox is a safe, pragmatic trade-off.
   It has no measurable effect on animation smoothness. */
app.commandLine.appendSwitch('no-sandbox');

log('--- launch --- electron ' + process.versions.electron + ' | ' + process.platform + ' ' + process.arch);
log('rendering: ' + (software ? 'SOFTWARE (hardware acceleration off)' : 'HARDWARE (GPU on)'));

process.on('uncaughtException', function (err) {
  log('UNCAUGHT: ' + (err && err.stack ? err.stack : String(err)));
});
process.on('unhandledRejection', function (err) {
  log('UNHANDLED REJECTION: ' + String(err));
});

/* ------------------------- automatic GPU fallback ------------------------ */
let gpuCrashes = 0;
let windowReady = false;

function noteGpuTrouble(what) {
  if (software) return;
  gpuCrashes++;
  log('graphics trouble (' + gpuCrashes + '): ' + what);

  /* A crash before the window has ever appeared is the "double-click and
     nothing happens" case — one of those is enough to give up on the GPU.
     After the window is up, allow one hiccup before falling back. */
  const limit = windowReady ? 2 : 1;
  if (gpuCrashes >= limit && !readFlag()) {
    writeFlag(true);
    log('graphics kept failing — the next launch will start in software rendering.');
    try {
      if (mainWindow) {
        mainWindow.webContents.executeJavaScript(
          'window.__solodevGpuFallback && window.__solodevGpuFallback();'
        ).catch(function () {});
      }
    } catch (e) {}
  }
}

app.on('child-process-gone', function (e, details) {
  log('child-process-gone: ' + JSON.stringify(details));
  if (details && details.type === 'GPU' && details.reason !== 'clean-exit') {
    noteGpuTrouble('GPU process ' + details.reason);
  }
});

/* ------------------------------ main window ------------------------------ */
let mainWindow = null;

function createWindow() {
  try {
    mainWindow = new BrowserWindow({
      width: 1440,
      height: 900,
      minWidth: 1000,
      minHeight: 640,
      show: false,
      backgroundColor: '#0a0e13',
      autoHideMenuBar: true,
      title: 'SoloDev Studio',
      icon: path.join(__dirname, 'build', 'icon.png'),
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        spellcheck: false,
        preload: path.join(__dirname, 'preload.js'),
        additionalArguments: ['--solodev-software=' + (software ? '1' : '0')]
      }
    });

    mainWindow.setMenuBarVisibility(false);
    mainWindow.once('ready-to-show', function () {
      log('ready-to-show');
      windowReady = true;
      mainWindow.show();
    });

    /* The first paint after a resize is the most likely place to see a driver
       stumble. Log it, and let the fallback above do its job. */
    mainWindow.webContents.on('render-process-gone', function (e, details) {
      log('render-process-gone: ' + JSON.stringify(details));
      if (details && details.reason !== 'clean-exit') noteGpuTrouble('renderer ' + details.reason);
    });
    mainWindow.webContents.on('did-fail-load', function (e, code, desc) {
      log('did-fail-load: ' + code + ' ' + desc);
    });

    mainWindow.webContents.setWindowOpenHandler(function (info) {
      if (info.url && info.url.indexOf('http') === 0) shell.openExternal(info.url);
      return { action: 'deny' };
    });

    mainWindow.loadFile(path.join(__dirname, 'app', 'index.html')).then(function () {
      log('index.html loaded');
    }).catch(function (err) {
      log('loadFile failed: ' + err);
    });
  } catch (err) {
    log('createWindow threw: ' + (err && err.stack ? err.stack : String(err)));
  }
}

/* ------------------------------- settings IPC ---------------------------- */
ipcMain.handle('solodev:get-status', function () {
  return {
    software: software,
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    platform: process.platform,
    crashes: gpuCrashes,
    logFile: LOG_FILE || ''
  };
});

ipcMain.handle('solodev:set-software', function (e, on) {
  writeFlag(!!on);
  log('software rendering ' + (on ? 'requested' : 'turned off') + ' — restarting');
  setTimeout(function () { app.relaunch(); app.exit(0); }, 250);
  return true;
});

app.whenReady().then(function () {
  log('app ready');
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch(function (err) {
  log('whenReady failed: ' + (err && err.stack ? err.stack : String(err)));
});

app.on('window-all-closed', function () {
  log('window-all-closed');
  if (process.platform !== 'darwin') app.quit();
});

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');

const createdFiles = new Set();
const activeProcesses = [];

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/walkzz/Discord-Quest-Library/refs/heads/main/discord-executables.txt';
const isDummyMode = process.env.QUEST_DUMMY_MODE === 'true';
const MANIFEST_FILE = '.quest-links.json';

let mainWindow;

function parseGameList(content) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const games = [];

  for (let i = 0; i < lines.length; i += 2) {
    if (lines[i] && lines[i + 1]) {
      const rawLine = lines[i + 1];
      const commentMatch = rawLine.match(/\/\/\s*(.+)$/);
      const working = !(commentMatch && /not working/i.test(commentMatch[1]));
      const exePath = rawLine.replace(/\/\/.*$/, '').trim();

      games.push({
        name: lines[i],
        exePath,
        exeName: path.basename(exePath),
        working // false → render red, route to Legacy Mode
      });
    }
  }
  return games;
}

function getManifestPath() {
  return path.join(path.dirname(process.execPath), MANIFEST_FILE);
}

function readManifest() {
  try {
    const p = getManifestPath();
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch (e) { /* corrupt or missing — treat as empty */ }
  return [];
}

function writeManifest(list) {
  try { fs.writeFileSync(getManifestPath(), JSON.stringify(list, null, 2), 'utf-8'); } catch (e) {}
}

function addToManifest(filePath) {
  const list = readManifest();
  if (!list.includes(filePath)) {
    list.push(filePath);
    writeManifest(list);
  }
}

function removeFromManifest(filePath) {
  writeManifest(readManifest().filter(p => p !== filePath));
}

function cleanupFolder() {
  if (isDummyMode) return;
  try {
    const manifest = readManifest();
    const stillLocked = [];

    for (const filePath of manifest) {
      if (path.resolve(filePath) === path.resolve(process.execPath)) continue; // never touch self
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); }
        catch (e) { stillLocked.push(filePath); }
      }
    }
    writeManifest(stillLocked);
  } catch (err) {
    console.error('Sweeper error:', err);
  }
}

function getLegacyFolderPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app.asar.unpacked', 'legacy');
  }
  return path.join(__dirname, 'legacy');
}

function createWindow() {
  if (isDummyMode) {
    
    // small tracking window
    const gameTitle = process.env.QUEST_GAME_TITLE || 'Discord Game';
    const dummyWin  = new BrowserWindow({
      width: 450,
      height: 250,
      title: gameTitle,
      autoHideMenuBar: true,
      backgroundColor: '#202020'
    });
    dummyWin.loadURL(`data:text/html;charset=utf-8,
      <body style="background-color:%23202020;color:white;font-family:'Segoe UI',Tahoma,sans-serif;text-align:center;padding-top:50px;">
        <h2>${gameTitle} Simulation Active</h2>
        <p style="color:%23a3a3a3;">Discord is now tracking the application.<br>Leave this window open for 15 minutes.</p>
      </body>
    `);
  } else {
    
    // main game library
    cleanupFolder();

    mainWindow = new BrowserWindow({
      width: 1100,
      height: 800,
      frame: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    mainWindow.loadFile('index.html');
  }
}

app.whenReady().then(createWindow);
app.on('will-quit', () => {
  for (const child of activeProcesses) {
    if (child.pid) {
      try { execSync(`taskkill /pid ${child.pid} /f /t`, { stdio: 'ignore' }); } catch (e) {}
    }
  }
  for (const filePath of createdFiles) {
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
    removeFromManifest(filePath);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// you know what this is doing duh
ipcMain.on('window-control', (event, command) => {
  if (!mainWindow) return;
  if (command === 'minimize') mainWindow.minimize();
  if (command === 'maximize') mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  if (command === 'close') app.quit();
});

// fetch the game list from the discord-executables.txt
ipcMain.handle('get-game-list', async () => {
  const localBackupPath = path.join(path.dirname(process.execPath), 'discord-executables.txt');
  
  try {
    const response = await fetch(`${GITHUB_RAW_URL}?t=${Date.now()}`);
    if (!response.ok) throw new Error("Failed to fetch live game list");
    
    const content = await response.text();
    const games = parseGameList(content);
    
    if (app.isPackaged) {
      fs.writeFileSync(localBackupPath, content, 'utf-8');
    }

    return games;
    
  } catch (error) {
    console.error("Network fetch failed, falling back to local file...", error);
    
    if (fs.existsSync(localBackupPath)) {
      return parseGameList(fs.readFileSync(localBackupPath, 'utf-8'));
    }
    
    const devPath = path.join(__dirname, 'discord-executables.txt');
    if (fs.existsSync(devPath)) {
       return parseGameList(fs.readFileSync(devPath, 'utf-8'));
    }

    return [];
  }
});

// launcher (automated mode - for the executables that are actually working without needing the subfolders(e.g, Roblox))
ipcMain.on('launch-dummy', (event, targetExeName, gameTitle) => {
  try {
    const currentExe = process.execPath;
    const appFolder  = path.dirname(currentExe);

    let exeBasename = path.basename(targetExeName);
    if (!path.extname(exeBasename)) exeBasename += '.exe';

    const targetExe = path.join(appFolder, exeBasename);

    if (path.resolve(targetExe) === path.resolve(currentExe)) {
      event.reply('launch-status', { success: false, message: 'Name conflict: this exe matches the launcher.' });
      return;
    }

    if (!fs.existsSync(targetExe)) fs.linkSync(currentExe, targetExe);
    createdFiles.add(targetExe);
    addToManifest(targetExe);

    const args = app.isPackaged ? [] : [__dirname];

    const child = spawn(targetExe, args, {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, QUEST_DUMMY_MODE: 'true', QUEST_GAME_TITLE: gameTitle }
    });

    child.on('error', (err) => {
      event.reply('launch-status', { success: false, message: `Spawn failed: ${err.message}` });
    });

    activeProcesses.push(child);
    child.unref();

  } catch (error) {
    event.reply('launch-status', { success: false, message: `Launch failed: ${error.message}` });
  }
});

// legacy mode window, use this when games are not working
ipcMain.on('open-legacy-mode', (event) => {
  const legacyPath = getLegacyFolderPath();

  if (!fs.existsSync(legacyPath)) {
    event.reply('launch-status', { success: false, message: `Legacy folder not found at: ${legacyPath}` });
    return;
  }

  const batContent = [
    '@echo off',
    `cd /d "${legacyPath}"`,
    'echo ============================================',
    'echo  Legacy Mode - Manual EXE Builder',
    'echo ============================================',
    'echo.',
    'echo 1. Run:  npm install        (first time only, installs pkg)',
    'echo 2. Run:  npx pkg index.js --targets node18-win-x64 --output GAME-NAME.exe',
    'echo 3. Open ..\\discord-executables.txt, find the exact subfolder path',
    'echo    for your game, then manually create that folder structure and',
    'echo    move GAME-NAME.exe into it yourself.',
    'echo.',
    'cmd /k'
  ].join('\r\n');

  const batPath = path.join(app.getPath('temp'), 'quest-legacy-mode.bat');

  try {
    fs.writeFileSync(batPath, batContent, 'utf-8');
    spawn('cmd.exe', ['/c', 'start', '""', batPath], { detached: true, stdio: 'ignore' }).unref();
  } catch (error) {
    event.reply('launch-status', { success: false, message: `Could not open Legacy Mode: ${error.message}` });
  }
});
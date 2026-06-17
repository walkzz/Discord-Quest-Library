const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100, // default size window, can be changed later
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

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('window-control', (event, command) => {
  if (command === 'minimize') mainWindow.minimize();
  if (command === 'maximize') mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  if (command === 'close') mainWindow.close();
});

ipcMain.handle('get-game-list', async () => {
  const filePath = path.join(__dirname, 'discord-executables.txt');
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const games = [];

  for (let i = 0; i < lines.length; i += 2) {
    if (lines[i] && lines[i + 1]) {
      const gameName = lines[i];
      const fullPath = lines[i + 1];
      const exeName = path.basename(fullPath); 
      
      games.push({
        name: gameName,
        exe: exeName
      });
    }
  }
  return games;
});

ipcMain.on('launch-dummy', (event, targetExeName, gameTitle) => {
  try {
    const currentExe = process.execPath;
    const appFolder = path.dirname(currentExe);
    const targetExe = path.join(appFolder, targetExeName);

    if (!fs.existsSync(targetExe)) {
      fs.linkSync(currentExe, targetExe);
    }

    const workerPath = path.join(__dirname, 'worker.js');
    const child = spawn(targetExe, [workerPath, gameTitle], {
      detached: true,
      stdio: 'ignore'
    });

    child.unref();
    // didn't put successful message here cuz it will bloat the screen, useless, not needed.
  } catch (error) {
    event.reply('launch-status', { success: false, message: `System error: ${error.message}` });
  }
});
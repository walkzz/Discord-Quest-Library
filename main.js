const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const isDummyMode = process.argv.includes('--dummy-mode');

let mainWindow;

function createWindow() {
  if (isDummyMode) {
    const titleIndex = process.argv.indexOf('--dummy-mode') + 1;
    const gameTitle = process.argv[titleIndex] || "Discord Game";
    
    // minimized window where you click the "launch quest" button
    const dummyWin = new BrowserWindow({
      width: 450, 
      height: 250,
      title: gameTitle,
      autoHideMenuBar: true,
      backgroundColor: '#202020'
    });

    dummyWin.loadURL(`data:text/html;charset=utf-8,
      <body style="background-color:%23202020; color:white; font-family:'Segoe UI', Tahoma, sans-serif; text-align:center; padding-top: 50px;">
        <h2>${gameTitle} Simulation Active</h2>
        <p style="color:%23a3a3a3;">Discord is now tracking the application.<br>Leave this window open for 15 minutes.</p>
      </body>
    `);
  } else {
    // main window
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('window-control', (event, command) => {
  if (!mainWindow) return;
  if (command === 'minimize') mainWindow.minimize();
  if (command === 'maximize') mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  if (command === 'close') app.quit(); 
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

    const child = spawn(targetExe, ['--dummy-mode', gameTitle], {
      detached: true,
      stdio: 'ignore'
    });

    child.unref();
  } catch (error) {
    event.reply('launch-status', { success: false, message: `System error: ${error.message}` });
  }
});
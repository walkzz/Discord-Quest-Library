const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
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

ipcMain.on('launch-dummy', (event, targetExeName) => {
  const activeQuestsDir = path.join(__dirname, 'active_quests');
  
  if (!fs.existsSync(activeQuestsDir)) {
    fs.mkdirSync(activeQuestsDir);
  }

  const sourceExe = path.join(__dirname, 'dummy.exe');
  const targetExe = path.join(activeQuestsDir, targetExeName);

  if (!fs.existsSync(sourceExe)) {
    event.reply('launch-status', { success: false, message: 'Base dummy.exe not found. Build it using index.js first.' });
    return;
  }

  try {
    if (!fs.existsSync(targetExe)) {
      fs.copyFileSync(sourceExe, targetExe);
    }
    
    exec(`start "${targetExeName}" "${targetExe}"`, (error) => {
      if (error) {
        event.reply('launch-status', { success: false, message: `Windows prevented launch: ${error.message}` });
      }
    });
    
  } catch (error) {
    event.reply('launch-status', { success: false, message: `File system error: ${error.message}` });
  }
});
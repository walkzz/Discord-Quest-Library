const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  controlWindow: (command) => ipcRenderer.send('window-control', command),
  getGameList: () => ipcRenderer.invoke('get-game-list'),
  launchDummy: (exeName) => ipcRenderer.send('launch-dummy', exeName),
  onLaunchStatus: (callback) => ipcRenderer.on('launch-status', (_event, data) => callback(data))
});
const { app, BrowserWindow } = require('electron');
const gameTitle = process.argv[2] || "Discord Game";

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 450,
    height: 250,
    title: gameTitle,
    autoHideMenuBar: true,
    backgroundColor: '#202020'
  });

  win.loadURL(`data:text/html;charset=utf-8,
    <body style="background-color:%23202020; color:white; font-family:'Segoe UI', Tahoma, sans-serif; text-align:center; padding-top: 50px;">
      <h2>${gameTitle} Simulation Active</h2>
      <p style="color:%23a3a3a3;">Discord is now tracking the game.<br>Leave this window open for 15 minutes.</p>
    </body>
  `);
});

// this closes the application, No memory leak? must invastgate
app.on('window-all-closed', () => {
  app.quit();
});
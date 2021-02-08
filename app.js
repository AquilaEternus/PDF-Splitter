const { app, BrowserWindow, ipcMain, Menu } = require('electron');

process.env.NODE_ENV = 'production';

const createWindow = () => {
   const win = new BrowserWindow({
      width: 800,
      height: 500,
      minHeight: 500,
      minWidth: 800,
      webPreferences: {
         nodeIntegration: true,
         devTools: false
      },
   });

   Menu.setApplicationMenu(null);

   win.loadFile('./views/index.html');
};

ipcMain.on('get-downloads-path', (e) => {
   e.returnValue = app.getPath('downloads');
})

app.on('ready', createWindow);

app.on('window-all-closed', () => {
   if (process.platform !== 'darwin') app.quit();
});

const { app, BrowserWindow, ipcMain, Menu } = require('electron');

// Set env
process.env.NODE_ENV = 'production';

const createWindow = () => {
   //Create the browser window
   const win = new BrowserWindow({
      width: 800,
      height: 500,
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

// Quit when all windows are closed.
app.on('window-all-closed', () => {
   if (process.platform !== 'darwin') app.quit();
});

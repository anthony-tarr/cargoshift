const electron = require('electron');
const app = electron.app;
const path = require('path');
const isDev = require('electron-is-dev');
require('./datastore');

const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 700,
    minHeight: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  const prodPath = path.join(__dirname, '/build/index.html');
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : prodPath);
  mainWindow.on('closed', () => (mainWindow = null));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

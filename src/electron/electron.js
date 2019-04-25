const path = require('path');
const url = require('url');
const electron = require('electron');
const { ipcMain } = require('electron');
const { createMainMenu, createPopupMenu } = require('./menus');
const { startWatchingFiles, stopWatchingFiles } = require('./watcher');
const { startServer, stopServer, getServerStatus, getServerLog, setSendMessageHook } = require('./projectServer');
const Store = require('./store.js');
const appWindowMessages = require('./commons/appWindowMessages');
const constants = require('./commons/constants');

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const Menu = electron.Menu;

let menuOptions = {};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// initialize the storage for the user-preferences
const store = new Store({
  configName: 'user-preferences',
  defaults: {
    // 800x600 is the default size of our window
    windowBounds: { width: 800, height: 600 }
  }
});

// Send message to the application
// Possible types:
// * generateThisProjectIndices - instruction to generate indices for the current source code
// * watcher_fileWasAdded - watcher says that some file was added into the watched dirs
// * watcher_fileWasChanged - watcher says that some file was changed in the watched dirs
// * watcher_fileWasRemoved - watcher says that some file was removed from the watched dirs
function sendMainWindowMessage(type, payload = {}) {
  mainWindow.webContents.send(
    'mainWindowMessage',
    { type, payload }
  );
}

function showContextMenu(menuType, options) {
  const contextMenu = createPopupMenu(menuType, options, sendMainWindowMessage);
  contextMenu.popup({window: mainWindow});
}

function createWindow () {

  let { width, height } = store.get('windowBounds');

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width, height, webPreferences: {
      webSecurity: false,
      devTools: false
    }
  });

  // and load the index.html of the app.
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../build/index.html'),
    protocol: 'file:',
    slashes: true
  });

  mainWindow.loadURL(startUrl);
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // The BrowserWindow class extends the node.js core EventEmitter class, so we use that API
  // to listen to events on the BrowserWindow. The resize event is emitted when the window size changes.
  mainWindow.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = mainWindow.getBounds();
    // Now that we have them, save them using the `set` method.
    store.set('windowBounds', { width, height });

    mainWindow.webContents.closeDevTools();

  });

  // Set custom application menu
  Menu.setApplicationMenu(createMainMenu(app, mainWindow, sendMainWindowMessage, menuOptions));

  // Set message hook for the project server
  setSendMessageHook(messageData => {
    sendMainWindowMessage(appWindowMessages.PROJECT_SERVER_STATUS_RESPONSE, messageData);
  });

  ipcMain.on('appWindowMessage', (event, arg) => {
    const {type, payload} = arg;
    if (type === appWindowMessages.WATCHER_START_WATCHING_FILES) {
      const { paths, projectDirPath } = payload;
      startWatchingFiles(paths, sendMainWindowMessage);
      menuOptions.isProjectOpen = true;
      Menu.setApplicationMenu(createMainMenu(app, mainWindow, sendMainWindowMessage, menuOptions));
      if (projectDirPath) {
        mainWindow.setTitle(`${projectDirPath}`);
      }
    } else if (type === appWindowMessages.WATCHER_STOP_WATCHING_FILES) {
      stopWatchingFiles();
      menuOptions.isProjectOpen = false;
      Menu.setApplicationMenu(createMainMenu(app, mainWindow, sendMainWindowMessage, menuOptions));
      mainWindow.setTitle('Webcodesk');
    } else if (type === appWindowMessages.PROJECT_SERVER_START) {
      startServer(payload)
    } else if (type === appWindowMessages.PROJECT_SERVER_STOP) {
      stopServer()
    } else if (type === appWindowMessages.PROJECT_SERVER_STATUS_REQUEST) {
      sendMainWindowMessage(appWindowMessages.PROJECT_SERVER_STATUS_RESPONSE, getServerStatus());
    } else if (type === appWindowMessages.PROJECT_SERVER_LOG_REQUEST) {
      sendMainWindowMessage(appWindowMessages.PROJECT_SERVER_LOG_RESPONSE, getServerLog());
    } else if (type === appWindowMessages.CONTEXT_MENU_RESOURCE_TREE_VIEW_ITEM) {
      showContextMenu(constants.CONTEXT_MENU_FOR_RESOURCE_OBJECT, payload);
    } else if (type === appWindowMessages.OPEN_URL_IN_EXTERNAL_BROWSER) {
      const { url } = payload;
      electron.shell.openExternal(url);
    } else if (type === appWindowMessages.AUTHENTICATION_USER_SIGNED_IN) {
      const { userProfile } = payload;
      menuOptions.userProfile = userProfile;
      Menu.setApplicationMenu(createMainMenu(app, mainWindow, sendMainWindowMessage, menuOptions));
    } else if (type === appWindowMessages.AUTHENTICATION_USER_SIGNED_OUT) {
      menuOptions.userProfile = null;
      Menu.setApplicationMenu(createMainMenu(app, mainWindow, sendMainWindowMessage, menuOptions));
    }
  });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  app.quit();

});

// app.on('activate', function () {
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (mainWindow === null) {
//     createWindow();
//   }
// });

app.on('will-quit', function(event) {
  event.preventDefault();
  setSendMessageHook(null);
  stopWatchingFiles();
  stopServer(function() {
    app.exit(0);
  });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

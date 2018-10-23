import {
    app,
    BrowserWindow,
    ipcMain
} from 'electron'

import Service from './Service';
import Tabs from './Tabs';
import Router from './Router';
import routes from './Controllers/index';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

let mainWindow;
let tabs;
let router;
let service;

const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height: 563,
        width: 1000,
        useContentSize: true,
        show: false,
        frame: true
    });

    service = new Service(ipcMain);
    router = new Router(service);
    tabs = Tabs.instance();
    router.register(routes);

    mainWindow.loadURL(winURL);

    mainWindow.on('closed', () => {
        tabs.closeAll();

        mainWindow = null
    });

    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
    });
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

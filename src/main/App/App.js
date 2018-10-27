import Service from './Service';
import electron from "electron";
import Router from '../Router';

let instance;

class App {

    constructor(electronApp, ipcMain) {
        this.electronApp = electronApp;
        this.ipc = ipcMain;
        this.service = new Service(this.ipc);
        this.connection = null;
        this.router = new Router(this.service);

        setTimeout(() => {
            this.router.register(
                require('./Controllers/index').default
            );
        }, 0);
    }

    setConnection(connection) {
        this.connection = connection;
    }

    static instance(electronApp = electron.remote.app, ipcMain = electron.ipcRenderer) {
        if(! instance) {
            instance = new App(electronApp, ipcMain);
        }

        return instance;
    }

}

export default App;
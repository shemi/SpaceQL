import * as events from '../../utils/main-events';
import Service from './Service';
import Favorite from './Favorite';
import Connection from "./Connection";

class App {

    constructor(electronApp, mainWindow, ipcMain) {
        this.electronApp = electronApp;
        this.mainWindow = mainWindow;
        this.ipc = ipcMain;
        this.service = new Service(this.ipc);

        this.listenToRendererEvents();
    }

    listenToRendererEvents() {
        //connections
        this.service.on(events.CONNECT, Connection.createConnection);
        this.service.on(events.TEST_CONNECTION, Connection.testConnection);

        //favorites
        this.service.on(events.GET_ALL_FAVORITES, Favorite.getAllAndTransform);
        this.service.on(events.SAVE_FAVORITE, Favorite.createUpdate);
    }



}

export default App;
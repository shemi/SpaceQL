import * as events from '../../utils/main-events';
import Service from './Service';
import ConnectionController from "./Controllers/ConnectionController";
import TableController from "./Controllers/TableController";
import DatabaseController from "./Controllers/DatabaseController";
import QueryController from "./Controllers/QueryController";
import electron from "electron";

let instance;

class App {

    constructor(electronApp, ipcMain) {
        this.electronApp = electronApp;
        this.ipc = ipcMain;
        this.service = Service;
        this.connection = null;

        this.listenToRendererEvents();
    }

    listenToRendererEvents() {
        //connections
        this.service.on(events.CONNECT, ConnectionController.call('connect'));
        this.service.on(events.TEST_CONNECTION, ConnectionController.call('test'));
        this.service.on('TableController@content', TableController.call('content'));
        this.service.on('DatabaseController@query', DatabaseController.call('query'));

        this.service.on('QueryController@exec', QueryController.call('exec'));
        this.service.on('QueryController@nextChunk', QueryController.call('nextChunk'));
        this.service.on('QueryController@deleteChunk', QueryController.call('deleteChunk'));
        this.service.on('QueryController@slowDown', QueryController.call('slowDown'));
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
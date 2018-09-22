import * as events from '../../utils/main-events';
import * as connectors from './Connections';
import * as drivers from './Drivers';
import Service from './Service';
import uuid from 'uuid/v4';
import Favorite from './Favorite';

class App {

    constructor(electronApp, mainWindow, ipcMain) {
        this.electronApp = electronApp;
        this.mainWindow = mainWindow;
        this.ipc = ipcMain;
        this.service = new Service(this.ipc);
        this.connections = {};

        this.listenToRendererEvents();
    }

    listenToRendererEvents() {
        this.ipc.on(events.CONNECT, this.connect.bind(this));
        this.service.on(events.TEST_CONNECTION, this.testConnection.bind(this));
        this.service.on(events.GET_ALL_FAVORITES, Favorite.getAllAndTransform);
        this.service.on(events.SAVE_FAVORITE, Favorite.createUpdate);
    }


    async testConnection(connectionForm) {
        let {type, driver, config, dbConfig} = App.transformConnectionForm(connectionForm);

        const Connector = connectors[type],
            Driver = drivers[driver];

        if(! Connector) {
            throw new Error(`Connector with the name ${type} not found.`);
        }

        if(! Driver) {
            throw new Error(`Driver with the name ${driver} not found.`);
        }

        let connection = new Connector(config, dbConfig, Driver);

        return await connection.test();
    }

    async connect(connectionForm) {
        let {type, driver, config, dbConfig} = App.transformConnectionForm(connectionForm);

        const Connector = connectors[type],
              Driver = drivers[driver];

        if(! Connector) {
            throw new Error(`Connector with the name ${type} not found.`);
        }

        if(! Driver) {
            throw new Error(`Driver with the name ${driver} not found.`);
        }

        let connection = await (new Connector(config, dbConfig, Driver))
            .connect();

        let connectionId = this.setConnection(connection);

        return {
            connectionId
        }
    }

    setConnection(connection) {
        if(connection.getId()) {
            return connection.getId();
        }

        const id = uuid();

        connection.setId(id);
        this.connections[id] = connection;

        return id;
    }

    connection(id) {
        return this.connections[id];
    }

    static transformConnectionForm(form) {
        return {
            type: form.connectionType,
            driver: form.driver,
            dbConfig: {
                host: form.dbHost,
                port: form.dbPort,
                user: form.dbUsername,
                password: form.dbPassword,
                database: form.dbName,
            },
            config: {
                host: form.sshHost,
                port: form.sshPort,
                user: form.sshUsername,
                password: form.sshPassword,
                key: form.sshKeyFilePath,
                socket: form.socketPath
            }
        }
    }

}

export default App;
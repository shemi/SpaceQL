import * as connectors from './Connections';
import * as drivers from './Drivers';
import uuid from 'uuid/v4';
import Favorite from "./Favorite";
import DatabasesCollection from './DatabasesCollection';

const connections = {};

export default class Connection {

    constructor(connectionForm) {
        let {type, driver, config, dbConfig} = Connection.transformConnectionForm(connectionForm);

        this._original = connectionForm;
        this._type = type;
        this._driver = driver;
        this._config = config;
        this._dbConfig = dbConfig;
        this.id = uuid();

        const Connector = connectors[this._type],
            Driver = drivers[this._driver];

        if (!Connector) {
            throw new Error(`Connector with the name ${type} not found.`);
        }

        if (!Driver) {
            throw new Error(`Driver with the name ${driver} not found.`);
        }

        this._connection = new Connector(this._config, this._dbConfig, Driver);
        this.driver = null;

        this.databases = new DatabasesCollection;
        this.systemDatabases = new DatabasesCollection;

    }

    test() {
        return this._connection.test();
    }

    async connect() {
        try {
            this.driver = await this._connection.connect();
            this.databases.setDriver(this.driver);
            this.systemDatabases.setDriver(this.driver);
            connections[this.id] = this;
        } catch (e) {
            throw e;
        }

        return this;
    }

    getStartData() {
        return this.driver.getInitData()
            .then(data => {
                let favorite = this._original.id ? Favorite.get(this._original.id) : null;

                return {
                    connection: {
                        id: this.id,
                        ...data
                    },
                    favorite: favorite ? favorite.toCollection() : null
                }
            });
    }

    static getConnection(id) {
        return connections[id];
    }

    static testConnection(connectionForm) {
        let inst = new Connection(connectionForm);

        return inst.test();
    }

    static createConnection(connectionForm) {
        let inst = new Connection(connectionForm);

        return inst.connect()
            .then(c => c.getStartData());
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
import * as connectors from './Connections';
import * as drivers from './Drivers';
import DatabasesCollection from './DatabasesCollection';
import Database from "./Database";

export default class Connection {

    constructor(connectionForm) {
        let {type, driver, config, dbConfig} = connectionForm;

        this._original = connectionForm;
        this._type = type;
        this._driver = driver;
        this._config = config;
        this._dbConfig = dbConfig;

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
        this.version = null;
        this.collations = [];
        this.characterSets = [];
    }

    async test() {
        return await this._connection.test();
    }

    async connect() {
        try {
            this.driver = await this._connection.connect();
            this.databases.setDriver(this.driver);
            this.systemDatabases.setDriver(this.driver);
        } catch (e) {
            throw e;
        }

        return this;
    }

    async initData() {
        const {
            databases,
            version,
            character_sets,
            collations
        } = await this.driver.getInitData();

        if(databases && databases.length > 0) {
            await this.setDatabases(databases);
        }

        this.version = version;
        this.characterSets = character_sets;
        this.collations = collations;

        return this;
    }

    async createDatabase(form) {
        let rawDatabase = await this.driver.createDatabase(form);

        this.databases.push(rawDatabase);

        return this.toRenderer();
    }

    async use(database) {
        await this.driver.use(database);

        return this.driver;
    }

    async getTables(database) {
        return await this.driver.getTables(database);
    }

    async getColumns(database, table) {
        return await this.driver.getColumns(database, table);
    }

    async getStorageEngines() {
        return await this.driver.getEngines();
    }

    async setDatabases(databases) {
        let rawDatabase,
            database,
            firstTable = this._dbConfig.database,
            selectedDatabase;

        for (rawDatabase of databases) {
            database = new Database(rawDatabase, this);

            if(database.isSystemDatabase()) {
                this.systemDatabases.push(database);
            } else {
                this.databases.push(database);
            }
        }

        if(firstTable) {
            selectedDatabase = this.databases.find({name: firstTable});
        } else {
            selectedDatabase = this.databases.first();
        }

        if(selectedDatabase instanceof Database) {
            await selectedDatabase.loadTables();
        }

        return this;
    }

    toRenderer() {
        return {
            name: this._dbConfig.user+'@'+this._dbConfig.host+':'+this._dbConfig.port,
            version: this.version,
            databases: this.databases.toRenderer(),
            systemDatabases: this.systemDatabases.toRenderer(),
            collations: this.collations,
            characterSets: this.characterSets
        }
    }

}
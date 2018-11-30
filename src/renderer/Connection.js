import DatabasesCollection from "./DatabasesCollection";
import Service from "./Service";
import Vue from "vue";


export default class Connection {

    constructor(rawConnection, originalForm = {}, tab) {

        let {
            name,
            databases, privileges,
            version, collations,
            characterSets
        } = rawConnection;

        this.tab = tab;
        this.form = originalForm;
        this.name = name;
        this.databases = new DatabasesCollection(databases || [], this);
        this.privileges = privileges || [];
        this.collations = collations || [];
        this.characterSets = characterSets || [];
        this.selectedDatabase = null;

        Vue.set(this, 'selectedDatabase', this.getFirstDatabaseToSelect());

        this.log = [];
        this.version = version.version;
        this.fullVersion = version.fullVersion;
        this.tableStorageEngines = [];

    }

    setData(rawConnection) {
        let {
            databases, privileges,
            collations, characterSets
        } = rawConnection;

        this.name = name;
        this.privileges = privileges || [];
        this.collations = collations || [];
        this.characterSets = characterSets || [];

        if(databases && Array.isArray(databases)) {
            for(let database of databases) {
                let exists = this.databases.first({name: database.name});

                if(! exists) {
                    this.databases.push(database);
                } else {
                    exists.refreshData(database);
                }
            }
        }
    }

    getFirstDatabaseToSelect() {
        if(this.form.dbName) {
            let database = this.databases.find({name: this.form.dbName});

            if(database) {
                return database;
            }
        }

        return this.databases.isNotEmpty() ? this.databases.first() : null;
    }

    async select(name) {
        const database = this.databases.find({name});

        if(! database) {
            return;
        }

        if(this.selectedDatabase) {
            this.selectedDatabase.deactivated();
        }

        Vue.set(this, 'selectedDatabase', database);

        return await this.selectedDatabase.loadTables();
    }

    async createDatabase(form) {
        return Service.sendTo(this.tabId, 'ConnectionController@createDatabase', form)
            .then(rawConnection => {
                this.setData(rawConnection);

                return this.select(form.name);
            });
    }

    setTab(tab) {
        this.tab = tab;

        return this;
    }

    get tabId() {
        if(! this.tab) {
            return null;
        }

        return this.tab.id;
    }

    async getStorageEngines() {
        if(this.tableStorageEngines.length > 0) {
            return this.tableStorageEngines;
        }

        let engines = await Service.sendTo(this.tabId, 'ConnectionController@getStorageEngines');
        this.tableStorageEngines = [];
        for(let engine of engines) {
            this.tableStorageEngines.push(engine);
        }

        return this.tableStorageEngines;
    }

    static async connect(connectionForm, tab) {
        const rawConnection = await Service.sendTo(tab.id, 'ConnectionController@connect', connectionForm),
            inst = new Connection(rawConnection, connectionForm, tab);

        return inst;
    }

    static async test(connectionForm, tab) {
        return await Service.sendTo(tab.id, 'ConnectionController@test', connectionForm);
    }

}
import DatabasesCollection from "./DatabasesCollection";
import Service from "./Service";
import Vue from "vue";

export default class Connection {

    constructor(rawConnection, originalForm = {}, tab) {

        let {
            name,
            databases, privileges,
            version
        } = rawConnection;

        this.tab = tab;
        this.form = originalForm;
        this.name = name;
        this.databases = new DatabasesCollection(databases || [], this);
        this.privileges = privileges || [];
        this.selectedDatabase = null;

        Vue.set(this, 'selectedDatabase', this.getFirstDatabaseToSelect());

        this.log = [];
        this.version = version.version;
        this.fullVersion = version.fullVersion;

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

    static async connect(connectionForm, tab) {
        const rawConnection = await Service.sendTo(tab.id, 'ConnectionController@connect', connectionForm),
            inst = new Connection(rawConnection, connectionForm, tab);

        return inst;
    }

    static async test(connectionForm, tab) {
        return await Service.sendTo(tab.id, 'ConnectionController@test', connectionForm);
    }

}
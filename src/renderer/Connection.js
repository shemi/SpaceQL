import DatabasesCollection from "./DatabasesCollection";
import Service from "./Service";

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
        this.selectedDatabase = this.getFirstDatabaseToSelect();
        this.privileges = privileges || [];
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

    select(name) {
        this.selectedDatabase = this.databases.find({name});

        if(! this.selectedDatabase) {
            return;
        }

        this.selectedDatabase.loadTables()
            .catch(err => {
                console.error(err);
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

    static async connect(connectionForm, tab) {
        const rawConnection = await Service.sendTo(tab.id, 'ConnectionController@connect', connectionForm),
            inst = new Connection(rawConnection, connectionForm, tab);

        return inst;
    }

    static async test(connectionForm, tab) {
        return await Service.sendTo(tab.id, 'ConnectionController@test', connectionForm);
    }

}
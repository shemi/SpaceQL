import DatabasesCollection from "./DatabasesCollection";
import Service from "./Service";

export default class Connection {

    constructor(rawConnection, originalForm = {}) {

        let {
            id, name,
            databases, privileges,
            version
        } = rawConnection;

        this.form = originalForm;

        this.id = id;
        this.name = name;
        this.databases = new DatabasesCollection(databases || [], this);
        this.selectedDatabase = this.getFirstDatabaseToSelect();
        this.privileges = privileges || [];
        this.log = [];
        this.version = version.version;
        this.fullVersion = version.fullVersion;
    }

    getFirstDatabaseToSelect() {
        console.log(this.form);
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
    }

}
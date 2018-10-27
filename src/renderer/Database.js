import TablesCollection from "./TablesCollection";
import Service from "./Service";
import Query from "./Query";

export default class Database {

    constructor(data, connection) {
        let {name, tables,
            default_character_set,
            default_collation} = data;

        this.name = name;
        this.tables = new TablesCollection(tables || [], this);
        this.tablesLoaded = this.tables.isNotEmpty();
        this.selectedTable = null;
        this.default_character_set = default_character_set;
        this.default_collation = default_collation;

        this.connection = connection;

        this.query = new Query(this);

        this.loadingTables = false;
    }

    selectFirstTable() {
        if(! this.tablesLoaded) {
            return;
        }

        this.selectedTable = this.tables.first();
    }

    async loadTables(refresh = false) {
        if(this.tablesLoaded && ! refresh) {
            return this;
        }

        this.loadingTables = true;

        if(refresh) {
            this.tablesLoaded = false;
            this.tables.deleteAll();
        }

        const tables = await Service.sendTo(this.tabId, 'DatabaseController@tables', this.name);

        this.tables.collect(tables);
        this.tablesLoaded = true;
        this.loadingTables = false;

        return this;
    }

    get tab() {
        return this.connection.tab;
    }

    get tabId() {
        return this.connection.tabId;
    }

}
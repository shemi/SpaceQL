import TablesCollection from "./TablesCollection";
import Service from "./Service";
import Query from "./Query";
import Vue from "vue";

export default class Database {

    constructor(data, connection) {
        let {name, tables,
            default_character_set,
            default_collation} = data;

        this.connection = connection;

        this.name = name;
        this.tables = new TablesCollection(tables || [], this);
        this.tablesLoaded = this.tables.isNotEmpty();
        this.selectedTable = null;
        this.default_character_set = default_character_set;
        this.default_collation = default_collation;
        this.query = new Query(this);

        this.loadingTables = false;
        this.selectFirstTable();
    }

    selectFirstTable() {
        if(! this.tablesLoaded) {
            return;
        }

        this.selectTable(this.tables.first());
    }

    selectTable(table) {
        if(typeof table === 'string') {
            table = this.tables.first({name: table});
        }

        if(this.selectedTable) {
            this.selectedTable.resetScroll();
        }

        Vue.set(this, 'selectedTable', table);
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

        this.selectFirstTable();

        return this;
    }

    deactivated() {
        this.tables.each(table => {
            table.resetScroll();
        });
    }

    get toAutocomplete() {
        let tables = [];

        for(let table of this.tables.all()) {
            tables.push(table.toAutocomplete);
        }

        return tables;
    }

    get tab() {
        return this.connection.tab;
    }

    get tabId() {
        return this.connection.tabId;
    }

}
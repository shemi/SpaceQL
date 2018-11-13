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

    refreshData(data) {
        let {default_character_set,
            default_collation} = data;

        this.default_character_set = default_character_set;
        this.default_collation = default_collation;
    }

    selectFirstTable() {
        if(! this.tablesLoaded) {
            return;
        }

        this.selectTable(this.tables.first());
    }

    getTable(name) {
        return this.tables.first({name});
    }

    selectTable(table) {
        if(typeof table === 'string') {
            table = this.getTable(table);
        }

        if(this.selectedTable) {
            this.selectedTable.resetScroll();
        }

        Vue.set(this, 'selectedTable', table);
    }

    selectTableOrFirst(table) {
        if(table && this.getTable(table)) {
            this.selectTable(table);

            return;
        }

        this.selectFirstTable();
    }

    async loadTables(refresh = false) {
        const oldSelectedTable = this.selectedTable ? this.selectedTable.name : null;

        if(this.tablesLoaded && ! refresh) {
            return this;
        }

        this.loadingTables = true;

        if(refresh) {
            this.tablesLoaded = false;
            this.selectedTable = null;
            this.tables.deleteAll();
        }

        const tables = await Service.sendTo(this.tabId, 'DatabaseController@tables', this.name, refresh);

        this.tables.collect(tables);
        this.tablesLoaded = true;
        this.loadingTables = false;

        if(refresh) {
            this.selectTableOrFirst(oldSelectedTable);
        } else {
            this.selectFirstTable();
        }

        return this;
    }

    async createTable(form) {
        try {
            const res = await Service.sendTo(this.tabId, 'DatabaseController@createTable', this.name, form);

            this.tab.log.info(res.head);

        } catch (e) {
            this.tab.log.error(e);

            throw e;
        }

        this.loadTables(true)
            .catch(err => {

            });

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
import TablesCollection from "./TablesCollection";

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
    }

}
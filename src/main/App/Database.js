import TablesCollection from './TablesCollection';

export default class Database {

    constructor(data, driver) {
        let {database, tables,
            default_character_set,
            default_collation} = data;

        this.name = database;
        this.tables = TablesCollection(tables, this);
        this.default_character_set = default_character_set;
        this.default_collation = default_collation;
        this.driver = driver;
    }

    async queryTable(tableName, query, order, limit) {
        const query = this.driver
            .use(this.name)
            .builder()
            .select(tableName);

        if(query && query.value) {

        }

    }

}
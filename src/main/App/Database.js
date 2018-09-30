import TablesCollection from './TablesCollection';

export default class Database {

    constructor(data, driver) {
        let {database, tables,
            default_character_set,
            default_collation} = data;

        this.name = database;
        this.tables = new TablesCollection(tables || [], this);
        this.default_character_set = default_character_set;
        this.default_collation = default_collation;
        this.driver = driver;

        this.tablesLoaded = false;
    }

    async getTables(refresh = false) {
        if(! refresh && this.tablesLoaded) {
            return this.tables;
        }

        await this.loadTables();

        return this.tables;
    }

    async loadTables() {
        let tables = await this.driver.getTables(this.name);

        this.tables.collect(tables);
        this.tablesLoaded = true;
    }

    async queryTable(tableName, query, order, limit) {
        const builder = this.driver
            .use(this.name)
            .builder()
            .select(tableName);

        if(query && query.value) {

        }
    }

    isSystemDatabase() {
        return ['information_schema', 'performance_schema', 'mysql', 'sys']
            .indexOf(this.name.toLocaleLowerCase()) >= 0;
    }

    toRenderer() {
        return {
            name: this.name,
            tables: this.tables.toRenderer(),
            default_character_set: this.default_character_set,
            default_collation: this.default_collation,
        }
    }

}
import TablesCollection from './TablesCollection';
import ColumnsCollection from "./ColumnsCollection";

export default class Database {

    constructor(data, connection) {
        let {database, tables,
            default_character_set,
            default_collation} = data;

        this.name = database;
        this.tables = new TablesCollection(tables || [], this);
        this.default_character_set = default_character_set;
        this.default_collation = default_collation;
        this.connection = connection;

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
        let tables = await this.connection.getTables(this.name);

        this.tables.collect(tables);
        this.tablesLoaded = true;
    }

    async getColumns(table) {
        return this.connection.getColumns(this.name, table);
    }

    async queryTable(tableName, query, order, limit) {
        const db = await this.connection.use(this.name);

        const builder = db.builder()
            .table(tableName)
            .take(limit);

        if(query && query.column) {
            builder.where(query.column, query.operator, query.value);
        }

        if(order && order.column) {
            builder.orderBy(order.column, order.direction)
        }

        return await builder.get();
    }

    async query(query) {
        const db = await this.connection.use(this.name);
        const results = await db.query(query);

        return results.map((set) => {
            if(set.columns) {
                let columns = new ColumnsCollection(set.columns, {});
                set.columns = columns.toRenderer();
            }

            return set.toJSON();
        });
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
import TablesCollection from './TablesCollection';
import RowsChunks from './RowsChunks';

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

    async queryTable(tableName, query, order, limit) {
        const db = await this.connection.use(this.name);

        const builder = db.builder()
            .table(tableName)
            .take(limit);
        

        if(query && query.value) {

        }

        return await builder.get();
    }

    query(query) {
        const chunkSize = RowsChunks.getRowsPerChunk();

        return new Promise((resolve, reject) => {
            this.connection.use(this.name)
                .then(db => db.query(query))
                .then(([rowsSets, columnsSets]) => {
                    rowsSets = (! Array.isArray(rowsSets[0])) ? [rowsSets] : rowsSets;
                    columnsSets = (! Array.isArray(columnsSets[0])) ? [columnsSets] : columnsSets;

                    let sets = [];

                    for(let setIndex in rowsSets) {
                        let rows = rowsSets[setIndex];
                        let columns = columnsSets[setIndex];
                        let total = rows ? rows.length : 0;
                        let chunksId = null;

                        if(total > chunkSize) {
                            let chunk = RowsChunks.create(rows);

                            rows = chunk.rows;
                            chunksId = chunk.id;
                        }

                        sets.push([rows, columns, chunksId, total, setIndex]);
                    }

                    resolve(sets);
                })
                .catch(err => reject(err));
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
import ColumnsInfoCollection from "./ColumnsInfoCollection";
import app from './App';
import ColumnsCollection from "./ColumnsCollection";

export default class Table {

    constructor(data, database) {
        let { name, type,
            engine, format,
            rows, created_at,
            collation, comment
        } = data;

        this.name = name;
        this.type = type;
        this.engine = engine;
        this.format = format;
        this.rows = rows;
        this.created_at = created_at;
        this.collation = collation;
        this.comment = comment;
        this.columns = new ColumnsInfoCollection([], this);
        this.columnsLoaded = false;

        this.database = database;

        this.getColumns()
            .then(c => {this.updateFront()});
    }

    async getColumns(refresh = false) {
        if(! refresh && this.columnsLoaded) {
            return this.columns;
        }

        this.columns.deleteAll();

        this.columns.collect(
            await this.database.getColumns(this.name)
        );

        return this.columns;
    }

    updateFront() {
        app.instance().service
            .send(`UpdateTable@${this.name}`, this.toRenderer())
    }

    async getContent(query = null, order = null, limit = 200) {
        const columns = new ColumnsCollection([], this);

        let results = await this.database.queryTable(this.name, query, order, limit);

        results.columns = columns.collect(results.columns).all();

        return results.toJSON();
    }

    toRenderer() {
        return {
            name: this.name,
            type: this.type,
            engine: this.engine,
            format: this.format,
            rows: this.rows,
            created_at: this.created_at,
            collation: this.collation,
            comment: this.comment,
            columns: this.columns.toRenderer()
        }
    }

}
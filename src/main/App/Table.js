import ColumnsCollection from "./ColumnsCollection";
import Collection from "../../utils/Collection";


export default class Table {

    constructor(data, database) {

        let { name, type,
            engine, format,
            rows, created_at,
            collation, comment,
            columns
        } = data;

        this.name = name;
        this.type = type;
        this.engine = engine;
        this.format = format;
        this.rows = rows;
        this.created_at = created_at;
        this.collation = collation;
        this.comment = comment;
        this.columns = new ColumnsCollection(columns, this);
        this.content = new Collection;

        this.database = database;
    }

    async getContent(query = null, order = null, limit = 200) {
        let [data, columns] = await this.database.queryTable(this.name, query, order, limit);

        this.content.collect(data);

        return {
            data: this.content.all(),
            columns
        }
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
            columns: this.columns.toRenderer(),
            content: this.content.toRenderer()
        }
    }

}
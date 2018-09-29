import ColumnsCollection from "./ColumnsCollection";
import Collection from "./Collection";


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

}
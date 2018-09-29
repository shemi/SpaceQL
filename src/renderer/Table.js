import Collection from "../utils/Collection";


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
        this.created_at = created_at;
        this.collation = collation;
        this.comment = comment;
        this.columns = new Collection(columns, this);
        this.content = new Collection([], this);

        this.database = database;
    }

}
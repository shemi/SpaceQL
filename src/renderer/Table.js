import Collection from "../utils/Collection";
import Service from "./Service";
import Connection from "./Connection";
import {CONNECT} from "../utils/main-events";


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

    getContent(query = {}, order = {}, limit = 100) {
        this.columns.deleteAll();
        this.content.deleteAll();

        return new Promise((resolve, reject) => {
            Service.send('TableController@content', this.database.connection.id, this.database.name, this.name, query, order, limit)
                .then(({rows, columns}) => {
                    this.content.merge(rows);
                    this.columns.merge(columns);

                    resolve(this);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    tabId() {
        return this.database.tabId();
    }

}
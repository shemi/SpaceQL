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

        this.lastQuery = null;
    }

    async getContent(query = {}, order = {}, limit = 100, refresh = false) {
        let tokenizeParams = JSON.stringify([query, order, limit]);

        if(tokenizeParams === this.lastQuery && ! refresh) {
            return this;
        }

        this.lastQuery = tokenizeParams;
        this.columns.deleteAll();
        this.content.deleteAll();

        let {rows, columns} = await Service.sendTo(
            this.tabId,
            'TableController@content',
            this.database.name,
            this.name,
            query,
            order,
            limit
        );

        this.content.merge(rows);
        this.columns.merge(columns);

        return this;
    }

    refreshContent() {
        if(! this.lastQuery) {
            return this;
        }

        return this.getContent(...JSON.parse(this.lastQuery), true);
    }

    get tabId() {
        return this.database.tabId;
    }

}
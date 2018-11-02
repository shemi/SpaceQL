import Collection from "../utils/Collection";
import Service from "./Service";
import Stateable from "../utils/Stateable";

export default class Table extends Stateable {

    constructor(data, database) {
        super();

        let { name, type,
            engine, format,
            created_at, collation,
            comment, columns
        } = data;

        this.database = database;

        this.name = name;
        this.type = type;
        this.engine = engine;
        this.format = format;
        this.created_at = created_at;
        this.collation = collation;
        this.comment = comment;
        this.columns = new Collection(columns, this);
        this.content = new Collection([], this);

        this.lastQuery = null;

        Service.on(this.tabId, `UpdateTable@${this.name}`, this.update.bind(this));
    }

    update(data) {
        let { name, type,
            engine, format, collation,
            comment, columns
        } = data;

        if(name) {
            this.name = name;
        }

        if(type) {
            this.type = type;
        }

        if(engine) {
            this.engine = engine;
        }

        if(format) {
            this.format = format;
        }

        if(collation) {
            this.collation = collation;
        }

        if(comment) {
            this.comment = comment;
        }

        if(columns) {
            this.columns.deleteAll();
            this.columns.collect(columns);
        }

    }

    async getContent(query = {}, order = {}, limit = 100, refresh = false) {
        let tokenizeParams = JSON.stringify([query, order, limit]);

        if(tokenizeParams === this.lastQuery && ! refresh) {
            return this;
        }

        this.lastQuery = tokenizeParams;
        this.columns.deleteAll();
        this.content.deleteAll();
        this.resetScroll();

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

    resetScroll() {
        this.setState('scrollLeft', 0);
        this.setState('scrollTop', 0);
    }

    get toAutocomplete() {
        return {
            text: this.name,
            columns: this.columns.pluck('name')
        }
    }

    get tabId() {
        return this.database.tabId;
    }

    static createState() {
        return {
            scrollTop: 0,
            scrollLeft: 0,
        }
    }

}
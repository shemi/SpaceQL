import Collection from "../utils/Collection";
import Service from "./Service";
import Stateable from "./Stateable";
import ColumnsCollection from "./ColumnsCollection";
import RowCollection from "./RowCollection";

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

        this.columns = new ColumnsCollection(columns, {
            name: this.name,
            database: this.database.name
        });

        this.tableColumns = new ColumnsCollection(columns, {
            name: this.name,
            database: this.database.name
        });

        this.content = new RowCollection([], {
            columns: this.tableColumns,
            table: this.name,
            database: this.database.name
        });

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

    async getContent(refresh = false) {
        let query = this.getState('queryForm'),
            order = this.getState('order'),
            limit = this.getState('limit'),
            tokenizeParams = JSON.stringify([query, order, limit]);

        if(! refresh && tokenizeParams === this.lastQuery) {
            return this;
        }

        this.lastQuery = tokenizeParams;

        if(! refresh) {
            this.tableColumns.deleteAll();
        }

        this.content.deleteAll();
        this.resetScroll();

        let results;

        try {
            results = await Service.sendTo(
                this.tabId,
                'TableController@content',
                this.database.name,
                this.name,
                query,
                order,
                limit
            );

            this.tab.log.info(results.head, this.database.name);

        } catch (e) {
            this.tab.log.error(e, this.database.name);

            return this;
        }

        if(! refresh) {
            this.tableColumns.merge(results.columns);
        }

        this.content.merge(results.rows);

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

    get tab() {
        return this.database.tab;
    }

    get tabId() {
        return this.database.tabId;
    }

    static createState() {
        return {
            queryForm: {
                column: null,
                operator: '=',
                value: null
            },
            order: {},
            limit: 100,
            scrollTop: 0,
            scrollLeft: 0,
        }
    }

}
import Collection from "../utils/Collection";
import Service from "./Service";
import Stateable from "./Stateable";
import ColumnsCollection from "./ColumnsCollection";
import RowCollection from "./RowCollection";
import Vue from "vue";
import TableStructure from "./TableStructure";

export default class Table extends Stateable {

    constructor(data, database, isNew = false) {
        super();

        let { name, type,
            engine, format,
            created_at, collation,
            comment, columns
        } = data;

        this._isNew = isNew;

        this.database = database;

        this.name = name;
        this.type = type;
        this.engine = engine;
        this.format = format;
        this.created_at = created_at;
        this.collation = collation;
        this.comment = comment || '';

        this.columns = new ColumnsCollection(columns || [], {
            name: this.name,
            database: this.database.name
        });

        this.tableColumns = new ColumnsCollection(columns || [], {
            name: this.name,
            database: this.database.name
        });

        this.content = new RowCollection([], {
            columns: this.tableColumns,
            table: this.name,
            database: this.database.name
        });

        this.lastQuery = null;
        this.contentChanged = false;
        this.structureChanged = false;

        this.buildStructureForm();

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

        this.structure.update(this.getStructureObject());
    }

    async getContent(refresh = false) {
        let query = this.getState('queryForm'),
            order = this.getState('order'),
            limit = this.getState('limit'),
            tokenizeParams = JSON.stringify([query, order, limit]);

        if(this._isNew) {
            return this;
        }

        refresh = refresh || this.contentChanged;

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
        this.contentChanged = false;

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

    getStructureObject() {
        return {
            name: this.name || '',
            database: this.database.name,
            type: this.type || '',
            engine: this.engine || '',
            format: this.format || '',
            collation: this.collation || '',
            comment: this.comment || '',
            columns: this.columns.export(),
            indexes: [],
            options: {}
        };
    }

    buildStructureForm() {
        this.structure = new TableStructure(this.getStructureObject());
    }

    get toAutocomplete() {
        return {
            text: this.name,
            columns: this.columns.pluck('name')
        }
    }

    get changed() {
        return this._isNew || this.structure.changed;
    }

    get tab() {
        return this.database.tab;
    }

    get tabId() {
        return this.database.tabId;
    }

    get isNew() {
        return this._isNew;
    }

    static createState() {
        return {
            queryForm: {
                column: null,
                operator: '=',
                value: null
            },
            structureForm: {
                name: '',
                nameChanged: false,
                columns: [],
                indexes: [],
                foreignKeys: [],
            },
            structureTab: 'columns',
            order: {},
            limit: 100,
            scrollTop: 0,
            scrollLeft: 0,
        }
    }

    static create(data, database) {
        return new Table(data, database, true);
    }

}
import Service from "./Service";
import Vue from 'vue';
import Stateable from "./Stateable";
import ColumnsCollection from "./ColumnsCollection";
import RowCollection from "./RowCollection";

class QueryResultSet extends Stateable {

    constructor(tabId, rows, columns, chunkId, total, index, databaseName) {
        super();

        this.columns = new ColumnsCollection(columns || [], {
            name: 'query-temp-table',
            database: databaseName
        });

        this.rows = new RowCollection(rows || [], {
            columns: this.columns,
            table: 'query-temp-table',
            database: databaseName
        });

        this.chunkId = chunkId;
        this.total = total;
        this.hasMoreRows = !! chunkId;
        this.index = index;
        this.tabId = tabId;

        this.loadingMore = false;
    }

    async next() {
        if(! this.hasMoreRows || this.loadingMore) {
            return;
        }

        this.loadingMore = true;
        let rows;

        try {
            rows = await Service.sendTo(this.tabId, 'QueryController@nextChunk', this.chunkId);
        }

        catch (err) {
            console.error(err);

            return;
        }

        if(! rows || ! Array.isArray(rows)) {
            this.hasMoreRows = false;
            this.loadingMore = false;

            return;
        }

        for(let row of rows) {
            this.rows.push(row);
        }

        this.loadingMore = false;
    }

    destroy() {
        if(this.chunkId) {
            Service.sendTo(this.tabId, 'QueryController@deleteChunk', this.chunkId)
                .then(res => console.log(res))
                .catch(err => console.log(err));
        }

        this.columns.deleteAll();
        this.rows.deleteAll();
    }

    static createState() {
        return {
            scrollTop: 0,
            scrollLeft: 0,
        }
    }

}

export default class Query extends Stateable {

    constructor(database) {
        super();

        this.database = database;
        this.resultsSets = [];
        this.sqlHistory = [];
        this.lastSql = '';
    }

    async exec(sql) {
        this.lastSql = sql.trim();

        this.clearSets();
        this.sqlHistory.length = 0;

        try {
            let results = await Service.sendTo(this.tabId, 'QueryController@exec', this.database.name, sql),
                set,
                resultSetsIndex = 0;

            for(set of results) {
                this.tab.log.info(set.head, this.database.name);

                if(set.columns && set.columns.length > 0) {
                    this.resultsSets.push(new QueryResultSet(
                        this.tabId,
                        set.rows,
                        set.columns,
                        set.chunkId,
                        set.head.rowsCount,
                        resultSetsIndex,
                        this.database.name
                    ));

                    resultSetsIndex++;
                }
            }

        }
        catch (e) {
            this.tab.log.error(e, this.database.name);
        }


        return Vue.nextTick();
    }

    clearSets() {
        for(let set of this.resultsSets) {
            set.destroy();
        }

        this.resultsSets = [];
    }

    get tab() {
        return this.database.tab;
    }

    get tabId() {
        return this.database.tabId;
    }

    getStateSettings() {
        return {
            storeKey: 'query',
            keysToStore: ['split']
        }
    }

    static createState() {
        return {
            split: Service.getPreference('query.split'),
            doc: null
        }
    }

}
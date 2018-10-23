import Service from "./Service";
import Vue from 'vue';

class QueryResultSet {

    constructor(rows, columns, chunkId, total, index) {
        this.rows = rows || [];
        this.columns = columns || [];
        this.chunkId = chunkId;
        this.total = total;
        this.hasMoreRows = !! chunkId;
        this.index = index;
        this.selectedTab = '0';

        this.loadingMore = false;
    }

    next() {
        if(! this.hasMoreRows || this.loadingMore) {
            return;
        }

        this.loadingMore = true;

        Service.send('QueryController@nextChunk', this.chunkId)
            .then(rows => {
                if(! rows || ! Array.isArray(rows)) {
                    this.hasMoreRows = false;
                }

                for(let row of rows) {
                    this.rows.push(row);
                }

                this.loadingMore = false;
            })
            .catch(err => console.log(err));
    }

}

export default class Query {

    constructor(database) {
        this.database = database;
        this.resultsSets = [];
        this.append = false;
        this.sqlHistory = [];
        this.lastSql = '';
    }

    exec(sql) {
        this.lastSql = sql.trim();

        if(this.append) {
            this.sqlHistory.push(sql);
        } else  {
            this.clearSets();
            this.sqlHistory.length = 0;
        }


        return Service.send('QueryController@exec', this.database.connectionId(), this.database.name, sql)
            .then((sets) => {
                for(let set of sets) {
                    this.resultsSets.push(new QueryResultSet(...set));
                }

                return Vue.nextTick();
            })
            .catch(err => {
                reject(err);
            });
    }

    clearSets() {
        for(let setIndex in this.resultsSets) {
            if(! this.resultsSets[setIndex]) {
                return;
            }

            this.deleteSet(setIndex);
        }

        this.resultsSets.length = 0;
    }

    deleteSet(setIndex) {
        let set = this.resultsSets[setIndex];

        if(set.chunkId) {
            Service.send('QueryController@deleteChunk', set.chunkId)
                .then(res => console.log(res))
                .catch(err => console.log(err));
        }

        Vue.delete(this.resultsSets, setIndex);
    }

    tabId() {
        return this.database.tabId();
    }

}
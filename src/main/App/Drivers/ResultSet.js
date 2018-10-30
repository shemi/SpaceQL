import ResultSetHead from "./ResultSetHead";
import RowsChunks from './RowsChunks';

class ResultSet {

    constructor(statement, start = null) {
        this.head = new ResultSetHead(start);
        this.rows = [];
        this.columns = null;
        this.statement = statement;
        this.chunkId = null;
    }

    setRows(rows, columns) {
        this.columns = columns;

        if(rows.length > RowsChunks.getRowsPerChunk()) {
            let chunk = RowsChunks.create(rows);

            this.chunkId = chunk.id;
            this.rows = chunk.rows;
        } else {
            this.rows = rows;
        }

        this.closeHead({rowsCount: rows.length});

        return this;
    }

    closeHead(data) {
        this.head.close({
            ...data,
            sqlString: this.statement.toString()
        }, this.statement);

        return this;
    }

    toJSON() {
        return {
            head: this.head.toJson(),
            rows: this.rows,
            columns: this.columns,
            type: this.statement.type ? this.statement.type.toLowerCase() : '',
            table: this.statement.table,
            chunkId: this.chunkId
        }
    }

}

export default ResultSet;
import ResultSetHead from "./ResultSetHead";
import RowsChunks from './RowsChunks';
import uuid from 'uuid/v4';

class ResultSet {

    constructor(statement, start = null, nested = false) {
        this.head = new ResultSetHead(start);
        this.rows = [];
        this.columns = null;
        this.statement = statement;
        this.chunkId = null;
        this.setId = uuid();
        this.nested = nested;
    }

    setRows(rows, columns = []) {
        let ri, column;

        this.setColumns(columns);

        for (ri = 0; ri < rows.length; ri++) {
            rows[ri].__spqlInternalRowId = 's_'+ this.setId +'r_'+ ri;
        }

        if (rows.length > RowsChunks.getRowsPerChunk()) {
            let chunk = RowsChunks.create(rows);

            this.chunkId = chunk.id;
            this.rows = chunk.rows;
        } else {
            this.rows = rows;
        }

        this.closeHead({rowsCount: rows.length});

        return this;
    }

    setColumns(columns) {
        if(! Array.isArray(columns)) {
            return;
        }

        columns = columns.map((column, index) => {
            if(typeof column !== 'object') {
                return column;
            }

            if(typeof column.inspect === 'function') {
                column = column.inspect();
            }

            column.key = column.name;

            if(this.nested) {
                column.key = `${column.table}_${column.key}`;
            }

            column.__spqlInternalId = 's_'+ this.setId +'c_'+ index;

            return column;
        });

        this.columns = columns;
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
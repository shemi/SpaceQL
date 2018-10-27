import moment from "moment";

class ResultSetHead {

    constructor(start = null) {
        this.time = {
            start: start || moment(),
            end: null
        };

        this.insertId = null;
        this.affectedRows = null;
        this.changedRows = null;
        this.rowsCount = null;
        this.sqlString = '';
        this.statementType = '';
        this.table = '';
    }

    close(data, statement) {
        console.log('close data:', data);
        this.time.end = moment();

        if(data && data.insertId) {
            this.insertId = data.insertId;
        }

        if(data && data.affectedRows) {
            this.affectedRows = data.affectedRows;
        }

        if(data && data.changedRows) {
            this.changedRows = data.changedRows;
        }

        if(data && data.rowsCount) {
            this.rowsCount = data.rowsCount;
        }

        if(statement) {
            this.statementType = statement.type ? statement.type.toLowerCase() : '';
            this.table = statement.table || '';
            this.sqlString = statement.toString();
        }

        return this;
    }

    static createAndClose(startTime, data) {
        return (new ResultSetHead(startTime))
            .close(data);
    }

    toJson() {
        let time = {};

        if(this.time.start) {
            time.start = this.time.start.toObject();
        }

        if(this.time.end) {
            time.end = this.time.end.toObject();
        }

        return {
            time,
            insertId: this.insertId,
            affectedRows: this.affectedRows,
            changedRows: this.changedRows,
            rowsCount: this.rowsCount,
            sqlString: this.sqlString,
            statementType: this.statementType,
            table: this.table
        }
    }
}

export default ResultSetHead;
import moment from "moment";

class ResultSetHeader {

    constructor(start = null) {
        this.time = {
            start: start || moment(),
            end: null
        };

        this.insertId = null;
        this.affectedRows = null;
        this.changedRows = null;
        this.rowsCount = null;
    }

    close(data) {
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

        return this;
    }

    static createAndClose(startTime, data) {
        return (new ResultSetHeader(startTime))
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
            rowsCount: this.rowsCount
        }
    }
}

export default ResultSetHeader;
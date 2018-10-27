import {LOG_TYPE_ERROR, LOG_TYPE_INFO, LOG_TYPE_WARNING} from "../utils/constants";
import SqlError from "../utils/Exceptions/SqlError";
import Moment from 'moment';
import { extendMoment } from 'moment-range';

const moment = extendMoment(Moment);

class LogMessage {

    constructor(message = null, database = null) {
        this.createdAt = moment();
        this.read = false;
        this.originalMessage = message;
        this.database = database;
        this.message = '';
        this.type = LOG_TYPE_INFO;

        if(typeof message === 'string') {
            this.message = message;
        }

        else if(message && message.message) {
            this.message = message.message;
        }
    }

    markRead() {
        this.read = true;
    }

}

class ErrorLog extends LogMessage {
    constructor(message = null, database = null) {
        super(message, database);

        this.type = LOG_TYPE_ERROR;
        this.sqlMessage = '';
        this.code = '';
        this.sqlState = null;
        this.errno = null;
        this.sqlState = null;

        if(message instanceof SqlError) {
            this.sqlMessage = message.sqlMessage;
            this.code = message.code;
            this.errno = message.errno;
            this.sqlState = message.sqlState;
        }

    }
}

class InfoLog extends LogMessage {
    constructor(message = null, database = null) {
        super(message, database);

        this.type = LOG_TYPE_INFO;
        this.startTime = null;
        this.endTime = null;
        this.affectedRows = null;
        this.changedRows = null;
        this.rowsCount = null;
        this.sqlQery = '';
        this.range = null;

        if(typeof message === 'object') {
            if(message.time && message.time.start) {
                this.startTime = moment(message.time.start);
            }

            if(message.time && message.time.end) {
                this.endTime = moment(message.time.end);
            }

            if(this.startTime && this.endTime) {
                this.range = moment.range(this.startTime, this.endTime);
                console.log('got '+ message.rowsCount + ' rows in ' + this.range.diff('seconds', true) + ' Seconds');
                console.dir(this.range);
            }

            if(message.affectedRows || parseInt(message.affectedRows) === 0) {
                this.affectedRows = parseInt(message.affectedRows);
            }

            if(message.changedRows || parseInt(message.changedRows) === 0) {
                this.changedRows = parseInt(message.changedRows);
            }

            if(message.rowsCount || parseInt(message.rowsCount) === 0) {
                this.rowsCount = parseInt(message.rowsCount);
            }

            if(message.sqlQery) {
                this.sqlQery = message.sqlQery;
            }

        }

    }
}

class WarningLog extends LogMessage {
    constructor(message = null, database = null) {
        super(message, database);

        this.type = LOG_TYPE_WARNING;
    }
}

class Log {

    constructor() {
        this.logs = [];

    }

    info(message, databaseName = null) {
        this.logs.push(new InfoLog(message, databaseName));
    }

    error(message, databaseName = null) {
        console.error(message);

        this.logs.push(new ErrorLog(message, databaseName));
    }

    warning(message, databaseName = null) {
        this.logs.push(new WarningLog(message, databaseName));
    }

}

export default Log;
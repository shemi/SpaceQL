import {LOG_TYPE_ERROR, LOG_TYPE_INFO, LOG_TYPE_WARNING} from "../utils/constants";
import SqlError from "../utils/Exceptions/SqlError";
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import trim from 'lodash/trim';

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
        this.insertId = null;
        this.rowsCount = null;
        this.sqlString = '';
        this.range = null;
        this.statementType = '';
        this.table = '';

        if(typeof message === 'object') {
            if(message.time && message.time.start) {
                this.startTime = moment(message.time.start);
            }

            if(message.time && message.time.end) {
                this.endTime = moment(message.time.end);
            }

            if(this.startTime && this.endTime) {
                this.range = moment.range(this.startTime, this.endTime);
            }

            if(message.affectedRows || parseInt(message.affectedRows) === 0) {
                this.affectedRows = parseInt(message.affectedRows);
            }

            if(message.changedRows || parseInt(message.changedRows) === 0) {
                this.changedRows = parseInt(message.changedRows);
            }

            if(message.insertId) {
                this.insertId = message.insertId;
            }

            if(message.rowsCount || parseInt(message.rowsCount) === 0) {
                this.rowsCount = parseInt(message.rowsCount);
            }

            if(message.sqlString) {
                this.sqlString = message.sqlString;
            }

            if(message.statementType) {
                this.statementType = message.statementType;
            }

            if(message.table) {
                this.table = message.table;
            }
        }

        this.craftMessage();
    }

    craftMessage() {
        let message = '';

        switch (this.statementType) {
            case 'select':
                message += `${this.rowsCount || 0} row(s) returned`;
                break;

            case 'insert':
                message += `${this.affectedRows || 0} row(s) inserted`;

                if(this.insertId) {
                    message += `, Insert ID: ${this.insertId}`;
                }

                break;

            case 'delete':
                message += `${this.affectedRows || 0} row(s) deleted`;
                break;

            case 'update':
                message += `${this.changedRows || 0} row(s) updated`;
                break;

            default:
                if(this.rowsCount >= 0) {
                    message += `${this.rowsCount} row(s) returned; `;
                }

                if(this.affectedRows >= 0) {
                    message += `${this.affectedRows} row(s) affected; `;
                }

                if(this.insertId) {
                    message += `Insert ID: ${this.insertId}; `;
                }

                if(this.changedRows >= 0) {
                    message += `${this.changedRows} row(s) changed; `;
                }

                message = trim(message, '; ');
        }

        if(this.range) {
            message += ` in ${this.range.diff('seconds', true)} Seconds`;
        }

        this.message = message;
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
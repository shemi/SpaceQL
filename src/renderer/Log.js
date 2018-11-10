import {LOG_TYPE_ERROR, LOG_TYPE_INFO, LOG_TYPE_WARNING} from "../utils/constants";
import SqlError from "../utils/Exceptions/SqlError";
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import trim from 'lodash/trim';
import uuid from 'uuid/v4';
import Stateable from "./Stateable";
import Service from "./Service";
import Vue from "vue";

const moment = extendMoment(Moment);

class LogMessage extends Stateable {

    constructor(message = null, database = null) {
        super();

        this.createdAt = moment();
        this.originalMessage = message;
        this.database = database;
        this.displayStartTime = null;
        this.displayEndTime = null;
        this.message = '';
        this.type = LOG_TYPE_INFO;
        this.sqlString = '';
        this.tables = [];
        this.databases = [];
        this.table = '';

        this.id = uuid();

        if(typeof message === 'string') {
            this.message = message;
        }

        else if(message && message.message) {
            this.message = message.message;
        }
    }

    displayTime(time) {
        let format = 'HH:mm:ss';

        if(! time.isSame(moment(), "day")) {
            format = 'ddd, MMM Do YYYY, ' + format;
        }

        return time.format(format);
    }

    displayCreatedAt() {
        return this.displayTime(this.createdAt);
    }

    displayTimeRange() {
        let timeString = '';

        timeString += this.displayStartTime || 'N/A';
        timeString += ' > ';
        timeString += this.displayEndTime || 'N/A';

        return timeString;
    }

    displayLocation() {
        let location = this.database || '';

        if(this.table) {
            location += `.${this.table}`;
        }

        return location.replace(/[\`\'\"]+/g, '');
    }

    markRead() {
        this.setState('read', true);
    }

    get read() {
        return this.getState('read');
    }

    get isOpen() {
        return this.getState('open');
    }

    static createState() {
        return {
            read: false,
            open: false
        };
    }

}

class ErrorLog extends LogMessage {
    constructor(message = null, database = null) {
        super(message, database);

        this.type = LOG_TYPE_ERROR;
        this.code = '';
        this.sqlState = null;
        this.errno = null;
        this.sqlString = '';

        if(message instanceof SqlError) {
            this.message = message.sqlMessage;
            this.code = message.code;
            this.errno = message.errno;
            this.sqlState = message.sqlState;
            this.sqlString = message.sqlString || '';
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
                this.displayStartTime = this.displayTime(this.startTime);
            }
            if(message.time && message.time.end) {
                this.endTime = moment(message.time.end);
                this.displayEndTime = this.displayTime(this.endTime);
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
                if(this.rowsCount != null) {
                    message += `${this.rowsCount} row(s) returned; `;
                }

                if(this.affectedRows != null) {
                    message += `${this.affectedRows} row(s) affected; `;
                }

                if(this.insertId) {
                    message += `Insert ID: ${this.insertId}; `;
                }

                if(this.changedRows != null) {
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

class Log extends Stateable {

    constructor() {
        super();

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

    clear(database) {
        let items = [];

        if(this.getState('filterDatabase')) {
            items = this.logs.filter(item => item.database !== database);
        }

        Vue.set(this, 'logs', items);
    }

    getStateSettings() {
        return {
            storeKey: this.constructor.name.toLowerCase(),
            keysToStore: ['showSettings', 'filterDatabase', 'levels']
        }
    }

    static createState() {
        return {
            showSettings: Service.getPreference('log.showSettings', false),
            filterDatabase: Service.getPreference('log.filterDatabase', true),
            levels: Service.getPreference('log.levels', [LOG_TYPE_INFO, LOG_TYPE_ERROR]),
            search: '',
            tables: ['all']
        };
    }

}

export default Log;
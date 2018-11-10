import ExtendableError from "./ExtendableError";

class SqlError {

    constructor(originalMessage) {
        this.sqlMessage = '';
        this.code = '';
        this.sqlState = null;
        this.errno = null;
        this.sqlState = null;
        this.sqlString = null;

        if(typeof message !== 'string') {
            let {message,
                sqlMessage,
                code,
                sqlState,
                sqlString,
                errno} = originalMessage;

            this.code = code;
            this.sqlState = sqlState;
            this.errno = errno;
            this.sqlMessage = sqlMessage;
            this.message = message;
            this.sqlString = sqlString;
        }

        else {
            this.message = originalMessage;
        }
    }

}

export default SqlError;
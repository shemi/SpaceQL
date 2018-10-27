import ExtendableError from "./ExtendableError";

class SqlError extends ExtendableError {

    constructor(originalMessage) {
        super(originalMessage);

        this.sqlMessage = '';
        this.code = '';
        this.sqlState = null;
        this.errno = null;
        this.sqlState = null;

        if(typeof message !== 'string') {
            let {message,
                sqlMessage,
                code,
                sqlState,
                errno} = originalMessage;

            this.code = code;
            this.sqlState = sqlState;
            this.errno = errno;
            this.sqlMessage = sqlMessage;
            this.message = message;
        }
    }

}

export default SqlError;
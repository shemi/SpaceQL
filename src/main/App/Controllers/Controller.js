import Connection from "../Connection";

export default class Controller {

    constructor() {

    }

    response(data) {
        return data;
    }

    getConnectionAndDatabase(connectionId, databaseName) {
        const connection = Connection.getConnection(connectionId);

        if(! connection) {
            throw new Error(`Can't find connection with the ID: ${connectionId}`);
        }

        const database = connection.databases.find({name: databaseName});

        if(! database) {
            throw new Error(`Can't find database with the name: ${databaseName}`);
        }

        return {
            connection,
            database
        }
    }

    getConnectionDatabaseAndTable(connectionId, databaseName, tableName) {
        const {connection, database} = this.getConnectionAndDatabase(connectionId, databaseName);

        const table = database.tables.find({name: tableName});

        if(! table) {
            throw new Error(`Can't find table with the name: ${table}`);
        }

        return {
            connection,
            database,
            table
        }
    }

    call(method) {
        return this[method].bind(this);
    }

}
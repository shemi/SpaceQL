import Controller from "./Controller";
import Connection from '../Connection';

class TableController extends Controller {

    async content(connectionId, databaseName, tableName, query = {}, order = {}, limit = 100) {
        const {table} = this.getConnectionDatabaseAndTable(connectionId, databaseName, tableName);

        return this.response(
            await table.getContent(query, order, limit)
        );
    }

}

export default (new TableController);
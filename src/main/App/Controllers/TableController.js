import Controller from "./Controller";

class TableController extends Controller {

    get actions() {
        return [
            'content'
        ];
    }

    async content(databaseName, tableName, query = {}, order = {}, limit = 100) {
        const database = this.connection.databases.find({name: databaseName});
        const table = database.tables.find({name: tableName});

        return this.response(
            await table.getContent(query, order, limit)
        );
    }

}

export default (new TableController);
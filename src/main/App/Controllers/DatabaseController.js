import Controller from "./Controller";

class DatabaseController extends Controller {

    get actions() {
        return [
            'tables',
            'query'
        ];
    }

    async tables(databaseName) {
        const database = this.connection.databases.find({name: databaseName});
        const tables = await database.getTables();

        return this.response(tables.toRenderer());
    }

    query(databaseName, queryString) {
        const database = this.connection.databases.find({name: databaseName});

        return new Promise((resolve, reject) => {
            database.query(queryString)
                .then(res => {
                    resolve(this.response(res));
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

}

export default (new DatabaseController);
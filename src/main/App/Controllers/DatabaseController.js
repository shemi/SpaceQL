import Controller from "./Controller";

class DatabaseController extends Controller {

    get actions() {
        return [
            'tables',
            'query',
            'createTable'
        ];
    }

    async tables(databaseName, refresh = false) {
        const database = this.connection.databases.find({name: databaseName});
        const tables = await database.getTables(refresh);

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

    async createTable(databaseName, form) {
        const database = this.connection.databases.find({name: databaseName});

        if(! database) {
            throw new Error("The database " + databaseName + " not found.");
        }

        const res = await database.createTable(form);

        return this.response(res);
    }

}

export default (new DatabaseController);
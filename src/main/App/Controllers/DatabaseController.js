import Controller from "./Controller";

class DatabaseController extends Controller {

    query(connectionId, databaseName, queryString) {
        const {database} = this.getConnectionAndDatabase(connectionId, databaseName);

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
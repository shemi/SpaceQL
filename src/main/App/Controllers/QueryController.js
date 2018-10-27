import Controller from "./Controller";
import RowsChunks from '../Drivers/RowsChunks';

class QueryController extends Controller {

    get actions() {
        return [
            'exec',
            'nextChunk',
            'deleteChunk'
        ];
    }

    exec(databaseName, queryString) {
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

    nextChunk(id) {
        return this.response(RowsChunks.next(id));
    }

    deleteChunk(id) {
        return this.response(RowsChunks.clear(id));
    }

}

export default (new QueryController);
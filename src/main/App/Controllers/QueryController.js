import Controller from "./Controller";
import RowsChunks from '../RowsChunks';

class QueryController extends Controller {

    exec(connectionId, databaseName, queryString) {
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

    nextChunk(id) {
        return this.response(RowsChunks.next(id));
    }

    deleteChunk(id) {
        return this.response(RowsChunks.clear(id));
    }

    slowDown() {
        let arr = [];

        for(let i = 0; i < 10000000; i++) {
            arr.push(i);

            for(let j = 0; j < 1000; j++) {

            }
        }

        JSON.stringify(arr);

        return;
    }

}

export default (new QueryController);
import Controller from "./Controller";
import Connection from '../Connection';
import Favorite from "../Favorite";

class ConnectionController extends Controller {

    async test(connectionForm) {
        const connection = new Connection(
            this.transformConnectionForm(connectionForm)
        );

        return this.response(await connection.test());
    }

    connect(connectionForm) {
        const favoriteId = connectionForm.id,
            favorite = favoriteId ? Favorite.get(favoriteId) : null;

        return new Promise((resolve, reject) => {
            const connection = new Connection(
                this.transformConnectionForm(connectionForm)
            );

            connection.connect()
                .then(conn => conn.initData())
                .then(conn => {
                    resolve(this.response({
                        connection: conn.toRenderer(),
                        favorite: favorite ? favorite.toRenderer() : {}
                    }));
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    disconnect(connectionId) {
        const connection = Connection.getConnection(connectionId);

        if(! connection) {
            return false;
        }

        connection.disconnect();
    }

    transformConnectionForm(form) {
        return {
            type: form.connectionType,
            driver: form.driver,
            dbConfig: {
                host: form.dbHost,
                port: form.dbPort,
                user: form.dbUsername,
                password: form.dbPassword,
                database: form.dbName,
            },
            config: {
                host: form.sshHost,
                port: form.sshPort,
                user: form.sshUsername,
                password: form.sshPassword,
                key: form.sshKeyFilePath,
                socket: form.socketPath
            }
        }
    }

}

export default (new ConnectionController);
import Controller from "./Controller";
import Connection from '../Connection';

class ConnectionController extends Controller {

    get actions() {
        return [
            'test',
            'connect',
            'disconnect',
            'createDatabase'
        ];
    }

    async test(connectionForm) {
        const connection = new Connection(
            this.transformConnectionForm(connectionForm)
        );

        return this.response(await connection.test());
    }

    connect(connectionForm) {
        return new Promise((resolve, reject) => {
            const connection = new Connection(
                this.transformConnectionForm(connectionForm)
            );

            connection.connect()
                .then(conn => conn.initData())
                .then(conn => {
                    this.app.setConnection(conn);

                    resolve(this.response(conn.toRenderer()));
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    disconnect() {
        if(! this.connection) {
            return this.response(false);
        }

        return this.response(this.connection.disconnect());
    }

    async createDatabase(form) {
        return this.connection.createDatabase(form);
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
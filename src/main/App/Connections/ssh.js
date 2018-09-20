import Connection from "./Connection";
import { Client } from 'ssh2';

class SshConnection extends Connection {

    connect() {
        let dbConfig = this._addDbDefaults(this.dbConfig);

        return new Promise((resolve, reject) => {
            this.connection = new Client();

            this.connection.on('ready', () => {
                this.connection.forwardOut(
                    '127.0.0.1',
                    12345,
                    dbConfig.host,
                    dbConfig.port,
                    (err, stream) => {
                        if (err) {
                            this.disconnect();

                            return reject(err);
                        }

                        dbConfig.host = 'localhost';
                        dbConfig.stream = stream;
                        this.driver.setConfig(dbConfig);

                        resolve();
                    }
                )
            });

            this.connection.on('error', (err) => {
                return reject(err);
            });

            this.connection.connect(this.config);
        });
    }

    disconnect() {
        if(this.driver.connected) {
            this.driver.disconnect();
        }

        if('end' in this.connection) {
            this.connection.end();
        }
    }

    async test() {
        let data;

        await this.connect();

        try {
            data = await this.driver.test();
        } catch(err) {
            throw new Error(err);
        }

        this.disconnect();

        return data;
    }

    _addDbDefaults(dbConfig) {
        if (! ('port' in dbConfig)) {
            dbConfig.port = 3306
        }

        if (! ('host' in dbConfig)) {
            dbConfig.host = 'localhost'
        }

        return dbConfig
    }

}

export default SshConnection;
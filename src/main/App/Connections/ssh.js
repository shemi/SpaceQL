import Connection from "./Connection";
import { Client } from 'ssh2';
import fs from 'fs';

class SshConnection extends Connection {

    async connect() {
        let connection = await this.connectSshPipe();

        return await connection.connect();
    }

    connectSshPipe() {
        let dbConfig = this._addDbDefaults(this.dbConfig);

        if(this.config.key) {
            try {
                fs.accessSync(this.config.key, fs.constants.R_OK)
            } catch (e) {
                throw new Error(`The SSH Key File not found, path: "${this.config.key}"`);
            }

            this.config.privateKey = fs.readFileSync(this.config.key);

            console.log(this.config.privateKey);

        }

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
                        dbConfig.port = 12345;
                        dbConfig.stream = stream;
                        this.driver.setConfig(dbConfig);

                        resolve(this.driver);
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
        let data,
            connection;

        try {
            connection = await this.connectSshPipe();
            data = await connection.test();
        } catch(err) {
            throw err;
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
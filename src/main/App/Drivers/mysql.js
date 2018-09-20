import Driver from './Driver';
import mysql from 'mysql2/promise';

class MysqlDriver extends Driver {

    async connect() {
        this.connection = await mysql.createConnection(this.config);
        this.connected = true;

        return this;
    }

    async test() {
        await this.connect();

        let [rows, columns] = await this.connection.query('SHOW VARIABLES LIKE "%version%";');
        let version = null;

        for(let row of rows) {
            if(row.Variable_name === 'version') {
                version = row.Value;

                break;
            }
        }

        await this.disconnect();

        return {
            host: this.config.host,
            port: this.config.port,
            user: this.config.user,
            version
        };
    }

    async disconnect() {
        await this.connection.end();
        this.connection = null;
        this.connected = false;

        return this;
    }

}

export default MysqlDriver;
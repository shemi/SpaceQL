import Driver from './Driver';
import mysql from 'mysql2/promise';

class MysqlDriver extends Driver {

    connect() {
        return new Promise((resolve, reject) => {
            this.connection = mysql.createPool(this.config);

            resolve(this);
        });
    }

    async startData() {
        const conn = await this.connection.getConnection();

        let data = {
            databases: await conn.query('SHOW databases'),
            privileges: await conn.query('SHOW PRIVILEGES'),
        };

        conn.release();

        return data;
    }

    setConfig(config) {
        this.config = {
            ...config,
        }
    }

    async test() {
        let connection = await mysql.createConnection(this.config);

        let [rows, columns] = await connection.query('SHOW VARIABLES LIKE "%version%";');
        let version = null;

        for (let row of rows) {
            if (row.Variable_name === 'version') {
                version = row.Value;

                break;
            }
        }

        await connection.end();

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
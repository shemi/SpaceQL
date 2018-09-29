import Driver from './Driver';
import mysql from 'mysql2/promise';
import QueryBuilder from "./QueryBuilder";
import MySqlGrammar from "./Grammars/MySqlGrammar";

class MysqlDriver extends Driver {

    connect() {
        return new Promise((resolve, reject) => {
            this.connection = mysql.createPool(this.config);

            resolve(this);
        });
    }

    async getInitData() {
        this.keepOpen = true;

        let data = {
            version: await this.getVersion(conn),
            databases: await conn.query('show databases'),
            privileges: await conn.query('show privileges'),
        };

        this.keepOpen = false;
        this.releaseOpenConnection();

        return data;
    }

    async getDatabases(databaseName = null, fresh = false) {
        if(! fresh && this.allDatabases.length > 0) {

        }

        let [rows, columns] = await conn.query(`
            SELECT SCHEMA_NAME AS \`database\`, 
            DEFAULT_CHARACTER_SET_NAME AS \`default_character_set\`,
            DEFAULT_COLLATION_NAME AS \`default_collation\`
            FROM INFORMATION_SCHEMA.SCHEMATA
        `);



    }

    async getConnection() {
        if(! this.openConnection) {
            this.openConnection = await this.connection.getConnection();
        }

        return this.openConnection;
    }

    async use(database, release = false) {
        if(this.using === database) {
            return this;
        }

        await this.query('USE ' + '`'+database+'`', release);
        this.using = database;

        return this;
    }

    builder() {
        return new QueryBuilder;
    }

    async query(sql, release = true) {
        const connection = await this.getConnection();

        if(sql instanceof QueryBuilder) {
            sql = (new MySqlGrammar).compileSelect(sql);
        }

        let results = connection.query(sql);

        if(release) {
            this.releaseOpenConnection();
        }

        return results;
    }

    releaseOpenConnection() {
        if(this.keepOpen) {
            return;
        }

        if(this.openConnection) {
            this.openConnection.release();
        }

        this.openConnection = null;
    }

    async getVersion(full = false, refresh = false) {
        let [rows, columns] = await this.query('show variables like "%version%"'),
            fullVersion = null;

        for (let row of rows) {
            if (row.Variable_name === 'version') {
                fullVersion = row.Value;

                break;
            }
        }

        this.fullVersion = fullVersion;

        if(full) {
            return fullVersion;
        }

        if(! fullVersion) {
            return '';
        }


        let { version, MAJOR, MINOR, PATCH } = MysqlDriver.extractVersion(fullVersion);

        this.version = version;
        this.MAJOR = MAJOR;
        this.MINOR = MINOR;
        this.PATCH = PATCH;

        return {
            fullVersion,
            version,
            MAJOR,
            MINOR,
            PATCH
        };
    }

    setConfig(config) {
        this.config = {
            ...config,
        }
    }

    async test() {
        let connection = await mysql.createConnection(this.config);

        let version = await this.getVersion(connection, true);

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

    static extractVersion(fullVersionString) {
        let shortVersion = fullVersionString.replace(/^\s*(\d+)\.(\d+)\.(\d+)(\-)?(.*)?/g, `$1.$2.$3`),
            versionParts = shortVersion.split('.');

        return {
            version: shortVersion,
            MAJOR: versionParts[0],
            MINOR: versionParts[1],
            PATCH: versionParts[2]
        }
    }

}

export default MysqlDriver;
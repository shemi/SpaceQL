import Driver from './Driver';
import mysql from 'mysql2/promise';
import QueryBuilder from "./QueryBuilder";
import MySqlGrammar from "./Grammars/MySqlGrammar";

class MysqlDriver extends Driver {

    connect() {
        return new Promise((resolve, reject) => {
            mysql.createConnection(this.config)
                .then(conn => {
                    this.connection = conn;
                    this.connected = true;

                    resolve(this);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    async getInitData() {
        return {
            version: await this.getVersion(),
            databases: await this.getDatabases(),
            // privileges: await this.query('show privileges'),
        };
    }

    async getDatabases() {
        let [rows, columns] = await this.query(`
            SELECT SCHEMA_NAME AS \`database\`, 
            DEFAULT_CHARACTER_SET_NAME AS \`default_character_set\`,
            DEFAULT_COLLATION_NAME AS \`default_collation\`
            FROM INFORMATION_SCHEMA.SCHEMATA`);

        return rows;
    }

    async getTables(database) {
        let [tables, columns] = await this.query(`
            select 
                TABLE_NAME as \`name\`,
                TABLE_TYPE as \`type\`,
                ENGINE as \`engine\`, 
                ROW_FORMAT as \`format\`,
                CREATE_TIME as \`created_at\`,
                TABLE_COLLATION as \`collation\`, 
                TABLE_COMMENT as \`comment\`,
                TABLE_SCHEMA
            from INFORMATION_SCHEMA.TABLES
            where TABLE_SCHEMA = ?
        `, [database]);

        return tables;
    }

    async getConnection() {
        if(! this.connected) {
            await this.connect();
        }

        return this.connection;
    }

    async use(database, release = false) {
        if(this.using === database) {
            return this;
        }

        await this.query('USE '+ database, [], release);
        this.using = database;

        return this;
    }

    builder() {
        return new QueryBuilder(this);
    }

    async query(sql, values = [], release = true) {
        if(sql instanceof QueryBuilder) {
            sql = (new MySqlGrammar).compileSelect(sql);
        }

        return new Promise((resolve, reject) => {
            this.getConnection()
                .then(connection => connection.query(sql, values))
                .then(results => {
                    resolve(results);
                })
                .catch(e => reject(e));
        });
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
            multipleStatements: true,
            dateStrings: true
        }
    }

    async test() {
        let version = await this.getVersion(true);

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
import Driver from './Driver';
import mysql from 'mysql2/promise';
import QueryBuilder from "./QueryBuilder";
import MySqlGrammar from "./Grammars/MySqlGrammar";
import ResultSet from "./ResultSet";
import moment from "moment";
import {SQLParser} from "./Parser";

//https://knexjs.org/

class MysqlDriver extends Driver {

    static CLIENT = 'mysql2';

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
            character_sets: await this.getCharacterSets(),
            collations: await this.getCollations(),
            // privileges: await this.query('show privileges'),
        };
    }

    async getCharacterSets() {
        let {rows: characterSets} = await this.query(
            `SELECT 
                CHARACTER_SET_NAME as \`name\`, 
                DEFAULT_COLLATE_NAME as \`default_collate\` 
            FROM INFORMATION_SCHEMA.CHARACTER_SETS`,
            [], true);

        return characterSets;
    }

    async getCollations() {
        let {rows: characterSets} = await this.query(
            `SELECT 
                ID as \`id\`,
                COLLATION_NAME as \`name\`,
                CHARACTER_SET_NAME as \`character_set\`
            FROM INFORMATION_SCHEMA.COLLATIONS`,
            [], true);

        return characterSets;
    }

    async getDatabases() {
        let {rows: databases} = await this.query(`
            SELECT 
                SCHEMA_NAME AS \`database\`, 
                DEFAULT_CHARACTER_SET_NAME AS \`default_character_set\`,
                DEFAULT_COLLATION_NAME AS \`default_collation\`
            FROM INFORMATION_SCHEMA.SCHEMATA
            `, [], true);

        return databases;
    }

    async getTables(database) {
        let {rows: tables} = await this.query(
            `select 
                TABLE_NAME as \`name\`,
                TABLE_TYPE as \`type\`,
                ENGINE as \`engine\`, 
                ROW_FORMAT as \`format\`,
                CREATE_TIME as \`created_at\`,
                TABLE_COLLATION as \`collation\`, 
                TABLE_COMMENT as \`comment\`,
                TABLE_SCHEMA
            from INFORMATION_SCHEMA.TABLES
            where TABLE_SCHEMA = ?`,
            [database], true);

        return tables;
    }

    async getColumns(database, table) {
        let {rows: columns} = await this.query(`
            SELECT 
                COLUMN_NAME as \`name\`,
                ORDINAL_POSITION as \`position\`,
                COLUMN_DEFAULT as \`default_value\`,
                IS_NULLABLE as \`is_nullable\`,
                DATA_TYPE as \`data_type\`,
                CHARACTER_MAXIMUM_LENGTH as \`character_maximum_length\`,
                CHARACTER_SET_NAME as \`character_set\`,
                COLLATION_NAME as \`collation\`,
                COLUMN_KEY as \`column_key\`,
                PRIVILEGES as \`privileges\`,
                COLUMN_COMMENT as \`comment\`
            FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME = ?
            ORDER BY position
	    `, [database, table], true);

        return columns;
    }

    async createDatabase(form) {
        const sql = `CREATE SCHEMA \`${form.name}\` DEFAULT CHARACTER SET ${form.characterSet} COLLATE ${form.collation}`;

        await this.query(sql, []);

        return {
            database: form.name,
            default_character_set: form.characterSet,
            default_collation: form.collation
        };
    }

    async getConnection() {
        if(! this.connected) {
            await this.connect();
        }

        return this.connection;
    }

    async use(database) {
        if(this.using === database) {
            return this;
        }

        await this.query('USE `'+ database + '`', [], true);
        this.using = database;

        return this;
    }

    async getEngines() {
        let engines = [],
            engine,
            {rows: rawEngines} = await this.query(
                `SELECT ENGINE as \`name\`, SUPPORT as \`support\`, COMMENT as \`comment\` FROM INFORMATION_SCHEMA.ENGINES`,
                [],
                true
            );

        for(engine of rawEngines) {
            engines.push({
                is_default: engine.support === 'DEFAULT',
                is_disabled: ['NO', 'DISABLED'].indexOf(engine.support) >= 0,
                ...engine
            })
        }

        return engines;
    }

    builder() {
        return new QueryBuilder(this);
    }

    async query(sql, values = [], single = false) {
        let start = moment(),
            sqlToParser = sql;

        if(sql instanceof QueryBuilder) {
            sqlToParser = sql.knex.toString();
            let builderRes = sql.knex.toSQL().toNative();
            sql = builderRes.sql;
            values = builderRes.bindings;



            single = true;
        }

        let statements = SQLParser.parse(sqlToParser, 'mysql', ';'),
            connection = await this.getConnection(),
            sets = [],
            statement,
            rowsSets,
            columnsSets,
            index = 0;

        try {
            [rowsSets, columnsSets] = await connection.query({
                sql,
                values,
                nestTables: single ? false : '_'
            });
        } catch (e) {
            e.sqlString = sql;

            throw e;
        }

        if(rowsSets && ! Array.isArray(rowsSets[0])) {
            rowsSets = [rowsSets];
        }

        else if(! rowsSets) {
            rowsSets = [];
        }

        if(columnsSets && ! Array.isArray(columnsSets[0])) {
            columnsSets = [columnsSets];
        }

        else if(! columnsSets) {
            columnsSets = [];
        }

        for(statement of statements) {
            let rows = rowsSets[index];
            let columns = columnsSets[index];
            let resultSet = new ResultSet(statement, start, ! single);

            if(Array.isArray(rows) && columns) {
                resultSet.setRows(rows, columns);
            } else {
                resultSet.closeHead(rows);
            }

            sets.push(resultSet);
            index++;
        }

        return single && sets.length > 0 ? sets[0] : sets;
    }

    async getVersion(full = false, refresh = false) {
        let {rows} = await this.query('SHOW variables LIKE "%version%"', [], true),
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
            dateStrings: true,
            supportBigNumbers: true
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
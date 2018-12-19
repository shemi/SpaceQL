import * as TYPES from 'mysql2/lib/constants/types';
import * as CHARSETS from 'mysql2/lib/constants/charsets';
import * as FLAGS from 'mysql2/lib/constants/field_flags';

export default class Column {

    constructor(data) {
        let {
            name, key, characterSet,
            columnLength, columnType,
            decimals, flags, schema,
            table, __spqlInternalId
        } = data;

        this.key = key;
        this.name = name;
        this.character_set = characterSet;
        this.type = Column.getTypeName(columnType);
        this.data_type = columnType;
        this.length = columnLength;
        this.decimals = decimals;
        this.flags = flags;
        this.database = schema;
        this.table = table;
        this.__spqlInternalId = __spqlInternalId;

        this.is_nullable = true;
        this.is_primary = false;
        this.is_unique = false;
        this.is_indexed = false;
        this.is_blob = false;
        this.is_unsigned = false;
        this.is_binary = false;
        this.is_auto_increment = false;

        if(this.flags) {
            this.is_nullable = ! (this.flags & FLAGS.NOT_NULL);
            this.is_primary = !! (this.flags & FLAGS.PRI_KEY);
            this.is_unique = !! (this.flags & FLAGS.UNIQUE_KEY);
            this.is_indexed = !! (this.flags & FLAGS.MULTIPLE_KEY);
            this.is_blob = !! (this.flags & FLAGS.BLOB);
            this.is_unsigned = !! (this.flags & FLAGS.UNSIGNED);
            this.is_binary = !! (this.flags & FLAGS.BINARY);
            this.is_auto_increment = !! (this.flags & FLAGS.AUTO_INCREMENT);
        }
    }

    toRenderer() {
        return {
            key: this.key,
            name: this.name,
            character_set: this.character_set,
            type: this.type,
            data_type: this.data_type,
            length: this.length,
            decimals: this.decimals,
            flags: this.flags,
            database: this.database,
            table: this.table,
            __spqlInternalId: this.__spqlInternalId,
            is_nullable: this.is_nullable,
            is_primary: this.is_primary,
            is_unique: this.is_unique,
            is_indexed: this.is_indexed,
            is_blob: this.is_blob,
            is_unsigned: this.is_unsigned,
            is_binary: this.is_binary,
            is_auto_increment: this.is_auto_increment
        }
    }

    static getTypeName(type) {
        let newType = Object.keys(TYPES).find(key => TYPES[key] === type);

        return newType ? newType.toLowerCase() : '';
    }

}
import * as TYPES from 'mysql2/lib/constants/types';

export default class ColumnInfo {

    constructor(data, table) {
        let {
            name, position,
            default_value, is_nullable,
            data_type, character_maximum_length,
            character_set, collation,
            column_key, privileges,
            comment, extra
        } = data;

        this.name = name;
        this.position = position;
        this.default_value = default_value;
        this.is_nullable = is_nullable === 'YES';
        this.data_type = data_type;
        this.character_maximum_length = character_maximum_length;
        this.character_set = character_set;
        this.collation = collation;
        this.column_key = column_key || '';
        this.privileges = privileges;
        this.comment = comment;
        this.extra = extra || '';

        this.table = table;

        this.is_primary = false;
        this.is_unique = false;
        this.is_indexed = false;
        this.is_auto_increment = false;

        this.numeric_type = TYPES[this.data_type.toUpperCase()];

        switch (this.column_key.toLowerCase()) {
            case 'pri':
                this.is_primary = true;
                break;
            case 'mul':
                this.is_indexed = true;
                break;
            case 'uni':
                this.is_unique = true;
                break;
        }

        switch (this.extra.toLowerCase()) {
            case 'auto_increment':
                this.is_auto_increment = true;
                break;

        }

    }

    toRenderer() {
        return {
            name: this.name,
            position: this.position,
            default_value: this.default_value,
            is_nullable: this.is_nullable,
            data_type: this.data_type,
            character_maximum_length: this.character_maximum_length,
            character_set: this.character_set,
            collation: this.collation,
            column_key: this.column_key,
            extra: this.extra,
            privileges: this.privileges,
            comment: this.comment,
            is_primary: this.is_primary,
            is_unique: this.is_unique,
            is_indexed: this.is_indexed,
            is_auto_increment: this.is_auto_increment,
            numeric_type: this.numeric_type,
        }
    }

}
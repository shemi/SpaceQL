import uuid from 'uuid/v4';

export default class ColumnInfo {

    constructor(data, table) {
        let {
            field, type,
            length, unsigned,
            zerofill, nullable,
            key, default_value, extra,
            collation, comment
        } = data;

        this.name = field;
        this.type = type;
        this.length = length;
        this.default_value = default_value;
        this.is_nullable = nullable;
        this.is_zerofill = zerofill;
        this.is_unsigned = unsigned;
        this.collation = collation;
        this.key = key;
        this.comment = comment;
        this.extra = extra;

        this.table = table;

        this.__spqlInternalRowId = `${this.table.database.name}.${this.table.name}.${this.name}`;
    }

    toRenderer() {
        return {
            name: this.name,
            type: this.type,
            length: this.length,
            default_value: this.default_value,
            key: this.key,
            is_nullable: this.is_nullable,
            is_zerofill: this.is_zerofill,
            is_unsigned: this.is_unsigned,
            collation: this.collation,
            extra: this.extra,
            comment: this.comment,
            __spqlInternalRowId: this.__spqlInternalRowId,
        }
    }

}
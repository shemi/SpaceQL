
export default class Column {

    constructor(data, table) {
        let {
            name, position,
            default_value, is_nullable,
            data_type, character_maximum_length,
            character_set, collation,
            column_key, extra, privileges,
            comment
        } = data;

        this.name = name;
        this.position = position;
        this.default_value = default_value;
        this.is_nullable = is_nullable;
        this.data_type = data_type;
        this.character_maximum_length = character_maximum_length;
        this.character_set = character_set;
        this.collation = collation;
        this.column_key = column_key;
        this.extra = extra;
        this.privileges = privileges;
        this.comment = comment;
        this.table = table;
    }

}
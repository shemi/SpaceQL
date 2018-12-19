import Stateable from "./Stateable";

export default class Column extends Stateable {

    constructor(data, origin) {
        super();
        this.originalKeys = [];

        for(let key of Object.keys(data)) {
            this.originalKeys.push(key);
            this[key] = data[key];
        }

        this.tableName = origin.name;
        this.database = origin.database;
    }

    export() {
        let data = {
            table: this.tableName,
            database: this.database
        };

        for(let key of this.originalKeys) {
            data[key] = this[key];
            data[key+'Changed'] = false;
        }

        return data;
    }

    static createForStructure(name, label, type, defaultValue = 0) {
        return new Column({
            name, label,
            default_value: defaultValue,
            key: name,
            type,
            __spqlInternalId: 'columns-structure-' + name
        }, {name: 'structure', database:'structure'})
    }

    static createState() {
        return {
            width: 'auto'
        }
    }

}
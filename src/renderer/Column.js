import Stateable from "./Stateable";

export default class Column extends Stateable {

    constructor(data, origin) {
        super();

        for(let key of Object.keys(data)) {
            this[key] = data[key];
        }

        this.tableName = origin.name;
        this.database = origin.database;
    }

    static createState() {
        return {
            width: 'auto'
        }
    }

}


export default class Connection {

    constructor(rawConnection) {

        let {
            id, name,
            tables,form
        } = rawConnection;

        this.id = id;
        this.name = name;
        this.form = form || {};
        this.tables = tables || [];
        this.log = [];
    }

    getFirstTable() {
       return this.tables.length > 0 ? this.tables[0] : '';
    }

}
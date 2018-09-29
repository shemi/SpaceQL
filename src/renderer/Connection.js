

export default class Connection {

    constructor(rawConnection) {

        let {
            id, name,
            form, databases, privileges
        } = rawConnection;

        this.id = id;
        this.name = name;
        this.form = form || {};
        this.databases = databases || [];
        this.selectedDatabase = null;
        this.privileges = privileges || [];
        this.log = [];
    }

    getFirstDatabase() {
       return this.databases.length > 0 ? this.databases[0] : '';
    }

}
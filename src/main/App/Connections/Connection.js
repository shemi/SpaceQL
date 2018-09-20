class Connection {

    constructor(config, dbConfig, Driver) {
        this.config = config;
        this.dbConfig = dbConfig;
        this.driver = new Driver;
        this.connection = null;
        this.id = null;
    }

    setId(id) {
        this.id = id;

        return this;
    }

    getId() {
        return this.id;
    }

}

export default Connection;
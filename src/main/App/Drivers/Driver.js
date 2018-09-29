class Driver {

    constructor() {
        this.config = null;
        this.connection = null;
        this.connected = false;

        this.fullVersion = null;
        this.version = null;
        this.MAJOR = null;
        this.MINOR = null;
        this.PATCH = null;

        this.allDatabases = [];
        this.databases = [];
        this.informationDatabases = [];

        this.defaultSchema = null;

        this.openConnection = null;
        this.keepOpen = false;
        this.using = null;

    }

    setConfig(config) {
        this.config = config;
    }

}

export default Driver;
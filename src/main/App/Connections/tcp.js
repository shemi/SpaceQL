import Connection from "./Connection";

class TcpIp extends Connection {

    connect() {
        this.driver.setConfig(this.dbConfig);
    }

    disconnect() {

    }

    async test() {
        let version;

        this.connect();

        try {
            version = await this.driver.test();
        } catch(err) {
            throw new Error(err);
        }

        this.disconnect();

        return version;
    }

}

export default TcpIp;
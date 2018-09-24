import Connection from "./Connection";

class TcpIp extends Connection {

    async connect() {
        let connection;
        this.driver.setConfig(this.dbConfig);

        try {
            connection = await this.driver.connect();
        } catch (e) {
            throw e;
        }

        return connection;
    }

    disconnect() {
        if(this.driver.connected) {
            this.driver.disconnect();
        }
    }

    async test() {
        let data;

        this.driver.setConfig(this.dbConfig);

        try {
            data = await this.driver.test();
        } catch(err) {
            throw new Error(err);
        }

        this.disconnect();

        return data;
    }

}

export default TcpIp;
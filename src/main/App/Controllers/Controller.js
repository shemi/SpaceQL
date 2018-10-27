import App from "../App";

export default class Controller {

    constructor() {
        this.app = App.instance();
    }

    get connection() {
        return this.app.connection;
    }

    response(data) {
        return data;
    }

    call(method) {
        return this[method].bind(this);
    }

}
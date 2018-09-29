export default class Controller {

    constructor() {

    }

    response(data) {
        return data;
    }

    call(method) {
        return this[method].bind(this);
    }

}
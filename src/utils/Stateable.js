import Vue from "vue";

export default class Stateable {

    constructor() {
        this.state = null;
        this.resetState();
    }

    resetState() {
        Vue.set(this, 'state', this.constructor.createState());
    }

    setState(key, value = null) {
        if(! value && typeof key === 'object') {
            Vue.set(this, 'state', key);

            return;
        }

        Vue.set(this.state, key, value);
    }

    getState(key = null, defaultValue = null) {
        if(! key) {
            return this.state;
        }

        let value = this.state[key];

        return value === undefined ? defaultValue : value;
    }

    static createState() {
        throw new TypeError('This method should be overridden by inheriting classes.');
    }

}
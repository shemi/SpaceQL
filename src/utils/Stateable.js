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

    getState(key = null) {
        if(! key) {
            return this.state;
        }

        return this.state[key];
    }

    static createState() {
        throw new TypeError('This method should be overridden by inheriting classes.');
    }

}